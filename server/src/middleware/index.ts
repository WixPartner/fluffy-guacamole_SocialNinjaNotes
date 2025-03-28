import { Express, json, urlencoded } from 'express';
import { auth } from './auth';
import { errorHandler } from './error';

export const setupMiddleware = (app: Express): void => {
  // Body parsing middleware
  app.use(json());
  app.use(urlencoded({ extended: true }));

  // Authentication middleware
  app.use(auth);

  // Health check middleware
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK' });
  });

  // Error handling middleware (should be last)
  app.use(errorHandler);
}; 