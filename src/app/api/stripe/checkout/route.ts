/**
 * POST /api/stripe/checkout
 * Create Stripe checkout session
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe (will use mock in test mode)
const getStripe = (): Stripe | null => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey || secretKey === 'sk_test_placeholder') {
    // Test mode - return null to use mock
    return null;
  }
  
  return new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia'
  });
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, priceId, successUrl, cancelUrl, customerEmail } = body;

    if (!agentId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, successUrl, cancelUrl' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const priceIdToUse = priceId || process.env.STRIPE_PRICE_ID || 'price_placeholder';

    // If no real Stripe key, return mock response for testing
    if (!stripe) {
      console.log('[Stripe Checkout] Test mode - returning mock session');
      return NextResponse.json({
        sessionId: `cs_test_mock_${Date.now()}`,
        url: `${successUrl}?session_id=cs_test_mock_${Date.now()}&mock=true`,
        testMode: true,
        message: 'Test mode - Stripe not configured. Add STRIPE_SECRET_KEY to enable real payments.'
      });
    }

    // Create real Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceIdToUse,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        agentId
      },
      subscription_data: {
        metadata: {
          agentId
        }
      }
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    
    // If Stripe is not configured, return a helpful message
    if (error.message?.includes('Invalid API Key')) {
      return NextResponse.json({
        error: 'Stripe not configured',
        message: 'Add STRIPE_SECRET_KEY to your environment to enable payments',
        sessionId: `cs_test_fallback_${Date.now()}`,
        url: body.successUrl || '/dashboard?session_id=fallback',
        testMode: true
      });
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}