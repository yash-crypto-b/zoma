import { limiter } from './security.js';
import { authSchema, validate } from './validation.js';
import { createHash } from 'node:crypto';
const ipLimit = limiter({ limit: 50, windowMs: 900000, name: 'authentication_ip' });
const accountLimit = limiter({ limit: 20, windowMs: 900000, name: 'authentication_account', key: req => createHash('sha256').update(req.body.email.toLowerCase()).digest('hex') });
export function authGuard(req, res, next) {
  if (req.path.toLowerCase() === '/logout') return next();
  ipLimit(req, res, () => validate(authSchema)(req, res, () => {
    if (req.path.toLowerCase().startsWith('/register') && req.body.password.length < 12) return res.status(400).json({ success: false, message: 'password must be at least 12 characters' });
    accountLimit(req, res, next);
  }));
}
