import { authenticate } from './session.js';
const requireRole = role => async (req, res, next) => {
  try {
    const identity = await authenticate(req);
    if (identity.role !== role) return res.status(401).json({ success: false, message: 'invalid login' });
    req.identity = identity;
    if (role === 'user') req.userId = identity.id;
    else req.foodpartner = identity;
    next();
  } catch { return res.status(401).json({ success: false, message: 'invalid or expired token' }); }
};
export const authMiddleware = requireRole('user');
export const authFoodpartnerMiddleware = requireRole('partner');
export async function optionalAuthMiddleware(req, res, next) {
  try { const identity = await authenticate(req); if (identity.role === 'user') req.userId = identity.id; } catch {}
  next();
}
