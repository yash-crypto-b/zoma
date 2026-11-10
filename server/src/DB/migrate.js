import '../env.js';
// Owner credentials are supplied explicitly for this one-off command.
if (!process.env.DB_MIGRATION_URL) throw new Error('Set DB_MIGRATION_URL to the schema-owner connection URL for migrations');
process.env.DATABASE_URL = process.env.DB_MIGRATION_URL;
const { default: pool } = await import('./db.js');
try {
 const {default: users} = await import('../models/user.models.js');
 const {default: partners} = await import('../models/foodpartner.models.js');
 const {default: reels} = await import('../models/reel.models.js');
 await users(); await partners(); await reels();
 console.log('Schema initialized');
} catch (e) { console.error('Migration failed:', e.code || e.name); process.exitCode=1; }
finally { await pool.end(); }
