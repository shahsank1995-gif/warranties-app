const db = require('./database');

// Check user ID first
db.get('SELECT id, email FROM users WHERE email = ?', ['demo@repusense.com'], (err, user) => {
    if (err) {
        console.error('Error:', err);
        return;
    }

    if (!user) {
        console.error('❌ Demo user not found!');
        return;
    }

    console.log(`✅ Found user: ${user.email}`);
    console.log(`   User ID: ${user.id}\n`);

    const userId = user.id;
    const now = new Date();

    // Warranty expiring in 2 days
    const exp2days = new Date(now);
    exp2days.setDate(exp2days.getDate() + 2);

    // Warranty expiring in 15 days
    const exp15days = new Date(now);
    exp15days.setDate(exp15days.getDate() + 15);

    // Already expired
    const expired = new Date(now);
    expired.setDate(expired.getDate() - 5);

    // Safe (90 days)
    const safe = new Date(now);
    safe.setDate(safe.getDate() + 90);

    const testWarranties = [
        {
            id: 'test-expiring-2days',
            productName: 'TEST: Laptop - 2 Days Left ⚠️',
            expiryDate: exp2days.toISOString().split('T')[0],
            warrantyPeriod: '2 days',
            days: 2
        },
        {
            id: 'test-expiring-15days',
            productName: 'TEST: Phone - 15 Days Left 📱',
            expiryDate: exp15days.toISOString().split('T')[0],
            warrantyPeriod: '15 days',
            days: 15
        },
        {
            id: 'test-expired',
            productName: 'TEST: Camera - EXPIRED 🚫',
            expiryDate: expired.toISOString().split('T')[0],
            warrantyPeriod: '0 days',
            days: -5
        },
        {
            id: 'test-safe',
            productName: 'TEST: Watch - Safe ✅',
            expiryDate: safe.toISOString().split('T')[0],
            warrantyPeriod: '90 days',
            days: 90
        }
    ];

    console.log('🧪 Adding test warranties...\n');

    testWarranties.forEach((w, index) => {
        db.run(
            `INSERT OR REPLACE INTO warranties 
            (id, user_id, product_name, retailer, purchase_date, warranty_period, expiry_date, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
            [w.id, userId, w.productName, 'Test Store', now.toISOString().split('T')[0], w.warrantyPeriod, w.expiryDate],
            (err) => {
                if (err) {
                    console.error(`❌ Failed: ${w.productName}`, err.message);
                } else {
                    console.log(`✅ Added: ${w.productName}`);
                    console.log(`   Expiry: ${w.expiryDate} (${w.days > 0 ? w.days + ' days' : 'expired'})`);
                }

                if (index === testWarranties.length - 1) {
                    console.log('\n✅ All test warranties added!');
                    console.log('\n🔄 Now refresh your browser to see:');
                    console.log('   🚫 1 EXPIRED (red)');
                    console.log('   ⚠️  2 EXPIRING SOON (amber)');
                    console.log('   ✅ 1 SAFE (green)');
                }
            }
        );
    });
});
