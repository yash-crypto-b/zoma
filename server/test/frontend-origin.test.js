import test from 'node:test';
import assert from 'node:assert/strict';
import { securityBoundary } from '../src/middleware/security.js';

test('Vercel origin is explicitly allowed without allowing unrelated cross-site mutations', () => {
  const previousSite = process.env.SITE_URL;
  const previousFrontend = process.env.FRONTEND_ORIGIN;
  process.env.SITE_URL = 'https://backend.example.test';
  process.env.FRONTEND_ORIGIN = 'https://frontend.example.test';
  function check(origin, site = 'same-origin') {
    let status = 200;
    let passed = false;
    const req = {
      path: '/api/auth/login', method: 'POST', secure: true,
      get: name => ({ origin, 'sec-fetch-site': site })[name],
      is: type => type === 'application/json',
    };
    const res = { locals: {}, set() {}, on() {}, status(code) { status = code; return this; }, json() {} };
    securityBoundary(req, res, () => { passed = true; });
    return { status, passed };
  }
  try {
    assert.equal(check(process.env.FRONTEND_ORIGIN).passed, true);
    assert.equal(check(process.env.SITE_URL).passed, true);
    assert.equal(check('https://attacker.example.test').status, 403);
    assert.equal(check(process.env.FRONTEND_ORIGIN, 'cross-site').status, 403);
    assert.equal(check('https://preview.example.test').status, 403);
  } finally {
    if (previousSite === undefined) delete process.env.SITE_URL; else process.env.SITE_URL = previousSite;
    if (previousFrontend === undefined) delete process.env.FRONTEND_ORIGIN; else process.env.FRONTEND_ORIGIN = previousFrontend;
  }
});
