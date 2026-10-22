# MockMate AI — Frontend Client

The frontend client for MockMate AI is a modern Single Page Application built with React 18, Vite, and React Router v6.

## Tech Stack & Architecture

- **React 18 & Vite:** Fast hot module replacement (HMR) and optimized Rollup production builds.
- **React Router v6:** Declarative nested routing with `<ProtectedRoute>` and `<AdminRoute>` guards.
- **Styling:** Design system in `src/index.css` leveraging CSS custom properties, responsive grids, and clean white & royal blue aesthetic.
- **Data Visualization:** Recharts for candidate score progression and performance radar charts.
- **Document Export:** html2canvas and jsPDF for client-side certificate rendering and high-resolution PDF download.
- **Speech Recognition:** Web Speech API integration for real-time candidate verbal dictation.

## Folder Organization

```text
client/
├── public/                 # Static public files (logo.png, favicon.png)
├── src/
│   ├── components/         # Reusable presentation and domain components
│   │   ├── admin/          # Admin management panels
│   │   ├── bookmarks/      # Bookmark question cards
│   │   ├── dashboard/      # Studio launchpad & practice statistics
│   │   ├── interview/      # Active question workbench & HUD
│   │   ├── profile/        # Profile overview & security forms
│   │   └── quiz/           # Multiple choice question components
│   ├── context/            # Global React state (AuthContext, ThemeContext)
│   ├── lib/                # Client utilities (api.js, text.js, image.js)
│   ├── mockData/           # Test fixtures (interviewMock.json, userMock.json, bookmarkMock.json)
│   ├── pages/              # Top-level view components for application routes
│   ├── App.jsx             # Top-level route switch & layout
│   ├── index.css           # Production CSS stylesheet
│   └── main.jsx            # React DOM root entry
├── index.html              # Vite HTML template
├── package.json            # Client dependencies and npm scripts
└── vite.config.js          # Vite bundler configuration & local API proxy
```

## Running Locally

```bash
# From workspace root
npm --prefix client run dev

# Or from inside the client/ directory
cd client
npm run dev
```

The frontend development server starts at `http://localhost:5173`.

## Building for Production

```bash
npm run build
```

Compiled assets are emitted to `client/dist/`.
