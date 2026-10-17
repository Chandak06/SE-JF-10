# Sprint separation and video hold

Updated 17 October 2026 at the user's request.

- `main`: verified Sprint 1, including teammate PRs #6 and #7.
- `codex/sprint-1-video`: recording branch based on Sprint 1 commit `86f6bf8`. Only this guide is added; no Sprint 2 application code is included.
- `PES2UG24CS185`: preserved Sprint 2 work and resolved teammate integration, in draft PR #5.

Do not merge Sprint 2 into main or the video branch until the user explicitly confirms that the final Sprint 1 video has been recorded. Keep PR #5 as a draft. Do not reset, delete or overwrite the saved Sprint 2 branch.

## Recording setup

Use `codex/sprint-1-video`. Stop and restart any existing app servers after changing branches. Rebuild after switching: ignored dist folders may otherwise contain output from the other sprint.

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

Wait for the user's explicit confirmation first. Then update PES2UG24CS185 from the latest main, resolve any new conflicts, and run its full tests/browser/container CI before making PR #5 ready and merging as authorized. The saved Sprint 2 branch already includes the reviewed Sprint 1 history; no application files need to be copied or reverted.
