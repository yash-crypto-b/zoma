import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import pool from '../src/DB/db.js';
import { limiter, securityBoundary } from '../src/middleware/security.js';
import { authGuard } from '../src/middleware/auth-validation.js';
import { authenticate } from '../src/middleware/session.js';
import { profileSchema, reelSchema, publicMediaUrl } from '../src/middleware/validation.js';

const response = () => ({ statusCode: 200, locals: {}, headers: {}, set(k,v) {this.headers[k]=v;return this;}, setHeader(k,v){this.headers[k]=v;}, status(s){this.statusCode=s;return this;}, json(v){this.body=v;return this;}, on(){} });
test('ten attack categories: controlled security regressions', async t => {
  const original = pool.query;
  let cutoff = 0;
  const queries = [];
  pool.query = async (sql, values) => {
    queries.push({sql, values});
    if (sql.startsWith('UPDATE users')) { cutoff = Date.now() + 1; return {rows:[]}; }
    if (sql.includes('FROM users')) return {rows:[{id:7,name:'Diner',email:'diner@example.test',cutoff}]};
    if (sql.includes('FROM food_partners')) return {rows:[{id:8,name:'Kitchen',cutoff:0}]};
    if (sql.includes('FROM reels')) return {rows:[]};
    throw new Error('sensitive database diagnostic');
  };
  const server = app.listen(0,'127.0.0.1');
  await new Promise(r=>server.once('listening',r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const sign = payload => jwt.sign({authTime:Date.now(), ...payload}, process.env.JWT_SECRET, {issuer:'zomareel',audience:'zomareel-api',expiresIn:'1h'});
  const diner = sign({userId:7}); const kitchen = sign({partnerId:8});
  const call = (path, body, token=diner, extra={}) => fetch(base+path, { method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`,...extra}, body:JSON.stringify(body) });
  try {
    await t.test('1 SQL injection: identifiers rejected and identity bound as a parameter', async()=>{
      const r=await call('/api/reels/1%20OR%201=1/like',{});assert.equal(r.status,400);
      await fetch(base+'/api/users/me',{headers:{Authorization:`Bearer ${diner}`}});
      const q=queries.find(x=>x.sql.includes('WHERE id = $1'));assert.deepEqual(q.values,[7]);
      assert.equal(profileSchema.safeParse({name:"'; DROP TABLE users;--"}).success,true);
    });
    await t.test('2 XSS: HTML escaping and nonce CSP', async()=>{
      const source=await readFile(new URL('../../client/js/ui.js',import.meta.url),'utf8');
      const {escapeHtml}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
      assert.equal(escapeHtml('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
      const r=await fetch(base+'/');const html=await r.text();const csp=r.headers.get('content-security-policy');
      assert.ok(csp.includes("object-src 'none'"));assert.ok(!csp.includes("script-src 'self' 'unsafe-inline'"));
      const nonce=/nonce-([^']+)/.exec(csp)[1]; assert.ok(html.includes(`<script nonce="${nonce}"`));
      assert.equal(reelSchema.safeParse({media_url:'javascript:alert(1)'}).success,false);
    });
    await t.test('3 CSRF: hostile origin and simple form requests denied',async()=>{
      assert.equal((await call('/api/auth/logout',{},diner,{Origin:'https://attacker.example'})).status,403);
      assert.equal((await fetch(base+'/api/auth/logout',{method:'POST',headers:{'Content-Type':'text/plain'},body:'{}'})).status,415);
    });
    await t.test('4 DoS: body limits and finite request buckets',async()=>{
      assert.equal((await call('/api/users/me',{name:'x'.repeat(40000)})).status,413);
      const limit=limiter({limit:2,windowMs:60000});let passed=0;
      for(let i=0;i<3;i++){const res=response();limit({ip:'test',requestId:'test'},res,()=>passed++);if(i===2)assert.equal(res.statusCode,429);}
      assert.equal(passed,2);
    });
    await t.test('5 credential stuffing: same account blocked across IPs before bcrypt',()=>{
      let last;let passed=0;
      for(let i=0;i<21;i++) {last=response();authGuard({ip:`ip-${i}`,path:'/login',body:{email:'target@example.test',password:'wrong-password'},requestId:'test'},last,()=>passed++);}
      assert.equal(passed,20);assert.equal(last.statusCode,429);
    });
    await t.test('6 access control: role isolation, principal-scoped reads, no mass assignment',async()=>{
      assert.equal((await call('/api/reels',{media_url:'https://example.test/a.jpg'})).status,401);
      assert.equal((await fetch(base+'/api/users/me',{headers:{Authorization:`Bearer ${kitchen}`}})).status,401);
      assert.equal(profileSchema.safeParse({name:'x',userId:8,role:'admin'}).success,false);
      assert.equal(reelSchema.safeParse({food_partner_id:99,media_url:'https://example.test/a.jpg'}).success,false);
      await fetch(base+'/api/reels/mine',{headers:{Authorization:`Bearer ${kitchen}`}});
      assert.ok(queries.some(q=>q.sql.includes('WHERE food_partner_id = $1') && q.values[0]===8));
    });
    await t.test('7 MITM: production HTTP rejected, HSTS and secure cookies',async()=>{
      const previous=process.env.NODE_ENV;process.env.NODE_ENV='production';
      try {const res=response();securityBoundary({secure:false,method:'GET'},res,()=>assert.fail());assert.equal(res.statusCode,426);assert.ok(res.headers['Strict-Transport-Security']);
        for (const method of ['GET','HEAD']) {
          let allowed=false;
          securityBoundary({secure:false,method,path:'/health'},response(),()=>{allowed=true;});
          assert.equal(allowed,true,'readiness probes must work without TLS');
        }
        const mutation=response();
        securityBoundary({secure:false,method:'POST',path:'/health'},mutation,()=>assert.fail());
        assert.equal(mutation.statusCode,426);
        const {cookieOptions}=await import('../src/middleware/session.js');assert.equal(cookieOptions().secure,true);assert.equal(cookieOptions().httpOnly,true);
      }finally{if(previous===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=previous;}
    });
    await t.test('8 SSRF prevention boundary: local and dangerous media destinations rejected',()=>{
      for(const value of ['http://127.0.0.1/a','https://169.254.169.254/latest','https://[::1]/','file:///etc/passwd','https://localhost/a','https://service.internal/a','https://2130706433/a','https://user:pass@example.com/a']) assert.equal(publicMediaUrl(value),false,value);
      assert.equal(publicMediaUrl('https://images.pexels.com/a.jpg'),true);
    });
    await t.test('9 session hijacking: persistent logout, wrong audience and ambiguous roles denied',async()=>{
      assert.equal((await authenticate({headers:{authorization:`Bearer ${diner}`}})).id,7);
      assert.equal((await call('/api/auth/logout',{})).status,200);
      await assert.rejects(authenticate({headers:{authorization:`Bearer ${diner}`}}));
      const bad=jwt.sign({userId:7,authTime:Date.now()},process.env.JWT_SECRET,{audience:'other'});
      await assert.rejects(authenticate({headers:{authorization:`Bearer ${bad}`}}));
      await assert.rejects(authenticate({headers:{authorization:`Bearer ${sign({userId:7,partnerId:8})}`}}));
      const source=await readFile(new URL('../../client/js/store.js',import.meta.url),'utf8');assert.ok(source.includes('const { token, ...metadata }'));
    });
    await t.test('10 supply chain: dependency integrity metadata and disabled lifecycle scripts',async()=>{
      assert.match(await readFile(new URL('../.npmrc',import.meta.url),'utf8'), /^ignore-scripts=true/m);
      const lock=JSON.parse(await readFile(new URL('../package-lock.json',import.meta.url),'utf8'));
      for(const [name,pkg] of Object.entries(lock.packages)){if(!name)continue;assert.match(pkg.integrity,/^sha512-/);assert.match(pkg.resolved,/^https:\/\/registry.npmjs.org\//);if(pkg.hasInstallScript) assert.equal(name, 'node_modules/fsevents');}
    });
    await t.test('safe errors and poisoned canonical headers',async()=>{
      const r=await call('/api/reels',{media_url:'https://example.test/a.jpg'},kitchen);assert.equal(r.status,500);assert.ok(!(await r.text()).includes('sensitive database'));
      const sitemap=await fetch(base+'/sitemap.xml',{headers:{'X-Forwarded-Host':'attacker.test','X-Forwarded-Proto':'javascript'}});assert.ok(!(await sitemap.text()).includes('attacker.test'));
    });
  } finally {pool.query=original;server.closeAllConnections();await new Promise(r=>server.close(r));await pool.end();}
});
