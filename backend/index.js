const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { initDB } = require('./db');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Error handler for JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('❌ JSON Parsing Error:', err.message);
        console.error('Body that caused error:', err.body);
        return res.status(400).json({ error: 'Invalid JSON body' });
    }
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export the app for Vercel
module.exports = app;

// Initialize database and start server (only if not running as a serverless function)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    (async () => {
        try {
            await initDB();
            app.listen(PORT, '127.0.0.1', () => {
                console.log(`⚡ WEBOCONTROL API Server running on http://127.0.0.1:${PORT}`);
            });
        } catch (err) {
            console.error('❌ Failed to initialize database:', err);
            // Don't exit if in production/vercel, it might be handled differently
            if (process.env.NODE_ENV !== 'production') process.exit(1);
        }
    })();
}
