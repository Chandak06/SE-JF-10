> Current status, 8 November 2026: `main` contains the integrated application and verified command-generated testing reports. The reproducible Sprint 1 increment remains on `PES2UG24CS185-Sprint-1`, including its video. Use the [three TXT submission reports](docs/submission/README.md) and [current testing guide](docs/TESTING.md).

# Collaborative Study Material & Quiz Platform

Team 10 · SE Jackfruit · MERN

## Sprint Structure

The final project plan contains exactly two implementation sprints:

- **Sprint 1:** core authentication, PDF upload, Question Bank, QuizAttempt/evaluation prototype, shared security, unit/integration tests and GitHub Actions.
- **Sprint 2:** all remaining approved functionality, complete integration, regression/system/NFR/UAT validation, deployment, final documentation and demo/release.

Sprint 2 is planned to complete the entire application; it is not claimed complete. See the [final plan](docs/TWO_SPRINT_PLAN.md), [work division](docs/WORK_DIVISION.md) and authoritative [Sprint 1 closeout](docs/SPRINT1_CLOSEOUT.md).

The saved Sprint 1 increment includes Dharani's registration/login/logout and validated PDF upload; Prajwal's Question Bank, Add MCQ, filters and student-safe endpoint; Karan's attempt model/UI and scoring prototype; and Harshit's shared authentication, hashing, authorization, integration/security tests and CI. Its sample-question prototype is historical; the current app loads real Quizzes and persists server-scored attempts.


## Current Sprint 2 development

**30 October:** The complete real Attempt/Result/History/Performance modules are integrated. [Harshit's final implementation and test summary](docs/SPRINT2_HARSHIT_FINAL_2026-10-30.md) covers the completed integration, submitted-SAD compatibility, frozen-document checks, full browser journey, local release and remaining human acceptance. Earlier missing-module/separation notes below are dated history.

**29 October:** Reviewed team Sprint 2 contributions are combined in a PR targeting **main**, as requested. Real Quiz creation/search, trusted submission API, Student Dashboard and enhanced PDF workflows are now connected to shared authentication and Admin Quiz moderation. See the [name-wise review, fixes, tests and remaining deliverables](docs/SPRINT2_TEAM_REVIEW_2026-10-29.md). The separation notes below describe the earlier plan; the saved Sprint 1 branch/video remain available.

Admin login opens the Administrator Dashboard with Question Bank and confirmed single/bulk material/question/quiz moderation. Students can upload/search/view/download PDFs, create/find/attempt Quizzes and view saved results, history and complete subject-wise performance. The legacy practice URL redirects to real Quiz discovery, with no arbitrary countdown. Folder management was dropped on 30 October. Independent acceptance evidence remains separate from automated implementation checks.

For a separate persistent local Docker demo, use `docker compose -f compose.local.yaml up --build -d`, then open `http://localhost:8080`. This explicit local environment uses its own MongoDB volume, does not use Atlas, and exposes only a loopback web port. Follow [setup and Admin provisioning instructions](docs/DEPLOYMENT.md); it is not a public HTTPS deployment.

Without Docker or Atlas on Windows, run `./scripts/start-sprint2.ps1` after installing the locked root/frontend dependencies. It builds the available Sprint 2 application and serves it at `http://127.0.0.1:8080` with persistent separate local MongoDB. See [local setup and explicit Admin provisioning](docs/DEPLOYMENT.md). It does not create an Admin automatically.

## Run locally

Public registration creates Students only. To set up the first authorized development Admin, use the explicitly confirmed `npm run seed:admin` procedure in [Admin setup](docs/ADMIN_SETUP.md). Use the common login page, then **Question Bank** or `/questions`. No Admin account is created automatically.

Use Node.js 24.15 or newer within the supported Node 24 series (`.nvmrc`: 24.19.0). Run `npm ci`. If no `.env` exists, copy `.env.example` to `.env`; preserve your configured Atlas connection and never commit credentials.

- `npm run db:check`: compile and verify MongoDB with an authenticated ping without changing records. Recheck live connectivity before recording.
- `npm run dev`: backend on port 5000 by default.
- In `frontend`, run `npm ci` and `npm run dev`. Set `VITE_API_BASE_URL` in a local frontend `.env` if needed.
- Register, log in and use the material upload page to submit title, subject, description and a PDF. Use an authorized administrator account for Add MCQ; as a Student, create/find a real Quiz, submit answers and inspect saved results/history/performance.
- `npm run build` and `npm start`: production backend.

API/runtime composition and authorization are documented in [integration](docs/INTEGRATION.md), the [Question contract](docs/question-api-contract.md) and [Attempt contract](docs/attempt-api-contract.md).

## Verify and CI/CD

For the complete team-wide testing submission, use [Whole-project testing](docs/TESTING.md): the current case document, three TXT reports, test data and manual acceptance register. `npm run reports:txt` executes the test tools and captures their actual output. Code and branch coverage are combined in the third report.

Run `npm run check` at the root. In `frontend`, run `npm run test:coverage`, `npm run lint` and `npm run build`. After installing the Playwright browsers, run `npm run test:browser`. Run `npm run demo:build` then `npm run demo:verify` for the compiled-release/restart check. TXT capture and failure propagation are checked with `node --test scripts/tests/text-test-reports.test.mjs`. Tests use disposable MongoDB rather than Atlas. Backend coverage gates are 85% statements/lines/functions and 80% branches; frontend coverage is reported separately. See [current test cases](docs/TEST_CASES_WHOLE_PROJECT.md) and [three TXT reports](docs/submission/README.md).

[GitHub Actions](.github/workflows/ci.yml) builds, tests, lints and retains reports/build artifacts on push, PR and manual dispatch. It supersedes the original Jenkins proposal and validates the isolated production HTTPS configuration. The documented persistent local release supports the SRS demonstration environment; record the chosen environment, final demo and acceptance evidence. See the [CI guide](docs/GITHUB_ACTIONS.md).

Sprint 2 PR #8 and subsequent team integrations, including verified TXT reports in PR #45, are merged. The earlier main-only-Sprint-1 separation instructions are historical; use the saved Sprint 1 branch when reproducing the original video.

Frozen submitted references: [SRS](SRS.md), [SAD](SAD.pdf), [Test Plan](TEST_PLAN.md) and [Test Plan PDF](TEST_PLAN.pdf). Current test-case/report revisions supplement these documents. See also [historical references](docs/historical/README.md) and [documentation audit](docs/DOCUMENTATION_AUDIT_2026-10-25.md).

For the 27 October Sprint 1 evaluation, follow the [current readiness checklist](docs/SPRINT1_EVALUATION_READINESS.md) and [one-minute video outline](demos/README.md). On Windows, run `./scripts/start-sprint1.ps1 -Service backend` and `./scripts/start-sprint1.ps1 -Service frontend` in separate terminals. The launcher uses a compatible installed Node or the available bundled runtime without changing global settings.
