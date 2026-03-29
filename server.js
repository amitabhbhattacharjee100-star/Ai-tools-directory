const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ── PLANS ──────────────────────────────────────────────
const PLANS = {
  pro: {
    name: "Pro Plan",
    amount: 1900, // $19.00
    interval: "month",
    description: "Featured badge, analytics dashboard, 5 screenshots",
  },
  spotlight: {
    name: "Spotlight Plan",
    amount: 4900, // $49.00
    interval: "month",
    description: "Homepage spotlight, newsletter feature, dofollow backlink",
  },
};

// ── CREATE CHECKOUT SESSION ────────────────────────────
app.post("/create-checkout-session", async (req, res) => {
  const { plan, toolName, email } = req.body;

  if (!PLANS[plan]) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: PLANS[plan].name,
              description: PLANS[plan].description,
              metadata: { toolName: toolName || "" },
            },
            unit_amount: PLANS[plan].amount,
            recurring: { interval: PLANS[plan].interval },
          },
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/success.html?plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/#pricing`,
      metadata: { plan, toolName: toolName || "" },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── WEBHOOK (Stripe → your server) ────────────────────
app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("Webhook error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      console.log(`✅ Payment received for: ${session.metadata.toolName}`);
      console.log(`   Plan: ${session.metadata.plan}`);
      console.log(`   Customer: ${session.customer_email}`);
      // TODO: Update your database to mark listing as featured/spotlight
      break;

    case "customer.subscription.deleted":
      console.log(`❌ Subscription cancelled: ${event.data.object.id}`);
      // TODO: Downgrade listing back to free
      break;
  }

  res.json({ received: true });
});

// ── START ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 NexAI server running at http://localhost:${PORT}`);
});
