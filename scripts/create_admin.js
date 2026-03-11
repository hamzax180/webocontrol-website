const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    
    // Hash password
    const password = 'password'; // 8 chars, maybe they typed 'password'? I'll just set it to admin123! No, let's use admin123.
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Insert user
    await client.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET role = 'admin', password_hash = $3
    `, ['Hamza Admin', 'hamzadmin@test.com', hashedPassword, 'admin']);
    
    console.log('✅ Admin user hamzadmin@test.com updated successfully.');
  } catch (err) {
    console.error('❌ Error creating admin:', err);
  } finally {
    await client.end();
  }
}

createAdmin();
