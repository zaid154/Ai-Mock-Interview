# MockMate AI

An AI-driven technical mock interview simulator built with the MERN stack (MongoDB, Express, React, Node.js) and Google Gemini AI.

MockMate AI helps developers practice technical interviews across Frontend, Backend, Fullstack, and System Design tracks with instant AI-driven rubric feedback, speech-to-text dictation, and personal question bookmarks.

**Live Application:** [ai-mock-interview-three-pi.vercel.app](https://ai-mock-interview-three-pi.vercel.app/)  
**Created by Mohd Zaid:** [Portfolio](https://portfolio-zeta-drab-97.vercel.app/) | [GitHub](https://github.com/zaid154) | [LinkedIn](https://www.linkedin.com/in/mohd-zaid-794090231/)

---

## Key Features

- **Adaptive Question Generation:** Generates domain-specific interview scenarios based on chosen roles (Frontend, Backend, MERN, System Design) and experience level.
- **Speech-to-Text Voice Dictation:** Integrated browser Web Speech recognition allows verbal responses to simulate live technical interviews.
- **Transparent Rubric Feedback:** Detailed point-by-point breakdown covering Technical Accuracy, System Architecture, and Communication Clarity.
- **Resume-Tailored Practice:** Optional PDF resume upload extracts candidate tech skills to formulate targeted technical scenarios.
- **Curated Question Bookmarks:** Save tough technical questions with ideal answers for quick revision before real interviews.
- **Clean White & Royal Blue Interface:** Responsive, lightweight design system with zero visual clutter.

---

## Tech Stack

### Frontend
- **React 18** (Vite bundler)
- **React Router v6** for client routing and route protection
- **Recharts** for performance metric visualizations
- **Lucide React** for icons
- **Axios** with JWT authorization interceptors

### Backend
- **Node.js & Express**
- **MongoDB & Mongoose**
- **Google Gemini API** (`@google/generative-ai`)
- **JSON Web Tokens (JWT)** & **Bcrypt.js** for authentication
- **Nodemailer / Brevo API** for email verification
- **Helmet, Rate Limiting & Mongo Sanitize** for API security

---

## Repository Structure

```text
Ai-Mock-Interview/
├── client/                     # Frontend Single Page App (React 18 + Vite)
│   ├── public/                 # Static assets (logo.png, favicon.png)
│   ├── src/
│   │   ├── components/         # Reusable UI & domain components
│   │   │   ├── bookmarks/      # Bookmark question card components
│   │   │   ├── dashboard/      # Studio launchpad & practice stats
│   │   │   ├── interview/      # Active question workbench & timer HUD
│   │   │   └── profile/        # Candidate profile & security forms
│   │   ├── context/            # AuthContext (user session, login, logout)
│   │   ├── lib/                # Client utilities (api.js, text.js, image.js)
│   │   ├── pages/              # 7 Core Pages (Landing, Login, Register, Dashboard, Practice, Interview, Results, Bookmarks, Profile)
│   │   ├── App.jsx             # Clean routing switch
│   │   ├── index.css           # Modern production CSS design system
│   │   └── main.jsx            # Application mount entry point
│   ├── index.html              # Vite HTML template
│   ├── package.json            # Frontend scripts & dependencies
│   └── vite.config.js          # Vite configuration
│
├── server/                     # Backend REST API (Node.js + Express)
│   ├── src/
│   │   ├── config/             # Database connection (db.js) & env loader (env.js)
│   │   ├── controllers/        # Business logic controllers (auth, interview, bookmark)
│   │   ├── middleware/         # Auth verification & error handling
│   │   ├── models/             # Mongoose schemas (User, Interview, Question, Bookmark, Resume)
│   │   ├── routes/             # Express route declarations (auth, interviews, bookmarks)
│   │   ├── services/           # Gemini AI integration & email delivery service
│   │   ├── utils/              # Token, OTP, and string utilities
│   │   ├── app.js              # Express app setup & route mounting
│   │   ├── index.js            # Server entry point & HTTP listener
│   │   └── seed.js             # Consolidated single-file database seeder
│   └── package.json            # Backend scripts & dependencies
│
├── .env.example                # Unified environment variables template
├── dev.js                      # Dual dev server launcher (Node native)
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

Fill in `.env`:
```env
PORT=5050
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/mockmate
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Install Dependencies

```bash
npm run setup
```

### 3. Seed Initial Questions (Optional)

```bash
npm run seed
```

### 4. Start Development Servers

```bash
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5050](http://localhost:5050)

---

## API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | API health check & uptime | No |
| `GET` | `/api/health` | Health check endpoint | No |
| `POST` | `/api/auth/register` | Register new account & trigger email OTP | No |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | No |
| `POST` | `/api/auth/verify-otp` | Verify email confirmation code | No |
| `POST` | `/api/auth/forgot-password` | Request password reset code | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user | Yes (Bearer) |
| `PATCH` | `/api/auth/profile` | Update user name, bio, or avatar image | Yes (Bearer) |
| `GET` | `/api/interviews` | List interview sessions for user | Yes (Bearer) |
| `POST` | `/api/interviews` | Generate tailored questions via Gemini | Yes (Bearer) |
| `GET` | `/api/interviews/:id` | Get interview session details | Yes (Bearer) |
| `POST` | `/api/interviews/:id/submit` | Submit answers for AI evaluation | Yes (Bearer) |
| `GET` | `/api/bookmarks` | Retrieve saved practice questions | Yes (Bearer) |
| `POST` | `/api/bookmarks` | Save question bookmark | Yes (Bearer) |
| `DELETE` | `/api/bookmarks/:id` | Remove question bookmark | Yes (Bearer) |

---

## License

This project is licensed under the MIT License.
