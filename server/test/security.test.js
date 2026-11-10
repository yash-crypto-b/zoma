import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import pool from '../src/DB/db.js';
import { authMiddleware } from '../src/middleware/auth.middleware.js';

test('HTTP security and complete database flow', async () => {
 const dbHost = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : process.env.DB_HOST || 'localhost';
 assert.ok(['localhost','127.0.0.1','[::1]','::1'].includes(dbHost), 'Integration tests require a loopback database');
 assert.notEqual(process.env.NODE_ENV, 'production', 'Never run fixtures against production');
 const server = app.listen(0,'127.0.0.1');
 await new Promise(resolve=>server.once('listening',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const suffix=Date.now()+'-'+Math.random().toString(36).slice(2);
 const dinerEmail='security-diner-'+suffix+'@example.test';
 const partnerEmail='security-partner-'+suffix+'@example.test';
 const call=(path,body,token,method='POST')=>fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
 try {
  let r=await fetch(base+'/health'); assert.equal(r.status,200);assert.equal(r.headers.get('x-powered-by'),null); assert.equal(r.headers.get('x-content-type-options'),'nosniff');
  for(const path of ['/.env','/server/.env','/.git/config']) {r=await fetch(base+path);assert.equal(r.status,404);}
  r=await fetch(base+'/api/users/me');assert.equal(r.status,401);
  r=await fetch(base+'/api/users/me',{headers:{Cookie:'token=%ZZ'}});assert.equal(r.status,401);
  r=await call('/api/auth/register',{email:dinerEmail,password:'short'});assert.equal(r.status,400);
  r=await call('/api/auth/register',{email:'bad',password:'long-password-123'});assert.equal(r.status,400);
  r=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'});assert.equal(r.status,400);
  r=await fetch(base+'/api/auth/logout',{method:'POST',headers:{'sec-fetch-site':'cross-site'}});assert.equal(r.status,403);
  r=await call('/api/auth/register',{name:'Security test',email:dinerEmail,password:'test-password-12345'});assert.equal(r.status,201);let diner=await r.json();assert.ok(diner.token);assert.equal(diner.user.password,undefined);
  r=await call('/api/auth/login',{email:dinerEmail,password:'wrong-password'});assert.equal(r.status,401);
  r=await call('/api/auth/login',{email:dinerEmail,password:'test-password-12345'});assert.equal(r.status,200);
  r=await call('/api/users/me',undefined,diner.token,'GET');assert.equal(r.status,200);
  r=await call('/api/users/me',{name:'Updated'},diner.token,'PATCH');assert.equal(r.status,200);diner.token=(await r.json()).token;
  r=await call('/api/reels',{media_url:'https://example.test/test.jpg'},diner.token);assert.equal(r.status,401);
  r=await call('/api/auth/registerFoodpartner',{name:'Security kitchen',email:partnerEmail,password:'test-password-12345'});assert.equal(r.status,201);const partner=await r.json();
  r=await call('/api/users/me',undefined,partner.token,'GET');assert.equal(r.status,401);
  r=await call('/api/reels',{media_url:'javascript:alert(1)'},partner.token);assert.equal(r.status,400);
  r=await call('/api/reels',{media_url:'https://example.test/'+suffix+'.jpg',dish_name:'Security test',price:10},partner.token);assert.equal(r.status,201);const {reel}=await r.json();
  const likes=await Promise.all(Array.from({length:6},()=>call('/api/reels/'+reel.id+'/like',{},diner.token)));
  assert.deepEqual(likes.map(x=>x.status),Array(6).fill(200));
  const {rows:[stored]}=await pool.query('SELECT likes,(SELECT count(*)::int FROM reel_likes WHERE reel_id=$1) AS actual FROM reels WHERE id=$1',[reel.id]);assert.equal(stored.likes,0);assert.equal(stored.actual,0);
  r=await fetch(base+'/api/reels');assert.equal(r.status,200);
  r=await call('/api/users/me',{email:'changed-'+dinerEmail},diner.token,'PATCH');assert.equal(r.status,403);
  r=await call('/api/users/me',{email:'changed-'+dinerEmail,currentPassword:'test-password-12345'},diner.token,'PATCH');assert.equal(r.status,200);diner.token=(await r.json()).token;
  r=await call('/api/users/me',{email:dinerEmail,currentPassword:'test-password-12345'},diner.token,'PATCH');assert.equal(r.status,200);diner.token=(await r.json()).token;
  // Browser cookie authentication and durable logout replay rejection.
  r=await call('/api/auth/login',{email:dinerEmail,password:'test-password-12345'});assert.equal(r.status,200);
  const cookie=r.headers.get('set-cookie').split(';')[0];const fresh=(await r.json()).token;
  assert.match(r.headers.get('set-cookie'),/HttpOnly/i);assert.match(r.headers.get('set-cookie'),/SameSite=Strict/i);
  r=await fetch(base+'/api/users/me',{headers:{Cookie:cookie}});assert.equal(r.status,200);
  r=await fetch(base+'/api/users/me',{method:'PATCH',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({name:"'; DROP TABLE users;--"})});assert.equal(r.status,200);assert.equal((await r.json()).user.name,"'; DROP TABLE users;--");
  r=await call('/api/auth/login',{email:dinerEmail,password:'test-password-12345'});assert.equal(r.status,200);const logoutToken=(await r.json()).token;
  r=await call('/api/auth/logout',{},logoutToken);assert.equal(r.status,200);
  r=await call('/api/users/me',undefined,logoutToken,'GET');assert.equal(r.status,401);
  r=await fetch(base+'/api/users/me',{headers:{Cookie:cookie}});assert.equal(r.status,401);
  r=await call('/api/reels/mine',undefined,partner.token,'GET');assert.equal(r.status,200);assert.ok((await r.json()).reels.every(x=>x.id===reel.id));
  for(let i=0;i<55;i++)r=await call('/api/auth/login',{email:'invalid',password:'invalid'});assert.equal(r.status,429);
 } finally {
  await pool.query('DELETE FROM users WHERE email=$1 OR email=$2',[dinerEmail,'changed-'+dinerEmail]);
  await pool.query('DELETE FROM food_partners WHERE email=$1',[partnerEmail]);
  await new Promise(resolve=>server.close(resolve));await pool.end();
 }
});

test('Reject JWT signed with unexpected algorithm',async ()=>{
 const token=jwt.sign({userId:1},process.env.JWT_SECRET,{algorithm:'HS384'});
 let status;const response={status(s){status=s;return this},json(){}};
 await authMiddleware({headers:{authorization:'Bearer '+token}},response,()=>assert.fail('must not authenticate'));
 assert.equal(status,401);
});
