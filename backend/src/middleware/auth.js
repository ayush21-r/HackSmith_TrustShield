import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT token and extract user info
 * Allows both authenticated and anonymous requests
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Allow anonymous requests (for public complaint submission)
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err.message);
      req.user = null;
      return next();
    }
    req.user = decoded;
    next();
  });
};

/**
 * Middleware to require authentication (HR routes)
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

/**
 * Middleware to require HR role
 */
export const requireHR = (req, res, next) => {
  if (!req.user || req.user.role !== 'HR') {
    return res.status(403).json({ error: 'HR access required' });
  }
  next();
};
