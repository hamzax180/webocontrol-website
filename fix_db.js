const { Client } = require('pg');
require('dotenv').config();

async function fixDB() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    await client.connect();
    console.log('Connected to PostgreSQL');

    try {
        // Ensure role column exists (safe with IF NOT EXISTS approach)
        await client.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'
        `);
        console.log('✅ Column "role" ensured on users table.');
    } catch (e) {
        console.error('❌ Error adding column:', e.message);
    }

    const email = 'hamzadmin@test123.com';
    const result = await client.query(
        "UPDATE users SET role = 'admin' WHERE email = $1",
        [email]
    );

    if (result.rowCount > 0) {
        console.log(`✅ Success: ${email} is now an Admin!`);
    } else {
        console.log(`❌ Error: User with email ${email} not found.`);
    }

    await client.end();
}

fixDB().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
