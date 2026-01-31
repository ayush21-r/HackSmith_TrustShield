import jwt from 'jsonwebtoken';

// Hardcoded demo users
const DEMO_USERS = {
  'employee@example.com': { id: 1, name: 'John Doe', role: 'EMPLOYEE', password: 'password123' },
  'hr@example.com': { id: 2, name: 'Jane Smith', role: 'HR', password: 'password123' }
};

/**
 * Login endpoint - returns JWT token
 * For hackathon demo, using hardcoded credentials
 */
export const login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = DEMO_USERS[email];

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, email, role: user.role, name: user.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get current user from token
 */
export const getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.user });
};
