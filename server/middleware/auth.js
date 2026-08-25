import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'aether_super_secret_jwt_key_2026';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Check if client provided guest ID in header
    const guestId = req.headers['x-guest-id'] || 'guest_default';
    req.user = { id: guestId, isGuest: true, username: 'Cinematic Explorer' };
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // fallback to guest rather than crashing
    req.user = { id: 'guest_default', isGuest: true, username: 'Cinematic Explorer' };
    next();
  }
}
