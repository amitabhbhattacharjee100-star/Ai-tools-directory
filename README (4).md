# NexAI — AI Tools Directory

A directory website with Stripe-powered freemium subscriptions.

## Revenue Model
| Plan       | Price   | Features                              |
|------------|---------|---------------------------------------|
| Free       | $0/mo   | Basic listing                         |
| Pro        | $19/mo  | Featured badge + analytics            |
| Spotlight  | $49/mo  | Homepage + newsletter + social shoutout |

---

## Quick Start (Local)

```bash
npm install
node server.js
# Open http://localhost:3000
```

---

## Deploy to Vercel (Free Hosting)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Add a `vercel.json` file:
   ```json
   {
     "version": 2,
     "builds": [{ "src": "server.js", "use": "@vercel/node" }],
     "routes": [{ "src": "/(.*)", "dest": "server.js" }]
   }
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Add your environment variables in Vercel Dashboard → Settings → Environment Variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`

---

## Set Up Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://YOUR-DOMAIN.vercel.app/webhook`
4. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
5. Copy the webhook secret → paste into `.env` as `STRIPE_WEBHOOK_SECRET`

---

## ⚠️ Security Reminders
- NEVER commit `.env` to GitHub
- NEVER share your secret key publicly
- Regenerate your secret key if it was ever exposed
- Use test keys (`sk_test_...`) during development
- Switch to live keys (`sk_live_...`) only when ready to accept real payments
