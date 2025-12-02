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
    // Helper to convert ? to $1, $2, etc.
    convertQuery: (sql) => {
        let i = 1;
        const converted = sql.replace(/\?/g, () => `$${i++}`);
        if (sql.includes('?')) {
            console.log(`[DB] Converted query: "${sql}" -> "${converted}"`);
        }
        return converted;
    },

    // Query that returns all rows
    all: async (sql, params = [], callback) => {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }
        try {
            const pgSql = db.convertQuery(sql);
            const result = await pool.query(pgSql, params);
            if (callback) callback(null, result.rows);
            return result.rows;
        } catch (err) {
            if (callback) callback(err);
            throw err;
        }
    },

    // Query that returns single row
    get: async (sql, params = [], callback) => {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }
        try {
            const pgSql = db.convertQuery(sql);
            const result = await pool.query(pgSql, params);
            const row = result.rows[0] || null;
            if (callback) callback(null, row);
            return row;
        } catch (err) {
            if (callback) callback(err);
            throw err;
        }
    },

    // Query for INSERT/UPDATE/DELETE
    run: async (sql, params = [], callback) => {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }
        try {
            const pgSql = db.convertQuery(sql);
            const result = await pool.query(pgSql, params);
            const ret = {
                lastID: result.rows[0]?.id || null,
                changes: result.rowCount
            };
            if (callback) callback(null, ret);
            return ret;
        } catch (err) {
            if (callback) callback(err);
            throw err;
        }
    },

    // Execute raw query
    query: async (sql, params = [], callback) => {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }
        try {
            const pgSql = db.convertQuery(sql);
            const result = await pool.query(pgSql, params);
            if (callback) callback(null, result);
            return result;
        } catch (err) {
            if (callback) callback(err);
            throw err;
        }
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
