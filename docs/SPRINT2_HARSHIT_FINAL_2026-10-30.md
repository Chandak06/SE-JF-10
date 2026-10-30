# Harshit Chandak Sprint 2 implementation and test summary

Date: 30 October 2026. Owner: Harshit Chandak / PES2UG24CS185. Baseline: main `f284381`, containing merged team PRs #35–39 after the earlier #34 integration. Final fixes use `harshit-sprint2-final-integration` and a reviewed/tested PR targeting main.

## Current scope

Karan's real Attempt, Result, History, Performance and acceptance-test changes are now published and integrated. The earlier missing-module reports describe the 28/29 October snapshots, not current availability. Harshit's CSMQ-29–34/55 implementation now connects the complete available application.

The submitted SRS, SAD and Test Plan are unchanged. `npm run check:submitted` and CI verify frozen fingerprints in [the separate manifest](evidence/submitted-document-hashes.json). PDFs are checked byte-for-byte; Markdown canonicalizes only checkout line endings. Local hashes also cover the untouched Word/PDF copies supplied in the project folder. No submitted file is regenerated or rewritten.

## Integration and correctness fixes

- Follow-up navigation audit: retired the exposed Sprint 1 sample practice route. The Student navbar links to saved Quiz History; `/quiz-attempt` redirects authenticated Students to real Quiz Search without starting or submitting an attempt. Real attempts open from Quiz details → Start Quiz. The historical Sprint 1 component remains isolated from production routing.
- Removed the arbitrary 20-minute client-only countdown: no quiz duration/deadline is specified by the frozen requirements or Quiz API, refreshing reset the counter, and reaching zero enforced nothing. Current quizzes explicitly have no time limit. Unsubmitted answers are labelled as drafts; only a successful persisted server response is labelled submitted and saved. A timed-assessment feature would require a separate agreed requirement and server-enforced deadline.
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

Follow-up prototype/navigation correction: all 180 frontend tests, lint and production build pass. The complete real Quiz → Attempt → saved Result → History → Performance journey was rerun successfully in Chrome, Edge and Firefox, including the retired-URL redirect/no-attempt assertion and absence of the arbitrary countdown. A fake-clock regression verifies that 21 minutes does not silently expire or submit an untimed quiz. These are new local checks; the earlier full CI evidence above describes its original tested commit.

## Demonstration and release acceptance

Use supported Node 24.15+ and installed locked root/frontend dependencies, then run `./scripts/start-sprint2.ps1`. Open `http://127.0.0.1:8080`. This explicitly separate local deployment matches the SAD's single local/development environment and preserves data under `.local/sprint2-demo/database`. It never loads Atlas configuration or creates an Admin automatically. Explicit trusted first-Admin provisioning is documented in [deployment instructions](DEPLOYMENT.md).

Demonstrate: Student login/Dashboard → material upload/search/details/view/download → Admin adds Question → Student creates/searches/attempts Quiz → saved result/answer feedback → history → subject performance → Admin confirmation/cancellation/removal → unavailable content with preserved history. The built verifier exercises the backend/storage lifecycle; browser journeys cover actual UI navigation. Record the final demo/video using the real local product; automated tests do not substitute for a human recording.

The Test Plan's human acceptance/signatures are still genuine human responsibilities: peer cross-testing, final defect/RTM review, Project Guide acceptance, final demonstration and agreement to freeze the release. No signatures, independent reviewer approval, public HTTPS deployment or final freeze/tag are fabricated. Production Caddy/HTTPS configuration and isolated Docker deployment are tested separately; no public domain/production environment is selected implicitly.

The configured Atlas read-only ping was rerun on 30 October and failed. Its records/access settings were not changed. This does not invalidate the separately verified local demonstration, but Atlas-specific deployment readiness must not be claimed from the disposable/local tests.

## Separate scope clarification

Harshit confirmed on 30 October that the folder-management idea is dropped. CSMQ-32's current integration acceptance criterion has been updated accordingly, with a dated scope decision retaining the historical context. Folder management is excluded from Sprint 2 completion assessment and is not an outstanding defect or teammate deliverable. The submitted SRS, SAD and Test Plan remain unchanged.

Harshit's implementation and automated verification are ready for final acceptance against the frozen baseline. Jira completion still requires the remaining genuine review/acceptance evidence; an automated coding run alone does not satisfy every Test Plan exit criterion.
