const bcrypt = require('bcryptjs');
const { Client } = require('pg');
require('dotenv').config();

async function test() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const result = await client.query('SELECT * FROM users WHERE email = $1', ['hamzadmin@test.com']);
  const user = result.rows[0];
  console.log('User found:', !!user);
  if(user) {
     const valid = await bcrypt.compare('AdminPassword123!', user.password_hash);
     console.log('Password valid:', valid);
     console.log('Hash in DB:', user.password_hash);
  } else {
     const allUsers = await client.query('SELECT email FROM users');
     console.log('All emails:', allUsers.rows);
  }
  await client.end();
}
test();
