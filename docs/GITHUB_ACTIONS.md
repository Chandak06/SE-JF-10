# Sprint 1 GitHub Actions

GitHub Actions is the required pipeline for CSMQ-6 and CSMQ-7. The October 10 Jira update supersedes references to Jenkins in the original planning documents.

The workflow `.github/workflows/ci.yml` runs automatically on push and pull_request, and supports workflow_dispatch. It installs locked dependencies, checks backend types, builds the backend, executes isolated MongoDB tests with coverage, then runs frontend tests, lint and production build. Failed checks stop the job and produce a failed result.

Artifacts: `sprint-1-test-reports` (backend JUnit/coverage plus frontend JUnit), `sprint-1-backend`, and `sprint-1-frontend`. Reports are retained even on failure; build packages are retained after successful checks. Atlas credentials are unnecessary for CI because integration tests use disposable MongoDB.

Do not commit `.env` values. For Sprint 2 deployment, supply credentials through GitHub environment secrets and specify the actual hosting target; no hosted deployment is claimed for this sprint.

Sprint 1 is integrated on `main` and the recording branch `PES2UG24CS185-Sprint-1`. Earlier PR authorization/status statements are historical; use the [closeout](SPRINT1_CLOSEOUT.md) for actual review/Jira state. Saved Sprint 2 draft PR #8 remains separate pending the recording gate. Keep intentional CI failure demonstrations off product branches.

Dated execution links are retained in [Harshit’s historical report](SPRINT1_HARSHIT.md). The [final plan](TWO_SPRINT_PLAN.md) assigns all remaining delivery and validation to Sprint 2; workflow configuration itself is unchanged by this documentation update.
