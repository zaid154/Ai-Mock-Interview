# MockMate AI — Frontend Client

The frontend client for MockMate AI is a Single Page Application built with React 18, Vite, and React Router v6.

## Architecture

- **React 18 & Vite:** Fast development HMR and optimized production builds.
- **React Router v6:** Route protection via `<ProtectedRoute>`.
- **CSS Design System:** Clean White & Royal Blue aesthetic in `src/index.css` using CSS custom properties.
- **Recharts:** Score breakdowns and skill assessment visualizations.
- **Web Speech API:** Real-time verbal response dictation.

## Core Pages

1. `Landing.jsx` — Platform introduction and engineering tracks.
2. `Login.jsx` & `Register.jsx` — User authentication.
3. `Dashboard.jsx` — Candidate overview and recent sessions.
4. `Practice.jsx` — Practice studio track selection and configuration.
5. `Interview.jsx` — Active interview screen with questions, timer, and voice input.
6. `Results.jsx` — AI feedback scorecard and 4-pillar rubric breakdown.
7. `Bookmarks.jsx` — Saved questions for quick interview revision.
8. `Profile.jsx` — Candidate profile details and practice stats.

## Running Locally

```bash
cd client
npm run dev
```

Runs at `http://localhost:5173`.
