const express = require('express');
const { getDB } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Initialize Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// GET /api/payments/config — return publishable key to frontend
router.get('/config', (req, res) => {
    res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// POST /api/payments/create-checkout-session
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
    try {
        const { items, orderId, paymentMethod } = req.body;

        if (!items || !items.length) {
            return res.status(400).json({ error: 'No items provided.' });
        }

        // Build Stripe line items
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: item.description || undefined,
                },
                unit_amount: Math.round(item.price * 100), // Stripe uses cents
            },
            quantity: item.quantity || 1,
        }));

        // Determine base URL for redirects
        const origin = req.headers.origin || 'http://localhost:5173';

        // Define payment method types array based on selection
        const types = paymentMethod === 'paypal' ? ['paypal'] : ['card'];

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: types,
            line_items: lineItems,
            mode: 'payment',
            success_url: `${origin}/payment.html?status=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/payment.html?status=cancelled`,
            client_reference_id: String(req.user.id),
            metadata: {
                orderId: orderId ? String(orderId) : '',
                userId: String(req.user.id),
            },
        });

        // Save stripe session ID to order if orderId provided
        if (orderId) {
            const pool = getDB();
            await pool.query(
                'UPDATE orders SET stripe_session_id = $1 WHERE id = $2 AND user_id = $3',
                [session.id, orderId, req.user.id]
            );
        }

        res.json({ sessionId: session.id, url: session.url });
    } catch (err) {
        console.error('Stripe checkout error:', err);
        res.status(500).json({ error: 'Failed to create checkout session.' });
    }
});

// GET /api/payments/session/:id — check session status
router.get('/session/:id', authMiddleware, async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.params.id);

        // If payment succeeded, update order status
        if (session.payment_status === 'paid' && session.metadata.orderId) {
            const pool = getDB();
            await pool.query(
                'UPDATE orders SET payment_status = $1, status = $2 WHERE id = $3',
                ['paid', 'confirmed', session.metadata.orderId]
            );
        }

        res.json({
            status: session.payment_status,
            customerEmail: session.customer_details?.email,
            amountTotal: session.amount_total,
            currency: session.currency,
        });
    } catch (err) {
        console.error('Session retrieve error:', err);
        res.status(500).json({ error: 'Failed to retrieve session.' });
    }
});

module.exports = router;
