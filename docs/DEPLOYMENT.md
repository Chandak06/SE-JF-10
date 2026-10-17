# Sprint 2 deployment and demonstration

Use current Node 24 (24.15+) and the locked dependencies. The local .env contains the Atlas URI; never copy it into source control, images, screenshots or reports.

## Local demonstration
1. Run npm ci and npm run build at the repository root.
2. Verify Atlas with npm run db:check; start the backend with npm start.
3. In frontend, run npm ci and npm run dev. Set VITE_API_BASE_URL if the backend is elsewhere.
4. Register and log in as a student; upload/search/download a PDF.
5. For an existing account you deliberately choose as the administrator, a trusted operator can run: node scripts/promote-admin.mjs EMAIL --confirm. This command changes that account's role in the configured database. It is never a public registration option and was not run against your Atlas accounts by this implementation.
6. Log in as that administrator, follow Content moderation, choose an item, cancel once, then explicitly confirm removal. The item disappears from student search/download. Removal retains the original file and an audit tombstone for recovery.
7. Log out; replayed credentials must fail.

## HTTPS container deployment
The repository supplies backend/web Dockerfiles, compose.yaml, and a Caddy gateway. Only the gateway exposes ports 80/443; the backend is reachable on the private application network and trusts exactly the gateway IP.

The host must have Docker Compose, public DNS pointing to the host, reachable ports 80/443, and an Atlas IP access rule for the host. Set SITE_ADDRESS to the public hostname and MONGODB_URI through an ignored deployment environment file or managed environment; do not put credentials in command history or committed files. Start with docker compose up --build -d. If 172.31.0.0/24 conflicts with an existing network, change the subnet and both service addresses together with TRUST_PROXY.

Caddy obtains/renews public certificates for eligible domains and redirects HTTP to HTTPS. It replaces forwarded scheme/client-IP headers. See [automatic HTTPS](https://caddyserver.com/docs/automatic-https) and [reverse proxy behavior](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy).

Verify a real deployment using the public HTTPS URL, browser registration/login/upload/moderation/logout, actual certificate validity, and Atlas persistence after backend restart. Record the URL and results in the Sprint report. No host/domain was supplied, so no public deployment, live certificate or release freeze is claimed yet. Docker is absent locally; CI builds the images and validates the gateway configuration.

## Browser and regression evidence
Root npm run check verifies backend types/build/tests/coverage, including 50 concurrent authenticated sessions and reconnect/removal persistence. Frontend npm run test:ci, npm run build and npm run lint verify regression.

Frontend npm run test:browser runs Google Chrome, Microsoft Edge and Playwright Firefox. Install Firefox into an ignored project cache with PLAYWRIGHT_BROWSERS_PATH configured; Chrome/Edge use installed stable channels. CI installs all three on its disposable runners. Browser tests start isolated MongoDB and temporary frontend/backend servers, never the configured Atlas database. [Playwright browser channels](https://playwright.dev/docs/browsers).

## Feature-owner handoff
Question/Quiz owners pass ModerationResource adapters via createRuntime options.moderation. list(limit) returns id/title only. remove(id, administratorId) must remove or tombstone the owned resource and ensure its read, quiz creation and attempt routes exclude removed data. Do not expose correctAnswer in student payloads. The shared /api/admin router handles auth, current-role checks, confirmation, ID validation and safe errors.

Question/Quiz/Attempt business code is absent on origin. Adapters are tested with explicitly labelled isolated contract fixtures. Those tests are not evidence of actual quiz creation, evaluation/history/performance integration.

Do not freeze/tag a final release until actual teammate integrations, deployment smoke checks and independent cross-testing are complete.
