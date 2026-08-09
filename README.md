# MockMate AI

> Practice interviews with an AI interviewer (or take an AI quiz) and get instant, actionable feedback.

A single project that runs a **React (Vite + JavaScript) client** and an **Express (JavaScript + Google Gemini) server** together, from **one command**, using **one shared `.env`**.

Everything is written in plain **JavaScript / JSX** — no TypeScript. The backend is modular CommonJS files (one model per file, one controller per feature); the frontend is small React components and pages with focused responsibilities.

---

## Key Features

### 🌟 Core Interview Capabilities
- **Two Practice Modes** — open-ended **Questions** (AI-graded with actionable feedback) or a multiple-choice **Quiz** (auto-scored, includes code output & problem-solving questions).
- **Role, Level & Category Aware** — customize interviews by technical category (**Frontend, Backend, Java, Python, .NET, MERN, React, SQL, HR, Aptitude**), experience level, and difficulty.
- **Resume-Tailored Questions** — upload a PDF resume; extracted text is passed to Gemini to tailor questions to your specific skill set.
- **Multiple Gemini API Keys with Auto-Fallback** — automatically retries next keys when rate limits occur.
- **Offline Fallback** — *Questions* mode falls back to a seeded question bank and heuristic grading if no Gemini API key is provided.

### 🚀 10 Feature Enhancements
1. **🌗 Dark & Light Mode** — toggle between sleek dark mode and bright modern light mode, saved across sessions in local storage.
2. **👤 Candidate Profile Page (`/profile`)** — customize name, bio headline, avatar emoji, and safely change password with current password confirmation.
3. **🔖 Question Bookmarks (`/bookmarks`)** — save key interview questions for later review, add personal notes, and filter saved questions by category.
4. **🎓 Milestone Certificates (`/certificates`)** — earn official, downloadable, and printable verified certificates (1st interview, 3 interviews, 5 interviews, 80%+ high score).
5. **🏆 Community Leaderboard (`/leaderboard`)** — see top-ranking candidates based on overall interview scores and total completed sessions.
6. **⏱️ Optional Interview Timer** — set optional countdown timers (per question or total time limit) with visual urgency alerts and auto-submission.
7. **📝 Personal Notes System** — record per-question notes during sessions or overall interview takeaways to revisit later.
8. **🏷️ 10+ Tech Categories** — target specific domain technical stacks in Gemini prompt generation.
9. **🔍 Session Search & Filtering** — instant search bar on the Dashboard to filter past history by role, category, or mode.
10. **✨ Premium Modern UI** — glassmorphism design system, smooth micro-animations, responsive layout, and mobile drawer navigation.

---

## Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| **Node.js** | ≥ 18 | Required by Vite 6 and global `fetch`. Check with `node -v`. |
| **npm** | ≥ 9 | Ships with Node 18+. |
| **MongoDB** | Recent | Local instance (`mongod`) or a MongoDB Atlas URI. |
| **Gemini API key** | Optional | Free key from [Google AI Studio](https://aistudio.google.com/apikey). |

---

## Quick Start

```bash
cd MockMate AI

npm run setup          # 1) Install root + client + server dependencies
cp .env.example .env   # 2) Create your env file (fill in secrets)
npm run seed           # 3) Seed admin user + default settings + fallback question bank
npm run dev            # 4) Run client + server together
```

- **Client:** [http://localhost:5174](http://localhost:5174)
- **Server:** [http://localhost:5050](http://localhost:5050) (Health check: `GET /api/health`)

---

## One Shared Environment (`.env`)

A single `.env` file lives at the root and powers both client and server:

| Variable | Used by | Purpose |
| --- | --- | --- |
| `PORT` | server | API port (default `5050`) |
| `NODE_ENV` | server | `development` / `production` |
| `CLIENT_URL` | server | CORS allowed origin for client |
| `MONGODB_URI` | server | MongoDB connection string |
| `JWT_SECRET` | server | Token signing secret |
| `JWT_EXPIRES_IN` | server | Token expiration duration (e.g. `7d`) |
| `GEMINI_API_KEY` / `GEMINI_API_KEYS` | server | Google Gemini API key(s) |
| `SMTP_HOST/PORT/USER/PASS/FROM` | server | Optional SMTP configuration for OTP emails |

---

## API Endpoints

| Method & Path | Auth | Purpose |
| --- | :---: | --- |
| **Auth & Profile** | | |
| `POST /api/auth/register` | — | Register new user |
| `POST /api/auth/login` | — | Authenticate user |
| `GET /api/auth/me` | ✅ | Fetch active user profile |
| `PATCH /api/auth/profile` | ✅ | Update profile name, bio, avatar, theme |
| `POST /api/auth/change-password` | ✅ | Secure password change |
| **Interviews & Quizzes** | | |
| `POST /api/interviews` | ✅ | Start new interview or quiz with category & timer |
| `GET /api/interviews` | ✅ | Fetch user interview history |
| `GET /api/interviews/leaderboard` | ✅ | Get top candidate rankings |
| `GET /api/interviews/:id` | ✅ | Retrieve specific session |
| `POST /api/interviews/:id/submit` | ✅ | Grade & save session answers |
| `PATCH /api/interviews/:id/notes` | ✅ | Save personal notes |
| `DELETE /api/interviews/:id` | ✅ | Remove session from history |
| **Bookmarks** | | |
| `GET /api/bookmarks` | ✅ | List bookmarked questions |
| `POST /api/bookmarks` | ✅ | Save a new bookmark |
| `PATCH /api/bookmarks/:id/notes` | ✅ | Update notes on a bookmark |
| `DELETE /api/bookmarks/:id` | ✅ | Delete bookmark |
| **Admin** | | |
| `GET /api/admin/users` | Admin | List all users |
| `PATCH /api/admin/users/:id/role` | Admin | Update user role (`user`/`admin`) |
| `DELETE /api/admin/users/:id` | Admin | Delete candidate account |

---

## Project Structure

```
MockMate AI/
├── .env.example
├── package.json
├── server/
│   ├── src/
│   │   ├── app.js
│   │   ├── index.js
│   │   ├── seed.js
│   │   ├── controllers/
│   │   │   ├── admin.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── bookmark.controller.js
│   │   │   └── interview.controller.js
│   │   ├── models/
│   │   │   ├── Bookmark.model.js
│   │   │   ├── Interview.model.js
│   │   │   ├── Question.model.js
│   │   │   ├── Setting.model.js
│   │   │   └── User.model.js
│   │   ├── routes/
│   │   │   ├── admin.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── bookmark.routes.js
│   │   │   └── interview.routes.js
│   │   └── services/
│   │       ├── email.js
│   │       └── gemini.js
└── client/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── ScoreChart.jsx
    │   │   └── Timer.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── ThemeContext.jsx
    │   └── pages/
    │       ├── Bookmarks.jsx
    │       ├── Certificates.jsx
    │       ├── Dashboard.jsx
    │       ├── Interview.jsx
    │       ├── Leaderboard.jsx
    │       ├── Profile.jsx
    │       ├── Quiz.jsx
    │       └── Results.jsx
```

---

## Tech Stack

- **Frontend:** React 18, Vite 6, React Router 6, Lucide Icons, Recharts, Axios, React Hot Toast
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), Google Gemini AI (`@google/generative-ai`), JWT Authentication, bcryptjs, Unpdf (resume parsing)
- **Styling:** Custom CSS variables design system supporting Light and Dark modes, Glassmorphism elements, and Responsive Layouts.
