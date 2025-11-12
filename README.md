# 🥴 CSIT314 — Crashout

---

## 👥 Project Team Members

| Role | Name |
|------|------|
| 👨‍💻 Project Manager | [Foo Kok Tai Justin](https://github.com/Cakebut) |
| 👨‍💻 Full Stack | [Eugene Lay Chai Chun](https://github.com/Eugenelcc) |
| 👩‍💻 Integration & Frontend | [Nur Syafiqah Binte Mustazam](https://github.com/hwatwhy) |
| 👨‍💻 Backend Dev | [Jiyavudeen Mohamed Haneefa](https://github.com/ladzys) |
| 👩‍💻 UIUX & Frontend | [Karissa Angeline Ramos Wong]() |
| 👨‍💻 Backend Dev | [Tan Jun Rong Dillon](https://github.com/dlawnns) |
| 👨‍💻 Backend Dev | [Sim Zhan Qi](https://github.com/ilovecoding77) |

**💡 Credit Supporter:** [Alexander Neo](https://github.com/AlexanderNeo427)

---

## 🎥 Project Demo

[![Watch the video](https://img.youtube.com/vi/Y4NMnImlmLA/0.jpg)](https://www.youtube.com/watch?v=Y4NMnImlmLA)  
🎬 [**Click here to watch on YouTube**](https://www.youtube.com/watch?v=Y4NMnImlmLA)

---

## 📚 Documentation

📄 [**Project Report (PDF)**](https://github.com/Cakebut/CSIT314Crashout/blob/main/Crashout%20Final%20Report.pdf)  
📄 [**Project Specifications (PDF)**](https://github.com/Cakebut/CSIT314Crashout/blob/main/Project%20Specification.pdf)

---

## 🗓️ Project Planning

📅 [**Taiga Backlog & Sprint Board**](https://tree.taiga.io/project/eugenelcc-314-name-project/backlog)

---


```markdown
# CSIT314 — Crashout (CSR ↔ PIN Matching System)

Crashout is a full‑stack TypeScript project (frontend + backend) built for the CSIT314 course to match Corporate Social Responsibility (CSR) corporate volunteers (CVs) to Persons-In-Need (PIN). This README has been updated to reflect the actual package.json scripts and key developer workflows for both the backend and frontend that you shared.

This README covers:
- Project summary & required features
- The extra features you requested (admin logs, forgot password, CSV export, real-time notifications, PM announcements and reports)
- Backend & frontend scripts (from package.json)
- How to run, build, seed and demo the app
- Environment variables, DB migration & seeding commands
- Useful API examples and test data guidance

---

## Table of contents

- [Project](#project)
- [Key features](#key-features)
- [Tech stack & repo composition](#tech-stack--repo-composition)
- [Getting started](#getting-started)
  - [Requirements](#requirements)
  - [Backend setup & scripts](#backend-setup--scripts)
  - [Frontend setup & scripts](#frontend-setup--scripts)
  - [Run both for development](#run-both-for-development)
  - [Build & deploy](#build--deploy)
  - [Seed/demo data](#seeddemo-data)
- [Environment variables](#environment-variables)
- [Database migrations](#database-migrations)
- [API examples](#api-examples)
- [Testing](#testing)
- [Contributing & next steps](#contributing--next-steps)
- [License & contact](#license--contact)

---

## Project

Crashout helps match volunteer opportunities (PIN service requests) with CSR representatives and corporate volunteers. It provides searching, shortlisting, historic views, reporting, category management, and real‑time notifications. The system supports distinct roles (user admin, CSR Rep, PIN, Platform Manager).

Required by spec:
- Support different user types and profiles (user admin, CSR Rep, PIN, Platform Manager)
- Allow PIN to create/manage requests
- Allow CSR Rep to search, shortlist and view history
- Allow PIN to track interest metrics (views, shortlists)
- Platform Manager manages categories and generates reports (daily/weekly/monthly/custom)

Extra features (you asked to include):
- Admin system log (view + export CSV)
- Forgot password (email reset)
- Export CSV for user list and system log
- CSR & PIN notifications with real-time view + shortlist from notifications
- Platform Manager announcements (broadcast to all users)
- Platform Manager reporting with daily/weekly/monthly/custom ranges

---

## Key features

- Role-based authentication & authorization
- Forgot password / email reset flow
- Admin dashboard: users, roles, system logs, CSV export
- Real-time notifications (Socket.IO or WebSocket)
- Shortlist / favourite workflow for CSR → PIN matching
- Platform Manager: announcement broadcast & report generator
- Seed scripts to create large test dataset for live demo (100+ records)

---

## Tech stack & repo composition

- Languages: TypeScript (majority), CSS
- Frontend: React + Vite (TypeScript), Tailwind-related tooling installed
- Backend: Express + Drizzle ORM, Postgres (pg), session support (connect-pg-simple), TypeScript
- Real-time: recommended Socket.IO or WebSocket integration for notifications
- CSV exports: generated server-side (streams or in-memory as appropriate)
- Repo language composition (estimated):
  - TypeScript: 79.2%
  - CSS: 20.2%
  - Other: 0.6%

---

## Getting started

### Requirements
- Node.js (>=16 recommended; some packages may require >=18 — check local engine)
- npm (or yarn/pnpm)
- Postgres (recommended for full features)
- SMTP credentials (for forgot-password emails) or a test SMTP like Mailtrap

Clone the repository:
```bash
git clone https://github.com/Cakebut/CSIT314Crashout.git
cd CSIT314Crashout
```

### Backend — install & scripts

Path: ./backend

Install:
```bash
cd backend
npm install
```

Important scripts (taken directly from backend/package.json):
- `npm run dev` — start the backend in development using nodemon
- `npm run build` — compile TypeScript (`tsc`) to `dist/`
- `npm run start` — run the compiled backend: `node dist/index.js`
- `npm run test` — runs tests via node script `scripts/run-jest.js`
- DB & seed/migration related scripts:
  - `npm run db:migrate` — run drizzle-kit push (--config ./drizzle.config.ts)
  - `npm run db:migrate:generate` — generate a drizzle migration
  - `npm run db:migrate:add_deleted` — run tx script: `tsx scripts/add_deleted_to_service_type.ts`
  - `npm run db:seed` — run seed script: `ts-node src/db/Seeding/seedData.ts`
  - `npm run db:seed2` — alternative seed: `ts-node src/db/Seeding/seedDatav2.ts`
  - `npm run db:delete` — delete seeded data: `ts-node src/db/Seeding/deleteData.ts`

Notes:
- The backend uses Drizzle ORM and drizzle-kit for migrations.
- dev uses `nodemon`; ensure `nodemon` is installed (it is listed in devDependencies).
- If you prefer tsx or ts-node for running TypeScript directly, those are in devDependencies.

Environment note: backend reads DB and session (connect-pg-simple) config from env vars (see env section below).

### Frontend — install & scripts

Path: ./frontend

Install:
```bash
cd frontend
npm install
```

Important scripts (from frontend/package.json):
- `npm run dev` — start Vite dev server (default port printed, typically 5173)
- `npm run build` — runs `tsc -b && vite build` (generates `dist`)
- `npm run preview` — preview built static site locally
- `npm run lint` — run eslint
- `npm run deploy` — (uses gh-pages) deploys `dist` to GitHub Pages (homepage is already set)
  - `npm run predeploy` runs `npm run build` first
- `homepage` in package.json is set to: https://cakebut.github.io/CSIT314Crashout/

Notes:
- Frontend is React + Vite (TypeScript). The `deploy` script will publish `dist/` to GitHub Pages using `gh-pages`.
- For development, run `npm run dev` and point the frontend to the backend API (via proxied URL or environment variable).

### Run both for development

Open two terminals (or use a process manager):

Terminal 1 — backend:
```bash
cd backend
npm run dev
# backend should print listening port (commonly: 3000 or configured by APP_PORT)
```

Terminal 2 — frontend:
```bash
cd frontend
npm run dev
# frontend will start Vite (default port 5173)
```

Configure frontend environment (e.g., VITE_API_URL) to point to your backend dev URL (http://localhost:3000 or similar).

---

## Build & deploy

Backend production:
```bash
cd backend
npm run build
# then on the server:
npm run start
```

Frontend production (build + deploy to GH Pages):
```bash
cd frontend
npm run build
npm run deploy
# deploy publishes dist/ via gh-pages package (homepage already configured)
```

---

## Seed/demo data

The project includes seed scripts to create demo/test data required by the spec (100+ records per datatype). Use these to generate the dataset for the final demo.

Examples:
```bash
# run seed (v1)
cd backend
npm run db:seed

# run alternative or extended seed (v2)
npm run db:seed2

# remove seeded demo data
npm run db:delete
```

Make sure:
- Your database is running and DATABASE_URL is configured
- Seed scripts create a variety of roles: user admin, CSR Rep, PIN, Platform Manager
- Seed scripts should create PIN requests, shortlists, matches, notifications, and example announcements so reporting can be demonstrated

---

## Environment variables (recommended)

Create `.env` files for backend and Vite (frontend) as needed.

Example backend `.env`:
```
DATABASE_URL=postgres://user:pass@localhost:5432/csit314_crashout
APP_PORT=3000
JWT_SECRET=change-this-secret
SESSION_SECRET=change-this-session-secret
SESSION_TABLE=sessions
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
FRONTEND_URL=http://localhost:5173
```

Example frontend `.env` (Vite uses VITE_ prefix):
```
VITE_API_URL=http://localhost:3000/api
VITE_APP_TITLE=Crashout
```

---

## Database migrations & Drizzle

- Run migrations:
  ```bash
  cd backend
  npm run db:migrate
  ```

- Generate migrations:
  ```bash
  npm run db:migrate:generate -- name-of-migration
  ```

- The project includes a helper script `db:migrate:add_deleted` for a particular migration update — run when instructed.

---

## API examples (suggested endpoints)

These are example endpoints that match features described in this README. Update to reflect your actual routes.

- Auth:
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/forgot-password
  - POST /api/auth/reset-password
- Users & admin:
  - GET /api/admin/users
  - GET /api/admin/users?format=csv
  - GET /api/admin/logs?from=YYYY-MM-DD&to=YYYY-MM-DD
  - GET /api/admin/logs?format=csv
- PIN / CSR:
  - GET /api/pins
  - POST /api/pins
  - POST /api/shortlist
  - GET /api/shortlist
- Notifications:
  - GET /api/notifications
  - WebSocket/Socket.IO namespace: /notifications
- Reports:
  - GET /api/reports?period=daily|weekly|monthly|custom&from=...&to=...
- Announcements:
  - POST /api/announcements (PM only)
  - GET /api/announcements

---

## CSV exports & system logs

- System logs:
  - Log every important action (auth, role changes, seed runs, matches)
  - Provide admin UI endpoints to list and filter logs
  - Allow CSV export for logs and user list (server should stream CSV for large exports)

Example server endpoint queries:
- GET /api/admin/logs?from=2025-01-01&to=2025-01-31&format=csv
- GET /api/admin/users?role=PIN&format=csv

---

## Real-time notifications & shortlist flow

Recommended approach:
- Server maintains a notifications table and publishes events via Socket.IO
- When a CSR shortlists a PIN:
  - Create shortlist record
  - Insert notification for the PIN
  - Broadcast to the PIN if connected
- Allow PIN or CSR to convert notification into a shortlist or match directly from the notification item
- Persist announcements so offline users receive them on next login

---

## Testing

- Backend test runner command:
  - `npm run test` (invokes `node scripts/run-jest.js` per backend package.json)
- Add unit tests (Jest/ts-jest) and E2E (Playwright/Cypress) to validate:
  - Authentication flows (register/login/forgot password)
  - Notifications & real-time updates
  - CSV export endpoints and generated file format
  - Report endpoints and aggregation (daily/weekly/monthly/custom)

 

## License & contact

- MIT LICENSE file 
- Repository: https://github.com/Cakebut/CSIT314Crashout
- Maintainer: @Eugenelcc


