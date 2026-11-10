import jwt from 'jsonwebtoken';
import pool from '../DB/db.js';
import { securityLog } from './security.js';
const invalidSession = () => Object.assign(new Error('invalid session'), { name: 'InvalidSession' });
export const cookieOptions = () => ({ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 86400000 });
export async function issueSession(res, payload) {
  const { rows } = await pool.query('SELECT EXTRACT(EPOCH FROM clock_timestamp()) * 1000 AS now');
  const token = jwt.sign({ ...payload, authTime: Number(rows[0].now) }, process.env.JWT_SECRET, { expiresIn: '1d', algorithm: 'HS256', issuer: 'zomareel', audience: 'zomareel-api' });
  res.cookie('token', token, cookieOptions());
  securityLog('session_issued', { role: payload.userId ? 'user' : 'partner' });
  return token;
}
export function readToken(req) {
  if (req.headers.authorization) return /^Bearer ([^ ]+)$/.exec(req.headers.authorization)?.[1];
  try { return decodeURIComponent(/(?:^|;\s*)token=([^;]*)/.exec(req.headers.cookie || '')?.[1] || ''); } catch { return ''; }
}
export async function authenticate(req) {
  const token = readToken(req);
  const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'], issuer: 'zomareel', audience: 'zomareel-api' });
  const user = Number.isSafeInteger(decoded.userId) && decoded.userId > 0;
  const partner = Number.isSafeInteger(decoded.partnerId) && decoded.partnerId > 0;
  if (user === partner || !Number.isFinite(decoded.authTime)) throw invalidSession();
  const table = user ? 'users' : 'food_partners'; // fixed identifiers, never request input
  const { rows } = await pool.query(`SELECT id, name, email, EXTRACT(EPOCH FROM updated_at AT TIME ZONE current_setting('TimeZone')) * 1000 AS cutoff FROM ${table} WHERE id = $1`, [user ? decoded.userId : decoded.partnerId]);
  if (!rows[0] || Number(rows[0].cutoff) > decoded.authTime) throw invalidSession();
  return { ...rows[0], role: user ? 'user' : 'partner' };
}
