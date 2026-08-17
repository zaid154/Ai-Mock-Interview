# MockMate AI

> AI-powered mock interview platform with real-time Gemini evaluation, admin-managed milestone certificates, and public credential verification.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-6366f1?style=for-the-badge&logo=vercel)](https://ai-mock-interview-three-pi.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

A full-stack MERN application that runs a **React (Vite + JavaScript) client** and an **Express (JavaScript + Google Gemini 2.5) server** together from one command.

---

## 🚀 Quick Start

```bash
npm run setup          # 1) Install root + client + server dependencies
cp .env.example .env   # 2) Create your env file (see "Environment" below)
npm run seed           # 3) Seed admins, candidates, sessions, certificates, milestones
npm run dev            # 4) Run client + server together
```

- **Client:** [http://localhost:5173](http://localhost:5173) — Vite picks the next free port if 5173 is taken, so check the terminal.
- **Server:** [http://localhost:5050](http://localhost:5050) (health check: `GET /api/health`)

You need a running **MongoDB** (local or Atlas) before seeding. `GEMINI_API_KEY` is optional
for a first run: Questions mode falls back to a 31-question offline bank, but **Quiz mode
needs a real key**.

### Seeded accounts

`npm run seed` prints every admin credential it creates. The defaults are:

| Role | Email | Password |
| --- | --- | --- |
| **Admin** | `admin@mockmate.com` | `Admin@123` |
| Admin | `admin@shop.com` | `Admin@123` |
| Admin + candidate data | `zaidm1323@gmail.com` | `ChangeMe123!` |
| Candidate | `aarav.sharma@gmail.com` | `Password123!` |
| Candidate | `priya.patel@gmail.com` | `Password123!` |
| Candidate | `rohan.verma@gmail.com` | `Password123!` |
| Candidate | `ananya.gupta@gmail.com` | `Password123!` |

The first row is driven by `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` in `.env` — change
those and re-seed to get your own admin. `zaidm1323@gmail.com` is the only account that comes
with completed sessions, so it is the one to use when reviewing the Certificates page.

---

## 🌟 Key Features

### 🎯 Core interview capabilities
- **Two practice modes**: open-ended **Questions** (AI-graded with line-by-line feedback) or multiple-choice **Quiz** (auto-scored, includes code-output and problem-solving items).
- **Role, level and category aware**: frontend, backend, fullstack, MERN, Java, Python, .NET, SQL, HR, aptitude — each with an experience level and difficulty.
- **Resume-tailored questions**: upload a PDF (`unpdf` parsing); the extracted text is passed to Gemini so questions match your stack.
- **Multiple Gemini keys with auto-fallback**: keys rotate out of the pool when rate-limited.
- **Fisher-Yates shuffling** so question order is not predictable across sessions.

### 📜 Admin-managed milestone certificates
Milestones are **documents, not code**. An admin creates, retunes, retires and restyles them
from the panel without a deploy.

- **Three layouts per credential** — `classic` (two columns with a ribbon sidebar and seal), `modern` (accent bar, large sans-serif name), `elegant` (framed, centred, serif). One component renders all three, so a candidate downloads exactly what the admin previewed.
- **Per-milestone accent colour**, applied through a single `--cert-accent` custom property.
- **Two award rules**: *N sessions at or above a minimum score*, or *any single session at or above a target score*.
- **Hide without deleting** — retire a credential while keeping its history.
- **Live preview** in the editor renders the real certificate component, scaled down.
- **1-click A4 landscape PDF** (`html2canvas` + `jsPDF`).
- **Public verification portal** at `/verify-certificate/:certId` with a scannable QR code.
- **Signature control**: upload a signature image and set the signatory name and title.

> The root element keeps the `.official-cert-card` class in **every** layout on purpose — the
> PDF export and the `@media print` block both select it. Renaming it silently breaks both.

### 🔖 Revision flashcard vault (`/bookmarks`)
Reveal/hide model answers, copy question + answer in one click, filter by topic, and keep
private revision notes per question.

### 🏆 Leaderboard (`/leaderboard`)
Candidate rankings by average score and sessions completed, with avatars.

### 👤 Profile (`/profile`)
- **One avatar everywhere.** A single `Avatar` component renders the navbar, profile, leaderboard and admin list, and understands all four forms the field can take: an image URL, a `data:` URL, an emoji, or a name initial. It falls back to the initial if an image 404s.
- **Uploads are cropped square and re-encoded to a 256px JPEG in the browser** before they are sent. The avatar is a single `String` on the user document, so a new picture replaces the old one outright — there is nothing to clean up — and a 3 MB photo becomes ~25 KB instead of a ~4 MB base64 string on every `/auth/me`.
- **Live preview** showing the picture as it appears in the navbar, the leaderboard and the profile header.
- Password change with a live requirement checklist.

### 🛡️ Admin console (`/admin`)
- **Certificate milestones**: full create / edit / delete / hide, layout and accent picker, restore-defaults.
- **Gemini API key rotation pool**: add, mask, remove.
- **Email verification policy**: require OTP verification before login.
- **Candidate management**: verify, promote, demote, delete.
- **Flexible key/value settings** for anything else.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite 6, React Router 6, Lucide Icons, Recharts, `html2canvas`, `jspdf`, Axios, React Hot Toast
- **Backend:** Node.js, Express, MongoDB (Mongoose), Google Gemini (`@google/generative-ai`), JWT cookie auth, bcryptjs, `unpdf`, Zod
- **Styling:** one hand-written stylesheet (`client/src/index.css`) built on CSS custom properties

### Responsive system
Three breakpoints, declared once, at the end of `index.css`:

| Token | Range | Behaviour |
| --- | --- | --- |
| Desktop | `> 1024px` | full multi-column layouts |
| Tablet | `≤ 1024px` | hamburger nav, two-column grids collapse |
| Mobile | `≤ 640px` | single column, tighter rail, larger tap targets |
| Small | `≤ 380px` | typography and padding only — never layout |

`.container`, `.nav-inner` and the footer all read the same `--rail-max` / `--rail-gutter`
tokens, so the navbar can never drift out of alignment with the page beneath it. The navbar
height lives in `--nav-h` and drives the anchor-scroll offset, so in-page links always land
flush under the sticky bar.

### Theme
The app ships **light**. `ThemeContext` still supports dark and honours a stored preference,
but there is no switcher in the UI, so following `prefers-color-scheme` would hand dark-mode
visitors a theme they could not leave. Certificates are always light-on-white whatever the
theme — they are printed documents.

---

## 🔑 Environment (`.env`)

A single `.env` at the project root powers both client and server.

| Variable | Used by | Purpose |
| --- | --- | --- |
| `PORT` | server | API port (default `5050`) |
| `NODE_ENV` | server | `development` / `production` |
| `CLIENT_URL` | server | CORS allowed origins, comma-separated |
| `MONGODB_URI` | server | MongoDB connection string |
| `JWT_SECRET` | server | Token signing secret — **rotate before deploying** |
| `JWT_EXPIRES_IN` | server | Token lifetime (e.g. `7d`) |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | seed | The admin account `npm run seed` creates or updates |
| `GEMINI_API_KEY` / `GEMINI_API_KEYS` | server | Gemini key, or a comma-separated pool |
| `GEMINI_MODEL` | server | Defaults to `gemini-2.5-flash` |
| `BREVO_API_KEY` or `SMTP_*` | server | OTP delivery. Blank = no email; verification is off by default |
| `VITE_API_URL` | client | **Leave blank in local dev.** Blank means the client calls the relative `/api`, which Vite proxies to the server — same origin, so no CORS and cookies work. Set it to an absolute URL only when the client is deployed separately from the API. |

---

## 📡 API Endpoints

| Method & Path | Auth | Purpose |
| --- | :---: | --- |
| **Auth** | | |
| `POST /api/auth/register` | — | Register |
| `POST /api/auth/login` | — | Authenticate |
| `POST /api/auth/verify-otp` | — | Confirm the emailed code |
| `POST /api/auth/resend-otp` | — | Re-send the code |
| `POST /api/auth/forgot-password` | — | Start a reset |
| `POST /api/auth/reset-password` | — | Finish a reset |
| `GET /api/auth/verification-settings` | — | Public settings + certificate signatory |
| `GET /api/auth/me` | ✅ | Current user |
| `PATCH /api/auth/profile` | ✅ | Update name, bio, avatar |
| `POST /api/auth/change-password` | ✅ | Change password |
| `POST /api/auth/complete-registration` | — | Finish signup when OTP is skipped |
| `POST /api/auth/logout` | — | Clear the session cookie |
| **Interviews & quizzes** | | |
| `POST /api/interviews` | ✅ | Start a session |
| `POST /api/interviews/resume` | ✅ | Parse an uploaded resume PDF into question context |
| `GET /api/interviews` | ✅ | Session history |
| `GET /api/interviews/leaderboard` | ✅ | Rankings |
| `GET /api/interviews/:id` | ✅ | One session |
| `POST /api/interviews/:id/submit` | ✅ | Grade and save answers |
| `PATCH /api/interviews/:id/notes` | ✅ | Save notes |
| `DELETE /api/interviews/:id` | ✅ | Remove a session |
| **Bookmarks** | | |
| `GET /api/bookmarks` | ✅ | List |
| `POST /api/bookmarks` | ✅ | Save |
| `PATCH /api/bookmarks/:id/notes` | ✅ | Update the revision note |
| `DELETE /api/bookmarks/:id` | ✅ | Delete |
| **Certificates** | | |
| `GET /api/certificates/templates` | ✅ | Milestones visible to candidates |
| **Admin** | | |
| `GET /api/admin/users` | Admin | List users |
| `PATCH /api/admin/users/:id/verified` | Admin | Verify / unverify |
| `PATCH /api/admin/users/:id/role` | Admin | Promote / demote |
| `DELETE /api/admin/users/:id` | Admin | Delete a user |
| `GET /api/admin/certificate-templates` | Admin | All milestones, including hidden |
| `POST /api/admin/certificate-templates` | Admin | Create a milestone |
| `PATCH /api/admin/certificate-templates/:id` | Admin | Update a milestone |
| `DELETE /api/admin/certificate-templates/:id` | Admin | Delete a milestone |
| `POST /api/admin/certificate-templates/reset` | Admin | Restore the four shipped milestones |
| `GET /api/admin/settings` | Admin | List key/value settings |
| `PUT /api/admin/settings` | Admin | Upsert a setting |
| `PATCH /api/admin/settings/:key/rename` | Admin | Rename a setting |
| `DELETE /api/admin/settings/:key` | Admin | Delete a setting |

Admins can neither change their own role nor delete their own account, so the last admin
cannot lock everyone out.

---

## 🌱 Seeding

`npm run seed` is **idempotent** — run it as often as you like:

- Admins and candidates are upserted by email.
- Certificate milestones are upserted **by key with `$setOnInsert`**, so re-seeding never
  discards a milestone an admin has since retitled, recoloured or switched layout on.
- Sessions and certificates for the seeded candidates are rebuilt each run.

`npm run seed:reset` clears the seeded data instead.

If the milestone collection is ever empty, the controller creates the four defaults on the
next read, so the Certificates page is never blank even without seeding.

---

## 📂 Project Structure

```
Ai-Mock-Interview/
├── .env.example
├── package.json                 # root: runs client + server together
├── README.md
├── server/
│   └── src/
│       ├── app.js               # express app + route mounts
│       ├── index.js             # boot + db connect
│       ├── seed.js / seed.reset.js
│       ├── config/              # db.js, env.js
│       ├── middleware/          # auth.js, validate.js, error.js
│       ├── controllers/
│       │   ├── admin.controller.js
│       │   ├── auth.controller.js
│       │   ├── bookmark.controller.js
│       │   ├── certificateTemplate.controller.js
│       │   └── interview.controller.js
│       ├── models/
│       │   ├── Bookmark.model.js
│       │   ├── Certificate.model.js
│       │   ├── CertificateTemplate.model.js
│       │   ├── Interview.model.js
│       │   ├── Question.model.js
│       │   ├── Setting.model.js
│       │   └── User.model.js
│       ├── routes/
│       │   ├── admin.routes.js
│       │   ├── auth.routes.js
│       │   ├── bookmark.routes.js
│       │   ├── certificate.routes.js
│       │   └── interview.routes.js
│       ├── services/            # email.js, gemini.js
│       └── utils/               # asyncHandler, otp, settings, token
└── client/
    └── src/
        ├── App.jsx, main.jsx, index.css
        ├── components/
        │   ├── AdminRoute.jsx
        │   ├── Avatar.jsx              # the single avatar renderer
        │   ├── CertificateCard.jsx     # all three certificate layouts
        │   ├── CertificateManager.jsx  # admin milestone CRUD + preview
        │   ├── ConfirmDialog.jsx
        │   ├── Footer.jsx
        │   ├── Navbar.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── ScoreChart.jsx
        │   ├── ScrollToTop.jsx         # resets scroll on route change
        │   └── Timer.jsx
        ├── context/                    # AuthContext.jsx, ThemeContext.jsx
        ├── lib/
        │   ├── api.js                  # axios instance + bearer interceptor
        │   ├── image.js                # square-crop + resize before upload
        │   ├── scrollToSection.js      # shared in-page anchor scrolling
        │   └── text.js
        └── pages/
            ├── AdminDashboard.jsx
            ├── Bookmarks.jsx
            ├── Certificates.jsx
            ├── Dashboard.jsx
            ├── ForgotPassword.jsx
            ├── Interview.jsx
            ├── Landing.jsx
            ├── Leaderboard.jsx
            ├── Login.jsx
            ├── OtpVerify.jsx
            ├── Profile.jsx
            ├── Quiz.jsx
            ├── Register.jsx
            ├── Results.jsx
            └── VerifyCertificate.jsx
```

---

## 📜 Scripts

| Command | What it does |
| --- | --- |
| `npm run setup` | Install root, client and server dependencies |
| `npm run dev` | Run server (`5050`) and client (`5173`) together |
| `npm run dev:server` / `npm run dev:client` | Run one side only |
| `npm run build` | Production build of the client |
| `npm start` | Start the built server |
| `npm run seed` | Seed admins, candidates, sessions, certificates, milestones |
| `npm run seed:reset` | Clear the seeded data |

---

## 👨‍💻 Author

Designed, engineered and built by **Mohd Zaid**

- 🌐 **Portfolio:** [portfolio-zeta-drab-97.vercel.app](https://portfolio-zeta-drab-97.vercel.app/)
- 🐙 **GitHub:** [@zaid154](https://github.com/zaid154)
- 💼 **LinkedIn:** [linkedin.com/in/mohd-zaid-794090231](https://www.linkedin.com/in/mohd-zaid-794090231/)
