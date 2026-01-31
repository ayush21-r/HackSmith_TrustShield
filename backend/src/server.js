import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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
