#!/usr/bin/env node

/**
 * Quick Deployment Health Check
 * Run: node deployment-check.js
 */

const https = require('https');
const http = require('http');

const endpoints = [
    { name: 'Vercel Frontend', url: 'https://warranties-app.vercel.app', method: 'GET' },
    { name: 'Render Backend Health', url: 'https://warranties-api.onrender.com/api/health', method: 'GET' },
    { name: 'Test Email Endpoint', url: 'https://warranties-api.onrender.com/api/auth/register', method: 'OPTIONS' },
];

async function checkEndpoint(endpoint) {
    return new Promise((resolve) => {
        const protocol = endpoint.url.startsWith('https') ? https : http;
        
        const req = protocol.request(endpoint.url, { 
            method: endpoint.method,
            timeout: 10000 
        }, (res) => {
            resolve({
                name: endpoint.name,
                status: res.statusCode,
                headers: res.headers,
                ok: res.statusCode >= 200 && res.statusCode < 400
            });
        });

        req.on('error', (err) => {
            resolve({
                name: endpoint.name,
                status: 0,
                error: err.message,
                ok: false
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                name: endpoint.name,
                status: 0,
                error: 'Request timeout',
                ok: false
            });
        });

        req.end();
    });
}

async function runChecks() {
    console.log('\n🔍 Deployment Health Check\n');
    console.log('Checking endpoints...\n');

    for (const endpoint of endpoints) {
        const result = await checkEndpoint(endpoint);
        const icon = result.ok ? '✅' : '❌';
        console.log(`${icon} ${result.name}`);
        if (result.status > 0) {
            console.log(`   Status: ${result.status}`);
        }
        if (result.error) {
            console.log(`   Error: ${result.error}`);
        }
        console.log('');
    }

    console.log('\n📋 Environment Variables Check\n');
    const required = [
        'VITE_GOOGLE_GENAI_API_KEY',
        'EMAIL_USER',
        'EMAIL_PASSWORD'
    ];

    required.forEach(env => {
        const icon = process.env[env] ? '✅' : '❌';
        console.log(`${icon} ${env}: ${process.env[env] ? '✓ Set' : '✗ Missing'}`);
    });

    console.log('\n📖 Setup Docs: See PRODUCTION_SETUP.md\n');
}

runChecks().catch(console.error);
