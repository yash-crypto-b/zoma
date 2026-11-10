import './src/env.js';
import app from './src/app.js';
import pool from './src/DB/db.js';

const PORT = Number(process.env.PORT) || 3000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || /replace-with|change-me/i.test(process.env.JWT_SECRET)) {
  console.error('JWT_SECRET is not set in server/.env, auth endpoints cannot work');
  process.exit(1);
}

if (process.env.NODE_ENV === 'production') {
  let origin;
  try { origin = new URL(process.env.SITE_URL); } catch { throw new Error('Production requires SITE_URL as an HTTPS origin'); }
  if (origin.protocol !== 'https:' || origin.origin !== process.env.SITE_URL || origin.username || origin.password) throw new Error('Production requires SITE_URL as an HTTPS origin without a trailing slash');
}

async function start() {
  try {
    await pool.query('SELECT id, name, email, password FROM users LIMIT 0');
    await pool.query('SELECT id, name, email, password FROM food_partners LIMIT 0');
    await pool.query('SELECT id, food_partner_id, media_url, likes FROM reels LIMIT 0');
    await pool.query('SELECT user_id, reel_id FROM reel_likes LIMIT 0');
    console.log('Database schema verified');
  } catch (error) {
    console.error(
      'Database startup failed:',
      error.code || 'connection/schema error',
      '\nCheck DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD (or DATABASE_URL) in server/.env'
    );
    await (await import('./src/DB/db.js')).default.end();
    process.exitCode = 1;
    return;
  }

  const server = app.listen(PORT, process.env.HOST || '127.0.0.1', () => {
    console.log(`server is running on port ${PORT}`);
  });

  server.requestTimeout = 60000;
  server.headersTimeout = 15000;
  server.keepAliveTimeout = 5000;
  server.maxRequestsPerSocket = 1000;

  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    console.log('Shutting down');
    const deadline = setTimeout(() => process.exit(1), 25000);
    deadline.unref();
    server.close(async () => {
      try { await pool.end(); } catch { process.exitCode = 1; }
      clearTimeout(deadline);
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`port ${PORT} is already in use, set PORT to a free port`);
    } else {
      console.error('server error:', error);
    }
    process.exit(1);
  });
}

start();
