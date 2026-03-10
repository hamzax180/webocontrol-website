const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, 'webocontrol.db');
const db = new Database(dbPath);

console.log('Using DB:', dbPath);

const users = db.prepare("SELECT email, role FROM users").all();
console.log('Current Users:', JSON.stringify(users, null, 2));

const email = 'hamzadmin@test123.com';
const result = db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(email);

if (result.changes > 0) {
    console.log(`✅ Success: ${email} is now an Admin!`);
} else {
    // Check for similar emails
    const similar = db.prepare("SELECT email FROM users WHERE email LIKE '%hamza%'").all();
    if (similar.length > 0) {
        console.log('ℹ️ Found similar users:', JSON.stringify(similar));
    } else {
        console.log(`❌ Error: User ${email} not found and no similar users.`);
    }
}
db.close();
