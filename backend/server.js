import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.js';
import portfolioRoutes from './routes/portfolio.js';
import packagesRoutes from './routes/packages.js';
import leadsRoutes from './routes/leads.js';
import feedbackRoutes from './routes/feedback.js';
import adminFeedbackRoutes from './routes/adminFeedback.js';
import { ensureDbConnection } from './utils/connect-to-DB.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration - hardcoded allowed origins with credentials
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.UI_URL, // Production frontend URL
  process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.CORS_ORIGINS?.split(',').includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Enable credentials (cookies, authorization headers)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serverless MongoDB connection middleware
// This ensures DB connection on each request and reuses existing connections
app.use(ensureDbConnection);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'photography-chatbot-backend'
  });
});

// API Routes
app.use('/api', chatRoutes);
app.use('/api', portfolioRoutes);
app.use('/api', packagesRoutes);
app.use('/api', leadsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin/feedback', adminFeedbackRoutes);

// Root endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Photography Studio API',
    version: '1.0.0',
    endpoints: {
      chat: '/api/chat',
      portfolio: '/api/portfolio',
      packages: '/api/packages',
      leads: '/api/leads',
      messages: '/api/messages/:session_id',
      feedback: '/api/feedback',
      adminFeedback: '/api/admin/feedback'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Conditional server listening - only in development/local
// In production (Vercel), the app is exported and used as serverless function
if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    server.close(() => {
      process.exit(0);
    });
  });
}

// Export for Vercel serverless
export default app;
