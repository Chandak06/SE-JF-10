# Sprint 2 feature-owner handoff

**29 October update:** Real Quiz creation/search/view and Student Dashboard from PRs #25–33, plus Karan's production Attempt API (#29), are integrated in the PR targeting main. `createRuntime` now registers the real Quiz moderation adapter by default. Earlier absence/adapter-injection statements below describe the 28 October snapshot; see the [current owner boundaries and remaining work](SPRINT2_TEAM_REVIEW_2026-10-29.md). Production Attempt/Result screens, history/performance and folders remain owner deliverables.

Harshit owns shared security/integration, Administrator Dashboard and moderation. Prajwal retains Question/Quiz business functionality, Karan retains production attempts/results/history/performance, and Dharani retains materials/folders. Student quiz creation stays a Student capability under SRS F-030.

Published User, Material and real Question modules are integrated. QuizAttempt/evaluator/UI prototypes are retained, not presented as production submission/history. Every published remote branch and open PR was inspected; missing production modules cannot be replaced by contract fixtures.

## Required owner delivery

Supply current branches/PRs, real model/API exports, frontend route/page exports and passing request/response/security tests for Quiz creation/search/retrieval, submission/evaluation/results/history/subject averages, folders and Student Dashboard. Then rerun integration against those real implementations.

## Moderation contract

`ModerationResource` in `backend/src/admin/moderation.ts` exposes `list(limit): Promise<{id,title}[]>` and `remove(id, administratorId): Promise<boolean>`. Register the real Quiz adapter through `createRuntime(connection, config, { moderation: { quizzes: adapter } })`. Registration is trusted server composition, not a client-controlled API. Shared routes enforce authentication, current Admin role, confirmation, identifiers, list limits and safe errors.

Owner reads, quiz selection and attempt paths must exclude removed content. Use atomic soft removal and preserve completed attempt/result references or snapshots; never cascade-delete history. Real Question reads now enforce `removedAt: null` and retain `removedAt`/`removedBy` audit fields. Future Quiz selection must apply the same exclusion rule.

Without an owner Quiz adapter, discovery exposes only integrated resources, the dashboard shows unavailability, and direct Quiz moderation returns controlled 503 after authorization. Fixture tests do not prove production integration.

The current backend account/session is authoritative. Never trust browser roles, client user IDs or Student-supplied answer keys. Verify per-user history/performance authorization and expose correct answers only after successful authorized submission/evaluation.

Final acceptance requires real modules, cross-module security/regression/browser/load/persistence and RTM checks, genuine cross-testing, a verified deployment/demo and an agreed freeze. No Done state or final release tag is invented by this handoff.

## CSMQ-54 owner update, 29 October 2026

Available refs now include Prajwal's `CSMQ-47` through `CSMQ-53` Quiz model, API, create, search, list, and view work. These routes are integrated for Student Dashboard navigation. The available Karan `CSMQ-40` ref supplies an attempt submission API, but no Quiz History or Performance page or API was found in the fetched refs. CSMQ-54 keeps those dashboard sections visibly unavailable until Karan supplies the real page and route exports. Do not replace them with the sample-question attempt prototype.
