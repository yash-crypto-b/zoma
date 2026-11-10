// Free Render services have no pre-deploy command, so initialize the schema
// in a separate process before loading the HTTP server.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

if (!process.env.DATABASE_URL) throw new Error('Render requires DATABASE_URL');

const migration = spawn(process.execPath, [fileURLToPath(new URL('./src/DB/migrate.js', import.meta.url))], {
  stdio: 'inherit',
  env: { ...process.env, DB_MIGRATION_URL: process.env.DB_MIGRATION_URL || process.env.DATABASE_URL },
});

const exitCode = await new Promise((resolve, reject) => {
  migration.once('error', reject);
  migration.once('exit', (code) => resolve(code ?? 1));
});

if (exitCode !== 0) process.exit(exitCode);
await import('./server.js');
