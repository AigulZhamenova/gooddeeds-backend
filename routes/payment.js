const express = require("express");
const Stripe = require("stripe");
require("dotenv").config();

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Создание платежа
router.post("/create-checkout-session", async (req, res) => {
  const { amount } = req.body; // сумма в тенге, например 1000

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd", // Stripe не поддерживает KZT
            product_data: {
              name: "Donation",
            },
            unit_amount: amount * 100, // доллары в центах
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3000/success", // перенаправление
      cancel_url: "http://localhost:3000/cancel",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Payment failed" });
  }
});

router.get("/check-session/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      res.json({ success: true, message: 'Payment completed successfully' });
    } else {
      res.json({ success: false, message: 'Payment failed or pending' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Error fetching session details' });
  }
});

module.exports = router;
