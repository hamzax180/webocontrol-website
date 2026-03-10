const express = require('express');
const { getDB } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/orders (protected - create order)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            website_type, description, budget, domain, pages,
            company_name, phone, location, ai_chat,
            ...otherRequirements
        } = req.body;

        if (!website_type) {
            return res.status(400).json({ error: 'Website type is required.' });
        }

        const pool = getDB();

        const result = await pool.query(`
      INSERT INTO orders (
        user_id, website_type, description, budget, domain, pages, 
        ai_integration, company_name, phone, location, requirements_json
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
            req.user.id,
            website_type,
            description || '',
            budget || '',
            domain || '',
            pages || '',
            ai_chat === 'yes' ? 1 : 0,
            company_name || '',
            phone || '',
            location || '',
            JSON.stringify(otherRequirements)
        ]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ error: 'Failed to create order.' });
    }
});

// GET /api/orders (protected - get orders)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const pool = getDB();
        let result;

        if (req.user.role === 'admin') {
            // Admins see all orders with user info
            result = await pool.query(`
                SELECT orders.*, users.name as user_name, users.email as user_email 
                FROM orders 
                JOIN users ON orders.user_id = users.id 
                ORDER BY orders.created_at DESC
            `);
        } else {
            // Regular users only see their own
            result = await pool.query(
                'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
                [req.user.id]
            );
        }

        res.json(result.rows);
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({ error: 'Failed to fetch orders.' });
    }
});

// PATCH /api/orders/:id/status (admin protected)
router.patch('/:id/status', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }

        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required.' });
        }

        const pool = getDB();
        const result = await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Order not found.' });
        }

        res.json({ message: 'Order status updated successfully.' });
    } catch (err) {
        console.error('Update order status error:', err);
        res.status(500).json({ error: 'Failed to update order status.' });
    }
});

// GET /api/orders/track/:id (public - track order)
router.get('/track/:id', async (req, res) => {
    try {
        let { id } = req.params;

        // Robust numeric extraction (handles #CF-4, 4, CF-4#, etc.)
        const match = id.match(/\d+/);
        const orderId = match ? match[0] : null;

        if (!orderId) {
            return res.status(400).json({ error: 'Invalid Order ID format.' });
        }

        const pool = getDB();
        const result = await pool.query('SELECT id, status FROM orders WHERE id = $1', [orderId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found.' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Track order error:', err);
        res.status(500).json({ error: 'Failed to track order.' });
    }
});

module.exports = router;
