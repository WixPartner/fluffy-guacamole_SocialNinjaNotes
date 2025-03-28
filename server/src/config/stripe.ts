import Stripe from 'stripe';
import { config } from 'dotenv';
import { logger } from '../utils/logger';

// Load environment variables
config();

// Debug log for environment variables
logger.info('Stripe Config - Environment variables loaded');
logger.info(`STRIPE_SECRET_KEY exists: ${!!process.env.STRIPE_SECRET_KEY}`);

if (!process.env.STRIPE_SECRET_KEY) {
  logger.error('STRIPE_SECRET_KEY is missing in environment variables');
  throw new Error('STRIPE_SECRET_KEY must be defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
});

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro',
  TEAM: 'team',
} as const;

export const STRIPE_PRICES = {
  PRO: process.env.STRIPE_PRICE_PRO,
  TEAM: process.env.STRIPE_PRICE_TEAM,
} as const;

export const SUBSCRIPTION_FEATURES = {
  [SUBSCRIPTION_TIERS.FREE]: {
    maxPages: 5,
    maxStorage: 100 * 1024 * 1024, // 100MB
    aiCredits: 10,
    collaborators: 0,
    allowedBlockTypes: [
      'text',
      'bullet-list',
      'number-list',
      'todo-list',
      'heading1',
      'heading2',
      'heading3',
      'picture'
    ]
  },
  [SUBSCRIPTION_TIERS.PRO]: {
    maxPages: 100,
    maxStorage: 5 * 1024 * 1024 * 1024, // 5GB
    aiCredits: 100,
    collaborators: 0,
    allowedBlockTypes: [
      'text',
      'bullet-list',
      'number-list',
      'todo-list',
      'toggle-list',
      'heading1',
      'heading2',
      'heading3',
      'picture',
      'code',
      'table',
      'file',
      'equation'
    ]
  },
  [SUBSCRIPTION_TIERS.TEAM]: {
    maxPages: 1000,
    maxStorage: 20 * 1024 * 1024 * 1024, // 20GB
    aiCredits: 500,
    collaborators: 10,
    allowedBlockTypes: [
      'text',
      'bullet-list',
      'number-list',
      'todo-list',
      'toggle-list',
      'heading1',
      'heading2',
      'heading3',
      'picture',
      'code',
      'table',
      'schedule',
      'file',
      'equation'
    ]
  },
} as const; 