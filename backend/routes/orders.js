const express = require('express');
const nodemailer = require('nodemailer');
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

// POST /api/orders/submit_request (protected - full order checkout replacement)
router.post('/submit_request', authMiddleware, async (req, res) => {
    try {
        const { items, estimated_total, customer_requirements } = req.body;
        
        if (!items || !items.length) {
            return res.status(400).json({ error: 'Order must contain items.' });
        }

        const pool = getDB();
        
        // Derive website types from items array for DB summary
        const website_type = items.map(i => i.type).join(', ') || 'Custom Order';
        
        // 1. Save to Database natively
        const insertResult = await pool.query(`
          INSERT INTO orders (
            user_id, website_type, budget, 
            contact_name, contact_email, company_name, phone, location, 
            requirements_json, status, payment_status
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `, [
            req.user.id,
            website_type,
            `$${estimated_total}`,
            (customer_requirements.firstName || '') + ' ' + (customer_requirements.lastName || ''),
            customer_requirements.email || req.user.email,
            customer_requirements.company || '',
            customer_requirements.phone || '',
            customer_requirements.location || '',
            JSON.stringify(req.body),
            'pending',
            'unpaid' // Removed stripe
        ]);

        const dbOrder = insertResult.rows[0];

        // 2. Draft Email to Webocontrol
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: parseInt(process.env.SMTP_PORT) === 465, 
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        // Prepare Itemization HTML
        const itemsHtml = items.map(item => `
          <tr style="border-bottom: 1px solid #eeeeee;">
             <td style="padding: 10px;"><b>${item.name}</b><br><small style="color: #666;">${item.description || ''}</small></td>
             <td style="padding: 10px; text-align: center;">${item.quantity || 1}</td>
             <td style="padding: 10px; text-align: right;">$${(item.price * (item.quantity || 1)).toLocaleString()}</td>
          </tr>
        `).join('');

        // Prepare Requirements List HTML
        let reqsHtml = '';
        for (const [key, value] of Object.entries(customer_requirements)) {
            if (value && typeof value !== 'object') {
                reqsHtml += `<li><strong>${key.replace(/_/g, ' ').toUpperCase()}:</strong> ${value}</li>`;
            } else if (Array.isArray(value) && value.length > 0) {
                reqsHtml += `<li><strong>${key.replace(/_/g, ' ').toUpperCase()}:</strong> ${value.join(', ')}</li>`;
            }
        }

        const mailOptions = {
            from: process.env.SMTP_USER || '"Webocontrol Ordering Server" <no-reply@webocontrol.com>',
            to: 'info@webocontrol.com', 
            subject: `🚀 New Project Request: ${customer_requirements.company || 'Unknown Client'} ($${estimated_total.toLocaleString()})`,
            html: `
              <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                  <div style="background-color: #0b0f19; padding: 20px; text-align: center; color: #fff;">
                      <h2 style="margin: 0;">New Project Request Received</h2>
                      <p style="margin: 5px 0 0 0; color: #aaa;">Order ID: #${dbOrder.id}</p>
                  </div>
                  
                  <div style="padding: 20px;">
                      <h3 style="border-bottom: 2px solid #0096ff; padding-bottom: 8px;">Client Information</h3>
                      <ul style="list-style: none; padding: 0; line-height: 1.6;">
                          <li><strong>Name:</strong> ${customer_requirements.firstName} ${customer_requirements.lastName}</li>
                          <li><strong>Email:</strong> <a href="mailto:${customer_requirements.email}">${customer_requirements.email}</a></li>
                          <li><strong>Phone:</strong> ${customer_requirements.phone}</li>
                          <li><strong>Location:</strong> ${customer_requirements.location}</li>
                          <li><strong>Company:</strong> ${customer_requirements.company}</li>
                      </ul>

                      <h3 style="border-bottom: 2px solid #0096ff; padding-bottom: 8px; margin-top: 30px;">Selected Products</h3>
                      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                          <thead>
                              <tr style="background-color: #f8f9fa;">
                                  <th style="padding: 10px; text-align: left;">Product Info</th>
                                  <th style="padding: 10px; text-align: center;">Qty</th>
                                  <th style="padding: 10px; text-align: right;">Total</th>
                              </tr>
                          </thead>
                          <tbody>
                              ${itemsHtml}
                          </tbody>
                          <tfoot>
                             <tr>
                                <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 1.1em;">Estimated Total:</td>
                                <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 1.1em; color: #0096ff;">$${estimated_total.toLocaleString()}</td>
                             </tr>
                          </tfoot>
                      </table>

                      <h3 style="border-bottom: 2px solid #0096ff; padding-bottom: 8px; margin-top: 30px;">Technical Requirements & Config</h3>
                      <ul style="line-height: 1.6;">
                          ${reqsHtml || '<li>No specific text requirements attached.</li>'}
                      </ul>
                  </div>
                  
                  <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 0.85em; color: #666;">
                      This is an automated notification from the WEBOCONTROL Ordering System.<br>
                      Login to the admin dashboard to manage its status.
                  </div>
              </div>
            `
        };

        // Suppress email errors in local/dev if SMTP is missing by ignoring failure, but report success
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            await transporter.sendMail(mailOptions);
            console.log('✅ Order notification email sent to info@webocontrol.com');
        } else {
            console.warn('⚠️ SMTP variables missing. Simulated email send successfully.');
        }

        res.status(201).json({ success: true, orderId: dbOrder.id });

    } catch (err) {
        console.error('Submit request error:', err);
        res.status(500).json({ error: 'Failed to process project request.' });
    }
});

module.exports = router;
