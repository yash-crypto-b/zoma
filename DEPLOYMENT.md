# Deploy Zomareel

This app serves its frontend and API together; there is no frontend build step. The included deployment targets one Linux Docker host, with Caddy terminating HTTPS, a persistent uploads volume, and an external PostgreSQL database with certificate-verified TLS. Docker Compose v2 is required. Keep one app instance: uploads and request throttling are local to that instance.

## Configure

1. Point a domain's DNS at the host and allow inbound TCP ports 80 and 443. Ensure the host can reach your database. If the Docker subnet `172.30.0.0/24` conflicts with your network, change it and both static addresses in `compose.yaml`, including `TRUSTED_PROXIES`.
2. Copy `.env.production.example` to `.env.production`. Set `APP_DOMAIN` to the hostname only and `SITE_URL` to its exact HTTPS origin, without a trailing slash. Generate `JWT_SECRET` with `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`. Protect this file; do not commit it.
3. Configure `DATABASE_URL` with a dedicated runtime login and URL-encoded credentials. Remove URL SSL parameters; the app enforces verified TLS. Set `DB_SSL_CA` if your provider requires a private CA. Give the runtime login CONNECT, schema USAGE, table SELECT/INSERT/UPDATE/DELETE, and sequence USAGE/SELECT, including future tables/sequences. Use a separate schema owner for migrations. Keep all database sessions in UTC.

## Initialize and launch

Run from the repository root:

```sh
docker compose --env-file .env.production build --pull
```

Set `DB_MIGRATION_URL` in the invoking shell to the schema owner's URL, then run the one-off migration. It is deliberately absent from the runtime environment file:

```sh
docker compose --env-file .env.production run --rm -e DB_MIGRATION_URL app node src/DB/migrate.js
```

Remove `DB_MIGRATION_URL` from the shell afterward, then start:

```sh
docker compose --env-file .env.production up -d --wait
docker compose --env-file .env.production ps
curl --fail https://YOUR_DOMAIN/health
```

The health response should report `status: ok`. Verify `/`, `/app`, registration, login, partner video publishing, video playback/range requests, likes, and logout through the public HTTPS URL. HTTP should redirect to HTTPS. Only the proxy publishes ports; the application trusts forwarded headers only from its configured proxy IP. The read-only `/health` probe also accepts internal HTTP so Docker can check database readiness.

## Data and releases

The image excludes local credentials and uploaded media. Existing local videos must be copied from `server/uploads` into the deployment's `uploads` volume before migrating existing database records that reference them. Preserve original filenames. Fresh installations start with an empty feed; development seeding is intentionally disabled in production.

Back up PostgreSQL and the uploads volume together. Preserve Caddy's data volume for certificates. Do not use `docker compose down -v` when retaining data. To update, back up data, build the new image, run required migrations with owner credentials, then run `up -d --wait`. Retain the previous image for rollback; database changes may require restoring a backup. SIGTERM drains active requests with a 25-second deadline.

Before release, run `npm ci`, `npm test`, `npm run security:secrets`, and `npm audit --omit=dev` in `server` against a local development database. Tests must never target production. Docker image build and public HTTPS checks require Docker, a real domain, and production database credentials.

Configuration references: [Caddy reverse proxy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy), [Compose environment interpolation](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/).
