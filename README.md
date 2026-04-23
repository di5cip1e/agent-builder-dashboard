# Agent Builder Dashboard

Commercial AI Agent Generation Platform for live client consultations.

## Quick Start

```bash
cd agent-builder-dashboard
npm install
cp .env.example .env.local
# Add your Stripe test keys
npm run dev
```

## Environment Variables

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
AGENT_STORAGE_PATH=/opt/agents
BASE_PORT=3001
DOMAIN=yourdomain.com
```

## Development

```bash
npm run dev      # Start Next.js dev server
npm run build    # Production build
npm start        # Production server
```

## Deployment (Hostinger VPS)

See `scripts/` directory for deployment configurations.