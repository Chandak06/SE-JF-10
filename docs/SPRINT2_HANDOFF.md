# Sprint 2 feature-owner handoff

**30 October update:** Real Quiz creation/search/view and Student Dashboard from PRs #25–33, plus Karan's production Attempt API (#29), are integrated in the PR targeting main. Student Quiz History (`/attempt-history`) and Performance Insights (`/attempt-insights`) pages are available and linked from the dashboard. `createRuntime` registers the real Quiz moderation adapter by default. Earlier absence/adapter-injection statements below describe the 28 October snapshot; see the [dated integration review](SPRINT2_TEAM_REVIEW_2026-10-29.md).

Harshit owns shared security/integration, Administrator Dashboard and moderation. Prajwal retains Question/Quiz business functionality, Karan retains production attempts/results/history/performance, and Dharani retains materials. Folder management was dropped by Harshit on 30 October. Student quiz creation stays a Student capability under SRS F-030.

The real User, Material, Question, Quiz, Attempt, Result, History and Performance modules are integrated. The old sample practice URL redirects to real Quiz Search; it is not a production attempt. See the [current logic audit](SPRINT2_LOGIC_AUDIT_2026-10-30.md) for the retained fixes and executed verification.

## Integrated owner delivery

Published owner branches and PRs supply real model/API and page/route exports for Quiz creation/search/retrieval, submission/evaluation/results/history/subject averages and Student Dashboard. Shared runtime integration and regression verification use these implementations. Record genuine peer cross-testing and final acceptance separately; folder management is not outstanding work.

## Moderation contract

`ModerationResource` in `backend/src/admin/moderation.ts` exposes `list(limit): Promise<{id,title}[]>` and `remove(id, administratorId): Promise<boolean>`. Register the real Quiz adapter through `createRuntime(connection, config, { moderation: { quizzes: adapter } })`. Registration is trusted server composition, not a client-controlled API. Shared routes enforce authentication, current Admin role, confirmation, identifiers, list limits and safe errors.

Owner reads, quiz selection and attempt paths must exclude removed content. Use atomic soft removal and preserve completed attempt/result references or snapshots; never cascade-delete history. Real Question reads now enforce `removedAt: null` and retain `removedAt`/`removedBy` audit fields. Future Quiz selection must apply the same exclusion rule.

Without an owner Quiz adapter, discovery exposes only integrated resources, the dashboard shows unavailability, and direct Quiz moderation returns controlled 503 after authorization. Fixture tests do not prove production integration.

The current backend account/session is authoritative. Never trust browser roles, client user IDs or Student-supplied answer keys. Verify per-user history/performance authorization and expose correct answers only after successful authorized submission/evaluation.

Final acceptance requires real modules, cross-module security/regression/browser/load/persistence and RTM checks, genuine cross-testing, a verified deployment/demo and an agreed freeze. No Done state or final release tag is invented by this handoff.

## CSMQ-54 owner update, 30 October 2026

Available refs include Prajwal's `CSMQ-47` through `CSMQ-53` Quiz model, API, create, search, list, and view work. These routes are integrated for Student Dashboard navigation. The Student Dashboard links to Karan's available Quiz History and Performance Insights pages at `/attempt-history` and `/attempt-insights`; both routes require a student session. The dashboard reuses these pages and does not substitute the sample-question attempt prototype.
