# Production validation and defect follow-up — 5 November 2026

Tested source: `888c0666ae78e14be134a6c090be860d254ddb00`, branch `PES2UG24CS185-Sprint-2`. Scope: all four members' integrated modules from both sprints. Submitted SRS, SAD, Test Plan and prior evidence snapshots are preserved. No Atlas or saved demonstration records were modified.

## Corrections

- Quiz detail retrieval now captures the original question count and populates it without querying the Quiz twice. Existing integration cases verify removed questions still cause `QUIZ_QUESTION_MISSING` rather than silently shortening a Quiz; trusted scoring, answer-key protection, moderation and owner history all pass.
- Browser system and page-load checks now build and serve the production frontend. The previous fixture used Vite development transforms and React StrictMode diagnostics. This environment correction tests the released bundle; it does not claim the development server has been optimized or erase its recorded failures. The application API remains real, same-origin and backed by disposable MongoDB.
- Playwright identifies production mode and the unchanged **3,000 ms** limit in metadata. The whole-project runner checks these fields and records the environment in the new report pack.

## Complete revalidation

The [new whole-project pack](2026-11-05-production-validation/README.md) contains all four reports, 541-case CSV/Markdown catalogue, JUnit, per-file coverage, browser versions, command exits/timestamps and measured timings. All planned cases passed: **199 backend unit-directory + 131 backend integration + 190 frontend + 21 browser = 541/541**, zero failed/skipped cases. Nine additional report-publisher integrity checks passed separately. Backend types/build, frontend lint/build, compiled release, actual database restart and frozen-document checks also passed.

Ten simultaneously active isolated browser users completed login, PDF upload, Quiz creation, trusted saved submission, own history and performance in each of Chrome, Edge and Firefox: **30 completed user flows**, with no recorded page errors. These flows are inside the 21 browser scenarios, not 30 extra planned test cases.

All **42** single-user content measurements were **117–590 ms** on this loopback fixture, below the unchanged **<3,000 ms** requirement. Measured Create Quiz: Chrome 373 ms, Edge 276 ms, Firefox 275 ms. Quiz View measurements were 141–358 ms. Full scenario duration includes multiple separately timed steps and is not a page-load timing.

The formerly intermittent full Student scenario was then repeated **three times per browser**, without selecting passing retries or changing code/assertions: **9/9 passed**, zero failed/skipped/flaky cases. Maximum content timing across each browser's three repeats: Chrome **351 ms**, Edge **321 ms**, Firefox **372 ms**. [Source-linked per-repeat timings and command](production-timing-rechecks-2026-11-05.json) retain all nine outcomes separately from the original 541 planned invocations. The complete pack was sealed before the rechecks; their results do not replace its JUnit.

The [exact-source GitHub Actions run](https://github.com/Chandak06/SE-JF-10/actions/runs/41988979219) completed successfully in all five jobs: backend/frontend, containers with HTTPS, Chrome, Edge and Firefox. This is additional CI evidence for the named source, separate from the local measurements and human acceptance.

| Load workload | New observed p90 | Scope |
| --- | --- | --- |
| Quiz, 10 sessions / 20 paired retrieval and submission requests | 79 ms | Real authenticated API and persisted submissions |
| Quiz, 50 sessions / 100 paired requests | 307 ms | Same bounded workload, all functionally completed |
| Auth/material, 10 sessions / 20 requests | 53 ms | Existing scoped authenticated smoke |
| Auth/material, 50 sessions / 100 requests | 250 ms | Existing scoped authenticated smoke |

The previous 23,471 ms fifty-session Quiz observation was not reproduced. Removing one redundant read is a justified query improvement, but this single comparative run does not establish that it alone caused the entire difference. Host conditions and independent revalidation matter; no universal fifty-user latency guarantee is claimed.

Whole measured coverage: **87.01% lines**, **84.41% statements**, **85.33% functions**, **77.03% branches**. Existing backend gates pass; frontend and combined values are measurements with no invented passing threshold. Browser execution is separate from V8 coverage.

## Defect disposition and acceptance boundary

PERF-01: compiled-production loopback revalidation passes; the original development-server failures remain in the [earlier report](WHOLE_PROJECT_SUMMARY_2026-11-05.md). STRESS-01: the slow observation is not reproduced by the defined fifty-session revalidation above. Earlier stale-auth-session and Quiz draft-owner fixes also pass their regression cases in this full execution.

Automated implementation and requested reporting work are verified on the named branch. Independent peer execution, representative-user/network confirmation, acceptance-time latest/previous-major browser coverage and Project Guide approval still require actual evidence in the [acceptance register](MANUAL_ACCEPTANCE.md). No automated run supplies another person's approval. PR #44 remains the review/integration vehicle; this report does not assert a merge or release approval.
