# Sprint separation and video hold

Updated 17 October 2026 at the user's request.

- `main`: verified Sprint 1, including teammate PRs #6 and #7.
- `PES2UG24CS185-Sprint-1`: recording branch based on Sprint 1 commit `86f6bf8`. Only this guide is added; no Sprint 2 application code is included.
- `PES2UG24CS185-Sprint-2`: preserved Sprint 2 work and resolved teammate integration, in draft PR #8.

Do not merge Sprint 2 into main or the video branch until the user explicitly confirms that the final Sprint 1 video has been recorded. Keep PR #8 as a draft. Do not reset, delete or overwrite the saved Sprint 2 branch.

## Team Sprint 1 verification

Checked published branches and open PRs on 17 October 2026 against the detailed Sprint 1 work plan. `main` contains the merged Sprint 1 application at `86f6bf8`; the recording branch has identical application code. Documentation updates do not add Sprint 2 features.

| Member | Sprint 1 deliverable | Available in main |
| --- | --- | --- |
| Dharani S | Registration, login/logout, User model, authenticated PDF upload and validation | Yes; PR #7 and shared integration tests |
| Prajwal M | Question model/API, administrator Add MCQ, Question Bank subject/topic/difficulty filtering | Not implemented; excluded from the current integration and recording scope at Harshit's explicit request |
| Karan Varshney | QuizAttempt model, attempt UI prototype and evaluation logic prototype | Yes; PR #6, model/helper tests and fixture integration; no production quiz submission/history claim |
| Harshit Chandak | Authentication middleware, hashing, role foundations, Member 1 integration and CI/CD | Yes; GitHub Actions replaces Jenkins by the team's decision |

Both published teammate branch tips (`PES2UG24CS157`, `PES2UG24CS903`) are ancestors of main. The only open PR is Sprint 2 draft #8. Sprint 2 moderation, protected PDF downloads, bounded material search and deployment containers are excluded from main. Harshit confirmed that Prajwal has not coded his module and asked to leave it out. Proceed with Dharani's, Karan's and Harshit's available Sprint 1 work; do not implement or wait for Prajwal's module, and do not present Question Bank features as completed in the video.

Validation: 110 backend tests, 30 frontend tests, typecheck, both builds, frontend lint and backend coverage gates passed for this application snapshot. Tests use isolated temporary MongoDB. The configured live Atlas connection currently fails during the TLS handshake (`ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR`); fix connectivity and rerun `npm run db:check` before recording the live product. No credentials or application records were changed by the connection checks.

## Recording setup

Use `PES2UG24CS185-Sprint-1`. Stop and restart any existing app servers after changing branches. Rebuild after switching: ignored dist folders may otherwise contain output from the other sprint.

At the repository root:
```powershell
npm ci
npm run check
npm run db:check
npm run dev
```

In a second terminal, in frontend:
```powershell
npm ci
npm run test:ci
npm run lint
npm run build
npm run dev
```

Keep the existing ignored .env and Atlas URI. Do not overwrite them with the example.

## Suggested Harshit video

1. Show the recording branch and the passing Sprint 1 GitHub Actions run.
2. Register a demo student, log in, and show the library/profile.
3. Open **Upload a material**, enter title, subject and description, choose a valid PDF and submit.
4. Show the material in the library and a controlled validation error if needed.
5. Log out through the profile menu; demonstrate that protected navigation returns to login.
6. Show passing password-hashing, auth/logout, RBAC and integration tests. The practice quiz is a Sprint 1 prototype, not a production scoring service.
7. Keep .env, credentials and bearer tokens out of the recording; use a demo account.

Do not demonstrate Sprint 2 administration, removal/search/download additions, deployment containers or final-release claims as Sprint 1 work.

## After recording

Wait for the user's explicit confirmation first. Then update PES2UG24CS185-Sprint-2 from the latest main, resolve any new conflicts, and run its full tests/browser/container CI before making PR #8 ready and merging as authorized. The saved Sprint 2 branch already includes the reviewed Sprint 1 history; no application files need to be copied or reverted.
