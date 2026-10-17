FROM node:24-bookworm-slim AS build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend ./
ENV VITE_API_BASE_URL=""
RUN npm run build

FROM caddy:2-alpine
COPY --from=build /app/frontend/dist /srv
COPY deploy/Caddyfile /etc/caddy/Caddyfile
