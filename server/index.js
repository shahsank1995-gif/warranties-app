const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./database');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcrypt');
const { sendTestEmail, sendVerificationEmail } = require('./emailService');
const { startScheduler, triggerManualCheck } = require('./scheduler');
const { sendPushNotification } = require('./fcmService');
const { createVerificationCode, verifyCode, createOrGetUser, emailExists, cleanupExpiredCodes } = require('./authService');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: NODE_ENV === 'production' ? true : false
}));

// CORS Configuration
const corsOptions = {
    origin: NODE_ENV === 'production'
        ? ['https://warranties-app.vercel.app', 'https://www.warranties-app.vercel.app']
        : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images if needed
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploaded images (if we decide to save to disk later)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes

// GET all warranties
app.get('/api/warranties', (req, res) => {
    const sql = 'SELECT * FROM warranties ORDER BY purchaseDate DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});

// POST new warranty
app.post('/api/warranties', (req, res) => {
    const { id, productName, purchaseDate, warrantyPeriod, retailer, expiryDate, receiptImage, receiptMimeType } = req.body;

    const sql = `INSERT INTO warranties (id, productName, purchaseDate, warrantyPeriod, retailer, expiryDate, receiptImage, receiptMimeType) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [id, productName, purchaseDate, warrantyPeriod, retailer, expiryDate, receiptImage, receiptMimeType];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: req.body,
            id: this.lastID
        });
    });
});

// DELETE warranty
app.delete('/api/warranties/:id', (req, res) => {
    const sql = 'DELETE FROM warranties WHERE id = ?';
    const params = [req.params.id];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'deleted',
            changes: this.changes
        });
    });
});

// AUTHENTICATION ENDPOINTS

// Register - collects email, name, password and sends verification code
app.post('/api/auth/register', async (req, res) => {
    const { email, name, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }

    if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters' });
        return;
    }

    try {
        const emailLower = email.toLowerCase().trim();

        // Check if user already exists
        const exists = await emailExists(db, emailLower);
        if (exists) {
            res.status(400).json({ error: 'Email already registered. Please login instead.' });
            return;
        }

        // Generate verification code
        const code = await createVerificationCode(db, emailLower);

        // Temporarily store password in verification_codes.used field
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE verification_codes SET used = ? WHERE email = ? AND code = ?',
                [password, emailLower, code],
                (err) => err ? reject(err) : resolve()
            );
        });

        // Send verification email
        const emailResult = await sendVerificationEmail(emailLower, code, name);

        if (emailResult.success) {
            console.log(`✅ [Auth] Signup email sent to ${emailLower}`);
            res.json({
                success: true,
                message: 'Verification code sent to your email',
                email: emailLower
            });
        } else {
            console.error(`❌ [Auth] Failed to send email:`, emailResult.message);
            res.status(500).json({ error: `Email service error: ${emailResult.message}` });
        }
    } catch (error) {
        console.error('[Auth] Registration error:', error.message);
        res.status(500).json({ error: `Registration failed: ${error.message}` });
    }
});

// Login with password
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }

    try {
        const emailLower = email.toLowerCase().trim();

        // Get user
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [emailLower], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        if (!user.password_hash) {
            res.status(401).json({ error: 'Please sign up to create a password' });
            return;
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Return user data
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                email_verified: user.email_verified
            }
        });
    } catch (error) {
        console.error('[Auth] Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Verify code and complete registration
app.post('/api/auth/verify-code', async (req, res) => {
    const { email, code, name } = req.body;

    if (!email || !code) {
        res.status(400).json({ error: 'Email and code are required' });
        return;
    }

    try {
        const emailLower = email.toLowerCase().trim();

        // Get verification record with password
        const verificationRecord = await new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM verification_codes 
                 WHERE email = ? AND code = ? AND expires_at > datetime('now')
                 ORDER BY created_at DESC LIMIT 1`,
                [emailLower, code],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!verificationRecord) {
            res.status(400).json({ error: 'Invalid or expired verification code' });
            return;
        }

        // Hash password (stored temporarily in 'used' field)
        const passwordPlainText = verificationRecord.used;
        const passwordHash = await bcrypt.hash(passwordPlainText, 10);

        // Create user with password
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (id, email, name, password_hash, email_verified) VALUES (?, ?, ?, ?, 1)',
                [userId, emailLower, name, passwordHash],
                (err) => err ? reject(err) : resolve()
            );
        });

        // Mark code as used
        await new Promise((resolve, reject) => {
            db.run('UPDATE verification_codes SET used = 1 WHERE id = ?', [verificationRecord.id],
                (err) => err ? reject(err) : resolve()
            );
        });

        // Get created user
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT id, email, name, email_verified FROM users WHERE id = ?', [userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        // Return user data
        res.json({
            success: true,
            message: 'Account created successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                email_verified: 1
            }
        });
    } catch (error) {
        console.error('[Auth] Verification error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Resend verification code
app.post('/api/auth/resend-code', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
    }

    try {
        const emailLower = email.toLowerCase().trim();

        // Generate new code
        const code = await createVerificationCode(db, emailLower);

        // Get user name if exists
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT name FROM users WHERE email = ?', [emailLower], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        // Send verification email
        const emailResult = await sendVerificationEmail(emailLower, code, user?.name);

        if (emailResult.success) {
            res.json({
                success: true,
                message: 'New verification code sent'
            });
        } else {
            res.status(500).json({ error: 'Failed to send verification email' });
        }
    } catch (error) {
        console.error('[Auth] Resend error:', error);
        res.status(500).json({ error: error.message });
    }
});

// NOTIFICATION API ENDPOINTS

// Get user notification settings
app.get('/api/user/settings', (req, res) => {
    const userId = 'demo-user'; // Hardcoded for now, will use auth later

    const sql = `
        SELECT u.email, ns.email_enabled, ns.push_enabled, ns.alert_threshold, ns.notification_time
        FROM users u
        LEFT JOIN notification_settings ns ON u.id = ns.user_id
        WHERE u.id = ?
    `;

    db.get(sql, [userId], (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: row || {
                email: null,
                email_enabled: 1,
                push_enabled: 0,
                alert_threshold: 30,
                notification_time: '09:00'
            }
        });
    });
});

// Update user email
app.post('/api/user/email', (req, res) => {
    const userId = 'demo-user'; // Hardcoded for now
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
    }

    const sql = 'UPDATE users SET email = ? WHERE id = ?';

    db.run(sql, [email, userId], function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'Email updated successfully',
            email: email
        });
    });
});

// Update notification settings
app.put('/api/user/settings', (req, res) => {
    const userId = 'demo-user'; // Hardcoded for now
    const { email_enabled, alert_threshold, notification_time } = req.body;

    const sql = `
        UPDATE notification_settings 
        SET email_enabled = ?, alert_threshold = ?, notification_time = ?
        WHERE user_id = ?
    `;

    db.run(sql, [email_enabled, alert_threshold, notification_time, userId], function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'Settings updated successfully',
            changes: this.changes
        });
    });
});

// Send test email
app.post('/api/notifications/test', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
    }

    try {
        const result = await sendTestEmail(email);
        if (result.success) {
            res.json({ message: result.message, success: true });
        } else {
            res.status(500).json({ error: result.message, success: false });
        }
    } catch (error) {
        res.status(500).json({ error: error.message, success: false });
    }
});

// Manually trigger notification check (for testing)
app.post('/api/notifications/trigger', async (req, res) => {
    try {
        await triggerManualCheck();
        res.json({ message: 'Notification check triggered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DEVICE TOKEN ENDPOINTS (Push Notifications)

// Register device token
app.post('/api/device-token', (req, res) => {
    const userId = 'demo-user'; // Hardcoded for now
    const { token, platform } = req.body;

    if (!token) {
        res.status(400).json({ error: 'Token is required' });
        return;
    }

    // Insert or update device token
    const sql = `
        INSERT INTO device_tokens (user_id, token, platform, last_used)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(token) DO UPDATE SET
            last_used = CURRENT_TIMESTAMP,
            platform = excluded.platform
    `;

    db.run(sql, [userId, token, platform || 'unknown'], function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        console.log(`[API] Device token registered for user ${userId} (${platform})`);
        res.json({
            message: 'Device token registered successfully',
            token: token
        });
    });
});

// Get user's device tokens
app.get('/api/device-tokens', (req, res) => {
    const userId = 'demo-user'; // Hardcoded for now

    const sql = 'SELECT * FROM device_tokens WHERE user_id = ? ORDER BY last_used DESC';

    db.all(sql, [userId], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});

// Test push notification
app.post('/api/notifications/test-push', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        res.status(400).json({ error: 'Device token is required' });
        return;
    }

    try {
        const result = await sendPushNotification(
            token,
            '✅ Test Notification',
            'Push notifications are working! You\'ll receive warranty alerts here.',
            { type: 'test' }
        );

        if (result.success) {
            res.json({ message: 'Test notification sent', success: true });
        } else {
            res.status(500).json({ error: result.message, success: false });
        }
    } catch (error) {
        res.status(500).json({ error: error.message, success: false });
    }
});

// Download receipt with proper filename
app.post('/api/download-receipt', async (req, res) => {
    try {
        const { imageData, filename, mimeType } = req.body;

        if (!imageData || !filename) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Convert base64 to buffer
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Set headers for download with proper filename
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', mimeType || 'application/octet-stream');
        res.setHeader('Content-Length', buffer.length);

        res.send(buffer);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Download failed' });
    }
});

// Temporary endpoint to create demo user
app.get('/api/admin/create-demo-user', async (req, res) => {
    try {
        const email = 'demo@repusense.com';
        const password = 'password123';
        const name = 'Demo User';
        const passwordHash = await bcrypt.hash(password, 10);
        const userId = 'demo-user';

        // Check if user exists BY EMAIL (not ID)
        const existingUser = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (existingUser) {
            // Update password and name
            await new Promise((resolve, reject) => {
                db.run('UPDATE users SET password_hash = ?, name = ? WHERE email = ?', [passwordHash, name, email], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            res.json({ success: true, message: `User ${email} updated` });
        } else {
            // Create user
            await new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO users (id, email, name, password_hash, email_verified) VALUES (?, ?, ?, ?, 1)',
                    [userId, email, name, passwordHash],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
            res.json({ success: true, message: `User ${email} created` });
        }
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Debug endpoint to check if user exists
app.get('/api/admin/check-demo-user', async (req, res) => {
    try {
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT id, email, name, password_hash FROM users WHERE email = ?', ['demo@repusense.com'], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (user) {
            res.json({
                exists: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    has_password: !!user.password_hash
                }
            });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), env: NODE_ENV });
});

// Root endpoint for default health checks
app.get('/', (req, res) => {
    res.send('Warranties API is running');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT} (${NODE_ENV})`);
    console.log(`📧 Email: ${process.env.EMAIL_USER ? '✓ Configured' : '✗ Missing'}`);
    console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite'}`);
    console.log(`🔑 Gemini API: ${process.env.VITE_GOOGLE_GENAI_API_KEY ? '✓ Configured' : '✗ Missing'}`);

    // Start notification scheduler
    startScheduler();
});
