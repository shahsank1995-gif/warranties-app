const nodemailer = require('nodemailer');

try {
    console.log('Nodemailer:', nodemailer);
    console.log('createTransporter type:', typeof nodemailer.createTransporter);

    if (typeof nodemailer.createTransporter === 'function') {
        console.log('✅ nodemailer.createTransporter is a function');
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: { user: 'test', pass: 'test' }
        });
        console.log('✅ Transporter created successfully');
    } else {
        console.error('❌ nodemailer.createTransporter is NOT a function');
    }
} catch (error) {
    console.error('❌ Error:', error);
}
