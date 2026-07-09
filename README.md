# MockMate AI

> Practice interviews with an AI interviewer and get instant, actionable feedback.

A single project that runs a **React (Vite + TypeScript) client** and an
**Express (TypeScript + Google Gemini) server** together, from **one command**,
using **one shared `.env`**.

The app works **with or without** a Gemini API key: set the key for AI-generated
questions and AI grading, or run it key-free and it falls back to a seeded
question bank and heuristic scoring — so it always runs end to end.

---

## Prerequisites

| Tool               | Version    | Notes                                                        |
| ------------------ | ---------- | ------------------------------------------------------------ |
| **Node.js**        | ≥ 18       | Required by Vite 6. Check with `node -v`.                    |
| **npm**            | ≥ 9        | Ships with Node 18+.                                          |
| **MongoDB**        | any recent | Local (`mongod`) or a MongoDB Atlas URI. Needed for auth, interviews, and seeding. |
| **Gemini API key** | optional   | Free key from [Google AI Studio](https://aistudio.google.com/apikey). Without it, the app uses the offline fallbacks. |

---

## Quick start

```bash
cd 01-ai-mock-interview

npm run setup          # 1) install root + client + server deps
cp .env.example .env   # 2) create your env (fill in the secrets)
npm run seed           # 3) load the question bank (used as the offline fallback)
npm run dev            # 4) run client + server together
```

- Client → http://localhost:5173
- Server → http://localhost:5000  (health check: `GET /api/health`)

The Vite dev server proxies `/api` to the backend, so the client can call
`/api/...` directly with no CORS setup in development.

> **Ports:** the server uses **5000** and the client **5173**. If another app is
> already on those ports, either stop it or change `PORT` (`.env`) and Vite's
> `server.port` / `proxy` in [`client/vite.config.ts`](client/vite.config.ts).

---

## One shared environment

There is a **single `.env`** at the project root — both apps read it:

- The **server** loads it via [`server/src/config/env.ts`](server/src/config/env.ts)
  (`dotenv`, pointed at `../../../.env`).
- The **client** loads it via Vite's `envDir: '..'` in
  [`client/vite.config.ts`](client/vite.config.ts).

> **Security:** Vite only exposes variables prefixed with `VITE_` to the browser
> bundle. Server secrets (`JWT_SECRET`, `GEMINI_API_KEY`, `MONGODB_URI`) are
> **not** shipped to the client even though they live in the same file.

| Variable         | Used by | Purpose                                                        |
| ---------------- | ------- | -------------------------------------------------------------- |
| `PORT`           | server  | API port (default 5000)                                        |
| `NODE_ENV`       | server  | `development` / `production`                                   |
| `CLIENT_URL`     | server  | CORS origin for the frontend                                   |
| `MONGODB_URI`    | server  | MongoDB connection string                                      |
| `JWT_SECRET`     | server  | Signing secret for auth tokens                                 |
| `JWT_EXPIRES_IN` | server  | Token lifetime (e.g. `7d`)                                      |
| `GEMINI_API_KEY` | server  | Google Gemini API key. **Blank = offline mode** (seeded bank + heuristic scoring). |
| `GEMINI_MODEL`   | server  | Optional. Gemini model to use (default `gemini-2.5-flash`). Override if the default alias is ever retired. |
| `VITE_API_URL`   | client  | Base URL of the API (browser-exposed)                          |

> **MongoDB Atlas note:** if your Node environment can't resolve the `mongodb+srv://`
> DNS SRV record (some networks/VPNs block SRV lookups — you'll see
> `querySrv ECONNREFUSED`), use the **non-SRV** multi-host form instead:
> `mongodb://user:pass@host-00:27017,host-01:27017,host-02:27017/mockmate?ssl=true&replicaSet=<name>&authSource=admin`.

---

## AI: how questions & grading work

All AI lives in [`server/src/services/gemini.ts`](server/src/services/gemini.ts),
which exposes two functions used by the interview routes:

| Function                       | With `GEMINI_API_KEY`                                        | Without a key (offline fallback)                                              |
| ------------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `generateQuestions(role, difficulty, count)` | Gemini writes fresh, role-specific questions (JSON) | `fallbackQuestions` — pulls from the seeded `questions` collection (by role → difficulty → any), dedupes, and tops up with a generic prompt if short |
| `evaluateInterview(role, items)` | Gemini grades each answer (0–10 + feedback), plus an overall score (0–100) and summary | `fallbackEvaluation` — heuristic scoring based on answer length/detail |

Both paths **degrade gracefully**: if a Gemini call fails or returns malformed
JSON, the code logs a warning and returns the offline result, so an interview
never hard-fails.

**To enable real AI:**

1. Get a free key at **https://aistudio.google.com/apikey**.
2. In [`.env`](.env), set `GEMINI_API_KEY=your_key_here` (optionally pin
   `GEMINI_MODEL`).
3. **Restart the dev server** — `.env` is read at startup, not hot-reloaded.

`getModel()` reads the key and model name; a missing key returns `null`, which
is how every function knows to take the offline path.

---

## How it works — request workflow

### Authentication

JWT-based, accepted as either a `Bearer` header **or** an httpOnly `token` cookie.

1. **Register / Login** → `POST /api/auth/register` or `/login`. The server
   hashes the password (`bcryptjs`), creates/finds the user, signs a JWT
   (`sub = userId`, `JWT_EXPIRES_IN`), sets the `token` cookie **and** returns
   `{ token, user }`.
2. The **client** stores the token in `localStorage` and attaches it as an
   `Authorization: Bearer` header on every request (Axios interceptor in
   [`lib/api.ts`](client/src/lib/api.ts)).
3. `requireAuth` ([`middleware/auth.ts`](server/src/middleware/auth.ts)) reads the
   header or cookie, verifies the JWT, and sets `req.userId`.
4. On app load, `AuthProvider` calls `GET /api/auth/me` to restore the session.
5. **Logout** clears the cookie and removes the `localStorage` token.

### Interview lifecycle

```mermaid
sequenceDiagram
    participant U as User (browser)
    participant C as Client (React)
    participant S as Server (Express)
    participant G as Gemini / fallback
    participant DB as MongoDB

    U->>C: Pick role + difficulty + count (Dashboard)
    C->>S: POST /api/interviews
    S->>G: generateQuestions()
    G-->>S: question prompts
    S->>DB: create Interview (status: in_progress)
    S-->>C: { interview }
    C->>U: /interview/:id — answer one at a time
    U->>C: Submit answers
    C->>S: POST /api/interviews/:id/submit
    S->>G: evaluateInterview()
    G-->>S: per-question scores + feedback + summary
    S->>DB: save scores, status: completed
    S-->>C: { interview }
    C->>U: /results/:id — verdict, chart, feedback
```

1. **Dashboard** ([`Dashboard.tsx`](client/src/pages/Dashboard.tsx)) — choose role,
   difficulty, and question count → `POST /api/interviews`. The server generates
   the questions up front and saves an `in_progress` interview.
2. **Interview** ([`Interview.tsx`](client/src/pages/Interview.tsx)) — loads the
   interview, presents questions one at a time, and collects answers. (Already-
   completed interviews redirect straight to results.)
3. **Submit** → `POST /api/interviews/:id/submit` with the answers array. The
   server grades them, stores per-question scores/feedback + an overall
   score/summary, and marks the interview `completed`.
4. **Results** ([`Results.tsx`](client/src/pages/Results.tsx)) — overall verdict,
   a per-question bar chart ([`ScoreChart.tsx`](client/src/components/ScoreChart.tsx)),
   and each question's feedback.

### API endpoints

| Method & path                  | Auth | Body                          | Returns                          |
| ------------------------------ | :--: | ----------------------------- | -------------------------------- |
| `GET /api/health`              |  —   | —                             | `{ status, service }`            |
| `POST /api/auth/register`      |  —   | `{ name, email, password }`   | `{ token, user }`                |
| `POST /api/auth/login`         |  —   | `{ email, password }`         | `{ token, user }`                |
| `POST /api/auth/logout`        |  —   | —                             | clears the cookie                |
| `GET /api/auth/me`             |  ✅  | —                             | `{ user }`                       |
| `POST /api/interviews`         |  ✅  | `{ role, difficulty, count }` | `{ interview }` (questions ready)|
| `GET /api/interviews`          |  ✅  | —                             | `{ interviews }` (summaries)     |
| `GET /api/interviews/:id`      |  ✅  | —                             | `{ interview }` (full)           |
| `POST /api/interviews/:id/submit` | ✅ | `{ answers: string[] }`      | `{ interview }` (graded)         |

---

## Commands

All commands are run from the project root:

| Command              | What it does                                          |
| -------------------- | ----------------------------------------------------- |
| `npm run setup`      | Install deps for root **+ client + server** in one go |
| `npm run dev`        | Run client and server together (via `concurrently`)   |
| `npm run dev:client` | Run only the client                                   |
| `npm run dev:server` | Run only the server                                   |
| `npm run build`      | Build server (`tsc`) then client (`vite build`)       |
| `npm run start`      | Start the built server                                |
| `npm run seed`       | Seed the database with the interview question bank    |

---

## Seeding the database

Make sure `MONGODB_URI` in `.env` points at a running MongoDB, then:

```bash
npm run seed
```

This runs [`server/src/seed.ts`](server/src/seed.ts), which connects to MongoDB,
clears the `questions` collection, and inserts the interview question bank
(Frontend / Backend / Full Stack / Behavioral × easy/medium/hard). This bank is
what the app serves when no `GEMINI_API_KEY` is set, so seeding is recommended
even if you plan to add a key later.

---

## File-by-file reference

### Server — `server/src/`

| File                          | Responsibility                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------- |
| `index.ts`                    | Entry point. Loads env, connects to MongoDB, then starts Express on `PORT`. Exits if the DB is unreachable. |
| `app.ts`                      | Builds the Express app: CORS, JSON + cookie parsing, request logging, mounts the routers, `GET /api/health`, and the 404 + error handlers. |
| `config/env.ts`               | Side-effect import that loads the single shared root `.env` via `dotenv` before anything reads `process.env`. |
| `config/db.ts`                | `connectDB(uri)` — thin wrapper around `mongoose.connect`.                                          |
| `middleware/auth.ts`          | `requireAuth` — extracts the JWT from the `Bearer` header or `token` cookie, verifies it, sets `req.userId`. |
| `middleware/validate.ts`      | `validate(schema)` — validates `req.body` against a Zod schema; 400 on failure, replaces the body with parsed data. |
| `middleware/error.ts`         | `notFound` (404 JSON) and `errorHandler` (maps `CastError`→400, duplicate key→409, else 500).      |
| `models/User.ts`              | Mongoose `User` schema — `name`, unique lowercase `email`, `passwordHash`.                          |
| `models/Interview.ts`         | `Interview` schema — user ref, role, difficulty, status, embedded `questions[{ prompt, answer, score, feedback }]`, `overallScore`, `summary`. |
| `models/Question.ts`          | `Question` schema — the seed-time question bank (`role`, `difficulty`, `prompt`); also the offline fallback source. |
| `routes/auth.routes.ts`       | `register` / `login` / `logout` / `me`. Hashes passwords, signs JWTs, sets the cookie, returns the public user. |
| `routes/interview.routes.ts`  | Interview endpoints (all behind `requireAuth`): start (generate questions), list, get one, submit (grade). |
| `services/gemini.ts`          | The AI layer — `generateQuestions` + `evaluateInterview` (Gemini), each with an offline fallback (`fallbackQuestions`, `fallbackEvaluation`). `getModel()` reads `GEMINI_API_KEY` / `GEMINI_MODEL`. |
| `utils/token.ts`              | `signToken` / `verifyToken` (jsonwebtoken).                                                         |
| `utils/asyncHandler.ts`       | `wrap()` — forwards rejected promises from async route handlers to Express' error handler.          |
| `seed.ts`                     | CLI script (`npm run seed`) that resets and inserts the question bank.                              |

### Client — `client/src/`

| File                            | Responsibility                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------ |
| `main.tsx`                      | React entry — mounts `App` inside `BrowserRouter`, `AuthProvider`, and the toast `Toaster`.       |
| `App.tsx`                       | Route table: `/`, `/login`, `/register`, and the protected `/dashboard`, `/interview/:id`, `/results/:id`. |
| `index.css`                     | Global styles + the app's dark theme.                                                            |
| `context/AuthContext.tsx`       | Auth state + `login` / `register` / `logout`. Restores the session via `GET /auth/me`, stores the token in `localStorage`. |
| `lib/api.ts`                    | Axios instance (base URL from `VITE_API_URL`, `withCredentials`, Bearer-token interceptor) + the `apiError` helper. |
| `lib/types.ts`                  | Shared TypeScript types — `User`, `Interview`, `InterviewQuestion`, `Difficulty`, `InterviewSummary`. |
| `components/Navbar.tsx`         | Top navigation — auth-aware links and sign-out.                                                   |
| `components/ProtectedRoute.tsx` | Route guard — shows a loader while auth resolves, redirects to `/login` if signed out.            |
| `components/ScoreChart.tsx`     | Recharts bar chart of per-question scores, color-coded by band.                                  |
| `pages/Landing.tsx`             | Public landing page (hero + "how it works" steps, Framer Motion).                                |
| `pages/Login.tsx`              | Sign-in form.                                                                                     |
| `pages/Register.tsx`           | Sign-up form.                                                                                     |
| `pages/Dashboard.tsx`          | Start a new interview (role / difficulty / count) and list past interviews.                       |
| `pages/Interview.tsx`          | The interview screen — answer questions one at a time, then submit.                               |
| `pages/Results.tsx`            | Graded results — overall verdict, score chart, and per-question feedback.                         |

### Root & config

| File                    | Responsibility                                                              |
| ----------------------- | --------------------------------------------------------------------------- |
| `package.json` (root)   | The orchestrator — `setup` / `dev` / `build` / `start` / `seed` scripts.     |
| `.env` / `.env.example` | The single shared environment for both apps.                                |
| `client/vite.config.ts` | Vite config — port 5173, `/api` proxy → 5000, `envDir: '..'` for the shared `.env`. |
| `server/tsconfig.json` · `client/tsconfig.json` | TypeScript configs for each side.                       |

---

## Project structure

```
01-ai-mock-interview/
├── .env.example            # single shared env for client + server
├── package.json            # root orchestrator — runs both with one command
│
├── client/                 # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Navbar, ProtectedRoute, ScoreChart
│   │   ├── context/         # AuthContext (session state)
│   │   ├── lib/             # api client + shared types
│   │   ├── pages/           # Landing, Login, Register, Dashboard, Interview, Results
│   │   ├── App.tsx          # route table
│   │   └── main.tsx         # entry point
│   ├── index.html
│   └── vite.config.ts       # envDir: '..' → uses the shared root .env
│
└── server/                 # Express + TypeScript + Gemini backend
    ├── src/
    │   ├── config/          # env + db
    │   ├── middleware/      # auth, validate, error
    │   ├── models/          # User, Interview, Question
    │   ├── routes/          # auth.routes, interview.routes
    │   ├── services/        # gemini (AI + offline fallbacks)
    │   ├── utils/           # token, asyncHandler
    │   ├── app.ts           # Express app + /api/health
    │   ├── index.ts         # entry point
    │   └── seed.ts          # question-bank seed script
    └── tsconfig.json
```

---

## Roadmap

- [x] Project structure + configs (client, server, root)
- [x] Single shared `.env` wiring (client + server)
- [x] One-command dev runner (`concurrently`)
- [x] Database seed script (question bank)
- [x] Auth — register / login with JWT (`routes/`, `models/User`, `middleware/auth`)
- [x] AI interview flow (Gemini question generation in `services/gemini.ts`)
- [x] Answer scoring + feedback (with an offline fallback when no API key)
- [x] Frontend pages + UI (`client/src/pages`, `components`)
- [ ] Adaptive follow-up questions that react to the candidate's answer
- [ ] Resume / job-description–tailored questions (Multer + pdf-parse)
- [ ] Streaming feedback

---

## Troubleshooting

| Symptom                                    | Fix                                                                                 |
| ------------------------------------------ | ----------------------------------------------------------------------------------- |
| `EADDRINUSE` / port already in use         | Change `PORT` (server) or Vite `server.port`, or stop whatever is using 5000 / 5173. |
| `MongooseServerSelectionError` on seed/boot | MongoDB isn't running or `MONGODB_URI` is wrong. Start `mongod` or fix the URI.     |
| `querySrv ECONNREFUSED` with an Atlas URI  | Your Node env can't resolve the SRV record — use the non-SRV multi-host URI (see the Atlas note above). |
| `process.env.X` is `undefined`             | No `.env` at the project root. Run `cp .env.example .env` and fill it in.            |
| Client calls fail / 404 on `/api/...`      | Server not running, or `VITE_API_URL` is wrong. Ensure the server is up on 5000.     |
| Interview questions look repetitive/generic | The question bank isn't seeded and there's no Gemini key. Run `npm run seed` and/or set `GEMINI_API_KEY`. |
| Added `GEMINI_API_KEY` but still offline   | Restart `npm run dev` — env is read at startup, not hot-reloaded. Check the key is valid and `GEMINI_MODEL` isn't a retired alias. |

---

## Tech stack

- **Client:** React 18, Vite 6, TypeScript, React Router, Framer Motion, Recharts, Axios, react-hot-toast, lucide-react
- **Server:** Express, TypeScript, MongoDB (Mongoose), JWT auth, Google Gemini (`@google/generative-ai`), Zod, bcryptjs
- **Tooling:** concurrently (one-command dev), tsx (server dev/seed)
