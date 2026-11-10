import '../env.js';
import pg from 'pg';
const connectionString = process.env.DATABASE_URL?.trim();
const production = process.env.NODE_ENV === 'production';
const url = connectionString ? new URL(connectionString) : null;
// URL SSL options can override pg's explicit TLS configuration: reject them.
if (url && ['sslmode', 'sslcert', 'sslkey', 'sslrootcert', 'ssl'].some(key => url.searchParams.has(key))) {
  throw new Error('Remove SSL parameters from DATABASE_URL; configure DB_SSL and DB_SSL_CA instead');
}
const host = url?.hostname || process.env.DB_HOST || 'localhost';
const local = ['localhost', '127.0.0.1', '[::1]', '::1'].includes(host);
if (!local && process.env.DB_SSL === 'false') throw new Error('Remote database connections require verified TLS');
const tls = production || !local || process.env.DB_SSL === 'true';
const poolConfig = {
  ...(connectionString ? { connectionString } : {
    user: process.env.DB_USER, host, database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD, port: Number(process.env.DB_PORT) || 5432,
  }),
  ssl: tls ? { rejectUnauthorized: true, ...(process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA.replaceAll('\\n', '\n') } : {}) } : false,
  connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000,
  statement_timeout: 10000, query_timeout: 12000, max: 10,
};
export const pool = new pg.Pool(poolConfig);
pool.on('error', () => console.error('Unexpected database pool error'));
export const query = (text, params) => pool.query(text, params);
export default pool;
