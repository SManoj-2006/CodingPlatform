# CodeCollab - Full Stack Pair Programming Platform

CodeCollab is a MERN-based real-time coding collaboration platform with:
- Clerk authentication
- live coding sessions
- Stream video + chat integration
- problem-based coding practice
- secure backend code execution proxy (Piston)

## Tech Stack

- Frontend: React, Vite, React Query, Clerk, Monaco Editor, Tailwind + DaisyUI
- Backend: Node.js, Express, MongoDB (Mongoose), Clerk Express middleware, Stream server SDK
- Code execution: self-hosted Piston (recommended)

## Core Features

- Authenticated dashboard with active and recent sessions
- Create / join / end pair-programming sessions
- Session-level video call + chat channel
- Multi-language code editor (JavaScript, Python, Java)
- Judge-style output panel using expected output matching

## API Endpoints (Short Reference)

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `GET` | `/health` | No | Health check |
| `GET` | `/api/chat/token` | Yes | Stream token for video/chat client |
| `POST` | `/api/sessions` | Yes | Create coding session |
| `GET` | `/api/sessions/active` | Yes | List active sessions |
| `GET` | `/api/sessions/my-recent` | Yes | List recent completed sessions |
| `GET` | `/api/sessions/:id` | Yes | Fetch session details |
| `POST` | `/api/sessions/:id/join` | Yes | Join session as participant |
| `POST` | `/api/sessions/:id/end` | Yes | End session (host only) |
| `POST` | `/api/code/execute` | Yes | Execute code through backend proxy |

## Project Structure

- `frontend/`: React client
- `backend/`: API server and business logic
- `backend/src/controllers/`: route handlers
- `backend/src/middleware/ProtectRoute.js`: auth + user auto-provisioning
- `backend/src/controllers/codeController.js`: code execution proxy to Piston

## Environment Setup

### Backend (`backend/.env`)

Minimum expected variables:

```env
PORT=3000
DB_URL=<mongodb_connection_string>
NODE_ENV=development
CLIENT_URL=http://localhost:5173

INNGEST_EVENT_KEY=<inngest_event_key>
INNGEST_SIGNING_KEY=<inngest_signing_key>

STREAM_API_KEY=<stream_api_key>
STREAM_API_SECRET=<stream_api_secret>

# Self-hosted Piston (recommended)
PISTON_API_URL=http://localhost:2000/api/v2
# optional for self-hosted, required for hosted emkc endpoint
PISTON_AUTH_TOKEN=
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000/api
VITE_CLERK_PUBLISHABLE_KEY=<clerk_publishable_key>
VITE_STREAM_API_KEY=<stream_api_key>
```

## Local Development

1. Install dependencies:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

2. Start backend:

```bash
npm run dev --prefix backend
```

3. Start frontend:

```bash
npm run dev --prefix frontend
```

## One-Command Docker Dev Stack

Run the complete stack (Mongo + Piston + runtime installer + backend + frontend):

```bash
docker compose up -d
```

Useful commands:

```bash
docker compose logs -f
docker compose down
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Piston API: `http://localhost:2000/api/v2`
- MongoDB: `mongodb://localhost:27017`

## Self-Hosted Piston Setup (No Public Token Needed)

1. Run Piston container:

```bash
docker rm -f piston_api
docker volume create piston_data
docker run --privileged -dit -p 2000:2000 -v piston_data:/piston --name piston_api ghcr.io/engineer-man/piston
```

2. Install runtimes used by the app:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:2000/api/v2/packages -ContentType "application/json" -Body '{"language":"node","version":"18.15.0"}'
Invoke-RestMethod -Method Post -Uri http://localhost:2000/api/v2/packages -ContentType "application/json" -Body '{"language":"python","version":"3.10.0"}'
Invoke-RestMethod -Method Post -Uri http://localhost:2000/api/v2/packages -ContentType "application/json" -Body '{"language":"java","version":"15.0.2"}'
```

3. Verify runtimes:

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:2000/api/v2/runtimes
```

## Reliability Improvements Included

- automatic Mongo user provisioning from Clerk claims on first protected request
- safer session flow with ObjectId validation
- idempotent session join behavior for retry/refresh
- participant persistence after successful Stream membership
- corrected Stream user image payload
- robust Piston execute URL handling for hosted and self-hosted bases

## Demo Checklist

- sign in with two Clerk accounts
- create session from account A
- join session from account B
- verify video + chat connect
- run JS/Python/Java code in both problem and session pages
- end session and confirm participant redirect to dashboard

## Future Scope

- team sessions with >2 participants
- collaborative editor with OT/CRDT
- contest mode with timed scoring
- plagiarism detection and submission history
- CI/CD deployment pipeline with observability
