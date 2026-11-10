# Current security audit

See [SECURITY-AUDIT.md](SECURITY-AUDIT.md) for the current findings, changes, verification results and deployment requirements.

The notes below describe a previous review. Its localStorage and non-revocable logout limitations have been superseded by the current implementation. Historical database administration statements were not independently repeated in this audit.

---

# Database and security review — 9 November 2026

The live local database passed connectivity and transactional insert/read/update/delete tests, including foreign-key cascades. HTTP tests exercise registration, login, profile updates, role separation, media URL validation, malformed cookies/JSON, secret-file requests, authentication throttling, JWT algorithm restrictions, and six simultaneous like toggles. Test records are removed; sequence values may advance.

## Changes applied

- Credentials stay in server/.env. Root and server ignore files exclude .env and its variants, allowing sanitized .env.example templates. dotenv loads relative to the server directory regardless of working directory.
- Created a random-password zomareel_app login with only CONNECT, schema USAGE, data CRUD and sequence usage. It cannot create databases, roles, or schema objects and has no superuser, replication or RLS bypass permissions. Removed PUBLIC access to this database and PUBLIC schema creation. The original PostgreSQL administrator still owns the database; its credentials are no longer used by the app.
- Startup verifies the existing schema and exits on database failure. Schema creation is an explicit npm run db:migrate operation requiring DB_MIGRATION_URL supplied only to that command. Keep this owner secret out of the normal app environment.
- Remote database connections require certificate-verified TLS; insecure URL TLS overrides are rejected. Local development uses password-authenticated loopback connections. Connection and query timeouts bound outages.
- PostgreSQL listens on all interfaces, but its inspected pg_hba.conf accepts only local socket/loopback SCRAM-SHA-256 connections. Other databases use this instance, so cluster-wide settings were preserved.
- App binds to 127.0.0.1 by default. Set HOST explicitly if deploying behind a proxy. Production also requires database TLS.
- Serialized concurrent like toggles using a row lock. Added authentication throttling, request limits, input bounds, 12-character registration passwords, bcrypt's 72-byte limit, HS256 verification, security headers and cross-site Fetch Metadata checks. Removed GET logout. Database errors and health responses omit sensitive diagnostics.
- Removed hardcoded seed credentials. Seeding requires a development environment and a user-supplied SEED_PASSWORD of at least 12 characters, against an initialized schema. Disabled known default passwords on 12 existing demo accounts while preserving their content.
- Rotated JWT_SECRET to invalidate existing tokens. Sign in again. Fixed the vulnerable development dependency chain by pinning the audit-recommended nodemon 3.1.11 and moving it to devDependencies.

## Run checks

From server/: npm run db:check, npm test, npm audit. Database and HTTP tests require access to local PostgreSQL.

## Scope and access limits

This checkout has no .git repository, so tracked files, historical credential exposure, and remote repository permissions could not be checked. Ignore rules do not remove secrets from an existing repository's history; rotate any previously published credentials.

An ignored dotenv file does not make access exclusive to a person. Your Windows account, system administrators, PostgreSQL administrators, and processes using your account can access the relevant credentials/data. The inspected .env ACL allows your account, SYSTEM and local Administrators. This project lives in OneDrive; Git ignore rules do not control OneDrive synchronization or sharing. Database users remain able to use the application's authorized public/API features.

The authentication limiter is in-memory per process; a multi-instance public deployment needs shared or upstream throttling. The existing client stores bearer tokens in localStorage, so a future XSS bug could expose a session. Logout clears client state/cookies; copied bearer tokens remain usable until expiry (one day). These are remaining session-design limitations, not a guarantee of a complete penetration test.

References: [node-postgres TLS configuration](https://node-postgres.com/features/ssl), [Express security guidance](https://expressjs.com/en/advanced/best-practice-security/).
