const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const fs = require('fs');

async function test() {
  const client = new Client({ connectionString: 'postgresql://postgres:hamza123@localhost:5432/codeforge' });
  await client.connect();
  const res = await client.query("SELECT * FROM users WHERE email = 'hamzadmin@test.com'");
  if (res.rows.length === 0) {
    fs.writeFileSync('out.json', JSON.stringify({ error: 'No user found' }));
  } else {
    const user = res.rows[0];
    const valid = await bcrypt.compare('AdminPassword123!', user.password_hash);
    fs.writeFileSync('out.json', JSON.stringify({ found: true, valid, hash: user.password_hash }));
  }
  await client.end();
}
test();
