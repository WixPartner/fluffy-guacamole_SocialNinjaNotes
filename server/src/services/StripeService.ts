import { stripe, SUBSCRIPTION_TIERS } from '../config/stripe';
import { User } from '../models/User';
import { Payment } from '../models/Payment';
import { Types } from 'mongoose';
import { logger } from '../utils/logger';

export class StripeService {
  static async createCustomer(userId: Types.ObjectId, email: string, name: string) {
    try {
      logger.info(`Creating Stripe customer for user ${userId}`);
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId: userId.toString(),
        },
      });
      
      await User.findByIdAndUpdate(userId, {
        'subscription.stripeCustomerId': customer.id,
      });

      logger.info(`Stripe customer created successfully: ${customer.id}`);
      return customer;
    } catch (error) {
      logger.error(`Error creating Stripe customer: ${error}`);
      throw error;
    }
  }

  static async createSubscription(userId: Types.ObjectId, priceId: string) {
    try {
      logger.info(`Creating subscription for user ${userId} with price ${priceId}`);
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      let { stripeCustomerId } = user.subscription;

      if (!stripeCustomerId) {
        const customer = await this.createCustomer(userId, user.email, user.name);
        stripeCustomerId = customer.id;
      }

      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      await User.findByIdAndUpdate(userId, {
        'subscription.stripeSubscriptionId': subscription.id,
        'subscription.tier': priceId === process.env.STRIPE_PRICE_TEAM ? SUBSCRIPTION_TIERS.TEAM : SUBSCRIPTION_TIERS.PRO,
        'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
      });

      logger.info(`Subscription created successfully: ${subscription.id}`);
      return subscription;
    } catch (error) {
      logger.error(`Error creating subscription: ${error}`);
      throw error;
    }
  }

  static async cancelSubscription(userId: Types.ObjectId) {
    try {
      logger.info(`Cancelling subscription for user ${userId}`);
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const { stripeSubscriptionId } = user.subscription;
      if (!stripeSubscriptionId) throw new Error('No active subscription');

      await stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      await User.findByIdAndUpdate(userId, {
        'subscription.cancelAtPeriodEnd': true,
      });

      logger.info(`Subscription cancelled successfully: ${stripeSubscriptionId}`);
    } catch (error) {
      logger.error(`Error cancelling subscription: ${error}`);
      throw error;
    }
  }

  static async reactivateSubscription(userId: Types.ObjectId) {
    try {
      logger.info(`Reactivating subscription for user ${userId}`);
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const { stripeSubscriptionId } = user.subscription;
      if (!stripeSubscriptionId) throw new Error('No subscription to reactivate');

      await stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: false,
      });

      await User.findByIdAndUpdate(userId, {
        'subscription.cancelAtPeriodEnd': false,
      });

      logger.info(`Subscription reactivated successfully: ${stripeSubscriptionId}`);
    } catch (error) {
      logger.error(`Error reactivating subscription: ${error}`);
      throw error;
    }
  }

  static async recordPayment(invoice: any, status: 'succeeded' | 'failed' | 'pending' = 'succeeded') {
    try {
      // Check if payment already exists
      const existingPayment = await Payment.findOne({ stripeInvoiceId: invoice.id });
      if (existingPayment) {
        logger.info(`Payment already recorded for invoice: ${invoice.id}`);
        return existingPayment;
      }

      const user = await User.findOne({
        'subscription.stripeSubscriptionId': invoice.subscription,
      });

      if (!user) {
        logger.warn(`No user found for subscription: ${invoice.subscription}`);
        return;
      }

      interface PaymentMethodDetails {
        type: string;
        last4: string;
        brand?: string | undefined;
      }

      let paymentMethodDetails: PaymentMethodDetails = {
        type: 'unknown',
        last4: '0000'
      };

      // Only try to retrieve payment method if it exists
      const paymentMethodId = invoice.payment_intent?.payment_method || invoice.default_payment_method;
      if (paymentMethodId) {
        try {
          const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
          paymentMethodDetails = {
            type: paymentMethod.type,
            last4: paymentMethod.card?.last4 || '0000',
            brand: paymentMethod.card?.brand
          };
        } catch (error) {
          logger.warn(`Could not retrieve payment method: ${error}`);
        }
      }

      const payment = new Payment({
        userId: user._id,
        stripeCustomerId: invoice.customer,
        stripeSubscriptionId: invoice.subscription,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status,
        paymentMethod: paymentMethodDetails,
        billingPeriod: {
          start: new Date(invoice.lines.data[0].period.start * 1000),
          end: new Date(invoice.lines.data[0].period.end * 1000),
        },
      });

      await payment.save();
      logger.info(`Payment recorded successfully: ${payment.id}`);
      return payment;
    } catch (error) {
      logger.error(`Error recording payment: ${error}`);
      throw error;
    }
  }

  static async handleWebhook(event: any) {
    try {
      logger.info(`Processing webhook event: ${event.type}`);
      
      switch (event.type) {
        case 'customer.created': {
          const customer = event.data.object;
          logger.info(`New customer created: ${customer.id}`);
          break;
        }

        case 'checkout.session.completed': {
          const session = event.data.object;
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const userId = session.metadata.userId || subscription.metadata.userId;
          
          if (!userId) {
            logger.warn(`No userId found in session or subscription metadata: ${session.id}`);
            return;
          }

          // Update user's subscription details
          await User.findByIdAndUpdate(userId, {
            'subscription.stripeSubscriptionId': subscription.id,
            'subscription.tier': subscription.items.data[0].price.id === process.env.STRIPE_PRICE_TEAM 
              ? SUBSCRIPTION_TIERS.TEAM 
              : SUBSCRIPTION_TIERS.PRO,
            'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
            'subscription.status': 'active'
          });
          
          logger.info(`Subscription activated for user: ${userId}`);
          break;
        }

        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          const userId = subscription.metadata.userId;
          
          if (!userId) {
            logger.warn(`No userId found in subscription metadata: ${subscription.id}`);
            return;
          }

          await User.findByIdAndUpdate(userId, {
            'subscription.stripeSubscriptionId': subscription.id,
            'subscription.tier': subscription.items.data[0].price.id === process.env.STRIPE_PRICE_TEAM 
              ? SUBSCRIPTION_TIERS.TEAM 
              : SUBSCRIPTION_TIERS.PRO,
            'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
            'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
            'subscription.status': subscription.status
          });
          
          logger.info(`Subscription ${event.type === 'customer.subscription.created' ? 'created' : 'updated'} for user: ${userId}`);
          break;
        }

        case 'invoice.payment_succeeded':
        case 'invoice.paid': {
          const invoice = event.data.object;
          
          // Only handle subscription invoices
          if (!invoice.subscription) {
            logger.info(`Skipping non-subscription invoice: ${invoice.id}`);
            return;
          }

          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          const userId = subscription.metadata.userId;

          if (!userId) {
            logger.warn(`No userId found in subscription metadata: ${subscription.id}`);
            return;
          }

          // Update subscription status
          await User.findByIdAndUpdate(userId, {
            'subscription.status': 'active',
            'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000)
          });

          try {
            // Record the payment - this will handle duplicates internally
            await this.recordPayment(invoice, 'succeeded');
            logger.info(`Payment processed for subscription: ${subscription.id}`);
          } catch (error) {
            // Log but don't throw error for payment recording issues
            logger.error(`Error recording payment (non-fatal): ${error}`);
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object;
          
          if (!invoice.subscription) return;

          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          const userId = subscription.metadata.userId;

          if (!userId) {
            logger.warn(`No userId found in subscription metadata: ${subscription.id}`);
            return;
          }

          // Update subscription status
          await User.findByIdAndUpdate(userId, {
            'subscription.status': 'past_due'
          });

          // Record the failed payment
          await this.recordPayment(invoice, 'failed');
          logger.warn(`Payment failed for subscription: ${subscription.id}`);
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          const userId = subscription.metadata.userId;
          
          if (!userId) {
            logger.warn(`No userId found in subscription metadata: ${subscription.id}`);
            return;
          }

          // Reset to free tier
          await User.findByIdAndUpdate(userId, {
            'subscription.tier': SUBSCRIPTION_TIERS.FREE,
            'subscription.stripeSubscriptionId': null,
            'subscription.currentPeriodEnd': null,
            'subscription.cancelAtPeriodEnd': false,
            'subscription.status': 'inactive'
          });
          
          logger.info(`Subscription deleted for user: ${userId}`);
          break;
        }

        // Handle payment intent events
        case 'payment_intent.succeeded':
        case 'payment_intent.created':
        case 'payment_method.attached':
        case 'charge.succeeded': {
          // These events are informational and don't require specific handling
          logger.info(`Payment-related event received: ${event.type}`);
          break;
        }

        // Handle invoice events
        case 'invoice.created':
        case 'invoice.finalized':
        case 'invoice.updated': {
          // These events are informational and don't require specific handling
          logger.info(`Invoice-related event received: ${event.type}`);
          break;
        }

        default:
          logger.info(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      logger.error(`Error handling webhook: ${error}`);
      throw error;
    }
  }

  static async getPaymentHistory(userId: Types.ObjectId) {
    try {
      const payments = await Payment.find({ userId })
        .sort({ createdAt: -1 })
        .lean();
      
      return payments;
    } catch (error) {
      logger.error(`Error fetching payment history: ${error}`);
      throw error;
    }
  }

  static async getLatestPayment(userId: Types.ObjectId) {
    try {
      const payment = await Payment.findOne({ userId })
        .sort({ createdAt: -1 })
        .lean();
      
      return payment;
    } catch (error) {
      logger.error(`Error fetching latest payment: ${error}`);
      throw error;
    }
  }
} 