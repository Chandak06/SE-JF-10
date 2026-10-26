# Sprint 1 Admin provisioning fix — 26 October 2026

## Root cause and audit

Public registration deliberately calls the existing repository's `createStudent`, which fixes `role: student`. The common login already selects the password hash internally, verifies it with bcrypt and returns a sanitized account with its database role. Admin navigation and `/questions` already check this role; backend middleware independently resolves the current active account and role from its server-side session for every protected request.

There was no trusted initial Admin provisioning command. A developer registering through the public page obtained a Student account and therefore could not access Question Bank. In addition, the frontend held authentication only in memory, so refreshing the page discarded it. No duplicate login page, User model, password hashing helper or Question Bank implementation was needed.

The inspected models, authentication services/routes, sessions, middleware, app/runtime composition, Question Bank API/UI, navigation/login/client, environment example, scripts, tests and Actions pipeline support this diagnosis.

## Implementation

- New trusted `npm run seed:admin` CLI validates input using the existing registration schemas and hashes with the existing bcrypt helper. It writes through the existing User model in the exact configured MongoDB database.
- Requires explicit development/test confirmation; refuses production before connecting. Creates an active Admin only for a new email. Repeats preserve the entire existing Admin account and password; Student emails and disabled Admins are refused. Unique indexing and duplicate-race handling prevent duplicates/overwrites. Connections close on success and failure; console output omits credentials, hashes, tokens and connection strings.
- Session restoration retains only a token in tab-scoped session storage. `/api/auth/me` validates it and supplies the current role before protected routes render. Forged browser role values are ignored. Rejected/offline restoration clears local state. Logout uses the in-memory or stored token, revokes it at the server and prevents a pending restore from resurrecting the logged-out session.
- Existing Question Bank routes, MCQ creation, filters and persistence are reused. Public registration remains Student-only and cannot accept privilege fields. There is no public Admin registration, new moderation/dashboard feature or Jira workflow modification.

## All created or modified files in this fix

| File | Change |
| --- | --- |
| [backend/src/security/provision-admin.ts](../backend/src/security/provision-admin.ts) | Validated, idempotent provisioning with Student/disabled-account safeguards and no password reset |
| [backend/scripts/seed-admin.ts](../backend/scripts/seed-admin.ts) | Explicitly confirmed development/test CLI, existing configuration and safe cleanup/errors |
| [backend/tests/integration/admin-provisioning.test.ts](../backend/tests/integration/admin-provisioning.test.ts) | 16 disposable-database tests for provisioning, CLI, hashing, races, roles and real MCQ persistence |
| [package.json](../package.json) | `seed:admin` command using existing tsx tooling |
| [.env.example](../.env.example) | Blank setup variable names only |
| [frontend/src/services/authService.ts](../frontend/src/services/authService.ts) | Server-validated token restoration, tab storage and consistent logout/401 cleanup |
| [frontend/src/App.tsx](../frontend/src/App.tsx) | Gates protected navigation while restoring a saved session |
| [frontend/src/services/authService.test.ts](../frontend/src/services/authService.test.ts) | Refresh, role validation, expiry/offline/storage failures and logout/restore race tests |
| [frontend/src/App.test.tsx](../frontend/src/App.test.tsx) | Extends the existing service mock with restoration methods; original scenarios retained |
| [frontend/tests/admin-session.integration.test.tsx](../frontend/tests/admin-session.integration.test.tsx) | Admin refresh/navigation, forged Student role rejection and expired-session redirect |
| [README.md](../README.md) | Links the trusted setup procedure and common-login route |
| [docs/INTEGRATION.md](INTEGRATION.md) | Updates the current token/refresh contract and links Admin setup |
| [docs/ADMIN_SETUP.md](ADMIN_SETUP.md) | Exact commands, private password entry, database selection, login/UI checks and troubleshooting |
| [docs/ADMIN_PROVISIONING_FIX_REPORT.md](ADMIN_PROVISIONING_FIX_REPORT.md) | This audit, verification, scope and limitations record |

## Provision and demonstrate

Run **`npm run seed:admin`** only after explicitly selecting and authorizing the development/test target and setting `ADMIN_PROVISION_CONFIRM`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` and optional `ADMIN_NAME` as described in [the secure setup procedure](ADMIN_SETUP.md). Do not put the password literally into command history or chat. Both app and CLI use `MONGODB_URI`; if its database component is omitted, MongoDB's default applies. Tests explicitly used named disposable databases rather than assuming `test`.

Then use the existing `/login` page with that Admin's email/password. Open **Question Bank** or `/questions`, choose **+ Add New MCQ**, enter all metadata/options and the correct answer, submit, filter and refresh. The card remains after refresh because the session is revalidated and the persisted record is listed. Log out and log in as a Student: no Question Bank navigation; `/questions` redirects to Materials; administrator API calls return 403, while anonymous calls return 401.

## Verification

- Backend: **191 passed, 0 failed**, including 16 new provisioning/API/CLI cases. Typecheck and production build passed. Coverage gates passed: 98.04% lines, 95.03% branches, 97.22% statements and 95.95% functions.
- Frontend: **50 passed, 0 failed**, including nine additional service/route cases. Lint and production build passed; existing assertions and coverage gates remain intact.
- Actual headless Chrome: the real provisioning CLI created an Admin in disposable `admin_browser_spec`; common login, required MCQ fields/selected answer, MongoDB persistence, authenticated refresh, matching/nonmatching subject filters, logout, Student refresh denial and backend 403/401 passed. No direct database role-edit workaround was used to provision the browser Admin.
- The existing GitHub Actions workflow is unchanged and runs all these tests/builds on push/PR. Local logs and browser results are under ignored `.local/admin-provisioning/`. CI status must be checked for the pushed head; this report does not invent a CI run or a teammate review.

## Git and Jira scope

Dedicated branch: `sprint1-admin-provisioning-fix`, based on evaluated commit `cdeafb17e2f7e8d215fad8ec653dece37ed42c1a` from `two-sprint-docs-and-jira-evidence` (PR #23). The initial working checkout was on main; the unpublished fix branch was fast-forwarded to that existing evaluation baseline and the scoped changes restored. The README overlap retained both the current evaluation guidance and the new Admin instructions. No shared history was rewritten.

Only the 14 files above differ from that baseline. Focused commits preserve teammates' contributions. Inspect the exact file commits with `git log --oneline cdeafb1..sprint1-admin-provisioning-fix`; final hashes are also reported in the completion message. Main and the saved Sprint 2 branch are not merged or changed automatically.

This is a newly identified setup/integration gap supporting **CSMQ-3, CSMQ-4 and CSMQ-5**, not a claim that Admin provisioning was an original separate Sprint 1 task or acceptance criterion. No Jira statuses, tasks or peer approvals were manufactured or edited. The existing two-sprint plan is unchanged.

## Remaining limitations

No account has been provisioned and no demo questions inserted into the real Atlas database by this task. Running provisioning against that environment still requires explicit authorization of the environment and account-creation action. The real database password/URI were never read into output or committed. The user must enter credentials locally and execute the documented development command, or separately authorize that action.

Production bootstrap, account promotion, password reset and reactivation are deliberately outside this CLI; they require a separate authorized procedure. Tab-scoped tokens are accessible to this application's JavaScript and are not HttpOnly cookies; broad authentication redesign is outside this fix. Backend authorization remains authoritative, and offline/blocked-storage restoration can require login again. Human review, merge approval and the user's actual video remain human deliverables.
