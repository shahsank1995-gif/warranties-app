/**
 * Authentication Service
 * Handles user registration, email verification, and login
 */

/**
 * Generate a random 6-digit verification code
 */
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create and store a verification code for an email
 * @param {object} db - Database connection
 * @param {string} email - User's email
 * @returns {Promise<string>} - The generated code
 */
async function createVerificationCode(db, email) {
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, ?)',
            [email.toLowerCase(), code, expiresAt.toISOString()],
            (err) => {
                if (err) reject(err);
                else resolve(code);
            }
        );
    });
}

/**
 * Verify a code for an email
 * @param {object} db - Database connection
 * @param {string} email - User's email
 * @param {string} code - Verification code
 * @returns {Promise<boolean>} - True if valid
 */
async function verifyCode(db, email, code) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM verification_codes 
             WHERE email = ? AND code = ? AND used = 0 AND expires_at > datetime('now')
             ORDER BY created_at DESC LIMIT 1`,
            [email.toLowerCase(), code],
            (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (!row) {
                    resolve(false);
                    return;
                }

                // Mark code as used
                db.run(
                    'UPDATE verification_codes SET used = 1 WHERE id = ?',
                    [row.id],
                    (err) => {
                        if (err) reject(err);
                        else resolve(true);
                    }
                );
            }
        );
    });
}

/**
 * Create a new user or get existing user
 * @param {object} db - Database connection
 * @param {string} email - User's email
 * @param {string} name - User's name (optional)
 * @returns {Promise<object>} - User object
 */
async function createOrGetUser(db, email, name = null) {
    return new Promise((resolve, reject) => {
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Try to create user
        db.run(
            'INSERT INTO users (id, email, name, email_verified) VALUES (?, ?, ?, 1)',
            [userId, email.toLowerCase(), name],
            function (err) {
                if (err) {
                    // User might already exist
                    if (err.message.includes('UNIQUE constraint failed')) {
                        // Get existing user
                        db.get(
                            'SELECT * FROM users WHERE email = ?',
                            [email.toLowerCase()],
                            (err, user) => {
                                if (err) reject(err);
                                else {
                                    // Mark email as verified
                                    db.run(
                                        'UPDATE users SET email_verified = 1 WHERE email = ?',
                                        [email.toLowerCase()],
                                        () => resolve(user)
                                    );
                                }
                            }
                        );
                    } else {
                        reject(err);
                    }
                } else {
                    // Return newly created user
                    db.get(
                        'SELECT * FROM users WHERE id = ?',
                        [userId],
                        (err, user) => {
                            if (err) reject(err);
                            else resolve(user);
                        }
                    );
                }
            }
        );
    });
}

/**
 * Check if email exists
 * @param {object} db - Database connection
 * @param {string} email - User's email
 * @returns {Promise<boolean>}
 */
async function emailExists(db, email) {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT id FROM users WHERE email = ?',
            [email.toLowerCase()],
            (err, row) => {
                if (err) reject(err);
                else resolve(!!row);
            }
        );
    });
}

/**
 * Clean up expired verification codes
 * @param {object} db - Database connection
 */
function cleanupExpiredCodes(db) {
    db.run(
        "DELETE FROM verification_codes WHERE expires_at < datetime('now') OR used = 1"
    );
}

module.exports = {
    generateVerificationCode,
    createVerificationCode,
    verifyCode,
    createOrGetUser,
    emailExists,
    cleanupExpiredCodes
};
