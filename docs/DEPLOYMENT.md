# Sprint 2 deployment and demonstration

Use supported Node 24.15+ and locked dependencies. Keep credentials/environment files out of Git, images, screenshots and logs. This branch packages available modules; missing production modules, public deployment and final freeze are not claimed complete.

## Existing local configuration / Atlas

Run root `npm ci`, `npm run check`, `npm run db:check` and the backend; in frontend run `npm ci`, tests/lint/build and the development server. The supported-runtime Windows launcher remains available. The exact configured URI selects the database; no database name is guessed.

On 28 October configuration and DNS checks passed but all three Atlas TLS handshakes failed before authentication. The operator must verify the actual cluster/network environment. Credentials/access settings were not changed and certificate validation stays enabled. Disposable test passes do not prove live Atlas reachability.

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

Use common login. Admins land on `/admin`, with the existing Question Bank and moderation categories. Cancel/confirm removal separately; audit metadata and saved references remain. Quiz moderation is unavailable until its real owner adapter is registered. Student materials and prototype navigation remain functional.

## Production HTTPS packaging

Existing `compose.yaml`, Dockerfiles and `deploy/Caddyfile` expose only the gateway and trust only its backend-network IP. Supply a selected public hostname/URI through ignored or managed configuration. DNS, HTTPS ports, approved database access and separately authorized production Admin bootstrap are operator requirements.

Caddy redirects HTTP to HTTPS and manages eligible domain certificates; the backend enforces production HTTPS. No public host/domain/certificate or production provisioning/password-reset procedure is invented. No cloud deployment or global Docker installation was attempted here.

## CI and evidence

GitHub Actions runs backend types/build/coverage, frontend tests/lint/build, Chrome/Edge/Firefox journeys, Docker image builds and production Caddy validation. The containers job starts an isolated `sprint2-ci` local deployment, then runs `scripts/check-local-release.mjs` through the gateway to verify the built frontend, readiness, registration/login, Student RBAC and logout. Cleanup deletes only that disposable CI project's volumes.

The smoke script requires `RELEASE_SMOKE_CONFIRM=disposable-local`, accepts loopback HTTP only and never loads `.env`. Do not run it on a real database whose records must remain unchanged. Docker is unavailable on this workstation; use the pushed-head CI result for actual container execution evidence.

Artifacts: `integrated-test-reports`, `integrated-backend`, `integrated-frontend` and per-browser evidence. Local logs are under ignored `.local/sprint2-2026-10-28/`. See [current status](SPRINT2_HARSHIT.md) and [RTM](SPRINT2_RTM.md) for actual results and acceptance limits.

## Owner handoff and final freeze

Follow the [owner handoff](SPRINT2_HANDOFF.md). Real Question moderation is integrated; fixture Quiz adapters are not production Quiz/Attempt/results/history/performance, folders or Student Dashboard modules. Freeze/tag only after real integrations, full-system tests, selected environment verification, final demo and genuine cross-testing.
