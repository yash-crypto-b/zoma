import { z } from 'zod';
const email = z.string().max(255).trim().email();
const password = z.string().min(1).refine(x => Buffer.byteLength(x) <= 72);
const name = z.string().trim().max(100);
export const authSchema = z.strictObject({ email, password, name: name.optional() });
export const profileSchema = z.strictObject({ name: name.nullable().optional(), email: email.optional(), currentPassword: password.optional() }).refine(x => Object.keys(x).length > 0);
// These links are rendered by browsers only; the server must never fetch them.
// Restrict destinations nonetheless to prevent access to local services by visitors.
export function publicMediaUrl(value) {
  try {
    const u = new URL(value);
    const host = u.hostname.toLowerCase();
    return u.protocol === 'https:' && !u.username && !u.password && (!u.port || u.port === '443') &&
      host.includes('.') && !host.endsWith('.localhost') && !host.endsWith('.local') &&
      !host.endsWith('.internal') && !host.includes(':') && !/^\d+(\.\d+){3}$/.test(host);
  } catch { return false; }
}
const media = z.string().max(2000).refine(publicMediaUrl);
const optionalText = max => z.string().trim().max(max).nullable().optional();
export const reelSchema = z.strictObject({
  dish_name: optionalText(140), caption: optionalText(2000), location: optionalText(140),
  price: z.union([z.number().min(0).max(100000), z.string().max(12).regex(/^(?:\d+(?:\.\d{1,2})?)?$/), z.null()]).optional(),
  media_type: z.enum(['image','video']).optional(), media_url: media.optional(),
  poster_url: z.union([media, z.literal(''), z.null()]).optional(),
});
export function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: 'invalid request fields' });
    req.body = parsed.data; next();
  };
}

const pagingSchema = z.strictObject({ page: z.string().regex(/^(0|[1-9]\d{0,3})$/).optional() });
export function validatePaging(req, res, next) {
  const parsed = pagingSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'invalid page' });
  req.page = Number(parsed.data.page || 0); next();
}
