# Sprint 2 deployment and demonstration

**30 October:** Real Attempt/Result/History/Performance modules are integrated, and Dashboard navigation is connected. The [current execution/acceptance report](SPRINT2_HARSHIT_FINAL_2026-10-30.md) supersedes older missing-module/prototype statements below. The built local verifier now exercises real Question/Quiz, idempotent scoring, SAD result/download contracts, PDF bytes and saved history through actual MongoDB restart. Submitted SRS/SAD/Test Plan files remain unchanged.

Use supported Node 24.15+ and locked dependencies. Keep credentials/environment files out of Git, images, screenshots and logs. The integrated application contains the real team modules. Local release validation is separate from Atlas readiness, public deployment and final acceptance/freeze.

## Existing local configuration / Atlas

Run root `npm ci`, `npm run check`, `npm run db:check` and the backend; in frontend run `npm ci`, tests/lint/build and the development server. The supported-runtime Windows launcher remains available. The exact configured URI selects the database; no database name is guessed.

The 31 October read-only diagnostic still fails before authentication: all three discovered Atlas servers return `ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR`. Inspect the SE project's actual cluster and network access settings; this error alone does not establish whether the cause is Atlas configuration or the local network. Credentials/access settings were not changed and certificate validation stays enabled. Disposable test passes do not prove live Atlas reachability. The Campus-Lost-Found project is unrelated and must not be changed for this application.

The SE console was subsequently verified at the project URL supplied by Harshit: **Collaborative_Study_Quiz_Platform** (`6aca5007b549773ddcc6fe35`). Cluster0 is **Active**, and an existing **Active** IP rule explicitly includes this computer's current IP. No rule was added, and the TLS failure remains unresolved. Do not treat another IP-list entry or a password reset as an established fix for a failure that occurs before authentication.

## Local Node demo on this Windows machine (no Docker or Atlas)

Install the locked root and frontend dependencies first (`npm ci` in each directory). From the repository root run:

```powershell
./scripts/start-sprint2.ps1
```

This selects supported Node 24, builds a separate same-origin frontend and starts the available integrated application at `http://127.0.0.1:8080`. It never loads `.env`, uses Atlas, changes your existing frontend build, or creates an account automatically. The MongoDB binary manager from the locked development dependencies starts real standalone MongoDB on loopback; first use can require downloading that binary. This is a local development environment, not production hosting. Keep access to this computer trusted: local MongoDB has no database authentication and listens only on loopback.

Data is saved under ignored `.local/sprint2-demo/database`, using WiredTiger. Ctrl+C stops the application and flushes database writes without deleting data. Restart with the same command to retain accounts, PDFs, questions and removal records. Keep that folder if you need the demonstration data. Do not run a second launcher against that directory while the first is active.

For the first Admin, follow the secure environment-input prompt in [Admin setup](ADMIN_SETUP.md), with `ADMIN_PROVISION_CONFIRM=development`, and replace its `npm run seed:admin` invocation with:

```powershell
./scripts/start-sprint2.ps1 -ProvisionAdmin
```

This explicit option provisions only the launcher's separate local database. It refuses Student promotion, disabled accounts and password resets. Clear the setup variables afterward as documented. Public registration still creates Students. Normal subsequent starts need no provisioning option.

For supported-Node shells on other platforms, the equivalent is:

```text
npm run demo:build
npm run demo:local -- --confirm-local-development
```

`npm run demo:verify` checks the actual build/assets and gateway registration/login/RBAC/logout against a freshly allocated disposable MongoDB directory, then stops and removes only that test directory. It never writes to the saved local demo or Atlas. Integration tests also restart real MongoDB and verify persisted sessions and Question moderation. GitHub Actions executes both the normal tests and built-demo verification.

This resolves the Docker/Atlas prerequisite for demonstrating the available modules. It does not supply missing teammates' business modules or establish Atlas/public HTTPS readiness.

## Explicit persistent local Docker demo (no Atlas)

With Docker Compose installed, explicitly choose a separate development database and loopback web environment:

```powershell
docker compose -f compose.local.yaml up --build -d
```

Open `http://localhost:8080`. MongoDB has no published host port; the named `development-data` volume persists across normal restarts. Local Compose uses its literal development URI, not Atlas. Only the web port binds to loopback. Development HTTP is permitted by the SRS; production HTTPS configuration is separate and unchanged.

To stop without deleting saved development data:

```powershell
docker compose -f compose.local.yaml down
```

Do not use `down -v` on data you need.

### First local Docker Admin

The `setup` profile never executes automatically. First read [Admin setup](ADMIN_SETUP.md) and explicitly authorize creation in this **local Compose development database**. Set `ADMIN_PROVISION_CONFIRM=development`, optional `ADMIN_NAME`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` using the secure prompt documented there. Then run:

```powershell
docker compose -f compose.local.yaml --profile setup run --rm seed-admin
```

Clear setup environment variables afterward. Do not put a password literally in command history. The existing trusted CLI refuses Student emails and never resets an existing Admin password. The legacy `scripts/promote-admin.mjs` shortcut is disabled.

Use common login. Admins land on `/admin`, with the existing Question Bank and real material/Question/Quiz moderation. Cancel/confirm removal separately; audit metadata and saved references remain. Students land on `/dashboard` and can use materials and real Quiz creation/search/view. The production submission API is integrated; the old attempt page is still a labelled prototype until CSMQ-41/42 supplies production Attempt/Result screens.

## Production HTTPS packaging

### Loopback HTTPS release verification

`compose.https.local.yaml` provides a separate persistent local HTTPS deployment with production backend transport enforcement, an unpublished MongoDB service and a gateway bound only to `127.0.0.1:8443`. It uses a separate `study_commons_local_https` database and named database/CA volumes, never the Atlas URI:

```text
docker compose -f compose.https.local.yaml up --build -d
```

The gateway issues a `localhost` certificate using its own internal CA, following [Caddy's local HTTPS mechanism](https://caddyserver.com/docs/automatic-https#local-https). No system/browser trust store is modified automatically. Export only the public root certificate with `docker compose -f compose.https.local.yaml cp web:/data/caddy/pki/authorities/local/root.crt .local/local-https-root.crt`; an operator must explicitly choose any browser trust configuration. Never disable TLS certificate verification. CI trusts this public CA only for its smoke process through `NODE_EXTRA_CA_CERTS`, tests real sensitive operations over HTTPS and confirms direct HTTP production API calls return `HTTPS_REQUIRED`.

For this separate local database's first Admin, use the secure input/confirmation procedure in [Admin setup](ADMIN_SETUP.md), then `docker compose -f compose.https.local.yaml --profile setup run --rm seed-admin`. The trusted setup helper runs in development mode against the literal local database; existing Student accounts are never promoted. Normal startup does not execute provisioning.

Normal `docker compose -f compose.https.local.yaml down` preserves saved database/certificate volumes. CI uses its own disposable `sprint2-tls-ci` project and removes only those temporary volumes. The local Node launcher remains a development HTTP option; it is not represented as verification of deployed HTTPS. Public-host deployment still requires the operator's selected environment and domain.

Existing `compose.yaml`, Dockerfiles and `deploy/Caddyfile` expose only the gateway and trust only its backend-network IP. Supply a selected public hostname/URI through ignored or managed configuration. DNS, HTTPS ports, approved database access and separately authorized production Admin bootstrap are operator requirements.

Caddy redirects HTTP to HTTPS and manages eligible domain certificates; the backend enforces production HTTPS. No public host/domain/certificate or production provisioning/password-reset procedure is invented. No cloud deployment or global Docker installation was attempted here.

## CI and evidence

GitHub Actions runs backend types/build/coverage, frontend tests/lint/build, Chrome/Edge/Firefox journeys, Docker image builds and production Caddy validation. The containers job starts an isolated `sprint2-ci` local deployment, then runs `scripts/check-local-release.mjs` through the gateway to verify the built frontend, readiness, registration/login, Student RBAC and logout. Cleanup deletes only that disposable CI project's volumes.

The smoke script requires `RELEASE_SMOKE_CONFIRM=disposable-local`, accepts loopback HTTP only and never loads `.env`. Do not run it on a real database whose records must remain unchanged. Docker is unavailable on this workstation; use the pushed-head CI result for actual container execution evidence.

Artifacts: `integrated-test-reports`, `integrated-backend`, `integrated-frontend` and per-browser evidence. Local logs are under ignored `.local/sprint2-2026-10-28/`. See [current status](SPRINT2_HARSHIT.md) and [RTM](SPRINT2_RTM.md) for actual results and acceptance limits.

The container CI job uses Ubuntu 22.04 because current `ubuntu-latest` Azure kernels cause `mongo:8` to exit with MongoDB startup error 12257600. The actual job logs reproduced [GitHub runner issue #15005](https://github.com/actions/runner-images/issues/15005) and [MongoDB's kernel detection issue](https://jira.mongodb.org/browse/SERVER-136848). This follows GitHub's documented compatible-host workaround without downgrading a database or bypassing MongoDB's startup protection. Container failure logs are retained in job output before disposable cleanup. Local Docker installations need a host kernel supported by their MongoDB image; the Windows Node launcher provides a separately tested alternative.

## Owner handoff and final freeze

Follow the [current team integration report](SPRINT2_TEAM_REVIEW_2026-10-29.md) and [owner handoff](SPRINT2_HANDOFF.md). Real Quiz, Question, material and Student Dashboard modules plus the production submission API are integrated. Production Attempt/Result screens, history/performance and folders remain pending. Freeze/tag only after the remaining real integrations, full-system tests, selected environment verification, final demo and genuine cross-testing.
