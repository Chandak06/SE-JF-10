# Sprint 1 review — 22 October 2026

Reviewed repository `Chandak06/SE-JF-10` against the detailed Sprint 1 work plan, SRS and the current Sprint 1 separation agreement. GitHub Actions replaces Jenkins by the team's decision. This report is for the user to share with teammates; no review messages were sent to teammates.

## Result and merge decision

**Changes required for Prajwal's PR chain #9–15. Do not merge it yet.** These are cumulative branches: the final head `c52835d09a24f2ba5e1d61f1d37d6777ce55d717` includes all seven commits. The following findings were reproduced, rather than inferred only from test coverage. No teammate source files were changed during review.

| Owner | Published contribution | Result |
| --- | --- | --- |
| Dharani S | PR #7; renamed branch `PES2UG24CS157-Sprint-1`, head `116e292` | Already merged into main; no subsequent changes. Auth/upload integration still passes. |
| Karan Varshney | PR #6; `PES2UG24CS903`, head `11d7a47` | Already merged into main; no subsequent changes. Attempt model, evaluation helper and explicitly labelled practice prototype still pass. |
| Prajwal M | PRs #9–15, CSMQ-22–28 | Available now; blocked by the findings below. Leave open for the owner to fix. |
| Harshit Chandak | Shared security, integration and CI/CD | No new application defect found in reviewed Sprint 1 code. Removed the duplicated frontend lint invocation in the CI workflow; tests and gates remain enabled. |

Main's application baseline is `5f7604a` / application snapshot `86f6bf8`. Sprint 2 branch `PES2UG24CS185-Sprint-2` and draft PR #8 must stay separate until the user confirms the Sprint 1 recording is finished. No Sprint 2 application files are included in this review/fix PR.

## Findings for Prajwal

### R1 — P2: A pending create can replace results for the current filters with an old query

Location: `frontend/src/pages/QuestionBankPage.tsx:39–46` and `:141`, introduced by PR #10 and retained through #15.

`handleSubmit` captures `fetchQuestions` and the filters from the render when submission starts. Filter controls remain enabled while `createQuestion` is pending. Changing Difficulty to Hard correctly loads Hard questions, but completing the create calls the old refresh and unconditionally writes the old unfiltered results over them. The selector still displays Hard while Easy questions are shown.

Reproduce: open Add MCQ, fill a valid question, submit with the create response delayed, select Hard while saving, let Hard results load, then complete the create. A deferred-promise UI regression test reproduces the incorrect list deterministically.

Fix: use one refresh path tied to the latest filter state and a request generation/cancellation guard, or disable filter changes throughout submission and refresh. Ensure every list write belongs to the currently displayed filters. Add the race regression test.

### R2 — P2: Successful filter recovery leaves the previous loading error visible

Location: `frontend/src/pages/QuestionBankPage.tsx:55–74` (especially successful response at line 64), PR #10 onward.

The effect sets `errorMessage` after a failed request but never clears that error when a later filter request succeeds. Reproduce: fail initial listing with `Temporary network failure`, then select Hard and return valid Hard results. The matching question appears, but the error banner remains. The supplied test fails because `role="alert"` is still present after success.

Fix: separate listing errors from form errors, clear the relevant error for a new request/success, and keep loading/error/result state consistent with the active query. Test failure followed by successful recovery.

### R3 — P2: Model validation does not enforce the API's question boundaries

Location: `backend/src/models/question.ts:37–40`, `:61–67`, `:108–113`, PR #9 onward. Compare `backend/src/questions/validation.ts` in PR #10 onward.

Three independent model-validation probes were accepted by Mongoose while rejected by `createQuestionSchema`: seven options, `marks: 1.5`, and a 501-character option text. The API limits options to 2–6, requires integer marks, and limits option text to 500 characters. The model only enforces a minimum of two options, positive marks and nonempty option text. Direct model/seed/import writes therefore do not share the advertised invariants. **The HTTP creation endpoint does reject these values; this is a model consistency defect, not a demonstrated authorization bypass.**

Fix: enforce the same upper option bound, integer/finite marks and option-text maximum in the model, preferably through shared constants. Add model-level negative tests for each boundary and rerun the API tests. Validation reproduction needs no network or Atlas records.

### R4 — P3: Verification and integration claims overstate what the tests prove

Locations: `docs/SPRINT1_MEMBER2_TEST_REPORT.md:23` and `:31`; `backend/tests/integration/questions.test.ts:279–309`; PRs #14/#15 and earlier integration-test wording.

The report marks model rejection of more than six options as passing, but the model accepts seven and `question-model.test.ts` does not cover the upper bound. It also calls the student-safe response directly consumable by `evaluateQuiz` without remapping. The actual test fetches the private stored question and explicitly maps `stored.correctAnswer` to `correctOptionId`. That server-side mapping is appropriate and must remain private, but it contradicts the stated zero-remapping claim. The current practice UI still uses seed questions, as allowed for Sprint 1; this is not a finished live submission/evaluation integration.

Fix: correct the traceability statements and test names, add the missing boundary assertions, and distinguish a tested server-side adapter example from a production endpoint/UI integration. Do not expose answers to make the student-safe DTO usable by the scorer.

## Verification evidence

- Existing combined backend suite: **170/170 tests**, 17 files; typecheck and build passed. Coverage: 98.21% lines, 97.24% statements, 96.05% branches, 95.74% functions.
- Existing combined frontend suite: **36/36 tests** passed on the repeat run. Frontend lint and production build passed.
- The initial concurrent frontend run hit one 5-second timeout in the existing registration-network-error test. It passed on the repeat run without code changes. This is recorded as a local timing observation, not assigned as a teammate functional defect.
- Additional review tests: **2/2 deliberately fail against the current Question Bank UI**, demonstrating R1 and R2. The original 36 tests pass in that same run. The fixture is stored as text outside test discovery so normal CI is not intentionally broken.
- Three independent model probes confirm R3; the reproduction is included as a text fixture.
- Existing PR #15 Actions run passed: https://github.com/Chandak06/SE-JF-10/actions/runs/39649707939. This predates the additional failing review cases and does not override them.

### Run the additional reproductions on the teammate branch

First check out the combined Sprint 1 contribution (`CSMQ-28-unit-integration-tests`, exact reviewed head above). Copy `docs/review-fixtures/QuestionBankPage.review.test.tsx.txt` from the review/fix branch into `frontend/src/pages/QuestionBankPage.review.test.tsx`, then run in `frontend`:

```powershell
npx vitest run src/pages/QuestionBankPage.review.test.tsx
```

The two tests should fail before the fix and pass afterward. Remove that temporary copy or retain it as a regression test once fixed. For model validation, build the backend, copy `docs/review-fixtures/question-model-boundaries.mjs.txt` into the repository root as a temporary `.mjs` file and run it with Node. Each case currently prints `apiAccepts: false, modelAccepts: true`.

## Before recording / before a future merge

The read-only Atlas recheck on 22 October still failed: `MongooseServerSelectionError`, with `MongoNetworkError` / `ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR` for all three server connections. This connection blocker needs resolution before the live demo; isolated test success does not prove Atlas connectivity. Do not disable TLS or certificate validation to work around it. No application records or roles were changed during the review.

After the owner pushes fixes, review the new exact heads, run the original suites plus the additional regressions, and merge only reviewed Sprint 1 PRs. Keep Sprint 2 draft #8 unmerged and sync approved main changes into the separate recording branch.
