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
 * Dynamically builds allowed origins from environment and hardcoded values
 */
const allowedOrigins = [
  // Hardcoded for local development
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  
  // Default Vercel domain pattern
  'https://trustshield-frontend.vercel.app',
  
  // Add from environment variable if set
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  
  // Support multiple Vercel preview deployments
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  
  // Wildcard for Vercel preview deployments (*.vercel.app)
  // Note: Will be checked with regex below
].filter(Boolean);

/**
 * SECURITY: CORS configuration
 * - Prevents unauthorized frontend origins from accessing backend
 * - DATABASE_URL and JWT_SECRET are never exposed to frontend
 * - Supports local development, production Vercel, and preview deployments
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, mobile apps, server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check for Vercel preview deployments (*.vercel.app pattern)
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    // Origin not allowed
    console.warn(`⚠️ CORS blocked request from: ${origin}`);
    console.warn(`📝 Allowed origins: ${allowedOrigins.join(', ')}`);
    return callback(new Error('CORS not allowed for this origin'));
  },
  credentials: false,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-JSON-Response'],
  optionsSuccessStatus: 200 // For legacy browsers
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

// Initialize database (run migrations and seed if needed)
async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database...');
    
    // Check if users exist
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      console.log('📝 No users found, seeding database...');
      
      // Create demo users
      await prisma.user.create({
        data: {
          id: 1,
          email: 'employee@example.com',
          password: 'password123',
          name: 'John Doe',
          role: 'EMPLOYEE'
        }
      });
      
      await prisma.user.create({
        data: {
          id: 2,
          email: 'hr@example.com',
          password: 'password123',
          name: 'Jane Smith',
          role: 'HR'
        }
      });
      
      console.log('✅ Database seeded with demo users');
    } else {
      console.log(`✅ Database ready (${userCount} users found)`);
    }
  } catch (error) {
    console.error('⚠️ Database initialization warning:', error.message);
    // Don't fail startup, the app can still work
  }
}

// Start server
async function start() {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`🛡️  TrustShield backend running on port ${PORT}`);
    console.log(`📋 Demo credentials:`);
    console.log(`   Employee: employee@example.com / password123`);
    console.log(`   HR: hr@example.com / password123`);
  });
}

start();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
