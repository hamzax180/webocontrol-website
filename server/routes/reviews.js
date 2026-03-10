const express = require('express');
const { getDB } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/reviews - Get all reviews
router.get('/', async (req, res) => {
    try {
        const pool = getDB();
        const result = await pool.query(`
            SELECT r.*, u.name as user_name 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            ORDER BY r.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Get reviews error:', err);
        res.status(500).json({ error: 'Failed to fetch reviews.' });
    }
});

// POST /api/reviews - Create a review (protected)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { content, rating } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Review content is required.' });
        }

        const pool = getDB();
        const insertResult = await pool.query(
            'INSERT INTO reviews (user_id, content, rating) VALUES ($1, $2, $3) RETURNING id',
            [req.user.id, content, rating || 5]
        );

        const result = await pool.query(`
            SELECT r.*, u.name as user_name 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.id = $1
        `, [insertResult.rows[0].id]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Create review error:', err);
        res.status(500).json({ error: 'Failed to post review.' });
    }
});

// DELETE /api/reviews/:id - Delete a review (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required to delete reviews.' });
        }

        const pool = getDB();
        const { id } = req.params;

        const result = await pool.query('DELETE FROM reviews WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Review not found.' });
        }

        res.json({ message: 'Review deleted successfully.' });
    } catch (err) {
        console.error('Delete review error:', err);
        res.status(500).json({ error: 'Failed to delete review.' });
    }
});

module.exports = router;
