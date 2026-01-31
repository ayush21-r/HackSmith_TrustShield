import express from 'express';
import { login, getCurrentUser } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Login with email and password
 * Demo credentials: employee@example.com / hr@example.com (password: password123)
 */
router.post('/login', login);

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', requireAuth, getCurrentUser);

export default router;
