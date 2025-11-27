require('dotenv').config({ path: '../.env.local' });
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('📧 Testing Email Configuration...');
    console.log('User:', process.env.EMAIL_USER ? process.env.EMAIL_USER : '(Not Set)');
    console.log('Password Length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    try {
        await transporter.verify();
        console.log('✅ Success! Server is ready to take our messages');
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('🔍 Google Response:', error.response);
        }
    }
}

testEmail();
