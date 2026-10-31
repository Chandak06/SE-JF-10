# Harshit Chandak — Sprint 2 readiness, 31 October 2026

Owner: PES2UG24CS185. Target: main. Submitted SRS, SAD and Test Plan remain frozen. Folder management was explicitly dropped on 30 October.

## Current completion boundary

| Jira item | Implemented and verified work | Remaining acceptance |
| --- | --- | --- |
| CSMQ-29 | Admin-only confirmed material removal; active reads and PDF downloads deny removed materials | Genuine peer review |
| CSMQ-30 | Confirmed Question/Quiz removal with real owner modules and preserved historical attempts | Genuine peer review |
| CSMQ-31 | Authentication/RBAC, input validation, safe errors, pre-submission key exclusion, retry protection and HTTPS enforcement | Genuine peer review; configured Atlas connectivity unresolved |
| CSMQ-32 | Real team modules, dashboards, Quiz/Attempt/Result/History/Performance and material flows integrated; PR #41 theme changes reviewed and integrated without reverting the 30 October logic fixes | Independent cross-testing |
| CSMQ-33 | Automated system/regression/security/NFR checks, RTM and evidence available | Human cross-testing and final acceptance |
| CSMQ-34 | Built local same-origin release verified with persistent MongoDB, documented startup/Admin provisioning and CI | Atlas-specific readiness, operator demo and agreed final freeze |
| CSMQ-55 | Responsive Admin Dashboard, role navigation, Question Bank and real moderation integration | Genuine peer review |

No missing teammate business module or dropped-folder requirement is used as a blocker. The old prototype URL redirects to real Quiz discovery; quizzes explicitly have no time limit. Scoring remains one point per correct response as required by SRS F-034.

## Verification executed

- Main commit `c891745` had successful full CI: [run 41072140496](https://github.com/Chandak06/SE-JF-10/actions/runs/41072140496). Reviewed [PR #41](https://github.com/Chandak06/SE-JF-10/pull/41) head `4f28c0e` had successful [PR CI 41071369083](https://github.com/Chandak06/SE-JF-10/actions/runs/41071369083).
- Integrated frontend: 184 tests, lint and production build pass. No backend logic is changed by this closeout; the 30 October full suite passed 326 backend tests with 97.92% line / 92.07% branch coverage.
- All 15 real browser journeys pass in Chrome, Edge and Firefox, including new computed-color assertions for History/Performance in light and dark themes. Dark-history screenshots are attached to browser results.
- The built local release passes authenticated registration/login/logout/RBAC, real Question/Quiz creation, trusted/idempotent saved scoring, SAD result/download contracts, PDF-byte equality, moderation and saved history through actual MongoDB stop/restart. It uses a newly allocated disposable database, not Atlas or the operator's saved demo data.
- Submitted-document fingerprints and whitespace checks pass. CI links above identify their exact historical heads; subsequent closeout CI evidence belongs in the PR/Jira entry after completion.

## Atlas diagnostic

The configured read-only authenticated ping still fails on 31 October. All three discovered servers fail TLS with `ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR` before database authentication. The diagnostic reports only allowlisted error codes; no URI, password or data is published. This alone does not identify the responsible network/Atlas setting.

The Atlas console initially opened Campus-Lost-Found. No settings in that unrelated project were changed. Project selection/browser recovery stopped responding; SE project settings could not yet be inspected. Do not disable TLS validation or substitute a guessed connection string. The independently verified local deployment remains usable.

## Final operator steps

1. Run `./scripts/start-sprint2.ps1`; use `http://127.0.0.1:8080`. For trusted first-Admin provisioning, use the explicit procedure in [DEPLOYMENT.md](DEPLOYMENT.md); normal registration creates Students only. Keep `.local/sprint2-demo/database` to retain demo records.
2. Demonstrate Student material upload/search/details/view/download; Admin Question creation; Student Quiz creation/search/start/submit/result/history/performance; Admin cancel/confirm moderation; removed content denied with history retained.
3. Record genuine teammate cross-testing, final defect/RTM review, demo evidence and acceptance. Then agree the release freeze. No reviewer signature, video or final freeze is fabricated by automated verification.
4. If Atlas is the chosen environment, restore access to the SE project console, verify its actual cluster and network access settings, then require a successful authenticated ping before claiming Atlas readiness.
