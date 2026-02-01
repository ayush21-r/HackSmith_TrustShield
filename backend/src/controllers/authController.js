import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logAuthEvent } from '../utils/authLogger.js';

const prisma = new PrismaClient();

// Hardcoded demo users
const DEMO_USERS = {
  'employee@example.com': { id: 1, name: 'John Doe', role: 'EMPLOYEE', password: 'password123' },
  'hr@example.com': { id: 2, name: 'Jane Smith', role: 'HR', password: 'password123' }
};

/**
 * Login endpoint - returns JWT token
 * For hackathon demo, using hardcoded credentials
 * LOGS: All successful logins to backend-only auth log
 */
export const login = (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.warn('⚠️  Login attempt missing email or password');
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = DEMO_USERS[email];

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      console.warn(`⚠️  Failed login attempt for: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // LOG: Record successful login to backend-only auth log
    logAuthEvent('LOGIN', email, user.role);
    
    console.log(`✅ Successful login: ${email} (${user.role})`);

    res.json({
      token,
      user: { id: user.id, email, role: user.role, name: user.name }
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
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

/**
 * Signup endpoint - creates new user account
 * LOGS: All successful signups to backend-only auth log
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (!['EMPLOYEE', 'HR'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // In production, hash this with bcrypt
        role
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // LOG: Record successful signup to backend-only auth log
    logAuthEvent('SIGNUP', email, role);

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
};
