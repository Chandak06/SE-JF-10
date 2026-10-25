# Collaborative Study Material & Quiz Platform

Team 10 · SE Jackfruit · MERN

## Sprint Structure

The final project plan contains exactly two implementation sprints:

- **Sprint 1:** core authentication, PDF upload, Question Bank, QuizAttempt/evaluation prototype, shared security, unit/integration tests and GitHub Actions.
- **Sprint 2:** all remaining approved functionality, complete integration, regression/system/NFR/UAT validation, deployment, final documentation and demo/release.

Sprint 2 is planned to complete the entire application; it is not claimed complete. See the [final plan](docs/TWO_SPRINT_PLAN.md), [work division](docs/WORK_DIVISION.md) and authoritative [Sprint 1 closeout](docs/SPRINT1_CLOSEOUT.md).

The merged Sprint 1 increment includes Dharani's registration/login/logout and validated PDF upload; Prajwal's Question Bank, Add MCQ, filters and student-safe endpoint; Karan's attempt model/UI and scoring prototype; and Harshit's shared authentication, hashing, authorization, integration/security tests and CI. The attempt page uses sample questions and local submission rather than production server scoring.

## Run locally

Use Node.js 24.15 or newer within the supported Node 24 series. Run `npm ci`. If no `.env` exists, copy `.env.example` to `.env`; preserve your configured Atlas connection and never commit credentials.

- `npm run db:check`: compile and verify MongoDB with an authenticated ping without changing records. Recheck live connectivity before recording.
- `npm run dev`: backend on port 5000 by default.
- In `frontend`, run `npm ci` and `npm run dev`. Set `VITE_API_BASE_URL` in a local frontend `.env` if needed.
- Register, log in and use the material upload page to submit title, subject, description and a PDF. Use an authorized administrator account for Add MCQ; show the student attempt prototype with its stated limitation.
- `npm run build` and `npm start`: production backend.

API/runtime composition and authorization are documented in [integration](docs/INTEGRATION.md), the [Question contract](docs/question-api-contract.md) and [Attempt contract](docs/attempt-api-contract.md).

## Verify and CI/CD

Run `npm run check` at the root. In `frontend`, run `npm run test:ci`, `npm run lint` and `npm run build`. Tests use disposable MongoDB rather than the configured Atlas database. Backend coverage gates are 85% statements/lines/functions and 80% branches.

[GitHub Actions](.github/workflows/ci.yml) builds, tests, lints and retains reports/build artifacts on push, PR and manual dispatch. It supersedes the original Jenkins proposal. Hosted deployment and final release validation belong to Sprint 2; a deployment target must still be confirmed. See the [CI guide](docs/GITHUB_ACTIONS.md).

Keep draft Sprint 2 PR #8 separate until Harshit confirms the Sprint 1 recording is complete. Follow the [recording/separation guide](docs/SPRINT_SEPARATION.md). This documentation branch is for review and is not merged automatically.

References: [SRS](SRS.md), [SAD](SAD.pdf), editable [Test Plan](TEST_PLAN.md), generated [Test Plan PDF](TEST_PLAN.pdf), [historical references](docs/historical/README.md) and [documentation audit](docs/DOCUMENTATION_AUDIT_2026-10-25.md).
