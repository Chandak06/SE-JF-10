# Independent and user acceptance record — Team 10

Testing window: 2-6 November 2026. Current automated outcomes are in the [three reviewed TXT reports](../submission/README.md). Earlier generated packs, including failed runs, remain in [pre-cleanup Git history](https://github.com/Chandak06/SE-JF-10/tree/cb440bba6b20bbfb4e50dc8e67519584ba4b3439/docs/testing). This register records only independent/manual evidence; Pending is not an executed pass. Append genuine dated evidence rather than entering expected outcomes as actual outcomes.

## Verified existing human-review evidence

[Dharani's recorded 25 October Sprint 1 review](../SPRINT1_DHARANI_REVIEW_HARSHIT.md) covers Harshit's CSMQ-5/7 at its named historical commit. It is retained as scoped Sprint 1 evidence. Its historical dependency findings and counts do not describe today's build, and it is not Sprint 2 or Project Guide acceptance.

On 5 November, GitHub submitted reviews were checked for PRs #8, #23–43: all 22 review lists were empty. Discussion timelines checked for #24, #32, #34, #35, #39, #40, #41, #42 and #43 were also empty. This does not rule out offline testing or another uninspected artifact; it means these PR records do not establish the pending sign-offs. See [inspection record](GITHUB_ACCEPTANCE_EVIDENCE_2026-11-05.md).

## Record actual acceptance

| Check / planned independent tester | Cases / required result | Actual build, browser/version, date and observation | Evidence link / approval | Status |
| --- | --- | --- | --- | --- |
| Prajwal tests Dharani | TC-Auth-01/02/03, TC-MAT-01/02/03; accounts, session, upload/search/view/download and Dashboard | Not supplied in inspected current evidence | Pending named execution record | Pending |
| Karan tests Prajwal | TC-QB-01/02, TC-QUIZ-01/02; create/filter valid and invalid Questions/Quizzes, student-safe keys | Not supplied in inspected current evidence | Pending named execution record | Pending |
| Dharani tests Karan | TC-QUIZ-03/04/05/06, Session, Retry, TC-PERF-01; scoring/results/owner history/full means and expiry | Not supplied in inspected current evidence | Pending named execution record | Pending |
| Karan tests Harshit | TC-ADMIN-01/02/Bulk/Nav, TC-SEC-01–04; denial/cancel/confirm, removal/audit/history and HTTPS | Not supplied in inspected current evidence | Pending named execution record | Pending |
| All members, integration | TC-SYS-01, TC-Rel-01; complete Student/Admin flow and restart | Automated execution supplied separately; independent result not recorded | Pending team record | Pending |
| Representative user | TC-UX-01; register, use materials, create and attempt Quiz without external help | Not recorded | Pending user observation | Pending |
| Typical network confirmation | TC-Perf-01; content ready under 3 seconds on stated campus/broadband device/network | 5 Nov compiled-production full run: 42 loopback measurements, 117–590 ms under the unchanged 3,000 ms limit. Earlier development-server failures remain preserved. Representative network confirmation is not recorded | Pending device/network and independent measurement record | Pending |
| Browser acceptance matrix | TC-Compat-01; latest and previous stable major of Chrome/Edge/Firefox at acceptance time | One installed channel per engine is automated; second-major slots not recorded | Pending version/date/core-flow matrix | Pending |
| QA/Dev Lead/Project Guide | TC-UAT-01; review all results/defects, accept build and approve release/demo/freeze | Not supplied | Actual approver, date and evidence required | Pending |

Do not edit the frozen submitted approval table or invent signatures. Actual approval can be recorded here or linked from a genuine GitHub/Jira review. Named peer assignments follow the explicit work-division matrix; preserve the original SRS while recording any team clarification separately.
