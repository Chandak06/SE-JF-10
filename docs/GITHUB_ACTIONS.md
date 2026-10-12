# Sprint 1 GitHub Actions

GitHub Actions is the required pipeline for CSMQ-6 and CSMQ-7. The October 10 Jira update supersedes references to Jenkins in the original planning documents.

The workflow `.github/workflows/ci.yml` runs automatically on push and pull_request, and supports workflow_dispatch. It installs locked dependencies, checks backend types, builds the backend, executes isolated MongoDB tests with coverage, then runs frontend tests, lint and production build. Failed checks stop the job and produce a failed result.

Artifacts: `sprint-1-test-reports` (backend JUnit/coverage plus frontend JUnit), `sprint-1-backend`, and `sprint-1-frontend`. Reports are retained even on failure; build packages are retained after successful checks. Atlas credentials are unnecessary for CI because integration tests use disposable MongoDB.

Do not commit `.env` values. For future deployment, supply credentials through GitHub environment secrets and specify the actual hosting target; no hosted deployment is claimed for this sprint.

The main contribution is branch `PES2UG24CS185`. The October 12 user request authorizes the agent to open and merge its PR after passing checks. Obtain Member 1 or Member 3 review as required by the work division before merging. The CI failure demonstration uses a separate, non-merge branch; its intentional assertion must never enter the contribution branch.

Current execution links and test results are recorded in `docs/SPRINT1_HARSHIT.md`.
