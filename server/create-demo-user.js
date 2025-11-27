const db = require('./database');
const bcrypt = require('bcrypt');

const EMAIL = 'demo@repusense.com';
const PASSWORD = 'password123';
const NAME = 'Demo User';

async function createDemoUser() {
    try {
        const passwordHash = await bcrypt.hash(PASSWORD, 10);
        const userId = 'demo-user'; // Keep ID consistent if possible

        db.run(
            'INSERT INTO users (id, email, name, password_hash, email_verified) VALUES (?, ?, ?, ?, 1)',
            [userId, EMAIL, NAME, passwordHash],
            function (err) {
                if (err) {
                    console.error('Error creating user:', err.message);
                } else {
                    console.log(`✅ User ${EMAIL} created successfully with password: ${PASSWORD}`);
                }
            }
        );
    } catch (error) {
        console.error('Error:', error);
    }
}

createDemoUser();
