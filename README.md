# MockMate AI

An end-to-end full-stack technical interview preparation platform built with the MERN stack (MongoDB, Express, React, Node.js) and Google Gemini AI.

MockMate AI helps developers practice technical interviews across Frontend, Backend, Fullstack, and System Design tracks with instant AI-driven rubrics, STAR method structuring, speech-to-text dictation, and verifiable milestone certificates.

**Live Application:** [ai-mock-interview-three-pi.vercel.app](https://ai-mock-interview-three-pi.vercel.app/)  
**Created by Mohd Zaid:** [Portfolio](https://portfolio-zeta-drab-97.vercel.app/) | [GitHub](https://github.com/zaid154) | [LinkedIn](https://www.linkedin.com/in/mohd-zaid-794090231/)

---

## Key Features

- **Adaptive Question Generation:** Generates domain-specific interview scenarios based on chosen roles (Frontend, Backend, MERN, System Design) and candidate experience level.
- **Speech-to-Text Voice Dictation:** Integrated browser Web Speech recognition allows verbal responses to simulate live audio interview rounds.
- **STAR Method Assistance:** Structured prompts to help candidates format complex scenario answers using Situation, Task, Action, and Result principles.
- **Transparent Rubric Feedback:** Detailed point-by-point breakdown covering Technical Accuracy, System Architecture, STAR Flow, and Communication Clarity.
- **Resume-Tailored Practice:** Optional PDF resume upload extracts candidate tech skills and projects to formulate targeted technical questions.
- **Milestone Certificates:** Generates shareable, downloadable certificates with unique verification IDs and public verification URLs.
- **Curated Question Bookmarks:** Save tough technical questions with ideal answers and personal notes for fast revision before real interviews.
- **Clean White & Royal Blue Interface:** Responsive, accessible design system built with CSS variables, clean typography, and zero visual clutter.

---

## Tech Stack

### Frontend
- **React 18** (Vite bundler)
- **React Router v6** for client routing and route protection
- **Recharts** for performance metric visualizations
- **Lucide React** for icons
- **Axios** with global interceptors for JWT authorization
- **jsPDF & html2canvas** for client-side certificate generation

### Backend
- **Node.js & Express 4**
- **MongoDB & Mongoose**
- **Google Gemini API** (`@google/generative-ai`)
- **JSON Web Tokens (JWT)** & **Bcrypt.js** for authentication
- **Nodemailer / Brevo API** for email OTP verification
- **Helmet, Express Rate Limit & Express Mongo Sanitize** for API security

---

## Repository Structure

```text
Ai-Mock-Interview/
├── client/                     # Frontend Single Page App (React 18 + Vite)
│   ├── public/                 # Static assets (logo.png, favicon.png)
│   ├── src/
│   │   ├── components/         # Reusable UI & domain components
│   │   │   ├── admin/          # Admin dashboard management tabs
│   │   │   ├── bookmarks/      # Bookmark question card components
│   │   │   ├── dashboard/      # Studio launchpad & practice stats
│   │   │   ├── interview/      # Active question workbench & timer HUD
│   │   │   ├── profile/        # Candidate profile & security forms
│   │   │   └── quiz/           # Multiple choice question components
│   │   ├── context/            # Global context (AuthContext, ThemeContext)
│   │   ├── lib/                # Client utilities (api.js, text.js, image.js)
│   │   ├── mockData/           # Test fixtures (interviewMock.json, userMock.json, bookmarkMock.json)
│   │   ├── pages/              # Main page routes (Landing, Dashboard, Practice, Results, etc.)
│   │   ├── App.jsx             # Main routing table and layout shell
│   │   ├── index.css           # Production CSS design system
│   │   └── main.jsx            # Application mount entry point
│   ├── index.html              # Vite HTML template
│   ├── package.json            # Frontend scripts & dependencies
│   └── vite.config.js          # Vite configuration
│
├── server/                     # Backend REST API (Node.js + Express)
│   ├── src/
│   │   ├── config/             # Database connection (db.js) & env loader (env.js)
│   │   ├── controllers/        # Business logic & database operations
│   │   ├── middleware/         # JWT auth guards, input validation, error handling
│   │   ├── models/             # Mongoose schemas (User, Interview, Bookmark, Certificate)
│   │   ├── routes/             # Express route declarations
│   │   ├── services/           # Gemini AI integration & email delivery service
│   │   ├── utils/              # Cryptographic OTP helpers, tokens, text cleaners
│   │   ├── app.js              # Express app, middleware pipeline & route mounts
│   │   └── index.js            # Server entry point & database connection bootstrap
│   └── package.json            # Backend scripts & dependencies
│
├── tests/                      # Automated unit tests
├── .env.example                # Unified environment variables template
├── package.json                # Monorepo orchestrator scripts
└── README.md                   # Project documentation
```

---

## Local Development Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** running locally or a MongoDB Atlas connection string
- **Google Gemini API Key** (free tier available at [Google AI Studio](https://aistudio.google.com/))

### 1. Clone & Configure Environment

```bash
git clone https://github.com/zaid154/Ai-Mock-Interview.git
cd Ai-Mock-Interview

# Copy environment template
cp .env.example .env
```

Open `.env` and fill in your values:
```env
PORT=5050
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/mockmate
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Install Dependencies

You can install all dependencies across the workspace with one command:
```bash
npm run setup
```

### 3. Seed Initial Database (Optional)

```bash
npm run seed
```
This sets up sample question templates and creates a default admin account:
- **Email:** `admin@mockmate.com`
- **Password:** `Admin@123`

### 4. Start Development Servers

```bash
npm run dev
```

Both servers will start concurrently:
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5050](http://localhost:5050)

---

## Running Automated Tests

Run the test suite from the root directory:
```bash
npm test
```
All unit tests verify client utility functions, cryptographic OTP security routines, and mock fixture schemas.

---

## API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | API health check & uptime | No |
| `GET` | `/api/health` | Health check endpoint | No |
| `POST` | `/api/auth/register` | Register new account & trigger email OTP | No |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | No |
| `POST` | `/api/auth/verify-otp` | Verify 6-digit email confirmation code | No |
| `POST` | `/api/auth/forgot-password` | Request password reset code | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user | Yes (Bearer) |
| `PATCH` | `/api/auth/profile` | Update user name, bio, or avatar image | Yes (Bearer) |
| `GET` | `/api/interviews` | List interview sessions for user | Yes (Bearer) |
| `POST` | `/api/interviews/generate` | Generate tailored questions via Gemini | Yes (Bearer) |
| `POST` | `/api/interviews/:id/submit` | Submit answers for AI evaluation | Yes (Bearer) |
| `GET` | `/api/bookmarks` | Retrieve saved practice questions | Yes (Bearer) |
| `POST` | `/api/bookmarks` | Toggle bookmark status for a question | Yes (Bearer) |
| `GET` | `/api/certificates` | Fetch candidate completion certificates | Yes (Bearer) |
| `GET` | `/api/certificates/verify/:id` | Public certificate verification endpoint | No |
| `GET` | `/api/admin/users` | List registered candidates | Yes (Admin) |
| `GET` | `/api/admin/settings` | View AI model configuration & keys | Yes (Admin) |

---

## License

This project is licensed under the MIT License.
