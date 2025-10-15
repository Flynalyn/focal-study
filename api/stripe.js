// api/stripe.js - Stripe Payment Endpoints
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Focal Study Premium subscription (annual)
const PREMIUM_PRODUCT_ID = 'prod_TEn6LZlqs1umId';
const PREMIUM_PRICE_ID = 'price_1SIJVrQ6DPO5XOJvlmdFq6ra';

/**
 * Create a checkout session for Focal Study premium subscription
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
        productId: PREMIUM_PRODUCT_ID,
        subscriptionType: 'annual',
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}

/**
 * Create a billing portal session for subscription management
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createBillingPortalSession(req, res) {
  try {
    const { customerId } = req.body;
    
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.CLIENT_URL}/premium`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    res.status(500).json({ error: 'Failed to create billing portal session' });
  }
}

/**
 * Handle Stripe webhooks for subscription events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Handle successful subscription creation
      console.log('Checkout session completed:', session.id);
      break;
    case 'customer.subscription.updated':
      const subscriptionUpdated = event.data.object;
      console.log('Subscription updated:', subscriptionUpdated.id);
      break;
    case 'customer.subscription.deleted':
      const subscriptionDeleted = event.data.object;
      console.log('Subscription cancelled:', subscriptionDeleted.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}

module.exports = {
  createCheckoutSession,
  createBillingPortalSession,
  handleWebhook,
};
