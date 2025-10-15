// api/stripe.js - Stripe Payment Endpoints
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Premium subscription price (monthly)
const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID;

/**
 * Create a checkout session for premium subscription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createCheckoutSession(req, res) {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'User ID and email are required' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: PREMIUM_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/premium/cancel`,
      customer_email: email,
      client_reference_id: userId,
      metadata: {
        userId: userId,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}

/**
 * Create a portal session for subscription management
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createPortalSession(req, res) {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.CLIENT_URL}/settings`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
}

/**
 * Webhook handler for Stripe events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleCheckoutComplete(session);
      break;

    case 'customer.subscription.updated':
      const subscriptionUpdated = event.data.object;
      await handleSubscriptionUpdate(subscriptionUpdated);
      break;

    case 'customer.subscription.deleted':
      const subscriptionDeleted = event.data.object;
      await handleSubscriptionCanceled(subscriptionDeleted);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}

/**
 * Handle completed checkout session
 * Updates user to premium status
 */
async function handleCheckoutComplete(session) {
  const userId = session.client_reference_id || session.metadata.userId;
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  // Update user in database with premium status
  // This would typically interact with your user database
  console.log(`User ${userId} upgraded to premium`);
  console.log(`Customer ID: ${customerId}, Subscription ID: ${subscriptionId}`);
  
  // TODO: Update user record in database:
  // - Set isPremium: true
  // - Store customerId
  // - Store subscriptionId
  // - Set premiumSince: new Date()
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdate(subscription) {
  const customerId = subscription.customer;
  const status = subscription.status;

  console.log(`Subscription updated for customer ${customerId}: ${status}`);
  
  // TODO: Update user subscription status in database
  // - Update subscription status
  // - Handle trial periods, past_due, etc.
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCanceled(subscription) {
  const customerId = subscription.customer;

  console.log(`Subscription canceled for customer ${customerId}`);
  
  // TODO: Update user record in database:
  // - Set isPremium: false
  // - Keep customerId for potential reactivation
  // - Set canceledAt: new Date()
}

/**
 * Check if user has active premium subscription
 * @param {string} userId - User ID
 * @returns {Object} Premium status information
 */
async function checkPremiumStatus(req, res) {
  try {
    const { userId } = req.params;

    // TODO: Query database for user's premium status
    // This is a placeholder response
    const isPremium = false; // Query from database
    const subscriptionId = null; // Get from database

    if (isPremium && subscriptionId) {
      // Verify with Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      return res.json({
        isPremium: subscription.status === 'active',
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
      });
    }

    res.json({ isPremium: false });
  } catch (error) {
    console.error('Error checking premium status:', error);
    res.status(500).json({ error: 'Failed to check premium status' });
  }
}

module.exports = {
  createCheckoutSession,
  createPortalSession,
  handleWebhook,
  checkPremiumStatus,
};
