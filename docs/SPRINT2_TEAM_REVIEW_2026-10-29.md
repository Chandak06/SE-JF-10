# Sprint 2 team review and integration — 29 October 2026

Harshit requested integration into **main**, superseding the earlier Sprint 2 separation instruction. The review branch is `sprint2-team-integration`; `PES2UG24CS185-Sprint-2` retains its existing history. The saved Sprint 1 branch and original `Sprint1.mp4` remain available.

## Reviewed contributions

| Owner | PRs / reviewed head | Integrated scope |
| --- | --- | --- |
| Prajwal | #25–28, #30–32; `e810d7d` | Real Quiz model, create/search/retrieve APIs and UI, student-safe DTOs and contract tests. These form a cumulative commit chain. |
| Dharani | #33; `7fd6db0` | Material keyword/subject search, details/uploader names, protected PDF viewing/download, Student Dashboard and recent materials. Her branch already includes Prajwal's Quiz chain and Harshit's `2d803a3` changes. |
| Karan | #29; `83e6599` | Production authenticated Student submission API, trusted scoring and MongoDB persistence. No production Attempt/Result screens, history or subject-performance delivery in this PR. |
| Harshit | #8; `2d803a3`, plus integration fixes | Shared authentication/security, Admin Dashboard, moderation, tests, CI/release setup and conflict resolution. |

All source commits and authorship are preserved. The runtime conflict is resolved with Questions, Quizzes, Attempts, shared authentication and all three moderation resources active together. One verified integration PR targets main, avoiding untested intermediate combinations.

## Findings and fixes

| Contribution | Finding | Integration fix |
| --- | --- | --- |
| Prajwal / Harshit | Real Quiz moderation exported but not registered; Admin Dashboard could not use it. | Register the actual adapter and test confirmation/cancellation, 401/403, tombstones and read/submission exclusion. |
| Prajwal | Quiz population included moderated Questions. | Active-only population; controlled 409 when a required reference is unavailable, without silently shortening the Quiz. |
| Karan | Trusted scoring still loaded moderated Questions. | Active-only lookup rejects unavailable content before saving; previous attempts remain intact. |
| Prajwal / shared security | Quiz clients missed shared 401 cleanup; Quiz search accepted malformed/unbounded fields. | Reuse shared authorized requests with stale-session protection; strict bounded filters and security regression tests. |
| Prajwal | Quiz ID navigation could retain the preceding detail state. | Key the routed detail component by Quiz ID. |
| Dharani | Invalid recent timestamps could crash Dashboard formatting; PDF requests could finish after unmount. | Validate finite representable dates and invalidate outstanding requests on unmount. |
| Integration checks | Old assertions expected unavailable Quiz moderation; concurrent load suites competed for CPU. | Assert the integrated resource set and real links; isolate backend files with one worker. Timing limits, coverage gates and authorization assertions remain unchanged. |

## Validation

- Backend: 305 tests in 33 files, typecheck/build/coverage passed; 97.95% lines, 92.80% branches.
- Frontend: 106 tests in 17 files, lint and production build passed.
- Real Quiz workloads: 10 sessions/20 requests p90 209ms; 50 sessions/100 requests p90 979ms. Each session retrieves a Quiz and submits to trusted scoring. These are scoped measurements, not missing-page performance claims.
- Existing auth/material loads: 10 sessions p90 139ms; 50 sessions p90 689ms. Original 3-second assertions remain.
- Browser matrix verifies Student Dashboard, real Quiz create/view, production submission API boundary, moderation, PDF details/view/download, roles, paging and responsive navigation. Final browser/CI evidence is linked in the integration PR and Jira.

Backend integration exercises real Question creation → Student Quiz creation/retrieval → trusted submission → saved result → Admin moderation. It checks answer-key exclusion, removed Quiz/Question denial, preserved history references and forged-score rejection. API scoring is not represented as a completed production Attempt/Result screen.

Tests use disposable databases. No Atlas records, access settings, passwords or real account roles were modified. The local Node/Docker releases remain available; Atlas connectivity/public HTTPS are separate environment checks.

## Remaining acceptance dependencies

- Karan's CSMQ-41–45: production Attempt UI integration, Result screen, per-user history, subject averages and tests; Jira still lists In Progress/To Do.
- Material folder management is not delivered by PR #33, whose scope is CSMQ-35/36/38/54.
- Full-platform NFR/UAT, genuine cross-testing, final demonstration and release freeze require those modules.

Harshit's CSMQ-30 now has actual Quiz integration ready for Code Review. CSMQ-29/55 remain review-ready. CSMQ-32–34 retain full-platform acceptance dependencies. A successful merge does not establish whole-Sprint-2 completion or invent independent human approval.
