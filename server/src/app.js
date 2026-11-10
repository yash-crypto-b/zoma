import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import reelRoutes from './routes/reel.routes.js';
import siteRoutes, { siteNotFound } from './site/router.js';
import errorHandler from './middleware/error.middleware.js';
import pool from './DB/db.js';
import { securityBoundary, limiter } from './middleware/security.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDirectory = path.resolve(__dirname, '../../client');
const clientIndex = path.join(clientDirectory, 'index.html');

const app = express();
app.disable('x-powered-by');
// Trust only explicitly configured proxy IPs/subnets; never arbitrary forwarded headers.
if (process.env.TRUSTED_PROXIES) app.set('trust proxy', process.env.TRUSTED_PROXIES.split(',').map(x => x.trim()));
app.use(securityBoundary);
app.use('/api', limiter({ limit: 300, windowMs: 60000 }));
app.use(express.json({ limit: "32kb" }));

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.status(200).json({
      success: true,
      status: 'ok',
      database: 'connected',
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      status: 'degraded',
      database: 'unavailable',
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reels', reelRoutes);
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads'), { dotfiles: 'deny', immutable: true, maxAge: '1y' }));

// Static assets (images, reels, CSS, the app shell). Marketing pages are
// rendered by the site router below so they ship complete, indexable HTML.
app.use(
  express.static(clientDirectory, {
    index: false,
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  })
);

app.use(siteRoutes);

// The signed-in application lives at /app and uses hash routing.
app.get(['/app', '/app/'], (req, res) => res.sendFile(clientIndex));

app.use((req, res) => {
  if ((req.method === 'GET' || req.method === 'HEAD') && req.accepts('html')) {
    return siteNotFound(req, res);
  }

  return res.status(404).json({
    success: false,
    message: "route not found",
  });
});

app.use(errorHandler);

export default app;
