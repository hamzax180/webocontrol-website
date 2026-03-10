const { Pool } = require('pg');

let pool;

function getDB() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return pool;
}

async function initDB() {
  const db = getDB();

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      website_type TEXT NOT NULL,
      description TEXT,
      budget TEXT,
      domain TEXT,
      pages TEXT,
      ai_integration INTEGER DEFAULT 0,
      contact_name TEXT,
      contact_email TEXT,
      company_name TEXT,
      phone TEXT,
      location TEXT,
      requirements_json TEXT,
      status TEXT DEFAULT 'pending',
      payment_status TEXT DEFAULT 'unpaid',
      stripe_session_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log('📦 Database initialized');
}

module.exports = { getDB, initDB };
