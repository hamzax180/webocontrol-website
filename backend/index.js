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

// Essential Environment Variables Validation
if (!process.env.JWT_SECRET) {
    console.error('❌ CRITICAL: JWT_SECRET is missing! Authentication will fail.');
    if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ Using fallback development secret for local testing.');
        process.env.JWT_SECRET = 'dev_secret_only_for_testing';
    }
}

if (!process.env.DATABASE_URL) {
    console.warn('⚠️ WARNING: DATABASE_URL is missing. DB operations will be simulated via mock objects.');
}

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

// Initialize database and start server
(async () => {
    try {
        // Run database initialization (tables creation)
        await initDB();
        
        // Start listening only if not in a serverless environment (VERCEL)
        if (!process.env.VERCEL) {
            app.listen(PORT, '127.0.0.1', () => {
                console.log(`⚡ WEBOCONTROL API Server running on http://127.0.0.1:${PORT}`);
            });
        }
    } catch (err) {
        console.error('❌ Database initialization failed:', err);
        // On local dev, exit if DB is critical. On Vercel, the function starts anyway.
        if (!process.env.VERCEL) process.exit(1);
    }
})();
