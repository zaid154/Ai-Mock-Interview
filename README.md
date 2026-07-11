# MockMate AI

> Practice interviews with an AI interviewer (or take an AI quiz) and get instant, actionable feedback.

A single project that runs a **React (Vite + JavaScript) client** and an
**Express (JavaScript + Google Gemini) server** together, from **one command**,
using **one shared `.env`**.

Everything is written in plain **JavaScript / JSX** — no TypeScript. The backend
is small CommonJS files (one model per file, one controller per feature); the
frontend is small React components and pages, one clear job each.

---

## Features

- **Email + password auth** (JWT in an httpOnly cookie *and* a `Bearer` header).
  A password reset revokes any tokens issued before it (via `tokenVersion`).
- **Email OTP verification** — optional at signup (create the account now, verify
  later) with resend. When an admin makes verification mandatory, a new account is
  created but no session is issued until the email is verified.
- **Clear email verification journey** — users first send a code, then receive a
  confirmation showing where it was sent and a reminder to check Spam/Promotions
  before entering the six-digit code. Resending is available after a short cooldown.
- **Forgot / reset password** using the same OTP system.
- **Admin panel** — manage users (verify/unverify, promote/demote admin, delete),
  a flexible add/edit/rename/delete settings table, and a global toggle that makes
  email verification mandatory.
- **Multiple Gemini API keys with auto-fallback** — tries keys in order and skips
  a rate-limited key for a short cooldown.
- **Two practice modes** — open-ended **Questions** (AI-graded) or a multiple-choice
  **Quiz** (auto-scored, includes "what's the output of this code?" problem-solving
  questions).
- **Role + experience aware** — questions match the role and experience level you pick.
- **Resume-tailored questions** — upload a PDF; its text is used to tailor questions.
- **Session history** — every interview/quiz is saved; reopen a past one or delete it.

> The app still works **without** a Gemini key: *Questions* mode falls back to a
> seeded question bank and heuristic scoring. *Quiz* mode needs a working key
> (it's fully AI-generated).

---

## Prerequisites

| Tool               | Version    | Notes                                                        |
| ------------------ | ---------- | ------------------------------------------------------------ |
| **Node.js**        | ≥ 18       | Required by Vite 6, and for the global `fetch`. `node -v`.   |
| **npm**            | ≥ 9        | Ships with Node 18+.                                          |
| **MongoDB**        | any recent | Local (`mongod`) or a MongoDB Atlas URI.                     |
| **Gemini API key** | optional   | Free key from [Google AI Studio](https://aistudio.google.com/apikey). Without it, Questions mode uses the offline fallback; Quiz mode is disabled. |

---

## Quick start

```bash
cd Ai-Mock-Interview

npm run setup          # 1) install root + client + server deps
cp .env.example .env   # 2) create your env (fill in the secrets)
npm run seed           # 3) create the admin user + default settings + fallback bank
npm run dev            # 4) run client + server together
```

- Client → http://localhost:5174
- Server → http://localhost:5050  (health check: `GET /api/health`)

> **Ports:** this project uses **5050** (server) and **5174** (client) so it
> doesn't clash with a sibling "mockmate" project on 5000/5173. Change `PORT`
> (`.env`) and Vite's `server.port` / `proxy` in
> [`client/vite.config.js`](client/vite.config.js) if you like — keep them in sync.

The Vite dev server proxies `/api` to the backend, so the client calls `/api/...`
directly with no CORS setup in development.

---

## Default admin & OTP codes (local dev)

`npm run seed` creates/updates an **admin** user from the `ADMIN_*` values in
`.env` (default `admin@mockmate.com` / `Admin@123`). Sign in and open **Admin**
in the navbar.

OTP codes are delivered only through configured SMTP email. They are never
printed to the server console or returned by the API. Configure `SMTP_*` before
using email verification or password reset.

---

## One shared environment

There is a **single `.env`** at the project root — both apps read it:

- The **server** loads it via [`server/src/config/env.js`](server/src/config/env.js)
  (`dotenv`, pointed at the repo root).
- The **client** loads it via Vite's `envDir: '..'` in
  [`client/vite.config.js`](client/vite.config.js).

Only variables prefixed with `VITE_` are exposed to the browser bundle, so server
secrets stay server-side even though they live in the same file.

| Variable          | Used by | Purpose                                                                 |
| ----------------- | ------- | ----------------------------------------------------------------------- |
| `PORT`            | server  | API port (default 5050)                                                 |
| `NODE_ENV`        | server  | `development` / `production` (controls secure cookies)                  |
| `CLIENT_URL`      | server  | CORS origin for the frontend. **Blank = same-origin** (prod)            |
| `MONGODB_URI`     | server  | MongoDB connection string (**note the name — not `MONGO_URI`**)         |
| `JWT_SECRET`      | server  | Signing secret for auth tokens                                          |
| `JWT_EXPIRES_IN`  | server  | Token lifetime (e.g. `7d`)                                              |
| `ADMIN_NAME/EMAIL/PASSWORD` | seed | The admin account created by `npm run seed`                       |
| `GEMINI_API_KEY`  | server  | A single Gemini key (optional)                                          |
| `GEMINI_API_KEYS` | server  | Multiple keys, comma-separated, for auto-fallback (optional)           |
| `GEMINI_MODEL`    | server  | Gemini model (default `gemini-2.5-flash`)                               |
| `SMTP_HOST/PORT/USER/PASS/FROM` | server | Required SMTP configuration for OTP emails                     |
| `VITE_API_URL`    | client  | Base URL of the API (browser-exposed). Blank = relative `/api`          |

> You can also add/rotate **Gemini keys** from the **admin panel** (stored in the
> DB), on top of any keys in `.env`.

---

## How the AI works

All AI lives in [`server/src/services/gemini.js`](server/src/services/gemini.js):

| Function              | With a working key                                     | Without a key                          |
| --------------------- | ------------------------------------------------------ | -------------------------------------- |
| `generateQuestions()` | Gemini writes role/experience-specific questions       | seeded question bank (offline)         |
| `generateQuiz()`      | Gemini writes MCQs incl. code-output questions          | **disabled** (API returns 503)         |
| `evaluateInterview()` | Gemini grades each answer + overall score              | length-based heuristic scoring         |

**Multiple keys / auto-fallback:** keys are gathered from the admin setting
`gemini_api_keys` (array) plus `GEMINI_API_KEYS` / `GEMINI_API_KEY` in `.env`.
`generateJson()` tries them in order; a key that hits an error is put on a short
in-memory cooldown and skipped until it expires, then retried. Simple loop +
timestamp — no queue or worker.

---

## Auth & sessions

- A JWT is signed with the user id **and** their current `tokenVersion`, and sent
  as an httpOnly cookie plus returned for the `Bearer` header.
- `requireAuth` verifies the token, then loads the user and checks the account
  still exists and the token's `tokenVersion` still matches — so a **password
  reset (which bumps `tokenVersion`) instantly invalidates older tokens** on every
  device.
- **Ownership is enforced server-side:** interview reads/writes/deletes are scoped
  to the signed-in user (`{ user: req.userId }`), so no one can touch another
  user's data. Admin routes additionally require the `admin` role.
- Admins can't delete or change the role of **their own** account (prevents an
  accidental self-lockout).

---

## Deployment (localhost vs Vercel)

The app runs as **two pieces**: a static client and an API server. Common
"works locally, breaks after deploy" causes are handled:

1. **Env var name** — the code reads `MONGODB_URI`. (The old `.env` used
   `MONGO_URI`, which was never read, so it silently used localhost. Fixed.)
2. **API base URL** — the client uses `VITE_API_URL`, falling back to a relative
   `/api`. In production set `VITE_API_URL` to your deployed API origin
   (e.g. `https://your-api.onrender.com/api`).
3. **SPA routing (404 on refresh)** — [`client/vercel.json`](client/vercel.json)
   rewrites all non-`/api` paths to `index.html` so `/dashboard`, `/admin`, etc.
   don't 404 on reload.
4. **Cross-site cookies** — in production the auth cookie is sent with
   `SameSite=None; Secure` so it survives a client and API on different domains.
   Set `CLIENT_URL` to the exact frontend origin (for CORS with credentials).
5. **No local disk needed** — uploaded resumes are parsed **in memory** and only
   the extracted text is stored, so it works on serverless hosts.

**Recommended shape:** deploy the **client** to Vercel (root = `client/`,
build `npm run build`, output `dist`) and the **server** to a host that runs a
long-lived Node process (Render / Railway / Fly). Point `VITE_API_URL` at the
server and set `CLIENT_URL` on the server to the Vercel URL.

### Fix for Vercel + Render login CORS errors

If the browser console shows a request to `http://localhost:5050` from the
Vercel site, the deployed client was built with the local API URL. Update both
hosts, then redeploy them:

| Host | Dashboard location | Name | Value |
| --- | --- | --- | --- |
| Vercel (Production) | Project -> Settings -> Environment Variables | `VITE_API_URL` | `https://YOUR-RENDER-SERVICE.onrender.com/api` |
| Render | Service -> Environment | `CLIENT_URL` | `https://ai-mock-interview-83spf9fuj-mohd-zaid-s-projects1.vercel.app` |
| Render | Service -> Environment | `NODE_ENV` | `production` |

Do not include a trailing slash in either URL. **Redeploy Render after changing
`CLIENT_URL`, then redeploy Vercel after changing `VITE_API_URL`**. `VITE_*`
values are compiled into the client bundle, so updating a Vercel environment
variable alone cannot change an already-deployed site. Verify the server first
at `https://YOUR-RENDER-SERVICE.onrender.com/api/health`; it should return JSON
with `"status": "ok"`.

---

## Email verification flow

The `/verify` screen starts with **Send verification code** as its primary action.
The code input appears only after a code has been sent, so users are not left
wondering where to find it. The confirmation names the destination email and asks
the user to check their inbox (including Spam or Promotions) before entering the
six-digit code.

After the registration form is submitted, the account stays in a **pending**
state: it has no auth session, dashboard access, or signed-in header. The account
is finalized only when the user enters a valid OTP or explicitly selects **Skip
for now** (when verification is optional). Either action starts the session and
then shows the authenticated header.

Registration sends the first verification code automatically. Users therefore
open the verification screen directly at the “Code sent” step. Users arriving
from login, or whose initial email could not be delivered, are instead shown the
clear first step to send a code.

## API endpoints

| Method & path                          | Auth  | Body                                              |
| -------------------------------------- | :---: | ------------------------------------------------- |
| `GET /api/health`                      |  —    | —                                                 |
| `POST /api/auth/register`              |  —    | `{ name, email, password }`                       |
| `POST /api/auth/login`                 |  —    | `{ email, password }`                             |
| `POST /api/auth/verify-otp`            |  —    | `{ email, otp }`                                  |
| `POST /api/auth/complete-registration` |  —    | `{ registrationToken }`                           |
| `POST /api/auth/resend-otp`            |  —    | `{ email }`                                       |
| `POST /api/auth/forgot-password`       |  —    | `{ email }`                                       |
| `POST /api/auth/reset-password`        |  —    | `{ email, otp, newPassword }`                     |
| `POST /api/auth/logout`                |  —    | —                                                 |
| `GET /api/auth/me`                     |  ✅   | —                                                 |
| `POST /api/interviews`                 |  ✅   | `{ role, experience, difficulty, mode, count, useResume }` |
| `GET /api/interviews`                  |  ✅   | —                                                 |
| `GET /api/interviews/:id`              |  ✅   | —                                                 |
| `POST /api/interviews/:id/submit`      |  ✅   | `{ answers }` (strings for questions, option indexes for quiz) |
| `DELETE /api/interviews/:id`           |  ✅   | — (remove your own session)                       |
| `POST /api/interviews/resume`          |  ✅   | multipart: `resume` (PDF)                          |
| `GET /api/admin/users`                 | admin | —                                                 |
| `PATCH /api/admin/users/:id/verified`  | admin | `{ isVerified }`                                  |
| `PATCH /api/admin/users/:id/role`      | admin | `{ role: 'user' \| 'admin' }` (not your own)      |
| `DELETE /api/admin/users/:id`          | admin | — (not your own)                                  |
| `GET /api/admin/settings`              | admin | —                                                 |
| `PUT /api/admin/settings`              | admin | `{ key, value }` (upsert)                         |
| `PATCH /api/admin/settings/:key/rename`| admin | `{ newKey }`                                      |
| `DELETE /api/admin/settings/:key`      | admin | —                                                 |

---

## Commands

| Command              | What it does                                          |
| -------------------- | ----------------------------------------------------- |
| `npm run setup`      | Install deps for root **+ client + server**           |
| `npm run dev`        | Run client and server together (via `concurrently`)   |
| `npm run dev:client` | Run only the client                                   |
| `npm run dev:server` | Run only the server (`nodemon`)                       |
| `npm run build`      | Build the client (`vite build`) — the server is plain JS, no build |
| `npm run start`      | Start the server (`node server/src/index.js`)         |
| `npm run seed`       | Create admin + default settings + fallback question bank |

---

## Project Structure

Every file, with a one-line explanation.

### Root

| File / folder            | What it does                                                                 |
| ------------------------ | --------------------------------------------------------------------------- |
| `package.json`           | Orchestrator scripts — `setup` / `dev` / `build` / `start` / `seed`.        |
| `.env` / `.env.example`  | The single shared environment for both apps.                                |
| `.gitignore`             | Ignores `node_modules`, `dist`, and the `.env`.                             |

### Server — `server/src/`

| File                              | What it does                                                                                   |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| `index.js`                        | Entry point. Loads env, connects to MongoDB, then starts Express. Exits if the DB is unreachable. |
| `app.js`                          | Builds the Express app: CORS, JSON + cookie parsing, logging, mounts the routers, `/api/health`, 404 + error handlers. |
| `seed.js`                         | `npm run seed` — inserts the fallback question bank, upserts the admin user, and default settings. |
| **config/**                       |                                                                                                |
| `config/env.js`                   | Loads the shared root `.env` (required first, before anything reads `process.env`).            |
| `config/db.js`                    | `connectDB(uri)` — thin wrapper around `mongoose.connect`.                                      |
| **models/** (one per file)        |                                                                                                |
| `models/User.model.js`            | User schema — name/email/passwordHash, `role`, `isVerified` + `otp*` fields, `resumeText`, and `tokenVersion` (bumped on reset to revoke old JWTs). |
| `models/Interview.model.js`       | Interview schema — role/experience/difficulty/`mode`, embedded questions (open-ended **and** quiz fields), overall score/summary. |
| `models/Question.model.js`        | Seed-time fallback question bank (used only in Questions mode when Gemini is unavailable).      |
| `models/Setting.model.js`         | Flexible `{ key, value }` config the admin panel edits (value is Mixed — string/boolean/array). |
| **controllers/** (one per feature)|                                                                                                |
| `controllers/auth.controller.js`  | register / login / verify-otp / complete-registration / resend-otp / forgot-password / reset-password / logout / me. Reset bumps `tokenVersion`; registration withholds the session until OTP verification or an optional skip. |
| `controllers/admin.controller.js` | users (list, set verified, change role, delete — with self-guards) + settings CRUD (list/upsert/rename/delete). |
| `controllers/interview.controller.js` | start (questions or quiz), list, get one, submit (AI grade or quiz auto-score), delete, resume upload (PDF → text via `unpdf`). |
| **routes/** (thin)                |                                                                                                |
| `routes/auth.routes.js`           | Auth routes + their Zod validation schemas.                                                    |
| `routes/admin.routes.js`          | Admin routes, all behind `requireAuth` + `requireAdmin`.                                       |
| `routes/interview.routes.js`      | Interview routes + the Multer (in-memory) upload for resumes.                                   |
| **middleware/**                   |                                                                                                |
| `middleware/auth.js`              | `requireAuth` (verifies the Bearer/cookie JWT, then confirms the user exists and the token's `tokenVersion` matches) and `requireAdmin` (checks the admin role). |
| `middleware/validate.js`          | `validate(schema)` — Zod body validation, 400 on failure.                                       |
| `middleware/error.js`             | 404 handler + central error handler (maps common Mongo/Multer errors).                          |
| **services/**                     |                                                                                                |
| `services/gemini.js`              | The AI layer — question/quiz generation + grading, multiple-key fallback, offline fallbacks.   |
| `services/email.js`               | Sends OTP email via SMTP and refuses delivery when SMTP is not configured.                       |
| **utils/**                        |                                                                                                |
| `utils/token.js`                  | `signToken(userId, tokenVersion)` / `verifyToken` (jsonwebtoken).                               |
| `utils/otp.js`                    | Generate, hash, expire, and timing-safely validate a 6-digit OTP.                              |
| `utils/settings.js`               | `getSetting(key, fallback)` — read one Setting value.                                           |
| `utils/asyncHandler.js`           | `wrap()` — forwards async errors to the Express error handler.                                  |

### Client — `client/src/`

| File                              | What it does                                                                                   |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| `main.jsx`                        | React entry — mounts `App` inside Router, `AuthProvider`, and the toast `Toaster`.             |
| `App.jsx`                         | Route table — public auth pages, protected app pages, and the admin-only page.                 |
| `index.css`                       | Global styles + dark theme (all component styling lives here).                                 |
| **context/**                      |                                                                                                |
| `context/AuthContext.jsx`         | Auth state + `login` / `register` / `logout` / `refreshUser`. Restores the session via `/auth/me`. |
| **lib/**                          |                                                                                                |
| `lib/api.js`                      | Axios instance (base URL, Bearer interceptor) + `apiError()` helper.                            |
| **components/**                   |                                                                                                |
| `components/Navbar.jsx`           | Top navigation — auth-aware links, admin link, sign-out.                                        |
| `components/ProtectedRoute.jsx`   | Guard — waits for auth, redirects to `/login` if signed out.                                    |
| `components/AdminRoute.jsx`       | Guard — like ProtectedRoute but also requires the admin role.                                   |
| `components/ScoreChart.jsx`       | Recharts bar chart of per-question scores.                                                      |
| **pages/**                        |                                                                                                |
| `pages/Landing.jsx`               | Public landing page (hero + how-it-works).                                                      |
| `pages/Login.jsx`                 | Sign in; routes to `/verify` when the API says verification is required.                        |
| `pages/Register.jsx`              | Sign up, then send the user to `/verify`.                                                       |
| `pages/OtpVerify.jsx`             | Enter the email OTP, resend it, or **skip** for now.                                            |
| `pages/ForgotPassword.jsx`        | Two-step reset: email → OTP + new password.                                                     |
| `pages/Dashboard.jsx`             | Start a session — role, experience, difficulty, mode toggle, resume upload — and the past-sessions list (open or delete each). |
| `pages/Interview.jsx`             | Open-ended interview — answer one question at a time, then submit.                              |
| `pages/Quiz.jsx`                  | Multiple-choice quiz — pick an option per question, then submit.                                |
| `pages/Results.jsx`               | Graded results — verdict, score chart, and a per-question breakdown (answers *or* the MCQ key). |
| `pages/AdminDashboard.jsx`        | Admin panel — verification toggle, Gemini keys, users table (verify, promote/demote, delete), flexible settings CRUD. |
| **config**                        |                                                                                                |
| `index.html`                      | Vite HTML entry (loads `/src/main.jsx`).                                                        |
| `vite.config.js`                  | Vite config — port 5174, `/api` proxy → 5050, `envDir: '..'` for the shared `.env`.            |
| `jsconfig.json`                   | Light JS/JSX editor config (no type-checking).                                                  |
| `vercel.json`                     | SPA rewrite so client-side routes don't 404 on refresh when deployed.                           |

---

## Troubleshooting

| Symptom                                     | Fix                                                                                 |
| ------------------------------------------- | ----------------------------------------------------------------------------------- |
| `EADDRINUSE` / port already in use          | Change `PORT` (server) or Vite `server.port`, or stop whatever is on 5050 / 5174.   |
| `Could not connect to MongoDB`              | MongoDB isn't running or `MONGODB_URI` is wrong. Start `mongod` or fix the URI.     |
| `querySrv ECONNREFUSED` with an Atlas URI   | Your network can't resolve the `mongodb+srv` SRV record. Use the **non-SRV** multi-host URI form: `mongodb://user:pass@host-00:27017,host-01:27017,host-02:27017/mockmate?ssl=true&replicaSet=<name>&authSource=admin`. |
| OTP never arrives                           | Configure valid `SMTP_*` values; OTPs are never exposed in logs.                    |
| Quiz mode says it needs a key               | Quiz is fully AI-generated. Add a working `GEMINI_API_KEY` (or a key in the admin panel). |
| Questions look repetitive/generic           | No Gemini key → the offline bank is small. Add a key, or `npm run seed` the bank.   |
| Client 404s on refresh after deploy         | Ensure `vercel.json` (SPA rewrite) is deployed with the client.                     |
| Login works locally, fails after deploy     | Set `VITE_API_URL` to the deployed API, and `CLIENT_URL` (server) to the frontend origin. |

---

## Tech stack

- **Client:** React 18, Vite 6, React Router, Framer Motion, Recharts, Axios, react-hot-toast, lucide-react
- **Server:** Express, MongoDB (Mongoose), JWT auth (bcryptjs), Google Gemini (`@google/generative-ai`), Multer + unpdf (resume PDF text extraction), Nodemailer (OTP email), Zod (validation)
- **Tooling:** concurrently (one-command dev), nodemon (server reload)
