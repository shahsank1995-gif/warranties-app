const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');

// Check if we are in production (Postgres) or development (SQLite)
const isPostgres = !!process.env.DATABASE_URL;

class DatabaseAdapter {
    constructor() {
        if (isPostgres) {
            console.log('🔌 Connecting to PostgreSQL...');
            this.pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false } // Required for Neon/Render
            });
            this.type = 'postgres';
        } else {
            console.log('🔌 Connecting to SQLite...');
            const dbPath = path.resolve(__dirname, 'warranties.db');
            this.sqlite = new sqlite3.Database(dbPath);
            this.type = 'sqlite';
        }
        this.init();
    }

    init() {
        this.createTables();
    }

    // Convert SQLite query (?) to Postgres query ($1, $2)
    normalizeQuery(sql) {
        if (this.type === 'sqlite') return sql;
        let i = 1;
        return sql.replace(/\?/g, () => `$${i++}`);
    }

    // Execute a query that returns no results (INSERT, UPDATE, DELETE)
    run(sql, params = [], callback) {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }

        if (this.type === 'postgres') {
            this.pool.query(this.normalizeQuery(sql), params)
                .then(res => {
                    if (callback) callback.call({ lastID: 0, changes: res.rowCount }, null);
                })
                .catch(err => {
                    if (callback) callback(err);
                });
        } else {
            this.sqlite.run(sql, params, callback);
        }
    }

    // Execute a query that returns a single row
    get(sql, params = [], callback) {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }

        if (this.type === 'postgres') {
            this.pool.query(this.normalizeQuery(sql), params)
                .then(res => {
                    if (callback) callback(null, res.rows[0]);
                })
                .catch(err => {
                    if (callback) callback(err);
                });
        } else {
            this.sqlite.get(sql, params, callback);
        }
    }

    // Execute a query that returns all rows
    all(sql, params = [], callback) {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }

        if (this.type === 'postgres') {
            this.pool.query(this.normalizeQuery(sql), params)
                .then(res => {
                    if (callback) callback(null, res.rows);
                })
                .catch(err => {
                    if (callback) callback(err);
                });
        } else {
            this.sqlite.all(sql, params, callback);
        }
    }

    createTables() {
        const isPg = this.type === 'postgres';

        // Helper for auto-increment syntax
        const autoInc = isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
        const textType = isPg ? 'TEXT' : 'TEXT';
        const dateType = isPg ? 'TIMESTAMP' : 'DATETIME';
        const now = isPg ? 'CURRENT_TIMESTAMP' : 'CURRENT_TIMESTAMP';

        const queries = [
            // Warranties Table
            `CREATE TABLE IF NOT EXISTS warranties (
                id TEXT PRIMARY KEY,
                productName TEXT NOT NULL,
                purchaseDate TEXT NOT NULL,
                warrantyPeriod TEXT NOT NULL,
                retailer TEXT,
                expiryDate TEXT,
                receiptImage TEXT,
                receiptMimeType TEXT,
                createdAt ${dateType} DEFAULT ${now}
            )`,

            // Users Table
            `CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE,
                name TEXT,
                password_hash TEXT,
                email_verified INTEGER DEFAULT 0,
                created_at ${dateType} DEFAULT ${now}
            )`,

            // Notification Settings
            `CREATE TABLE IF NOT EXISTS notification_settings (
                user_id TEXT PRIMARY KEY,
                email_enabled INTEGER DEFAULT 1,
                push_enabled INTEGER DEFAULT 0,
                alert_threshold INTEGER DEFAULT 30,
                notification_time TEXT DEFAULT '09:00',
                last_notification_sent ${dateType},
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`,

            // Device Tokens
            `CREATE TABLE IF NOT EXISTS device_tokens (
                id ${autoInc},
                user_id TEXT NOT NULL,
                token TEXT NOT NULL UNIQUE,
                platform TEXT,
                created_at ${dateType} DEFAULT ${now},
                last_used ${dateType} DEFAULT ${now},
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`,

            // Verification Codes
            `CREATE TABLE IF NOT EXISTS verification_codes (
                id ${autoInc},
                email TEXT NOT NULL,
                code TEXT NOT NULL,
                expires_at ${dateType} NOT NULL,
                used INTEGER DEFAULT 0,
                password_temp TEXT,
                created_at ${dateType} DEFAULT ${now}
            )`
        ];

        // Execute table creation sequentially
        const executeNext = (index) => {
            if (index >= queries.length) {
                this.seedData();
                return;
            }
            this.run(queries[index], (err) => {
                if (err) console.error(`Error creating table ${index}:`, err.message);
                else executeNext(index + 1);
            });
        };

        executeNext(0);
    }

    seedData() {
        // Create default user if not exists
        this.run(`INSERT INTO users (id, email) VALUES ('demo-user', NULL) ON CONFLICT(id) DO NOTHING`, (err) => {
            if (err && this.type === 'sqlite') {
                // Fallback for SQLite which might not support ON CONFLICT in older versions or syntax diff
                this.run(`INSERT OR IGNORE INTO users (id, email) VALUES ('demo-user', NULL)`);
            }
        });

        // Create default settings
        this.run(`INSERT INTO notification_settings (user_id) VALUES ('demo-user') ON CONFLICT(user_id) DO NOTHING`, (err) => {
            if (err && this.type === 'sqlite') {
                this.run(`INSERT OR IGNORE INTO notification_settings (user_id) VALUES ('demo-user')`);
            }
        });

        console.log(`✅ Database initialized (${this.type})`);
    }
}

const db = new DatabaseAdapter();
module.exports = db;
