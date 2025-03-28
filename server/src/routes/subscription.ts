import express from 'express';
import { Types } from 'mongoose';
import { StripeService } from '../services/StripeService';
import { stripe, STRIPE_PRICES, SUBSCRIPTION_FEATURES} from '../config/stripe';
import { auth } from '../middleware/auth';
import { IUser } from '../models/User';

const router = express.Router();

// Create a subscription
router.post('/', auth, async (req, res) => {
  try {
    const user = req.user as IUser & { _id: Types.ObjectId };
    const { priceId } = req.body;
    
    if (!priceId || ![STRIPE_PRICES.PRO, STRIPE_PRICES.TEAM].includes(priceId)) {
      return res.status(400).json({ message: 'Invalid price ID' });
    }

    // Get or create customer
    let { stripeCustomerId } = user.subscription;
    if (!stripeCustomerId) {
      const customer = await StripeService.createCustomer(user._id, user.email, user.name);
      stripeCustomerId = customer.id;
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      subscription_data: {
        metadata: {
          userId: user._id.toString()
        }
      },
      success_url: `${process.env.CLIENT_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.CLIENT_URL}/plans?subscription=cancelled`,
      metadata: {
        userId: user._id.toString()
      }
    });

    return res.json({
      sessionId: session.id
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

// Cancel subscription
router.post('/cancel', auth, async (req, res) => {
  try {
    const user = req.user as IUser & { _id: Types.ObjectId };
    await StripeService.cancelSubscription(user._id);
    return res.json({ message: 'Subscription cancelled successfully' });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

// Reactivate subscription
router.post('/reactivate', auth, async (req, res) => {
  try {
    const user = req.user as IUser & { _id: Types.ObjectId };
    await StripeService.reactivateSubscription(user._id);
    return res.json({ message: 'Subscription reactivated successfully' });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

// Get subscription status
router.get('/status', auth, async (req, res) => {
  try {
    const user = req.user as IUser & { _id: Types.ObjectId };
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tier = user.subscription.tier as keyof typeof SUBSCRIPTION_FEATURES;
    
    return res.json({
      subscription: user.subscription,
      features: SUBSCRIPTION_FEATURES[tier]
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

// Get payment history
router.get('/payments', auth, async (req, res) => {
  try {
    const user = req.user as IUser & { _id: Types.ObjectId };
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const payments = await StripeService.getPaymentHistory(user._id);
    return res.json(payments);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

// Get latest payment
router.get('/payments/latest', auth, async (req, res) => {
  try {
    const user = req.user as IUser & { _id: Types.ObjectId };
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const payment = await StripeService.getLatestPayment(user._id);
    return res.json(payment);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).json({ message: 'Webhook signature missing' });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    await StripeService.handleWebhook(event);
    return res.json({ received: true });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

export default router; 