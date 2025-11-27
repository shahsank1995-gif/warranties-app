const db = require('./database');
const bcrypt = require('bcrypt');

const EMAIL = 'demo@repusense.com';
const PASSWORD = 'password123';
const NAME = 'Demo User';
const USER_ID = 'demo-user';

async function updateDemoUser() {
    try {
        const passwordHash = await bcrypt.hash(PASSWORD, 10);

        db.run(
            'UPDATE users SET email = ?, name = ?, password_hash = ?, email_verified = 1 WHERE id = ?',
            [EMAIL, NAME, passwordHash, USER_ID],
            function (err) {
                if (err) {
                    console.error('Error updating user:', err.message);
                } else {
                    console.log(`✅ User ${USER_ID} updated successfully.`);
                    console.log(`Email: ${EMAIL}`);
                    console.log(`Password: ${PASSWORD}`);
                }
            }
        );
    } catch (error) {
        console.error('Error:', error);
    }
}

updateDemoUser();
