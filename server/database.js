const { Pool } = require('pg');
const path = require('path');

// PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL error:', err);
    process.exit(-1);
});

// Helper functions to maintain compatibility with SQLite-style queries
const db = {
    // Query that returns all rows
    all: async (sql, params = []) => {
        const result = await pool.query(sql, params);
        return result.rows;
    },

    // Query that returns single row
    get: async (sql, params = []) => {
        const result = await pool.query(sql, params);
        return result.rows[0] || null;
    },

    // Query for INSERT/UPDATE/DELETE
    run: async (sql, params = []) => {
        const result = await pool.query(sql, params);
        return {
            lastID: result.rows[0]?.id || null,
            changes: result.rowCount
        };
    },

    // Execute raw query
    query: async (sql, params = []) => {
        return await pool.query(sql, params);
    },

    // Close connection
    close: async () => {
        await pool.end();
    }
};

// Initialize database tables
async function initializeDatabase() {
    try {
        console.log('🔧 Initializing PostgreSQL database...');

        // Read and execute migration file
        const fs = require('fs');
        const migrationPath = path.join(__dirname, 'migrations', '001_add_organizations.sql');

        if (fs.existsSync(migrationPath)) {
            const migration = fs.readFileSync(migrationPath, 'utf8');
            await pool.query(migration);
            console.log('✅ Organization tables created/verified');
        }

        // Create users table if it doesn't exist (existing functionality)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(255) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255),
                password_hash VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Create warranties table with organization support
        await pool.query(`
            CREATE TABLE IF NOT EXISTS warranties (
                id VARCHAR(255) PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
                productName VARCHAR(500) CHECK (LENGTH(productName) >= 1),
                purchaseDate DATE NOT NULL,
                warrantyPeriod VARCHAR(100),
                expiryDate DATE NOT NULL,
                retailer VARCHAR(500),
                receiptImage TEXT,
                receiptMimeType VARCHAR(100),
                department VARCHAR(100),
                cost_center VARCHAR(100),
                asset_id VARCHAR(100),
                vendor VARCHAR(200),
                purchase_order_number VARCHAR(100),
                warranty_cost DECIMAL(12, 2),
                notes TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Create notification_settings table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notification_settings (
                user_id VARCHAR(255) PRIMARY KEY,
                email_enabled BOOLEAN DEFAULT TRUE,
                push_enabled BOOLEAN DEFAULT FALSE,
                sms_enabled BOOLEAN DEFAULT FALSE,
                alert_days INTEGER DEFAULT 30 CHECK (alert_days > 0),
                fcm_token TEXT,
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Create verification_codes table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS verification_codes (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                code VARCHAR(6) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                used_at TIMESTAMP
            )
        `);

        // Create indexes
        await pool.query('CREATE INDEX IF NOT EXISTS idx_warranties_user_id ON warranties(user_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_warranties_expiry ON warranties(expiryDate)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email)');

        console.log('✅ Database initialization complete');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        throw error;
    }
}

// Run initialization
initializeDatabase().catch(console.error);

module.exports = db;
