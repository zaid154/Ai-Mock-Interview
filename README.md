# MockMate AI

> AI-Powered Mock Interview Platform with Real-Time Gemini Line-by-Line Evaluation, Automated Certificate Generation & Public Credential Verification.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-6366f1?style=for-the-badge&logo=vercel)](https://ai-mock-interview-three-pi.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

A full-stack MERN application that runs a **React (Vite + JavaScript) client** and an **Express (JavaScript + Google Gemini 2.5) server** together from one command.

---

## 🌟 Key Features

### 🎯 Core Interview Capabilities
- **Two Practice Modes**: Open-ended **Questions** (AI-graded with actionable line-by-line feedback) or multiple-choice **Quiz** (auto-scored, includes code output & problem-solving questions).
- **Role, Level & Category Aware**: Customize interviews by technical category (**Frontend, Backend, Fullstack, MERN, Java, Python, .NET, SQL, HR, Aptitude**), experience level, and difficulty.
- **Resume-Tailored Questions**: Upload a PDF resume (`unpdf` parsing); extracted text is passed to Gemini to tailor questions to your specific skill set.
- **Multiple Gemini API Keys with Auto-Fallback**: Automatically rotates keys in a pool when rate limits occur.
- **Offline Question Fallback**: Falls back to a seeded question bank and heuristic grading if no Gemini API key is active.

### 📜 Official Milestone Credentials & Public Verification Portal
- **🎓 4 Milestone Certificates**: Earn official credentials (1st Interview, 3 Interviews, 5 Interviews, 80%+ High Score).
- **📥 1-Click High-Res PDF Download**: Download vector landscape A4 certificate PDF files directly into your Downloads folder (`html2canvas` + `jsPDF`).
- **🔗 Public Credential Verification Portal (`/verify-certificate/:certId`)**: Every certificate includes a unique verification code (`MM-CERT-XXXXXXXX`), vector QR code, and public verification link. Anyone can verify candidate authenticity on the live portal!
- **✍️ Admin Certificate Authority Signature Control**: Admins can upload custom handwritten signature images (PNG/SVG) and set signatory name & title from the Admin Control Panel.

### 🛡️ Administrative Command Control (`/admin`)
- **🔑 Gemini API Key Rotation Pool**: Add, monitor, and remove Gemini API keys in rotation.
- **🔒 Email Verification Policy**: Toggle mandatory OTP email verification requirement before user logins.
- **🌗 Theme Toggle Visibility Control**: Admins can hide/show candidate light/dark theme switchers in real-time.
- **👥 Candidate User Management**: Verify, demote, promote, or delete candidate accounts.

### 🚀 Additional Platform Capabilities
1. **🌗 Dark & Light Mode**: Sleek dark mode and bright modern light mode with high-contrast UI tokens.
2. **👤 Candidate Profile Page (`/profile`)**: Customize name, bio headline, avatar, theme, and safely change passwords.
3. **🔖 Question Bookmarks (`/bookmarks`)**: Save key interview questions for later review, add personal notes, and filter by category.
4. **🏆 Community Leaderboard (`/leaderboard`)**: Rank top candidates based on overall scores and session counts.
5. **⏱️ Optional Interview Timer**: Countdown timers (per question or total time limit) with visual urgency alerts.
6. **📝 Personal Session Notes**: Record per-question notes during sessions or overall interview takeaways.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite 6, React Router 6, Lucide Icons, Recharts, `html2canvas`, `jspdf`, Axios, React Hot Toast
- **Backend:** Node.js, Express.js, MongoDB Atlas (Mongoose), Google Gemini AI (`@google/generative-ai`), JWT Cookie Auth, bcryptjs, `unpdf`
- **Styling:** Custom CSS variables design system supporting Light and Dark modes, Glassmorphism, and Responsive Layouts.

---

## 🚀 Quick Start

```bash
cd "MockMate AI"

npm run setup          # 1) Install root + client + server dependencies
cp .env.example .env   # 2) Create your env file (fill in secrets)
npm run seed           # 3) Seed admin user + default settings + completed sample interviews
npm run dev            # 4) Run client + server together
```

- **Client:** [http://localhost:5173](http://localhost:5173)
- **Server:** [http://localhost:5050](http://localhost:5050) (Health check: `GET /api/health`)
- **Live Vercel Site:** [https://ai-mock-interview-three-pi.vercel.app/](https://ai-mock-interview-three-pi.vercel.app/)

---

## 🔑 Shared Environment (`.env`)

A single `.env` file lives at the root and powers both client and server:

| Variable | Used by | Purpose |
| --- | --- | --- |
| `PORT` | server | API port (default `5050`) |
| `NODE_ENV` | server | `development` / `production` |
| `CLIENT_URL` | server | CORS allowed origin list |
| `MONGODB_URI` | server | MongoDB Atlas / Local connection string |
| `JWT_SECRET` | server | Token signing secret |
| `JWT_EXPIRES_IN` | server | Token expiration duration (e.g. `7d`) |
| `GEMINI_API_KEY` / `GEMINI_API_KEYS` | server | Google Gemini API key(s) |
| `SMTP_HOST/PORT/USER/PASS/FROM` | server | Optional SMTP configuration for OTP emails |

---

## 📡 API Endpoints

| Method & Path | Auth | Purpose |
| --- | :---: | --- |
| **Auth & Verification** | | |
| `POST /api/auth/register` | — | Register new user |
| `POST /api/auth/login` | — | Authenticate user |
| `GET /api/auth/verification-settings` | — | Fetch public platform verification settings |
| `GET /verify-certificate/:certId` | — | Public credential verification page |
| `GET /api/auth/me` | ✅ | Fetch active user profile |
| `PATCH /api/auth/profile` | ✅ | Update profile name, bio, avatar, theme |
| **Interviews & Quizzes** | | |
| `POST /api/interviews` | ✅ | Start new interview or quiz session |
| `GET /api/interviews` | ✅ | Fetch user completed interview history |
| `GET /api/interviews/leaderboard` | ✅ | Get top candidate rankings |
| `GET /api/interviews/:id` | ✅ | Retrieve specific session |
| `POST /api/interviews/:id/submit` | ✅ | Grade & save session answers |
| `PATCH /api/interviews/:id/notes` | ✅ | Save personal notes |
| `DELETE /api/interviews/:id` | ✅ | Remove session from history |
| **Bookmarks** | | |
| `GET /api/bookmarks` | ✅ | List bookmarked questions |
| `POST /api/bookmarks` | ✅ | Save a new bookmark |
| `DELETE /api/bookmarks/:id` | ✅ | Delete bookmark |
| **Admin Operations** | | |
| `GET /api/admin/users` | Admin | List all registered users |
| `PATCH /api/admin/users/:id/role` | Admin | Update user role (`user`/`admin`) |
| `PUT /api/admin/settings` | Admin | Save system settings (signatory, theme toggle, OTP policy) |
| `DELETE /api/admin/users/:id` | Admin | Delete candidate account |

---

## 📂 Project Structure

```
MockMate AI/
├── .env.example
├── package.json
├── README.md
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
    │       ├── Landing.jsx
    │       ├── Leaderboard.jsx
    │       ├── Profile.jsx
    │       ├── Quiz.jsx
    │       ├── Results.jsx
    │       └── VerifyCertificate.jsx
```
