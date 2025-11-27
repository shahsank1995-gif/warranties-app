// const fetch = require('node-fetch'); // Using native fetch
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const API_URL = 'http://localhost:3000/api/auth';
const DB_PATH = path.join(__dirname, 'warranties.db');

const TEST_USER = {
    email: `test_${Date.now()}@example.com`,
    name: 'Test User',
    password: 'password123'
};

async function runTest() {
    console.log('🚀 Starting Auth Flow Test...');
    console.log('Test User:', TEST_USER);

    // 1. Register
    console.log('\n1️⃣  Testing Registration...');
    const regRes = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_USER)
    });
    const regData = await regRes.json();

    if (regRes.ok) {
        console.log('✅ Registration successful:', regData.message);
    } else {
        console.error('❌ Registration failed:', regData);
        return;
    }

    // 2. Get Verification Code from DB
    console.log('\n2️⃣  Retrieving Verification Code from DB...');
    const code = await new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
            if (err) reject(err);
        });

        db.get(
            'SELECT code FROM verification_codes WHERE email = ? ORDER BY created_at DESC LIMIT 1',
            [TEST_USER.email],
            (err, row) => {
                db.close();
                if (err) reject(err);
                else resolve(row ? row.code : null);
            }
        );
    });

    if (code) {
        console.log('✅ Found code:', code);
    } else {
        console.error('❌ Could not find verification code in DB');
        return;
    }

    // 3. Verify Code
    console.log('\n3️⃣  Testing Verification...');
    const verifyRes = await fetch(`${API_URL}/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: TEST_USER.email,
            code: code,
            name: TEST_USER.name
        })
    });
    const verifyData = await verifyRes.json();

    if (verifyRes.ok) {
        console.log('✅ Verification successful. User created:', verifyData.user.email);
    } else {
        console.error('❌ Verification failed:', verifyData);
        return;
    }

    // 4. Login with Password
    console.log('\n4️⃣  Testing Login with Password...');
    const loginRes = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: TEST_USER.email,
            password: TEST_USER.password
        })
    });
    const loginData = await loginRes.json();

    if (loginRes.ok) {
        console.log('✅ Login successful!');
        console.log('User:', loginData.user);
        console.log('\n🎉 ALL TESTS PASSED!');
    } else {
        console.error('❌ Login failed:', loginData);
    }
}

runTest().catch(console.error);
