import { config } from 'dotenv';
import path from 'path';

// Load environment variables before any other imports
config({ path: path.join(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/error';
import routes from './routes';
import { logger } from './utils/logger';
import eventsRoutes from './routes/events';

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: {
    policy: 'same-origin-allow-popups'
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://accounts.google.com", "https://apis.google.com", "https://github.com"],
      connectSrc: ["'self'", "https://api.github.com", "https://github.com", "https://accounts.google.com", "https://www.googleapis.com", "https://oauth2.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "https://avatars.githubusercontent.com", "https://lh3.googleusercontent.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://github.githubassets.com", "https://accounts.google.com"],
      fontSrc: ["'self'", "https://github.githubassets.com", "data:", "*"],
      formAction: ["'self'", "https://github.com", "https://accounts.google.com"],
      frameAncestors: ["'none'"]
    }
  }
}));
app.use(compression());

// Handle raw body for Stripe webhooks
app.use('/api/subscription/webhook', express.raw({ type: 'application/json' }));

// Parse JSON bodies for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check route
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy'
  });
});

// API Routes
app.use('/api', routes);
app.use('/api/events', eventsRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
}); 