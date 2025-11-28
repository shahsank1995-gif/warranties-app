// No need to import fetch in Node.js v18+

async function testLogin() {
    console.log('Testing Login API...');
    const url = 'https://warranties-api.onrender.com/api/auth/login';
    const body = {
        email: 'demo@repusense.com',
        password: 'password123'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        console.log(`Status: ${response.status}`);
        const contentType = response.headers.get('content-type');
        console.log(`Content-Type: ${contentType}`);

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log('Response Data:', JSON.stringify(data, null, 2));
        } else {
            const text = await response.text();
            console.log('Response Text (First 500 chars):', text.substring(0, 500));
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testLogin();
