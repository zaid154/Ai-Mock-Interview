# MockMate AI — Backend REST API

The backend server for MockMate AI is an Express application built with Node.js and MongoDB (via Mongoose).

## Architecture

- **`config/`**: Database connection (`db.js`) and environment loader (`env.js`).
- **`models/`**: Mongoose schemas (`User`, `Interview`, `Question`, `Bookmark`, `Resume`).
- **`routes/`**: Express routes (`auth`, `interviews`, `bookmarks`).
- **`controllers/`**: Business logic controllers.
- **`services/`**: Google Gemini AI integration and email delivery service.
- **`middleware/`**: JWT authentication and error handling.
- **`utils/`**: Token, OTP, and string utilities.
- **`seed.js`**: Single-file database seeder for fallback questions and default admin.

## Running Locally

```bash
cd server
npm run dev
```

Runs at `http://localhost:5050`.

## Health Check

- `GET /` -> `{ status: 'ok', service: 'mockmate-server', uptime: <seconds> }`
- `GET /api/health` -> `{ status: 'ok', service: 'mockmate-server' }`
