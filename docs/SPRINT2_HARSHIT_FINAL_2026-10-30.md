# Harshit Chandak Sprint 2 implementation and test summary

Date: 30 October 2026. Owner: Harshit Chandak / PES2UG24CS185. Baseline: main `f284381`, containing merged team PRs #35–39 after the earlier #34 integration. Final fixes use `harshit-sprint2-final-integration` and a reviewed/tested PR targeting main.

## Current scope

Karan's real Attempt, Result, History, Performance and acceptance-test changes are now published and integrated. The earlier missing-module reports describe the 28/29 October snapshots, not current availability. Harshit's CSMQ-29–34/55 implementation now connects the complete available application.

The submitted SRS, SAD and Test Plan are unchanged. `npm run check:submitted` and CI verify frozen fingerprints in [the separate manifest](evidence/submitted-document-hashes.json). PDFs are checked byte-for-byte; Markdown canonicalizes only checkout line endings. Local hashes also cover the untouched Word/PDF copies supplied in the project folder. No submitted file is regenerated or rewritten.

## Integration and correctness fixes

- Student Dashboard now opens the real History and Performance pages instead of disabled placeholders.
- Attempt submission, history and quiz loading consistently invalidate an expired session without clearing a newer login.
- Performance uses all authenticated history pages, including attempts older than the newest 50. A changing/incomplete history or changed session produces a retryable error rather than a misleading average. The 51-attempt regression gives the expected subject average.
- The frozen SAD's `/api/materials/:id/download` path is supported alongside the existing `/file` API. Both require authentication, return the stored PDF bytes and reject removed content.
- Successful saved submissions additionally return the SAD's `resultId` and `correctAnswers`; `attemptId` and current scoring fields remain compatible with existing clients. Feedback is displayed after successful submission. Quiz discovery, pre-submission questions, history, errors and logs do not disclose answer keys.
- The real UI retains a submission UUID across retries/page reloads and sends `Idempotency-Key` without changing the SAD request body. A partial unique MongoDB index scoped by authenticated user and key ensures racing retries save one attempt. Different answers with an already-used key return 409; a fresh key permits a deliberate repeat attempt. Legacy clients without the optional header keep their existing behavior.
- Actual MongoDB restart tests now preserve completed attempts/history as well as accounts, sessions and Question tombstones. Moderation retains saved history and subject metadata.

## Executed verification

| Check | Result |
| --- | --- |
| Backend types/build/coverage | 326 tests, 36 files passed; 97.92% lines, 92.07% branches, existing gates retained |
| Frontend tests/lint/build | 178 tests, 34 files passed; lint and production build passed |
| Browser journeys | 15 passed: five each in Chrome, Edge and Firefox, including the complete real Attempt → Result → History → Performance flow |
| Normal single-user timing | Materials, Create Quiz, Quiz Search, Dashboard, Quiz View, Attempt, Result, History and Performance primary-content checks all pass the original 3-second limit after application startup in all three browsers; JSON timing attachments retained |
| Concurrency | Real Quiz retrieval/scoring: 10 sessions/20 requests p90 222ms; 50 sessions/100 requests p90 1131ms. Auth/material checks: p90 163ms/634ms. These are measured API workloads, not claims of 50 simultaneous browser processes |
| Persistence | Reconnection and actual standalone MongoDB stop/restart preserve sessions, attempts, history and moderation exclusions |
| Built local release | Real compiled frontend/assets, auth/RBAC/logout, real Question/Quiz creation, trusted/idempotent scoring, SAD response/download, PDF-byte equality, moderation and saved history after MongoDB restart passed |
| Frozen documents | Local hash comparison and canonical CI guard passed; no submitted document changes |

Logs are under ignored `.local/sprint2-2026-10-30/`. CI retains JUnit/coverage/build and browser evidence, including full-flow timing JSON and screenshots. These tests use only newly allocated disposable databases; no Atlas content, roles or access settings are changed. The final PR/Jira evidence identifies its exact head and CI run; no successful CI result is invented here.

## Demonstration and release acceptance

Use supported Node 24.15+ and installed locked root/frontend dependencies, then run `./scripts/start-sprint2.ps1`. Open `http://127.0.0.1:8080`. This explicitly separate local deployment matches the SAD's single local/development environment and preserves data under `.local/sprint2-demo/database`. It never loads Atlas configuration or creates an Admin automatically. Explicit trusted first-Admin provisioning is documented in [deployment instructions](DEPLOYMENT.md).

Demonstrate: Student login/Dashboard → material upload/search/details/view/download → Admin adds Question → Student creates/searches/attempts Quiz → saved result/answer feedback → history → subject performance → Admin confirmation/cancellation/removal → unavailable content with preserved history. The built verifier exercises the backend/storage lifecycle; browser journeys cover actual UI navigation. Record the final demo/video using the real local product; automated tests do not substitute for a human recording.

The Test Plan's human acceptance/signatures are still genuine human responsibilities: peer cross-testing, final defect/RTM review, Project Guide acceptance, final demonstration and agreement to freeze the release. No signatures, independent reviewer approval, public HTTPS deployment or final freeze/tag are fabricated. Production Caddy/HTTPS configuration and isolated Docker deployment are tested separately; no public domain/production environment is selected implicitly.

The configured Atlas read-only ping was rerun on 30 October and failed. Its records/access settings were not changed. This does not invalidate the separately verified local demonstration, but Atlas-specific deployment readiness must not be claimed from the disposable/local tests.

## Separate scope clarification

Folder management appears in Jira CSMQ-32 but not in the frozen SRS/SAD/Test Plan, the current work division, or Dharani's CSMQ-35/36/38/54 criteria. It is a backlog/baseline inconsistency, not a verified missing Dharani requirement. This report does not amend the submitted documents, silently delete Jira acceptance criteria or add an unapproved folder feature.

Harshit's implementation and automated verification are ready for final acceptance against the frozen baseline. Jira completion still requires the remaining genuine review/acceptance evidence; an automated coding run alone does not satisfy every Test Plan exit criterion.
