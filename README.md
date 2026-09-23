<div align="center">

  <img src="client/public/logo.png" alt="MockMate AI Logo" width="108" height="108" style="border-radius: 50%;" />

  # MockMate AI
  
  **Next-Generation AI Technical Interview Platform with Real-Time Multi-Modal Evaluation & Verifiable Milestone Credentials**

  [![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-a855f7?style=for-the-badge&logo=vercel)](https://ai-mock-interview-three-pi.vercel.app/)
  [![Google Gemini](https://img.shields.io/badge/AI%20Engine-Gemini%202.5-38bdf8?style=for-the-badge&logo=google)](https://ai.google.dev/)
  [![Node Version](https://img.shields.io/badge/Node.js-18%2B-22c55e?style=for-the-badge&logo=node.js)](https://nodejs.org/)
  [![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

</div>

---

## 🌌 Overview

**MockMate AI** is a full-stack MERN application built for engineering candidates to prepare for competitive technical rounds. It pairs real-time **Google Gemini 2.5** evaluation with candidate telemetry, automated scoring, interactive audio/visual HUD components, and cryptographic milestone certificates with public QR-verification.

Featuring the **Reflect Cosmic Dark Space Aesthetic** (`#030014`, starlight glass borders, radiant purple/cyan neon highlights) and a clean modular architecture where every client file is strictly maintainable.

---

## 🚀 Quick Start

```bash
npm run setup          # 1) Install root + client + server dependencies
cp .env.example .env   # 2) Create your environment file (see configuration below)
npm run seed           # 3) Seed admin, candidate accounts, sessions, and milestones
npm run dev            # 4) Run client + server simultaneously
```

* **Client:** [http://localhost:5173](http://localhost:5173) (or auto-picked port by Vite)
* **API Server:** [http://localhost:5050](http://localhost:5050) (`GET /api/health` for healthcheck)

### Default Seeded Credentials

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `zaidm1323@gmail.com` | `123456` | Full Admin Console + Pre-completed sessions |
| **Admin** | `admin@mockmate.com` | `Admin@123` | Full Admin Console |
| **Candidate** | `aarav.sharma@gmail.com` | `Password123!` | Candidate Hub & Practice Studio |
| **Candidate** | `priya.patel@gmail.com` | `Password123!` | Candidate Hub & Practice Studio |

> Seeded admin credentials can be customized via `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` in `.env`.

---

## ✨ Key Features & Architecture

### 🎙️ 1. Technical Practice Modes (`/practice`)
* **Technical Interview Mode:** Conversational open-ended architectural and algorithmic scenarios with line-by-line AI critique, rubric scoring (Problem Solving, Communication, Code Quality), and model solutions.
* **Rapid Technical Assessment Mode:** Timed multiple-choice challenges evaluating core engineering, algorithmic time-complexity ($O(N)$), and distributed system trade-offs.
* **Stack & Track Customization:** Full Stack, Backend, Frontend, Cloud & DevOps, System Design, Data Structures & Algorithms, and HR / Behavioral.
* **Resume-Driven AI Scenarios:** Upload a candidate CV (PDF parsed server-side via `unpdf`). Gemini synthesizes tailored technical questions targeted specifically at the candidate's declared projects and tech stack.

### ⚡ 2. Gemini Multi-Key Round-Robin Load Balancer
* **Unified Key Pooling:** Seamlessly pools Gemini API keys from both environment variables (`GEMINI_API_KEYS`, `GEMINI_API_KEY`) and dynamic MongoDB admin settings.
* **Round-Robin Balancing:** Distributes incoming AI requests evenly across all healthy keys in the pool, multiplying requests-per-minute (RPM) limits.
* **Automated 60s Cooldown Failover:** If an API key hits rate limits (HTTP 429) or quota errors, it is placed on a 60-second cooldown and the request automatically retries on the next healthy key without throwing an error to the user.

### 📊 3. Candidate Performance Hub (`/dashboard`)
* Dedicated engineering candidate control center.
* Quick-launch cards for Technical Interviews and Assessments.
* Telemetry metrics: Average Score, Total Interviews, Quiz Accuracy, and Performance trends.
* Direct action history with detailed result review and bookmarks.

### 📜 4. Verifiable Milestone Certificates (`/certificates`)
* **3 Modular Card Layouts:** Classic, Modern, and Elegant.
* **Export Options:** 1-click high-fidelity A4 landscape PDF export (`html2canvas` + `jsPDF`).
* **Public Verification Portal:** Public route at `/verify-certificate/:certId` with live scannable QR verification and signatory validation.

### 🛡️ 5. Modular Administrator Console (`/admin`)
Split into dedicated, high-performance management views:
* **Candidate Management (`/admin/users`):** Real-time candidate directory with live avatars, verification toggles, role promotion/demotion (Admin vs Candidate), and account deletion safeguards.
* **Milestone Templates (`/admin/certificates`):** Create, update, style, and retire credential milestones without redeploying code.
* **Platform & AI Settings (`/admin/settings`):** Live AI load balancer pool status, key addition/removal, mandatory email verification switch, signatory credentials, and custom key-value store.

### 🔖 6. Revision Flashcard Vault (`/bookmarks`)
* Save tricky technical interview questions and model answers.
* Attach private markdown revision notes and filter by domain category.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, React Router 6, Lucide Icons, Recharts, Axios, React Hot Toast, `html2canvas`, `jspdf` |
| **Backend** | Node.js, Express, MongoDB (Mongoose), Google Generative AI (`@google/generative-ai`), JWT Cookie Auth, Bcrypt.js, `unpdf`, Zod |
| **Styling** | Reflect Space Design System (`#030014`, starlight glassmorphism, responsive CSS variables, zero runtime CSS overhead) |
| **Security** | HTTP-only same-site cookies, Mongo sanitization, Helmet headers, rate-limiting, SHA-256 hashed OTPs |

---

## 🔑 Environment Configuration (`.env`)

A single `.env` at the root configures both frontend and backend:

```env
NODE_ENV=development
PORT=5050
CLIENT_URL=http://localhost:5173,http://localhost:5174

# Database
MONGODB_URI=mongodb://localhost:27017/mockmate

# Security & Auth
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Default Admin Seed Credentials
ADMIN_NAME=Mohd Zaid
ADMIN_EMAIL=zaidm1323@gmail.com
ADMIN_PASSWORD=ChangeMe123!

# Google Gemini AI (Multiple keys separated by comma)
GEMINI_API_KEY=AIzaSy...
GEMINI_API_KEYS=AIzaSy...,AIzaSy...
GEMINI_MODEL=gemini-2.5-flash

# Email / OTP Delivery (Optional)
BREVO_API_KEY=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=MockMate AI <no-reply@mockmate.ai>
```

---

## 📡 API Reference

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a new account
* `POST /api/auth/login` — Sign in with credentials
* `POST /api/auth/verify-otp` — Verify email OTP code
* `POST /api/auth/resend-otp` — Resend verification OTP
* `POST /api/auth/forgot-password` — Request password reset
* `POST /api/auth/reset-password` — Set new password with OTP
* `GET  /api/auth/me` — Fetch current session user
* `PATCH /api/auth/profile` — Update candidate profile & avatar
* `POST /api/auth/logout` — Invalidate session cookie

### Interviews & Quizzes (`/api/interviews`)
* `POST /api/interviews` — Initialize interview / quiz session
* `POST /api/interviews/resume` — Extract technical stack from PDF resume
* `GET  /api/interviews` — List candidate session history
* `GET  /api/interviews/leaderboard` — Global candidate rankings
* `GET  /api/interviews/:id` — Fetch session questions and state
* `POST /api/interviews/:id/submit` — Submit answers for AI grading
* `PATCH /api/interviews/:id/notes` — Save candidate private notes
* `DELETE /api/interviews/:id` — Delete a session record

### Administration (`/api/admin`)
* `GET    /api/admin/users` — Candidate list with avatars and verification state
* `PATCH  /api/admin/users/:id/verified` — Toggle candidate verification
* `PATCH  /api/admin/users/:id/role` — Promote/demote candidate role
* `DELETE /api/admin/users/:id` — Delete user account
* `GET    /api/admin/certificate-templates` — All milestone templates
* `POST   /api/admin/certificate-templates` — Create custom milestone
* `GET    /api/admin/settings` — Platform settings & active AI keys count
* `PUT    /api/admin/settings` — Upsert configuration / add AI key
* `DELETE /api/admin/settings/:key` — Delete setting entry

---

## 📂 Project Structure

```
Ai-Mock-Interview/
├── package.json                   # Root orchestrator scripts
├── README.md                      # Platform documentation
├── server/                        # Express API Backend
│   └── src/
│       ├── index.js               # Entrypoint & DB connection
│       ├── app.js                 # Middleware & route mounting
│       ├── seed.js                # Database seeder
│       ├── controllers/           # admin, auth, bookmark, certificate, interview
│       ├── models/                # User, Interview, Question, Bookmark, Setting, Certificate
│       ├── routes/                # admin, auth, bookmark, certificate, interview
│       ├── services/              # aiService.js (Gemini rotation), emailService.js
│       └── utils/                 # authHelpers, tokenUtils, otpUtils, settingsUtils
└── client/                        # React + Vite Frontend
    ├── public/
    │   ├── logo.png               # 3D Circular Transparent Logo
    │   ├── favicon.png            # High-density Chrome Tab Icon
    │   ├── black-hole.mp4         # Visual effect assets
    │   └── black-hole.webm
    └── src/
        ├── App.jsx                # Router & Protected route layout
        ├── index.css              # Reflect Space Dark Design System
        ├── components/
        │   ├── Navbar.jsx         # Floating glass header with logo
        │   ├── NavDrawer.jsx      # Mobile responsive navigation drawer
        │   ├── Footer.jsx         # Platform footer & branding
        │   ├── Avatar.jsx         # Multi-format user avatar renderer
        │   ├── ConfirmDialog.jsx  # Glass confirmation modal
        │   ├── CertificateCard.jsx# Milestone credential renderer
        │   ├── admin/             # AdminNav, AdminSettingsTab, AdminUsersTable
        │   ├── dashboard/         # PerformanceHub, PracticeStudio
        │   ├── landing/           # HeroHUD, GlassBentoGrid, TrackExplorer, ReflectBlackHole
        │   └── profile/           # ProfileOverview, ProfileEdit, ProfileSecurity
        └── pages/                 # Landing, Login, Register, Dashboard, Practice,
                                   # Interview, Quiz, Results, Bookmarks, Leaderboard,
                                   # Certificates, VerifyCertificate, AdminUsers,
                                   # AdminCertificates, AdminSettings
```

---

## 📜 Available NPM Scripts

| Command | Action |
| :--- | :--- |
| `npm run setup` | Install all dependencies across root, client, and server |
| `npm run dev` | Launch both backend API (`:5050`) and client (`:5173`) in parallel |
| `npm run dev:client` | Launch Vite frontend development server only |
| `npm run dev:server` | Launch Express backend server with nodemon |
| `npm run build` | Execute production client build via Vite |
| `npm run seed` | Seed initial database accounts, sessions, and milestones |
| `npm run seed:reset` | Flush and rebuild database from clean initial state |

---

## 👨‍💻 Author & Creator

Designed and engineered with passion by **Mohd Zaid**

* 🌐 **Portfolio:** [portfolio-zeta-drab-97.vercel.app](https://portfolio-zeta-drab-97.vercel.app/)
* 🐙 **GitHub:** [@zaid154](https://github.com/zaid154)
* 💼 **LinkedIn:** [linkedin.com/in/mohd-zaid-794090231](https://www.linkedin.com/in/mohd-zaid-794090231/)

---

<div align="center">
  <sub>Built with modern React, Node.js, Express, MongoDB, and Google Gemini. © 2026 MockMate AI. All rights reserved.</sub>
</div>
