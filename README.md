# MODGUARD: AI Content Moderation Platform

A full-stack content moderation platform where users submit images for automated, AI-driven policy screening across six moderation categories. Each image receives a verdict (Approved, Flagged, or Blocked) with a per-category confidence breakdown. Users can appeal flagged or blocked verdicts, and admins control policy configuration, review appeals, and view platform analytics.

---

## Overview

Every submitted image is screened independently against the platform's active policies. For each enabled category the AI returns a safe/unsafe classification, a confidence score, and a short reasoning summary. Enforcement is driven entirely by admin-configured policy: each category has a confidence threshold and an enforcement behavior (Flag for Review or Auto-Block). A category only affects a verdict when it is classified `unsafe` and its confidence meets or exceeds that category's threshold.

To keep the audit trail honest, the exact policy configuration in force at submission time is snapshotted onto the submission. Later policy edits never rewrite historical verdicts.

---

## Features

**User**
- Register and log in (JWT authentication)
- Submit one or several images for screening
- Receive an overall verdict plus a per-category breakdown (classification, confidence, reasoning) for each image
- Browse full submission history with filters by outcome, flagged category, and date range
- File a written appeal on any flagged or blocked submission and track its status and the admin's response

**Admin**
- Everything a user can do, plus:
- Review the pending appeal queue, with the original submission, images, and the user's justification
- Accept (override the verdict to Approved) or reject appeals, with an optional written response
- Configure each policy category: enable/disable, set the confidence threshold, set enforcement behavior
- View analytics: submission volume over time, verdict distribution, appeal outcomes, and a ranked list of top users by submission volume

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React (Create React App), React Router, Axios, Recharts |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose ODM |
| Auth | JSON Web Tokens (JWT), bcrypt password hashing |
| AI screening | Google Gemini Vision API (`gemini-1.5-flash`) |
| File handling | Multer (image uploads) |
| Containerization | Docker, Docker Compose |

The frontend and backend communicate exclusively over a REST API.

---

## Architecture Decisions

**Why MongoDB.** Submissions are deeply nested and variable: one submission holds many image verdicts, each holding a variable-length list of per-category results. Modeling that as a single document tree avoids multi-table joins and keeps each submission readable as one unit. Mongoose gives schema validation and enums in code while preserving that flexibility.

**Policy snapshots.** When a submission is screened, the active policy set (category, threshold, enforcement behavior) is copied onto the submission as `policySnapshot`. This makes every historical verdict reproducible and explainable even after an admin later changes the rules. Editing a policy only affects future submissions, never past ones.

**JWT with role-based middleware.** Authentication is stateless via JWT. Two layers of middleware protect routes: `authMiddleware` verifies the token and attaches the user, and `roleMiddleware('admin')` gates admin-only endpoints. This keeps authorization logic out of the controllers.

**AI service abstraction with graceful fallback.** All AI interaction lives in `services/aiService.js` behind a single `analyzeImage` function, so the rest of the backend never touches the AI provider directly. If the AI request fails (bad key, rate limit, network), the service returns a safe-by-default result for every category instead of throwing, so a submission never hard-fails on an external dependency.

**Confidence-threshold verdict engine.** The verdict for each image is computed by comparing each `unsafe` category result against that category's configured threshold. An unsafe hit on an Auto-Block category blocks the image; an unsafe hit on a Flag category flags it; otherwise the image is approved. The overall submission outcome is the most severe outcome across its images.

**REST as the sole interface.** The React app is a pure client; every piece of state comes through documented REST endpoints, which keeps the frontend and backend independently testable.

---

## Project Structure

```
content-moderation/
├── backend/
│   ├── controllers/      # Business logic (auth, submissions, appeals, admin)
│   ├── middleware/        # JWT auth + role checks
│   ├── models/           # Mongoose schemas (User, Policy, Submission, Appeal)
│   ├── routes/           # REST route definitions
│   ├── services/         # aiService.js (Gemini integration)
│   ├── uploads/          # Stored image uploads (gitignored)
│   ├── seeder.js         # Seeds the six default policies
│   ├── server.js         # App entry point
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios instance + endpoint helpers
│   │   ├── components/   # Navbar, PrivateRoute
│   │   ├── context/      # AuthContext
│   │   └── pages/        # Landing, Login, Register, Dashboard, Submit,
│   │                     #   History, Appeals, Admin* pages
│   ├── Dockerfile
│   └── .env
├── docker-compose.yml
└── README.md
```

---

## Environment Variables

**`backend/.env`**

| Variable | Description | Example |
| --- | --- | --- |
| `PORT` | Backend port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://mongo:27017/content-moderation` |
| `JWT_SECRET` | Secret used to sign JWTs | `change-me-to-a-long-random-string` |
| `GEMINI_API_KEY` | Google Gemini API key | `your_gemini_key` |

**`frontend/.env`**

| Variable | Description | Example |
| --- | --- | --- |
| `REACT_APP_API_URL` | Base URL of the backend API | `http://localhost:5000/api` |

> When running through Docker Compose, `MONGO_URI` uses the service hostname `mongo`. When running the backend directly on your host machine, use `mongodb://127.0.0.1:27017/content-moderation` instead.

A free Gemini key can be created at https://aistudio.google.com. Never commit `.env` files; they are gitignored.

---

## Getting Started (Docker)

**Prerequisites:** Docker Desktop installed and running.

1. Clone the repository and enter it:
   ```bash
   git clone <repo-url>
   cd content-moderation
   ```

2. Create `backend/.env` and `frontend/.env` using the tables above.

3. Build and start all services:
   ```bash
   docker-compose up --build
   ```
   This launches three containers: MongoDB, the backend API, and the frontend.

4. Seed the six default policies (run once, after the containers are up):
   ```bash
   docker-compose exec backend node seeder.js
   ```

5. Open the app:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

Register an account from the UI. To create an admin, choose the Admin role on the registration form.

---

## Local Development (without Docker)

If you prefer to run the services directly:

1. Start a local MongoDB instance and set `backend/.env` `MONGO_URI` to `mongodb://127.0.0.1:27017/content-moderation`.

2. Backend:
   ```bash
   cd backend
   npm install
   node seeder.js   # seed policies once
   npm run dev
   ```

3. Frontend (in a second terminal):
   ```bash
   cd frontend
   npm install
   npm start
   ```

---

## API Reference

All protected routes require an `Authorization: Bearer <token>` header. Admin routes additionally require the `admin` role.

**Auth**
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account, returns a JWT |
| POST | `/api/auth/login` | Log in, returns a JWT |

**Submissions** (auth required)
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/submissions` | Submit images (multipart, field `images`) for screening |
| GET | `/api/submissions` | List the current user's submissions |

**Appeals** (auth required)
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/appeals` | File an appeal on a flagged or blocked submission |
| GET | `/api/appeals` | List the current user's appeals |

**Admin** (auth + admin role required)
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/admin/appeals` | Pending appeal queue |
| PUT | `/api/admin/appeals/:id` | Resolve an appeal (Accepted/Rejected) |
| GET | `/api/admin/policies` | List all policies |
| PUT | `/api/admin/policies/:id` | Update a policy |
| GET | `/api/admin/analytics` | Platform analytics |

---

## Moderation Categories

1. Graphic Violence
2. Hate Symbols
3. Self-Harm
4. Extremist Propaganda
5. Weapons & Contraband
6. Harassment & Humiliation

---

## Notes and Limitations

- AI screening quality depends on the Gemini model and the prompt. The service degrades gracefully (safe-by-default) when the API is unavailable, so screening never blocks the request pipeline.
- Uploaded images are stored on the backend filesystem under `uploads/`. For production this would move to object storage (such as S3 or Cloudinary).
- The free Gemini tier is sufficient for evaluation-level traffic but is rate limited.