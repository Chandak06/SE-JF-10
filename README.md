# Collaborative Study Material & Quiz Platform

Team 10 · SE Jackfruit · MERN

Harshit Chandak (PES2UG24CS185), Sprint 1, CSMQ-2 through CSMQ-7: shared authentication/security, Member 1 integration, tests and GitHub Actions.

Dharani's account model, repository and React pages are integrated from branch PES2UG24CS157, preserving their commits. Harshit's integration adds runtime composition, secured PDF upload/storage and browser upload/logout. Question-bank and attempt business features remain assigned to their respective teammates.

## Run locally

Use Node.js 24.15 or newer within the supported Node 24 series. Run `npm ci`. If no `.env` exists, copy `.env.example` to `.env`; keep your existing Atlas configuration. Never overwrite or commit a configured `.env`.

- `npm run db:check`: compile and verify MongoDB with an authenticated ping, without changing records.
- `npm run dev`: backend at port 5000 by default.
- In `frontend`, run `npm ci` and `npm run dev`. Set `VITE_API_BASE_URL` in a local frontend `.env` when needed.
- Register, log in, follow **Share a PDF or log out**, enter title/subject/description and choose a PDF.
- `npm run build` and `npm start`: production backend.

The API provides `/health`, `/ready`, `/api/auth/register`, `/login`, `/me`, `/logout` (under `/api/auth`) and authenticated `POST /api/materials`.

## Verify

Run `npm run check` at the repository root. In `frontend`, run `npm run test:ci`, `npm run lint` and `npm run build`.

Backend tests use isolated temporary MongoDB, never the configured Atlas database. Coverage gates: 85% statements/lines/functions and 80% branches. Reports are generated in `reports/`, `coverage/` and `frontend/reports/`.

## Sprint 1 CI/CD

[GitHub Actions](.github/workflows/ci.yml) checks backend types, builds both applications, runs backend/frontend tests and frontend lint, and retains reports plus backend/frontend build artifacts. Pushes, pull requests and manual runs trigger it. This implements Sprint 1 build/package delivery; hosted deployment requires a later deployment target.

GitHub Actions replaces Jenkins per the updated Jira requirements and project decision on 10 October 2026. No Jenkins setup is needed.

See [integration contracts](docs/INTEGRATION.md), [Sprint evidence](docs/SPRINT1_HARSHIT.md) and [CI guide](docs/GITHUB_ACTIONS.md). Independent teammate review and the user-created PR remain necessary before merging.

References: [SRS](SRS.md), [SAD](SAD.pdf), [test plan](TEST_PLAN.pdf), detailed Sprint 1 work plan and updated work division in the project folder.

## Sprint 2 administration and readiness

The Sprint 2 contribution adds protected material search/download, administrator moderation with explicit confirmation, owner-supplied Question/Quiz moderation adapters, browser regressions and scoped concurrency/persistence tests. Removed materials are hidden from all read/download paths and retained for recovery.

See docs/SPRINT2_HARSHIT.md for requirement status and docs/DEPLOYMENT.md for local administration, HTTPS containers, browser tests and teammate integration contracts. Whole-platform completion depends on the missing Question/Quiz/Attempt modules and deployment target.
