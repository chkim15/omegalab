// Simple test script to verify Stripe integration
// Run with: node test-stripe.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testStripeConnection() {
  try {
    // Test basic connection
    const account = await stripe.accounts.retrieve();
    console.log('✅ Stripe connection successful');
    console.log('Account ID:', account.id);
    
    // List products
    const products = await stripe.products.list({ limit: 5 });
    console.log('\n📦 Available products:');
    products.data.forEach(product => {
      console.log(`- ${product.name} (${product.id})`);
    });
    
    // List prices
    const prices = await stripe.prices.list({ limit: 5 });
    console.log('\n💰 Available prices:');
    prices.data.forEach(price => {
      console.log(`- ${price.id}: ${price.unit_amount / 100} ${price.currency} / ${price.recurring?.interval}`);
    });
    
  } catch (error) {
    console.error('❌ Stripe connection failed:', error.message);
  }
}

testStripeConnection(); 