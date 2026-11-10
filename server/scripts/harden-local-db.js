import '../src/env.js';
import fs from 'node:fs';
import crypto from 'node:crypto';
import pg from 'pg';
import pool from '../src/DB/db.js';
const quote = s => '"' + s.replaceAll('"', '""') + '"';
const password = crypto.randomBytes(48).toString('hex');
let client;
try {
 client = await pool.connect();
 const { rows: [info] } = await client.query('SELECT current_database() AS db, current_user AS owner');
 if (info.db !== 'zomareel') throw new Error('Expected local zomareel database');
 const existing = await client.query("SELECT 1 FROM pg_roles WHERE rolname='zomareel_app'");
 if (existing.rowCount) throw new Error('App role already exists; no credentials were changed');
 await client.query('BEGIN');
 await client.query("CREATE ROLE zomareel_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD '" + password + "'");
 await client.query('GRANT CONNECT ON DATABASE ' + quote(info.db) + ' TO zomareel_app');
 await client.query('REVOKE ALL ON DATABASE ' + quote(info.db) + ' FROM PUBLIC');
 await client.query('REVOKE CREATE ON SCHEMA public FROM PUBLIC');
 await client.query('GRANT USAGE ON SCHEMA public TO zomareel_app');
 await client.query('GRANT SELECT, INSERT, UPDATE, DELETE ON users, food_partners, reels, reel_likes TO zomareel_app');
 await client.query('GRANT USAGE, SELECT ON SEQUENCE users_id_seq, food_partners_id_seq, reels_id_seq TO zomareel_app');
 const probe = new pg.Client({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT), database: info.db, user: 'zomareel_app', password, connectionTimeoutMillis: 5000 });
 // Commit role and grants before connecting through a new session.
 await client.query('COMMIT');
 try { await probe.connect(); await probe.query('SELECT id FROM users LIMIT 0'); } finally { await probe.end(); }
 const file = new URL('../.env',import.meta.url);
 let env = fs.readFileSync(file,'utf8');
 env = env.replace(/^DB_USER=.*$/m, 'DB_USER=zomareel_app').replace(/^DB_PASSWORD=.*$/m,'DB_PASSWORD=' + password);
 fs.writeFileSync(file,env);
 console.log('Restricted app role created and server/.env updated; no credentials printed');
} catch(e) { if(client) await client.query('ROLLBACK').catch(()=>{}); console.error('Hardening failed:',e.code || e.message); process.exitCode=1; }
finally {client?.release(); await pool.end();}
