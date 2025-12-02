// Run this in Node.js locally to create your account
// Usage: node create-account-local.js

const https = require('https');

const data = JSON.stringify({
    email: 'prakamyak2001@gmail.com',
    name: 'Prakamyak',
    password: 'password123'
});

const options = {
    hostname: 'warranties-api.onrender.com',
    port: 443,
    path: '/api/admin/create-user',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('\nResponse:');
        console.log(body);
        console.log('\nYou can now login with:');
        console.log('Email: prakamyak2001@gmail.com');
        console.log('Password: password123');
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
