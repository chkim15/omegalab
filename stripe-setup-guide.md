# Stripe Test Mode Setup Guide

## Step 1: Create Product
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Products** in the left sidebar
3. Click **Add product**
4. Fill in:
   - **Name**: OmegaLab Pro
   - **Description**: Premium math tutoring with unlimited questions
   - **Images**: (optional)
5. Click **Save product**

## Step 2: Create Price
1. In your OmegaLab Pro product page
2. Click **Add price**
3. Fill in:
   - **Price**: $20.00
   - **Currency**: USD
   - **Billing model**: Standard pricing
   - **Price type**: Recurring price
   - **Billing period**: Monthly
4. Click **Save price**
5. **Copy the Price ID** (starts with `price_`)

## Step 3: Set Up Webhooks
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
   - For local development: `http://localhost:3000/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. **Copy the Webhook signing secret** (starts with `whsec_`)

## Step 4: Update Environment Variables
Add these to your `.env` file:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
BASE_URL=http://localhost:3000
```

## Step 5: Update Price ID in Code
Replace the placeholder price ID in `dashboard.tsx` with your actual price ID:

```typescript
priceId: 'price_your_actual_price_id_here',
```

## Step 6: Test the Integration
1. Start your server: `npm run dev`
2. Click "Try Pro for free" in your app
3. Complete test payment with Stripe test card: `4242 4242 4242 4242`
4. Check webhook events in Stripe dashboard 