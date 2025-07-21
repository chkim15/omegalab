import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export interface CreateCheckoutSessionParams {
  priceId: string;
  userId: string;
  email: string;
  successUrl?: string;
  cancelUrl?: string;
}

export const createCheckoutSession = async ({
  priceId,
  userId,
  email,
  successUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/dashboard?success=true`,
  cancelUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/dashboard?canceled=true`,
}: CreateCheckoutSessionParams) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment', // Changed from 'subscription' to 'payment' for one-time payments
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
      metadata: {
        userId: userId,
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const createPortalSession = async (customerId: string) => {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.BASE_URL || 'http://localhost:3000'}/dashboard`,
    });

    return session;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};

export const handleWebhook = async (payload: string, signature: string) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
}; 