import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';

/**
 * SECURITY: Load environment variables from .env file
 * CRITICAL: Never commit .env to version control
 * CRITICAL: All secrets (DATABASE_URL, JWT_SECRET) come from environment only
 */
dotenv.config();

// Verify critical environment variables are set
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not set in environment variables');
  console.error('   Set DATABASE_URL in .env or Render dashboard');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET not set in environment variables');
  console.error('   Set JWT_SECRET in .env or Render dashboard');
  process.exit(1);
}

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

/**
 * CORS Configuration for production deployment
 * Allows requests from:
 * - Vercel frontend (production)
 * - localhost (development)
 */
const allowedOrigins = [
  'https://trustshield-frontend.vercel.app', // Your Vercel domain - UPDATE THIS
  'http://localhost:3000',                     // Local development
  'http://localhost:3001',                     // Alternative local port
  process.env.FRONTEND_URL                     // From environment variable if set
].filter(Boolean); // Remove undefined values

/**
 * SECURITY: CORS configuration
 * Prevents unauthorized frontend origins from accessing backend
 * DATABASE_URL and JWT_SECRET are never exposed to frontend
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked request from: ${origin}`);
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'TrustShield backend is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🛡️  TrustShield backend running on port ${PORT}`);
  console.log(`📋 Demo credentials:`);
  console.log(`   Employee: employee@example.com / password123`);
  console.log(`   HR: hr@example.com / password123`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
