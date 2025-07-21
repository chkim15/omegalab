// Stripe Test Setup Verification
// Run with: node test-stripe-setup.js

import 'dotenv/config';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function testStripeSetup() {
  console.log('🔍 Testing Stripe Setup...\n');

  try {
    // Test 1: Check environment variables
    console.log('1️⃣ Checking environment variables:');
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('❌ STRIPE_SECRET_KEY not found');
    } else {
      console.log('✅ STRIPE_SECRET_KEY found');
    }
    
    if (!process.env.STRIPE_PUBLISHABLE_KEY) {
      console.log('❌ STRIPE_PUBLISHABLE_KEY not found');
    } else {
      console.log('✅ STRIPE_PUBLISHABLE_KEY found');
    }
    
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.log('❌ STRIPE_WEBHOOK_SECRET not found');
    } else {
      console.log('✅ STRIPE_WEBHOOK_SECRET found');
    }

    // Test 2: Check Stripe connection
    console.log('\n2️⃣ Testing Stripe connection:');
    const account = await stripe.accounts.retrieve();
    console.log('✅ Stripe connection successful');
    console.log(`   Account ID: ${account.id}`);
    console.log(`   Account type: ${account.type}`);

    // Test 3: List products
    console.log('\n3️⃣ Checking products:');
    const products = await stripe.products.list({ limit: 10 });
    if (products.data.length === 0) {
      console.log('❌ No products found. Please create a product first.');
    } else {
      console.log('✅ Products found:');
      products.data.forEach(product => {
        console.log(`   - ${product.name} (${product.id})`);
      });
    }

    // Test 4: List prices
    console.log('\n4️⃣ Checking prices:');
    const prices = await stripe.prices.list({ limit: 10 });
    if (prices.data.length === 0) {
      console.log('❌ No prices found. Please create a price first.');
    } else {
      console.log('✅ Prices found:');
      prices.data.forEach(price => {
        const amount = price.unit_amount / 100;
        const currency = price.currency.toUpperCase();
        const interval = price.recurring?.interval || 'one-time';
        console.log(`   - ${price.id}: $${amount} ${currency} / ${interval}`);
      });
    }

    // Test 5: Check webhooks
    console.log('\n5️⃣ Checking webhooks:');
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    if (webhooks.data.length === 0) {
      console.log('❌ No webhooks found. Please create a webhook endpoint.');
    } else {
      console.log('✅ Webhooks found:');
      webhooks.data.forEach(webhook => {
        console.log(`   - ${webhook.url} (${webhook.status})`);
      });
    }

    console.log('\n🎉 Stripe setup verification complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Copy your price ID from above');
    console.log('2. Update the priceId in dashboard.tsx');
    console.log('3. Start your server: npm run dev');
    console.log('4. Test the checkout flow');

  } catch (error) {
    console.error('❌ Stripe setup verification failed:', error.message);
    console.log('\n💡 Make sure you have:');
    console.log('1. Created a Stripe account');
    console.log('2. Added your STRIPE_SECRET_KEY to .env');
    console.log('3. Created a product and price in Stripe dashboard');
  }
}

testStripeSetup(); 