#!/bin/bash

echo "🚀 Stripe Test Mode Setup"
echo "=========================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Stripe Test Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Base URL for redirects
BASE_URL=http://localhost:3000

# Your existing variables
OPENAI_API_KEY=your_openai_key_here
DATABASE_URL=your_database_url_here
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Go to https://dashboard.stripe.com"
echo "2. Copy your test keys from Developers → API keys"
echo "3. Update the .env file with your actual keys"
echo "4. Create a product and price in Stripe dashboard"
echo "5. Set up webhooks (see stripe-setup-guide.md)"
echo "6. Run: node test-stripe-setup.js"
echo "7. Update priceId in dashboard.tsx"
echo "8. Start server: npm run dev"
echo ""
echo "🎯 Test card number: 4242 4242 4242 4242"
echo "📅 Any future date"
echo "�� Any 3-digit CVC" 