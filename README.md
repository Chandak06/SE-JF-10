> Active development branch: `PES2UG24CS185-Sprint-2`. See [Sprint 2 status](docs/SPRINT2_HARSHIT.md). Main preserves the Sprint 1 increment and video; this branch adds final-product integration.

# Collaborative Study Material & Quiz Platform

Team 10 · SE Jackfruit · MERN

## Sprint Structure

The final project plan contains exactly two implementation sprints:

- **Sprint 1:** core authentication, PDF upload, Question Bank, QuizAttempt/evaluation prototype, shared security, unit/integration tests and GitHub Actions.
- **Sprint 2:** all remaining approved functionality, complete integration, regression/system/NFR/UAT validation, deployment, final documentation and demo/release.

Sprint 2 is planned to complete the entire application; it is not claimed complete. See the [final plan](docs/TWO_SPRINT_PLAN.md), [work division](docs/WORK_DIVISION.md) and authoritative [Sprint 1 closeout](docs/SPRINT1_CLOSEOUT.md).

The merged Sprint 1 increment includes Dharani's registration/login/logout and validated PDF upload; Prajwal's Question Bank, Add MCQ, filters and student-safe endpoint; Karan's attempt model/UI and scoring prototype; and Harshit's shared authentication, hashing, authorization, integration/security tests and CI. The attempt page uses sample questions and local submission rather than production server scoring.


## Current Sprint 2 development

**29 October:** Reviewed team Sprint 2 contributions are combined in a PR targeting **main**, as requested. Real Quiz creation/search, trusted submission API, Student Dashboard and enhanced PDF workflows are now connected to shared authentication and Admin Quiz moderation. See the [name-wise review, fixes, tests and remaining deliverables](docs/SPRINT2_TEAM_REVIEW_2026-10-29.md). The separation notes below describe the earlier plan; the saved Sprint 1 branch/video remain available.

On `PES2UG24CS185-Sprint-2`, Admin login opens the Administrator Dashboard with links to the existing Question Bank and confirmed material/question moderation. Protected material search, paging and PDF downloads are integrated. Production Quiz/Attempt/history/performance and other unpublished owner modules remain explicit integration dependencies; see [current Sprint 2 status](docs/SPRINT2_HARSHIT.md).

For a separate persistent local Docker demo, use `docker compose -f compose.local.yaml up --build -d`, then open `http://localhost:8080`. This explicit local environment uses its own MongoDB volume, does not use Atlas, and exposes only a loopback web port. Follow [setup and Admin provisioning instructions](docs/DEPLOYMENT.md); it is not a public HTTPS deployment.

Without Docker or Atlas on Windows, run `./scripts/start-sprint2.ps1` after installing the locked root/frontend dependencies. It builds the available Sprint 2 application and serves it at `http://127.0.0.1:8080` with persistent separate local MongoDB. See [local setup and explicit Admin provisioning](docs/DEPLOYMENT.md). It does not create an Admin automatically.

## Run locally

Public registration creates Students only. To set up the first authorized development Admin, use the explicitly confirmed `npm run seed:admin` procedure in [Admin setup](docs/ADMIN_SETUP.md). Use the common login page, then **Question Bank** or `/questions`. No Admin account is created automatically.

Use Node.js 24.15 or newer within the supported Node 24 series (`.nvmrc`: 24.19.0). Run `npm ci`. If no `.env` exists, copy `.env.example` to `.env`; preserve your configured Atlas connection and never commit credentials.

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

For the 27 October Sprint 1 evaluation, follow the [current readiness checklist](docs/SPRINT1_EVALUATION_READINESS.md) and [one-minute video outline](demos/README.md). On Windows, run `./scripts/start-sprint1.ps1 -Service backend` and `./scripts/start-sprint1.ps1 -Service frontend` in separate terminals. The launcher uses a compatible installed Node or the available bundled runtime without changing global settings.
