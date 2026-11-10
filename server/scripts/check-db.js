import pool from '../src/DB/db.js';
let client;
try {
 client = await pool.connect();
 const {rows:[role]} = await client.query('SELECT rolsuper, rolcreatedb, rolcreaterole, rolreplication, rolbypassrls FROM pg_roles WHERE rolname=current_user');
 if (Object.values(role).some(Boolean)) throw new Error('App database role has excessive privileges');
 const {rows:[priv]} = await client.query("SELECT has_schema_privilege(current_user,'public','CREATE') AS can_create");
 if(priv.can_create) throw new Error('App role can create schema objects');
 await client.query('BEGIN');
 const email='db-check-'+Date.now()+'@example.test';
 const {rows:[user]}=await client.query('INSERT INTO users(name,email,password) VALUES ($1,$2,$3) RETURNING id',['Database check',email,'not-a-real-account']);
 await client.query('UPDATE users SET name=$1 WHERE id=$2',['Updated',user.id]);
 const {rows:[partner]}=await client.query('INSERT INTO food_partners(name,email,password) VALUES ($1,$2,$3) RETURNING id',['Check kitchen',email,'not-a-real-account']);
 const {rows:[reel]}=await client.query('INSERT INTO reels(food_partner_id,media_url) VALUES($1,$2) RETURNING id',[partner.id,'https://example.test/'+Date.now()]);
 await client.query('INSERT INTO reel_likes(user_id,reel_id) VALUES($1,$2)',[user.id,reel.id]);
 await client.query('DELETE FROM reels WHERE id=$1',[reel.id]);
 const likes=await client.query('SELECT 1 FROM reel_likes WHERE reel_id=$1',[reel.id]);
 if(likes.rowCount) throw new Error('Foreign-key cascade failed');
 console.log('PASS: connectivity, restricted role, read/write/update/delete and foreign-key cascade (rolled back)');
} catch(e){console.error('Database check failed:',e.code || e.message);process.exitCode=1;}
finally {if(client){await client.query('ROLLBACK').catch(()=>{});client.release();}await pool.end();}
