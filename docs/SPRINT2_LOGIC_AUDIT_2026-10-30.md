# Sprint 2 logic audit — 30 October 2026

Scope: current integrated application, including the follow-up correction that removes the exposed Sprint 1 sample practice route. Submitted SRS, SAD and Test Plan are unchanged; folder management is excluded by Harshit's explicit scope decision.

## Confirmed issues corrected

1. The old practice URL opened sample questions and an automatic, unenforced 20-minute countdown. It now redirects authenticated Students to real Quiz Search; the navbar opens saved Quiz History. Real quizzes have no time limit because the frozen requirements and API specify none. Drafts are distinguished from successfully saved submissions.
2. Quiz discovery and the Question picker could show results from previous filters while a new request was pending. They now hide those results until the current filters resolve; stale questions cannot be selected through Select All. Failed requests clear stale results and display an error rather than simultaneously claiming that no matches exist. Regression tests hold requests pending and then reject them.
3. Variable Question Bank marks were displayed as if they controlled quiz scoring. SRS CSMQ-F-034 explicitly defines the score as the number of correct responses. Quiz details and attempts now consistently show one point per correct answer. Creation explains that rule and distinguishes reference Question Bank marks. Server scoring is unchanged and matches the submitted SRS.
4. The attempt loader rejected a valid uppercase MongoDB URL when the server returned its canonical lowercase ID. It now compares identifiers case-insensitively, consistent with the retrieval service and backend. A different quiz ID still fails verification.

## Reviewed behavior

| Flow | Logical boundary checked |
| --- | --- |
| Authentication | Student registration, bcrypt validation, server-resolved roles, expired/revoked sessions, Admin provisioning and route/API access controls |
| Materials | PDF type/content/size validation; search/filter/paging; authenticated metadata/view/download; stored-byte equality; confirmed Admin removal and subsequent read denial |
| Questions and Quiz creation | Admin-managed questions; student-safe selection; selected IDs must exist and remain active; invalid/duplicate input rejected; quiz discovery/details retain answer-key exclusion |
| Attempts | Actual Quiz question set; missing/removed questions reject the attempt rather than shortening it; options and duplicate responses validated; score derived only from trusted server answer keys |
| Submission lifecycle | Confirmation; omitted responses count as unanswered; retry identity prevents duplicate records; changed answers with a reused identity return a conflict; a fresh identity permits a deliberate repeat |
| Results and history | Successful persistence precedes result/answer feedback; only the authenticated user's history is returned; completed results remain after moderation and real database restart |
| Performance | All history pages are included; partial/changing history is rejected; subject averages use saved percentages; zero-history state is defined; charts/export use the loaded records |
| Moderation | Administrator-only operations; explicit confirmation/cancellation; removed records excluded from active reads; historical attempts retained |

## Executed verification

- Backend: all 326 tests passed, including database-backed integration, real MongoDB restart and security tests; types, build and coverage gates passed. Coverage: 97.92% lines and 92.07% branches.
- Frontend: all 184 tests passed across 34 files, including the new pending/failed filter, scoring-label and uppercase-ID regressions; lint and production build passed.
- Browsers: all 15 journeys passed across Chrome, Edge and Firefox using a disposable database, covering real Quiz creation/attempt/results/history/performance, PDF upload/pagination and confirmed moderation.
- Submitted-document fingerprint guard and whitespace checks passed. These are local execution results; no new GitHub Actions success is claimed here before its run finishes.

This review and the executed regression/browser checks found no further blocking defect in the reviewed flows after these fixes. This is bounded verification, not proof that every possible input, browser version or external deployment is error-free. Historical reports describe their dated snapshots.

The configured Atlas connection failed its last check earlier on 30 October and was not changed during this audit. The separately tested disposable/local MongoDB environment does not establish Atlas readiness. Genuine peer UAT, demonstration and final release acceptance remain outstanding.
