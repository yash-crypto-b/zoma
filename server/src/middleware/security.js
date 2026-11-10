import { randomUUID, randomBytes } from 'node:crypto';
export function securityLog(event, fields = {}) {
  console.log(JSON.stringify({ time: new Date().toISOString(), event, ...fields }));
}
export function limiter({ limit, windowMs, key = req => req.ip, name = 'api' }) {
  const buckets = new Map();
  let swept = 0;
  return (req, res, next) => {
    const now = Date.now();
    if (now - swept > 60000) { for (const [k,v] of buckets) if (v.until <= now) buckets.delete(k); swept = now; }
    const k = key(req);
    let bucket = buckets.get(k);
    if (!bucket || bucket.until <= now) {
      if (buckets.size >= 10000 && !bucket) return res.status(429).json({ success: false, message: 'try again later' });
      bucket = { count: 0, until: now + windowMs }; buckets.set(k, bucket);
    }
    if (++bucket.count > limit) {
      res.set('Retry-After', String(Math.ceil((bucket.until-now)/1000)));
      securityLog('rate_limit', { requestId: req.requestId, policy: name });
      return res.status(429).json({ success: false, message: 'too many requests' });
    }
    next();
  };
}
export function securityBoundary(req, res, next) {
  req.requestId = randomUUID(); res.set('X-Request-ID', req.requestId);
  res.set('X-Content-Type-Options', 'nosniff'); res.set('X-Frame-Options', 'DENY');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.locals.nonce = randomBytes(18).toString('base64');
  res.set('Content-Security-Policy', `default-src 'self'; script-src 'self' 'nonce-${res.locals.nonce}' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; media-src 'self' blob: https:; connect-src 'self' https://www.google-analytics.com; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'`);
  if (process.env.NODE_ENV === 'production') {
    res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    // Readiness probes run inside the container without TLS termination.
    const readiness = req.path === '/health' && ['GET', 'HEAD'].includes(req.method);
    if (!req.secure && !readiness) return res.status(426).json({ success: false, message: 'HTTPS required' });
  }
  if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'no-store');
    res.on('finish', () => { if (res.statusCode >= 400) securityLog('request_rejected', { requestId: req.requestId, method: req.method, status: res.statusCode }); });
    if (!['GET','HEAD','OPTIONS'].includes(req.method)) {
      const origin = req.get('origin');
      const expected = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;
      // Vercel proxies same-origin API requests to this service. Only its
      // explicitly configured production origin may also send cookie mutations.
      const allowedOrigins = [expected, process.env.FRONTEND_ORIGIN].filter(Boolean);
      if (req.get('sec-fetch-site') === 'cross-site' || (origin && !allowedOrigins.includes(origin))) return res.status(403).json({ success: false, message: 'cross-site request blocked' });
      // Browser cookie mutations must carry JSON or video, forcing a CORS preflight.
      if (!req.is('application/json') && !req.is('video/mp4')) return res.status(415).json({ success: false, message: 'unsupported content type' });
    }
  }
  next();
}
