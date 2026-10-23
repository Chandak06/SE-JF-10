# Sprint separation and recording guide

Updated 23 October 2026 after the Sprint 1 fixes were merged.

- `main`: the integrated Sprint 1 product, including Prajwal's PRs #9–15, Dharani's fixes in PR #18 and Karan's score validation in PR #19.
- `PES2UG24CS185-Sprint-1`: synchronized recording branch with the same Sprint 1 application and this guide. Check `git diff main...PES2UG24CS185-Sprint-1` before recording; it should be empty after the documentation PR is merged and branches synchronized.
- `PES2UG24CS185-Sprint-2`: saved Sprint 2 work in draft PR #8. It remains separate and does not yet incorporate the latest Sprint 1 merges.

Keep PR #8 as a draft until Harshit explicitly confirms the final Sprint 1 video is complete. Preserve its branch and commits.

## Team Sprint 1 verification

| Member | Included in main |
| --- | --- |
| Dharani S | Registration, login/logout, User model, authenticated PDF upload/validation; latest-request ordering, native PDF picker reset and safe theme storage in PR #18 |
| Prajwal M | Question model and validation, administrator Add MCQ UI/API, subject/topic/difficulty filters, student-safe question endpoint, API contract and tests; PRs #9–15 |
| Karan Varshney | QuizAttempt model, student attempt UI prototype, evaluation helper and fixture integration; PR #19 rejects fractional and infinite scores |
| Harshit Chandak | Shared backend, hashing, authentication, role authorization, account/PDF integration, security tests and GitHub Actions |

The reported Question Bank errors, three materials/theme defects and invalid attempt scores have been fixed. Historical review reports describe the earlier snapshots and are not the current defect list. The student attempt page is a sample-question prototype; its submit action locks the local session and does not send a production scoring request. Full production quiz submission/history is not claimed.

Verification on the merged Sprint 1 source through `d4b82e0`: 175 backend tests and 39 frontend tests passed, backend typecheck/build and frontend lint/build passed. Backend coverage: 98.22% lines and 96.10% branches. Four additional independent material/theme reproduction cases passed during PR #18 review (43 frontend cases including those local audit fixtures). Those four fixtures are retained under ignored `.local/all-member-audit`, outside the committed suite.

## Database connection readiness

Use the existing ignored `.env`; do not paste credentials into this guide, screenshots or commits. Before recording, run `npm run db:check` and require a successful authenticated ping. Tests use disposable MongoDB and do not establish live Atlas readiness.

Earlier on 23 October, Atlas DNS resolved all three servers but TLS handshakes failed before authentication. The matching Atlas project reported that the current IP was absent from its access list. At the user's explicit request, a temporary `0.0.0.0/0` entry was added with a six-hour expiry. Afterward, the authenticated Atlas ping passed. The compiled production composition returned 200 for `/health` and `/ready`, and 401 for anonymous `/api/materials` and `/api/questions`. No application records were created by these checks; normal runtime indexes were initialized. TLS certificate validation remained enabled. The temporary entry permits connection attempts from all IPv4 addresses while database authentication remains required; allow-list the recording computer's current IP for future sessions after expiry. See MongoDB's official connection troubleshooting guide: https://www.mongodb.com/docs/atlas/troubleshoot-connection/.

## Recording setup

Use `PES2UG24CS185-Sprint-1` after synchronization, or the matching `main`. Stop and restart existing app servers after changing branches. Rebuild because ignored dist folders can contain output from a different branch.

From the repository root:

```powershell
git switch PES2UG24CS185-Sprint-1
npm ci
npm run check
npm run db:check
npm run dev
```

In a second terminal:

```powershell
cd frontend
npm ci
npm run test:ci
npm run lint
npm run build
npm run dev
```

## Demo evidence

1. Show the recording branch and successful Sprint 1 Actions run.
2. Register a demo student, log in, upload a real PDF and show its material card and controlled validation errors.
3. Log out and demonstrate protected-route rejection.
4. With an authorized administrator account, show adding/filtering questions. Never expose answer keys to the student endpoint.
5. Show the student's sample-question attempt prototype and clearly describe its local submission limitation.
6. Show the unit/integration results, security checks and Jira-to-code evidence. Record independent teammate review/cross-testing separately; automated checks do not constitute peer approval.
7. Keep `.env`, credentials and tokens out of the video.

Sprint 2 moderation, material search/download additions, deployment containers and final-release claims are excluded from this recording.

## After recording

After explicit confirmation, integrate latest main into `PES2UG24CS185-Sprint-2`. The pre-merge check found shared-file conflicts in `backend/src/runtime.ts`, `frontend/src/App.tsx` and `frontend/src/components/Navbar.tsx`; preserve both sets of registrations, routes and navigation when resolving them. Recheck conflicts against current heads and run the integrated backend/frontend/browser/container checks before making PR #8 ready. Its previous Edge CI job was cancelled during browser installation and is not a passing hosted Edge result.

