# MockMate AI — Backend REST API

The backend server for MockMate AI is a modular Express application built with Node.js and MongoDB (via Mongoose). It powers authentication, question generation, AI scoring rubrics, and certificate issuance.

## Architecture

The backend follows an MVC-inspired pattern:
- **`config/`**: Database connection (`db.js`) with event monitoring and reconnect handling; environment loader (`env.js`).
- **`models/`**: Clean Mongoose schemas with explicit field types and automatic timestamps.
- **`routes/`**: Express routers organized by resource domain (`auth`, `interviews`, `bookmarks`, `certificates`, `admin`).
- **`controllers/`**: Request validation, business logic, database queries, and standardized JSON responses.
- **`services/`**: Integration with Google Gemini Generative AI SDK and Nodemailer / Brevo email services.
- **`middleware/`**: JWT authentication checks, role-based access control, input validation schemas, and global error handling.
- **`utils/`**: Cryptographic OTP generation (SHA-256), timing-safe comparison, JWT issuance, and text sanitization.

## Folder Organization

```text
server/
├── src/
│   ├── config/             # DB connection (db.js) & env configuration (env.js)
│   ├── controllers/        # Business logic controllers
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── bookmarkController.js
│   │   ├── certificateTemplateController.js
│   │   └── interviewController.js
│   ├── middleware/         # Auth, validation, and error middlewares
│   ├── models/             # Mongoose schemas (User, Interview, Bookmark, Certificate)
│   ├── routes/             # Express API routes
│   ├── services/           # Gemini AI and Email delivery services
│   ├── utils/              # Token, OTP, and string utilities
│   ├── app.js              # Express app setup, CORS, security headers, rate limiters
│   ├── index.js            # Entry point running database connection and HTTP listener
│   ├── seed.js             # Initial database seeder
│   └── seedReset.js        # Full database reset and seeder
├── package.json            # Server dependencies and npm scripts
└── README.md
```

## Running Locally

```bash
# From workspace root
npm --prefix server run dev

# Or from inside the server/ directory
cd server
npm run dev
```

The backend server starts at `http://localhost:5050`.

## API Health Checks

- `GET /` -> Returns `{ status: 'ok', service: 'mockmate-server', uptime: <seconds> }`
- `GET /api/health` -> Returns `{ status: 'ok', service: 'mockmate-server' }`
