# Sprint 1 administrator setup and Question Bank access

This is a newly identified demonstration setup gap supporting CSMQ-3 (authentication), CSMQ-4 (RBAC) and CSMQ-5 (integration). Initial administrator provisioning was not an original, separate Sprint 1 Jira task or acceptance criterion. This fix changes no Jira states, approved requirements or two-sprint scope.

## What was missing

Public registration intentionally creates Students. The shared login already returns the account's database role, the navigation shows Question Bank for Admins, `/questions` is Admin-only, and the backend independently checks the current account/session before every administrator operation. There was no trusted first-Admin provisioning command. Registering through the public page therefore could never produce an Admin.

Previously a page refresh also discarded the in-memory authentication state. The fix retains only the bearer token in tab-scoped `sessionStorage` and validates it through `/api/auth/me` before protected routes render. The current role comes from the server, not browser storage. Expired/revoked/offline restoration fails closed to login. Logout revokes the server session and clears the tab token; when logout fails, it can be retried. If browser storage is disabled, login works in memory and refresh requires login again.

## Provision the first development Admin

Use supported Node 24.15+ and installed project dependencies. Run from the repository root. **This command writes an account to the configured database. Run it only after explicitly authorizing that development/test environment and the account creation.** This change has not provisioned any account or inserted demo questions into your Atlas database.

Both the app and CLI use the existing `loadConfig`/`connectDatabase` functions and the exact configured `MONGODB_URI`. Inspect your ignored local configuration privately first. A URI with `/your_database` selects that database; a URI omitting a database uses MongoDB's driver default (normally `test`). Neither the CLI nor the app forces the name `test`. Use a named development database in the URI if that is your intended target; never paste its connection credentials into a screenshot or commit.

The exact provisioning command is:

```powershell
npm run seed:admin
```

Set the required variables first. This example asks for the password without showing it or writing it literally into shell history:

```powershell
$env:NODE_ENV = 'development'
$env:ADMIN_PROVISION_CONFIRM = 'development'
$env:ADMIN_NAME = Read-Host 'Administrator display name'
$env:ADMIN_EMAIL = Read-Host 'Separate administrator email'
$adminSecret = Read-Host 'Administrator password (12+ characters, at most 72 UTF-8 bytes)' -AsSecureString
$env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new('', $adminSecret).Password
try {
    npm run seed:admin
} finally {
    Remove-Item Env:ADMIN_PASSWORD, Env:ADMIN_PROVISION_CONFIRM, Env:ADMIN_EMAIL, Env:ADMIN_NAME -ErrorAction SilentlyContinue
    Remove-Variable adminSecret -ErrorAction SilentlyContinue
}
```

`MONGODB_URI` and normal app configuration may come from your existing ignored `.env`; do not overwrite them. Passwords must follow the existing bcrypt input limits. Environment values are used only by the trusted local setup process; never pass a password as a command-line argument, commit it, or capture it on video. Production mode is refused before connecting. Test mode requires `ADMIN_PROVISION_CONFIRM=test` and must target an explicitly authorized disposable test database.

## Existing accounts and failures

- New email: creates one active Admin with the existing User model and existing bcrypt helper. No public registration or role selector is added.
- Existing active Admin: succeeds idempotently without changing name, role or password. Use its original password to log in; repeating provisioning is not a password reset.
- Existing Student: refuses; never silently promotes it. Choose a distinct Admin email. Promotion would need a separately authorized process.
- Disabled Admin: refuses; never silently reactivates it.
- Invalid/missing email/password, unsupported environment or missing confirmation: refuses before connecting. Errors do not print submitted values.
- Connection/creation failure: exits nonzero with a safe message, closes its connection and never prints credentials, hashes, tokens or connection strings. Unique email indexing handles concurrent attempts without creating duplicates or resetting a winner's password.

There is no production bootstrap, password-reset or account-promotion procedure in this fix. Those actions require separate authorization and review; do not work around the safeguards by editing roles in the public UI.

## Log in and verify the interfaces

1. Start the existing backend and frontend with the same configured backend/database. Open the normal `/login` page.
2. Enter the provisioned Admin email and its password. The app opens Materials; use **Question Bank** in the navigation or open `/questions`.
3. Click **+ Add New MCQ**. Enter question text, subject, topic, difficulty, marks and option text; select the correct option and click **Add Question**.
4. Confirm the success message and question card. Filter by subject/topic/difficulty. Refresh `/questions`; the app validates the saved session with the server and reloads the stored question.
5. In your trusted database tool, privately inspect the `questions` collection in the database selected by `MONGODB_URI` to confirm the saved question. Do not assume a database name. Do not create demonstration records in Atlas without authorizing that environment/action.
6. Log out. Log in as an ordinary Student through the same login page. Student navigation shows Materials and Practice quiz, not Question Bank. Opening `/questions` redirects to Materials; the backend returns 403 for Student calls to administrator question APIs and 401 for unauthenticated calls.

Backend authorization uses the current database role on every request. Changing a browser-stored value cannot grant Admin permissions. Login and refresh return the current server role; a role change during a session is enforced by the backend immediately.

## Troubleshooting

- Missing Question Bank link: verify the logged-in email is the separately provisioned account, not a publicly registered Student. Log out and back in or refresh to obtain the current role.
- Wrong password after repeat provisioning: repeats deliberately preserve the old password. This command is not account recovery.
- Refresh returns to login: the session expired/revoked, the backend could not validate it, or browser session storage is unavailable. Confirm backend availability, API URL and CORS origin, then log in again.
- 401 means no valid active session; 403 means the authenticated current account lacks the required role. Do not bypass backend checks.
- Questions appear in a different database: check the privately configured URI and whether it includes a database name. CLI and app must run with the same configuration.

Tab storage is accessible to JavaScript in this application origin; it is not an HttpOnly cookie. Do not treat it as a secret vault or store roles there. Existing token expiry, hashed server-side sessions, protected APIs and backend role checks remain authoritative. A broader authentication redesign is outside this Sprint 1 fix.

## Verification and change record

Automated tests use disposable MongoDB only. They cover CLI creation/repetition/refusal, hashing, unique-email races, disabled/Student safeguards, common Admin/Student login, MCQ persistence, 401/403, privilege-injection rejection, session restoration, forged browser-role rejection and expiry/logout behavior. Final counts, Git branch and browser verification are recorded in [the fix report](ADMIN_PROVISIONING_FIX_REPORT.md).
