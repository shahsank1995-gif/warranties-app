const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const runMigration = async () => {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL not found in .env.local');
        process.exit(1);
    }

    console.log('🔌 Connecting to database...');
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔄 Running migration: Adding user_id to warranties table...');
        await pool.query('ALTER TABLE warranties ADD COLUMN IF NOT EXISTS user_id TEXT;');
        console.log('✅ Migration successful: user_id column added.');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await pool.end();
    }
};

runMigration();
