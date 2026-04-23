import Stripe from 'stripe';

// Initialize Stripe with the secret key from environment
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('⚠️ STRIPE_SECRET_KEY not set. Stripe features will be disabled.');
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2024-04-10',
      typescript: true,
    })
  : null;

// Configuration constants
export const STRIPE_CONFIG = {
  // Price ID for the base subscription
  priceId: process.env.STRIPE_PRICE_ID || '',
  
  // Metered billing event name
  meterEventName: process.env.STRIPE_METER_EVENT_NAME || 'agent_usage',
  
  // Usage tiers (requests per month)
  tiers: {
    tier1: {
      limit: parseInt(process.env.STRIPE_USAGE_TIER_1_LIMIT || '10000'),
      cost: parseFloat(process.env.STRIPE_USAGE_TIER_1_COST || '0'),
    },
    tier2: {
      limit: parseInt(process.env.STRIPE_USAGE_TIER_2_LIMIT || '50000'),
      cost: parseFloat(process.env.STRIPE_USAGE_TIER_2_COST || '0.001'),
    },
    tier3: {
      limit: Infinity,
      cost: parseFloat(process.env.STRIPE_USAGE_TIER_3_COST || '0.0005'),
    },
  },
  
  // Base monthly fee
  baseMonthlyFee: 49,
  
  // Currency
  currency: 'usd',
};

/**
 * Create a Stripe Checkout Session for agent purchase
 */
export async function createCheckoutSession({
  agentId,
  agentName,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  agentId: string;
  agentName: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: customerEmail,
    line_items: [
      {
        price: STRIPE_CONFIG.priceId,
        quantity: 1,
      },
    ],
    metadata: {
      agentId,
      agentName,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: {
        agentId,
        agentName,
      },
    },
  });

  return session;
}

/**
 * Create a Stripe Customer Portal Session
 */
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Get or create a Stripe customer
 */
export async function getOrCreateCustomer({
  email,
  name,
  metadata,
}: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  // Try to find existing customer
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata,
  });

  return customer;
}

/**
 * Record usage for metered billing
 */
export async function recordUsage({
  customerId,
  agentId,
  requestCount,
}: {
  customerId: string;
  agentId: string;
  requestCount: number;
}) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  // Get customer to find their subscriptions
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  
  if (!customer.subscriptions?.data?.length) {
    console.log('No active subscription found for customer');
    return;
  }

  // Report usage to Stripe Metered Billing
  // Note: This requires a metered subscription setup in Stripe
  for (const subscription of customer.subscriptions.data) {
    if (subscription.status === 'active') {
      await stripe.subscriptionItems.createUsageRecord(
        subscription.items.data[0].id,
        {
          quantity: requestCount,
          timestamp: Math.floor(Date.now() / 1000),
          action: 'increment',
        },
        {
          idempotencyKey: `${agentId}-${Date.now()}`,
        }
      );
    }
  }
}

/**
 * Calculate cost based on usage tier
 */
export function calculateUsageCost(requestCount: number): number {
  const { tiers } = STRIPE_CONFIG;
  
  if (requestCount <= tiers.tier1.limit) {
    return tiers.tier1.cost * requestCount;
  } else if (requestCount <= tiers.tier2.limit) {
    const tier1Cost = tiers.tier1.cost * tiers.tier1.limit;
    const tier2Cost = tiers.tier2.cost * (requestCount - tiers.tier1.limit);
    return tier1Cost + tier2Cost;
  } else {
    const tier1Cost = tiers.tier1.cost * tiers.tier1.limit;
    const tier2Cost = tiers.tier2.cost * (tiers.tier2.limit - tiers.tier1.limit);
    const tier3Cost = tiers.tier3.cost * (requestCount - tiers.tier2.limit);
    return tier1Cost + tier2Cost + tier3Cost;
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    webhookSecret
  );
}

/**
 * Get subscription status
 */
export async function getSubscriptionStatus(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately = false
): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId);
  } else {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
}

/**
 * Check if running in test mode
 */
export function isTestMode(): boolean {
  const key = process.env.STRIPE_SECRET_KEY || '';
  return key.startsWith('sk_test_');
}

/**
 * Get Stripe publishable key for frontend
 */
export function getPublishableKey(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
}