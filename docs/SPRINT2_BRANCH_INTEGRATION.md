# All-branch consistency and integration audit — 28 October 2026

**29 October:** New owner branches and PRs #25–33 are available and reviewed in the [current team integration report](SPRINT2_TEAM_REVIEW_2026-10-29.md). The table below is the earlier dated snapshot, not today's availability list. The integration target is now main by Harshit's explicit instruction.

All published remote branches were fetched and inspected, plus all open PRs. The only open PR was the existing Sprint 2 draft #8. Branches below were examined rather than merged indiscriminately. Already-integrated feature branches add no missing Sprint 2 business module. Latest main/video baseline is `0e73b37`; Sprint 2 base before this work was `d0a1513`.

| Branch | Inspected head | Already ancestor of latest main at audit | Available business models |
| --- | --- | --- | --- |
| `origin/CSMQ-22-question-model` | `f32bd1e` | Yes | question.ts, quiz-attempt.ts |
| `origin/CSMQ-23-add-mcq-ui-api` | `0199d1f` | Yes | question.ts, quiz-attempt.ts |
| `origin/CSMQ-24-question-validation` | `207e1be` | Yes | question.ts, quiz-attempt.ts |
| `origin/CSMQ-25-question-bank-filters` | `1699405` | Yes | question.ts, quiz-attempt.ts |
| `origin/CSMQ-26-student-safe-payload` | `45a1333` | Yes | question.ts, quiz-attempt.ts |
| `origin/CSMQ-27-document-question-api-contract` | `b408708` | Yes | question.ts, quiz-attempt.ts |
| `origin/CSMQ-28-unit-integration-tests` | `a9168cf` | Yes | question.ts, quiz-attempt.ts |
| `origin/PES2UG24CS157-Sprint-1` | `df6d352` | Yes | question.ts, quiz-attempt.ts |
| `origin/PES2UG24CS185-Sprint-1` | `e13c050` | Yes | question.ts, quiz-attempt.ts |
| `origin/PES2UG24CS185-Sprint-2` | `d0a1513` | No; saved Sprint 2 branch | quiz-attempt.ts |
| `origin/PES2UG24CS903` | `840b0a3` | Yes | quiz-attempt.ts |
| `origin/codex/sprint1-ci-review-20261022` | `8750448` | Yes | quiz-attempt.ts |
| `origin/codex/teammate-pr-integration` | `86f6bf8` | Yes | quiz-attempt.ts |
| `origin/main` | `0e73b37` | Yes | question.ts, quiz-attempt.ts |
| `origin/sprint1-admin-provisioning-fix` | `c679804` | Yes | question.ts, quiz-attempt.ts |
| `origin/two-sprint-docs-and-jira-evidence` | `cdeafb1` | Yes | question.ts, quiz-attempt.ts |

## Findings and resolution

- Main includes the latest real Question Bank, current account/session roles, safe payload and prototype contracts. These were missing from the saved Sprint 2 branch and are now integrated.
- Preserved both route groups and their security: Question Bank/student-safe routes plus Admin moderation/material search/download/pagination. Retained all original commits/authorship.
- Kept main's secure initial Admin provisioning and validated refresh; disabled the legacy promotion shortcut. Preserved latest video bytes.
- Resolved runtime, App/routes/tests, navbar, material loading, Vite test selection and README conflicts. Test discovery now includes both existing TypeScript API integration files and TSX integration tests, and excludes browser suites from Vitest.
- No published production Quiz model/create/search router, production submit/results/history/performance UI/API, folders or Student Dashboard was found. Question/Quiz contract fixtures and sample-question attempts are explicitly distinguished from actual production modules.
- Production owner modules must be supplied before CSMQ-30/32/33/34 can be accepted in full. See [handoff requirements](SPRINT2_HANDOFF.md). The new Admin Dashboard does not take over Student quiz creation or other owners' schemas.

Main and the Sprint 1 recording branch were not changed by this development. No force-push, history rewriting, fake reviews, synthetic Jira screenshots or actual Atlas data modifications were used.
