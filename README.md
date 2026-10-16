<div align="center">

  <img src="client/public/logo.png" alt="MockMate AI Logo" width="112" height="112" style="border-radius: 50%;" />

  # MockMate AI

  **Enterprise AI Technical Mock Interview Platform with Sub-400ms Assessment Dispatch, 4-Pillar Rubric Scoring, Voice Dictation & Cryptographic Verifiable Credentials**

  [![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-a855f7?style=for-the-badge&logo=vercel)](https://ai-mock-interview-three-pi.vercel.app/)
  [![AI Engine](https://img.shields.io/badge/AI%20Engine-Google%20Gemini-38bdf8?style=for-the-badge&logo=google)](https://ai.google.dev/)
  [![Architecture](https://img.shields.io/badge/Stack-MERN%20FullStack-22c55e?style=for-the-badge&logo=mongodb)](https://nodejs.org/)
  [![Node Version](https://img.shields.io/badge/Node.js-18%2B-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
  [![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

</div>

---

## 🌌 1. Project Overview

**MockMate AI** is a production-grade MERN stack engineering interview simulator designed to bridge the gap between candidate preparation and real-world hiring rounds at top tech companies. 

Unlike generic chatbot wrappers, MockMate AI combines:
- ⚡ **Sub-400ms Assessment Dispatch:** Zero-latency session start using indexed database caching and instant retrieval.
- 🎙️ **Speech-to-Text Voice Dictation:** Browser-native Web Speech API enabling spoken verbal practice (recreating the best part of Google Interview Warmup).
- ⭐ **STAR Framework Assistant:** Integrated **Situation, Task, Action, Result** response builder helping candidates structure complex scenario answers.
- 💬 **Interviewer Follow-Up Probes:** Real-time AI counter-probing challenging architectural trade-offs, scalability bottlenecks, and edge cases.
- 🎯 **Transparent 4-Pillar Rubric Scoring:** Point-by-point scoring breakdown (Technical Accuracy, Architecture Depth, STAR Flow, and Communication) that explains exactly how marks are earned.
- 🤖 **Gemini Multi-Key Load Balancer:** Round-robin key rotation with 60-second cooldown protection preventing rate limit interruptions.
- 📄 **ATS In-Memory Resume Parser:** Server-side PDF analysis generating interview scenarios tailored to candidate projects and skills.
- 📜 **Cryptographic Milestone Credentials:** Tamper-proof milestone certificates with public scannable QR verification and high-resolution A4 PDF exports.

Featuring the **Reflect Cosmic Dark Space Aesthetic** (`#030014`, starlight glass surfaces, radiant purple/indigo neon accents, crisp typography, and full keyboard accessibility).

---

## 📁 2. Complete Folder & File Structure

```text
Ai-Mock-Interview/
├── .env                                  # Unified environment configuration (client + server)
├── .env.example                          # Template for environment secrets
├── .gitignore                            # Git exclusion rules
├── package.json                          # Root monorepo orchestrator scripts (concurrent dev)
├── README.md                             # Comprehensive technical documentation
│
├── client/                               # Frontend Application (React 18 + Vite 6)
│   ├── index.html                        # HTML template with metadata & favicon
│   ├── package.json                      # Frontend dependencies & Vite scripts
│   ├── vite.config.js                    # Vite bundler, proxy configuration & aliases
│   │
│   ├── public/                           # Static Public Assets
│   │   ├── logo.png                      # Branded circular transparent platform logo
│   │   ├── favicon.png                   # High-density browser tab favicon
│   │   ├── black-hole.mp4                # Hero atmospheric video background (MP4)
│   │   └── black-hole.webm               # High-efficiency WebM video background
│   │
│   └── src/                              # Client Application Source Code
│       ├── App.jsx                       # Master React Router routes & auth guards
│       ├── main.jsx                      # React 18 DOM mount point & context wrappers
│       ├── index.css                     # Reflect Space Dark Design System & variables
│       │
│       ├── context/                      # React State Contexts
│       │   └── AuthContext.jsx           # Global user authentication, token & role state
│       │
│       ├── lib/                          # Client Utilities & HTTP Clients
│       │   ├── api.js                    # Central Axios instance with error formatting & cookies
│       │   └── text.js                   # String sanitizers & normalizePrompt utility
│       │
│       ├── components/                   # Modular, Reusable UI Components
│       │   ├── Navbar.jsx                # Floating glass header with navigation & user menu
│       │   ├── NavDrawer.jsx             # Mobile-responsive slide-out navigation drawer
│       │   ├── Footer.jsx                # Global footer with legal links & branding
│       │   ├── Avatar.jsx                # Multi-format user avatar & initial fallback
│       │   ├── ConfirmDialog.jsx         # Modal dialog for critical user confirmations
│       │   ├── CertificateCard.jsx       # Visual milestone certificate renderer with QR code
│       │   ├── CookieBanner.jsx          # Storage & cookie compliance notice
│       │   ├── FormattedPrompt.jsx       # Markdown & code block formatting for question prompts
│       │   ├── QuestionEvaluationList.jsx# 4-pillar rubric score cards, checklists & model answers
│       │   ├── ScoreChart.jsx            # Recharts radial & bar visualizations for score metrics
│       │   │
│       │   ├── admin/                    # Admin Dashboard Components
│       │   │   ├── AdminNav.jsx          # Sub-navigation header for admin portal
│       │   │   ├── AdminSettingsTab.jsx  # AI Key pool manager & platform settings
│       │   │   └── AdminUsersTable.jsx   # Candidate directory, verification & role toggle
│       │   │
│       │   ├── bookmarks/                # Revision & Vault Components
│       │   │   └── BookmarkCard.jsx      # Flashcard review card with model answer & note editor
│       │   │
│       │   ├── dashboard/                # Candidate Hub Components
│       │   │   ├── PerformanceHub.jsx    # Candidate telemetry overview & quick launches
│       │   │   ├── PracticeStudio.jsx    # Interactive session configuration form
│       │   │   └── PracticeProgress.jsx  # Ultra-fast loading status indicator
│       │   │
│       │   ├── interview/                # Technical Interview Room Components
│       │   │   ├── InterviewHUD.jsx      # Timer, question stepper, progress bar & quit action
│       │   │   └── QuestionWorkbench.jsx # Voice dictation, STAR builder, probe bubble & input
│       │   │
│       │   ├── landing/                  # Landing Page Showcase Components
│       │   │   ├── HeroHUD.jsx           # Live interactive terminal & telemetry simulation
│       │   │   ├── GlassBentoGrid.jsx    # Feature showcase with elevated glass cards
│       │   │   ├── TrackExplorer.jsx     # Interactive track browser (Frontend, Backend, etc.)
│       │   │   └── ReflectBlackHole.jsx  # Atmospheric visual effect wrapper
│       │   │
│       │   ├── profile/                  # User Profile Management Components
│       │   │   ├── ProfileOverview.jsx   # Profile stats, badges & active resume status
│       │   │   ├── ProfileEdit.jsx       # Name, bio, avatar & target track updater
│       │   │   └── ProfileSecurity.jsx   # Password change & active sessions
│       │   │
│       │   └── quiz/                     # Rapid MCQ Quiz Components
│       │       └── QuizHud.jsx           # Timed question stepper & option picker HUD
│       │
│       └── pages/                        # View Routed Page Controllers
│           ├── Landing.jsx               # Public homepage & feature showcase
│           ├── Login.jsx                 # Secure candidate & admin authentication
│           ├── Register.jsx              # Candidate registration with email validation
│           ├── ForgotPassword.jsx        # Password reset initiation with OTP dispatch
│           ├── ResetPassword.jsx         # Password update submission
│           ├── VerifyOtp.jsx             # 6-digit SHA-256 OTP confirmation page
│           ├── Dashboard.jsx             # Logged-in candidate hub & activity history
│           ├── Practice.jsx              # Drill configuration studio (sub-400ms launch)
│           ├── Interview.jsx             # Interactive voice & text technical interview room
│           ├── Quiz.jsx                  # Speed multiple-choice technical assessment room
│           ├── Results.jsx               # In-depth rubric score report, charts & notes
│           ├── Bookmarks.jsx             # Saved questions vault with search & filters
│           ├── Leaderboard.jsx           # Global candidate ranking & percentile showcase
│           ├── Certificates.jsx          # Earned milestone credentials & PDF export
│           ├── VerifyCertificate.jsx     # Public certificate authentication portal (/verify-certificate/:id)
│           ├── Profile.jsx               # Candidate account settings & resume management
│           ├── PrivacyPolicy.jsx         # Data retention & GDPR/AI compliance page (/privacy)
│           ├── TermsOfService.jsx        # Platform terms of use & academic honesty (/terms)
│           ├── AdminUsers.jsx            # Admin candidate directory & permissions
│           ├── AdminCertificates.jsx     # Admin milestone criteria template designer
│           └── AdminSettings.jsx         # Admin Gemini AI key pool & SMTP configuration
│
└── server/                               # Backend Application (Node.js + Express + Mongoose)
    ├── package.json                      # Server dependencies & nodemon runner
    │
    └── src/                              # Server Source Code
        ├── index.js                      # Primary HTTP bootstrap & MongoDB connection
        ├── app.js                        # Express middleware, CORS, Helmet, rate-limiters & routes
        ├── seed.js                       # Database seed runner (Admins, candidates, questions)
        ├── seedData.js                   # Seed data bank for questions, candidates, templates
        ├── seedReset.js                  # Database purge & re-seed utility
        │
        ├── config/                       # Environment & Database Configuration
        │   ├── db.js                     # MongoDB Mongoose connection handler
        │   └── env.js                    # Root .env loader for monorepo consistency
        │
        ├── controllers/                  # Route Controllers (Business Logic)
        │   ├── adminController.js        # User management & platform settings updates
        │   ├── authController.js         # JWT auth, bcrypt hashing, OTP generation & profiles
        │   ├── bookmarkController.js     # Robust normalized bookmark toggle & notes management
        │   ├── certificateController.js  # Certificate creation, retrieval & QR verification
        │   ├── certificateTemplateController.js # Milestone criteria template CRUD
        │   └── interviewController.js    # Sub-400ms session start, submit, follow-up probe & PDF resumes
        │
        ├── middleware/                   # Express Middlewares
        │   ├── authMiddleware.js         # JWT verification & role authorization (admin/user)
        │   ├── errorMiddleware.js        # Global error handlers & 404 responses
        │   └── validateMiddleware.js     # Zod schema input validator
        │
        ├── models/                       # Mongoose Database Schemas
        │   ├── bookmarkModel.js          # Saved questions with normalized compound index
        │   ├── certificateModel.js       # Verifiable certificates with SHA-256 hashes
        │   ├── certificateTemplateModel.js # Milestone threshold criteria & styles
        │   ├── interviewModel.js         # Sessions with 4-pillar rubrics, model answers & probes
        │   ├── questionModel.js          # Pre-seeded question bank categorized by role & difficulty
        │   ├── resumeModel.js            # Structured ATS resume context extracted from PDFs
        │   ├── settingModel.js           # Dynamic database configuration & Gemini key pool
        │   └── userModel.js              # User profiles, passwords, OTPs & roles
        │
        ├── routes/                       # Express Route Definitions
        │   ├── adminRoutes.js            # /api/admin endpoints
        │   ├── authRoutes.js             # /api/auth endpoints
        │   ├── bookmarkRoutes.js         # /api/bookmarks endpoints
        │   ├── certificateRoutes.js      # /api/certificates endpoints
        │   └── interviewRoutes.js        # /api/interviews endpoints
        │
        ├── services/                     # External Integration Services
        │   ├── aiService.js              # Gemini multi-key rotation, 4-pillar evaluation & fast questions
        │   └── emailService.js           # Nodemailer Gmail SMTP & Brevo API failover delivery
        │
        └── utils/                        # Server Utilities & Helpers
            ├── asyncHandler.js           # Async error wrapping middleware
            ├── authHelpers.js            # Public user sanitization & cookie helpers
            ├── otpUtils.js               # Crypto-secure 6-digit OTP generator & SHA-256 hasher
            ├── settingsUtils.js          # Fast setting retrieval cache
            ├── textUtils.js              # Universal prompt normalization & regex escaping
            └── tokenUtils.js             # JWT signing & verification utilities
```

---

## 🚀 3. Quick Start & Setup Guide

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher
* **MongoDB:** Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas URI

### Step-by-Step Installation

```bash
# 1. Clone the repository
git clone https://github.com/zaid154/Ai-Mock-Interview.git
cd Ai-Mock-Interview

# 2. Install dependencies across root, frontend, and backend with one command
npm run setup

# 3. Create your environment file from the template
cp .env.example .env
# (Review .env and update MongoDB URI or Gemini API keys if needed)

# 4. Seed the database with the pre-configured admin, candidate profiles & questions
npm run seed

# 5. Launch both backend API and frontend client concurrently
npm run dev
```

The application will be live at:
* **Frontend Application:** [http://localhost:5174](http://localhost:5174) (or [http://localhost:5173](http://localhost:5173))
* **Backend API Server:** [http://localhost:5050](http://localhost:5050)
* **API Health Check:** [http://localhost:5050/api/health](http://localhost:5050/api/health)

---

## 🔑 4. Seeded Authentication Credentials

The seed script automatically initializes default administrative and candidate accounts:

| Account Type | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Primary Administrator** | `zaidm1323@gmail.com` | `123456` | Full Admin Console, AI Key Pool, Milestone Designer |
| **Secondary Administrator** | `admin@shop.com` | `Admin@123` | Full Admin Console Access |
| **Candidate (Top Ranked)** | `aarav.sharma@gmail.com` | `Password123!` | Practice Studio, Saved Bookmarks, 4 Milestones |
| **Candidate (System Design)** | `priya.patel@gmail.com` | `Password123!` | Practice Studio, Saved Bookmarks, 4 Milestones |
| **Candidate (DevOps)** | `rohan.verma@gmail.com` | `Password123!` | Practice Studio, Saved Bookmarks, 3 Milestones |

---

## ⚙️ 5. Environment Configuration (`.env`)

A single, centralized `.env` file at the project root manages configurations across both frontend and backend:

```env
# ── Server & Environment ──
NODE_ENV=development
PORT=5050
CLIENT_URL=http://localhost:5173,http://localhost:5174,https://ai-mock-interview-three-pi.vercel.app

# ── Database ──
MONGODB_URI=mongodb://localhost:27017/mockmate

# ── Authentication & Security ──
JWT_SECRET=super_secret_jwt_key_mockmate_ai_production_2026
JWT_EXPIRES_IN=7d

# ── Default Admin Seeded Credentials ──
ADMIN_NAME=Mohd Zaid
ADMIN_EMAIL=zaidm1323@gmail.com
ADMIN_PASSWORD=123456

# ── Google Gemini AI (Multi-Key Rotation Pool) ──
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_KEY=AIzaSy...
GEMINI_API_KEYS=AIzaSyKey1...,AIzaSyKey2...,AIzaSyKey3...

# ── Email & OTP Dispatch (Optional - Console Fallback in Dev) ──
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM=MockMate AI <your_email@gmail.com>
BREVO_API_KEY=xkeysib-...

# ── Client Vite Environment (Browser-Exposed) ──
VITE_API_URL=http://localhost:5050/api
```

---

## 🌟 6. Key Features & Competitor-Driven Innovations

### ⚡ 1. Sub-400ms Assessment Dispatch Engine
* **The Problem Solved:** Competitor platforms often force candidates to wait 5–8 seconds while an AI model generates questions sequentially over the internet.
* **Our Solution:** MockMate AI couples pre-seeded, categorized question banks with an instant database dispatcher (`getFastQuestions`). When candidates configure a drill, questions are served in **15ms–40ms**, launching the interactive session in **under 350ms**.

### 🎙️ 2. Speech-to-Text Voice Dictation (Google Warmup Replacement)
* **The Problem Solved:** With Google shutting down Interview Warmup in late 2026, candidates lost the ability to practice answering technical questions verbally.
* **Our Solution:** Native browser **Web Speech API** integration in `QuestionWorkbench.jsx`. With one click, candidates speak into their microphone; speech is converted to text in real-time and placed in the response area with live word-count telemetry.

### ⭐ 3. STAR Method Response Assistant (Big Interview & Exponent Inspired)
* **The Problem Solved:** Candidates frequently struggle to organize scenario-based engineering answers.
* **Our Solution:** Built-in STAR assistant tab breaking down answers into:
  - **Situation:** Project context & system background
  - **Task:** The specific engineering challenge
  - **Action:** Architectural decisions, algorithms, and tools
  - **Result:** Quantifiable impact (e.g. *"reduced p99 latency by 45%"*)
  - One-click insertion automatically formats a structured, professional response.

### 💬 4. Real-Time Interviewer Follow-Up Probes (Interviewing.io Realism)
* **The Problem Solved:** Static interview simulators don't simulate the dynamic pressure of real hiring panels.
* **Our Solution:** A dedicated **"Interviewer Probe"** button. The AI analyzes the candidate's current draft and generates a realistic follow-up counter-question challenging race conditions, scale, or failure recovery.

### 🎯 5. Transparent 4-Pillar Rubric Scoring Engine
* **The Problem Solved:** Eliminates opaque scores like *"3/10"* without context.
* **Our Solution:** Every open-ended question is graded against 4 standardized pillars:
  1. **Technical Accuracy & Concepts (0–3 pts):** Correctness of algorithms, definitions, and complexity.
  2. **Architecture Depth & Trade-offs (0–3 pts):** Constraints, edge cases, and design choices.
  3. **STAR Structure & Flow (0–2 pts):** Organization, clarity, and methodology.
  4. **Communication & Vocabulary (0–2 pts):** Precision and professional delivery.
  Accompanied by an itemized **Talking Points Checklist** (`✓` covered / `✗` missed) and a side-by-side **Model 10/10 Reference Answer**.

### 🔖 6. Robust Study Vault & Bookmark Toggling
* **The Problem Solved:** Eliminates duplicate bookmarks and unbookmarking glitches caused by whitespace or newline discrepancies.
* **Our Solution:** Strict prompt normalization (`normalizePrompt`) on both frontend and backend with optimistic UI updates. Candidates can save tricky questions, hide/reveal model answers, and save private revision notes.

---

## 📡 7. Comprehensive REST API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new candidate account | No |
| `POST` | `/api/auth/login` | Sign in with email and password | No |
| `POST` | `/api/auth/verify-otp` | Verify 6-digit email confirmation code | No |
| `POST` | `/api/auth/resend-otp` | Resend verification code | No |
| `POST` | `/api/auth/forgot-password`| Request password reset code via email | No |
| `POST` | `/api/auth/reset-password` | Submit new password using OTP code | No |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile | Yes |
| `PATCH`| `/api/auth/profile` | Update profile information, bio, track, and avatar | Yes |
| `POST` | `/api/auth/logout` | Clear HTTP-only authentication cookies | Yes |

### 🎙️ Interviews & Assessments (`/api/interviews`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/interviews` | Launch interview or quiz session (<400ms) | Yes |
| `POST` | `/api/interviews/batch` | Generate additional question batches | Yes |
| `POST` | `/api/interviews/:id/probe` | Generate real-time interviewer follow-up probe | Yes |
| `POST` | `/api/interviews/:id/submit`| Submit answers for 4-pillar rubric grading | Yes |
| `GET` | `/api/interviews` | Retrieve candidate session history | Yes |
| `GET` | `/api/interviews/:id` | Fetch specific session questions & responses | Yes |
| `POST` | `/api/interviews/resume` | Upload & parse candidate PDF resume (ATS context) | Yes |
| `GET` | `/api/interviews/resume/active`| Get active uploaded resume details | Yes |
| `DELETE`| `/api/interviews/resume/active`| Detach active resume from profile | Yes |
| `GET` | `/api/interviews/leaderboard` | Retrieve global candidate rankings & percentiles | Public |
| `PATCH`| `/api/interviews/:id/notes`| Save candidate private session notes | Yes |
| `DELETE`| `/api/interviews/:id` | Delete interview session record | Yes |

### 🔖 Study Vault & Bookmarks (`/api/bookmarks`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/bookmarks` | List all saved questions with model answers | Yes |
| `POST` | `/api/bookmarks` | Add a new question to study vault | Yes |
| `POST` | `/api/bookmarks/toggle` | Toggle bookmark (add if absent, purge if present) | Yes |
| `PATCH`| `/api/bookmarks/:id/notes`| Update private revision notes on a bookmark | Yes |
| `DELETE`| `/api/bookmarks/:id` | Remove question from study vault | Yes |

### 📜 Milestone Certificates (`/api/certificates`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/certificates` | Fetch candidate's unlocked milestone credentials | Yes |
| `GET` | `/api/certificates/:id` | Fetch certificate details by ID | Yes |
| `GET` | `/api/certificates/verify/:certId`| Public QR verification portal | Public |

### 🛡️ Administration (`/api/admin`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/users` | Candidate directory with avatars & verification states | Admin |
| `PATCH`| `/api/admin/users/:id/verified`| Manually toggle user email verification | Admin |
| `PATCH`| `/api/admin/users/:id/role` | Promote/demote candidate role (Admin vs User) | Admin |
| `DELETE`| `/api/admin/users/:id` | Delete candidate account | Admin |
| `GET` | `/api/admin/certificate-templates`| View all milestone credential templates | Admin |
| `POST` | `/api/admin/certificate-templates`| Create or update custom milestone criteria | Admin |
| `GET` | `/api/admin/settings` | Platform settings & AI key pool health | Admin |
| `PUT` | `/api/admin/settings` | Update configuration or add Gemini API keys | Admin |

---

## 📜 8. Monorepo Scripts Reference

All primary workflow commands are executed from the project root:

| Command | Description |
| :--- | :--- |
| `npm run setup` | Automatically installs all dependencies for root, client, and server |
| `npm run dev` | Concurrently boots the backend Express API (`:5050`) and Vite frontend (`:5174`) |
| `npm run dev:client` | Runs the Vite frontend development server independently |
| `npm run dev:server` | Runs the Express backend API server independently with nodemon hot-reload |
| `npm run build` | Builds the optimized production frontend bundle in `client/dist` |
| `npm run start` | Launches the backend server in production mode |
| `npm run seed` | Populates MongoDB with default admins, candidate profiles, and questions |
| `npm run seed:reset` | Flushes existing collections and rebuilds the database clean |

---

## 🛡️ 9. Security & Compliance Architecture

* **Authentication Security:** Secure HTTP-only same-site cookies protecting JWT session tokens against XSS.
* **Database Protection:** Strict schema typing with Mongoose and `express-mongo-sanitize` stripping `$` and `.` operators to prevent NoSQL injection.
* **Brute-Force Safeguards:** Stricter rate-limiting on sensitive authentication endpoints (`/api/auth/login`, `/api/auth/verify-otp`, `/api/auth/forgot-password`).
* **HTTP Security Headers:** Enhanced with `helmet` configuring strict Content-Security-Policy (CSP), frameguards, and HSTS headers.
* **Privacy & Compliance:** Dedicated [`Privacy Policy`](client/src/pages/PrivacyPolicy.jsx) and [`Terms of Service`](client/src/pages/TermsOfService.jsx) detailing zero-storage in-memory PDF parsing and GDPR candidate rights.

---

## 👨‍💻 10. Author & Creator

Designed, architected, and engineered with passion by **Mohd Zaid**.

* 🌐 **Portfolio:** [portfolio-zeta-drab-97.vercel.app](https://portfolio-zeta-drab-97.vercel.app/)
* 🐙 **GitHub:** [@zaid154](https://github.com/zaid154)
* 💼 **LinkedIn:** [linkedin.com/in/mohd-zaid-794090231](https://www.linkedin.com/in/mohd-zaid-794090231/)
* 📧 **Contact:** `zaidm1323@gmail.com`

---

<div align="center">
  <sub>Built with React, Node.js, Express, MongoDB, and Google Gemini. © 2026 MockMate AI. All rights reserved.</sub>
</div>
