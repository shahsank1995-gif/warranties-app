const nodemailer = require('nodemailer');

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Send warranty expiry notification email
 * @param {string} recipientEmail - User's email address
 * @param {Array} expiringWarranties - Array of warranties expiring soon
 * @param {number} alertThreshold - Number of days before expiry to alert
 */
async function sendExpiryNotificationEmail(recipientEmail, expiringWarranties, alertThreshold) {
  if (!recipientEmail || !expiringWarranties || expiringWarranties.length === 0) {
    return { success: false, message: 'Invalid parameters' };
  }

  try {
    const transporter = createTransporter();

    // Create warranty list HTML
    const warrantyListHTML = expiringWarranties.map(w => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <strong>${w.productName}</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          ${w.retailer || 'N/A'}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #f59e0b;">
          <strong>${w.daysRemaining} days</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          ${new Date(w.expiryDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })}
        </td>
      </tr>
    `).join('');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
      <div style="background-color: rgba(255,255,255,0.2); display: inline-block; padding: 12px; border-radius: 50%; margin-bottom: 10px;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
        ⚠️ Warranty Alert
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
        You have ${expiringWarranties.length} ${expiringWarranties.length === 1 ? 'warranty' : 'warranties'} expiring soon
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 0;">
        Hello! 👋
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        This is a friendly reminder that the following ${expiringWarranties.length === 1 ? 'warranty is' : 'warranties are'} expiring within the next <strong>${alertThreshold} days</strong>:
      </p>

      <!-- Warranties Table -->
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 12px; text-align: left; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Product</th>
            <th style="padding: 12px; text-align: left; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Retailer</th>
            <th style="padding: 12px; text-align: left; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Days Left</th>
            <th style="padding: 12px; text-align: left; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Expires On</th>
          </tr>
        </thead>
        <tbody>
          ${warrantyListHTML}
        </tbody>
      </table>

      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          <strong>💡 Tip:</strong> Review your warranties before they expire. Check if you need to make any claims or renew coverage.
        </p>
      </div>

      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Login to <strong>Warranto</strong> to view full details and manage your warranties.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          View My Warranties
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        You're receiving this email because you enabled warranty alerts in Warranto.
      </p>
      <p style="color: #6b7280; font-size: 12px; margin: 8px 0 0 0;">
        © ${new Date().getFullYear()} Warranto - Warranty Tracking Made Simple
      </p>
    </div>

  </div>
</body>
</html>
    `;

    const mailOptions = {
      from: `"Warranto Alerts" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `⚠️ ${expiringWarranties.length} ${expiringWarranties.length === 1 ? 'Warranty' : 'Warranties'} Expiring Soon`,
      html: htmlContent,
      text: `Warranty Expiry Alert\n\nYou have ${expiringWarranties.length} ${expiringWarranties.length === 1 ? 'warranty' : 'warranties'} expiring within the next ${alertThreshold} days:\n\n` +
        expiringWarranties.map(w => `- ${w.productName} (${w.retailer || 'N/A'}) - Expires in ${w.daysRemaining} days`).join('\n')
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: `Email sent successfully to ${recipientEmail}`
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Send test email
 * @param {string} recipientEmail - Email to send test to
 */
async function sendTestEmail(recipientEmail) {
  if (!recipientEmail) {
    return { success: false, message: 'Email address required' };
  }

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Warranto Alerts" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: '✅ Test Email - Warranto Notifications',
      html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 8px;">
    <h1 style="color: white; margin: 0;">✅ Email Configured Successfully!</h1>
  </div>
  <div style="padding: 20px; background: #f9f9f9; margin-top: 20px; border-radius: 8px;">
    <p>Great news! Your email notifications are working perfectly.</p>
    <p>You'll now receive alerts when your warranties are about to expire.</p>
    <p style="margin-top: 30px; color: #666; font-size: 14px;">
      This is a test email from Warranto.
    </p>
  </div>
</body>
</html>
      `,
      text: 'Email configured successfully! You will now receive warranty expiry notifications.'
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: `Test email sent to ${recipientEmail}`
    };
  } catch (error) {
    console.error('Error sending test email:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Send verification code email
 * @param {string} recipientEmail - User's email
 * @param {string} code - 6-digit verification code
 * @param {string} name - User's name (optional)
 */
async function sendVerificationEmail(recipientEmail, code, name = null) {
  if (!recipientEmail || !code) {
    return { success: false, message: 'Email and code required' };
  }

  try {
    const transporter = createTransporter();
    const greeting = name ? `Hi ${name}!` : 'Hello!';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">
        Welcome to Warranto! 🎉
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
        Your warranty tracking journey starts here
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 40px;">
      <p style="color: #374151; font-size: 18px; line-height: 1.6; margin-top: 0;">
        ${greeting}
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Thanks for signing up! To complete your registration, please verify your email with the code below:
      </p>

      <!-- Verification Code -->
      <div style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border: 2px dashed #8b5cf6; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
          Your Verification Code
        </p>
        <div style="font-size: 48px; font-weight: bold; letter-spacing: 8px; color: #8b5cf6; font-family: monospace;">
          ${code}
        </div>
        <p style="color: #9ca3af; font-size: 13px; margin: 10px 0 0 0;">
          Code expires in 10 minutes
        </p>
      </div>

      <div style="background-color: #ede9fe; border-left: 4px solid #8b5cf6; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #5b21b6; font-size: 14px;">
          <strong>🔒 Security Tip:</strong> Never share this code with anyone. Warranto will never ask for it.
        </p>
      </div>

      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Once verified, you'll be able to:
      </p>
      <ul style="color: #374151; font-size: 16px; line-height: 1.8; padding-left: 20px;">
        <li>📸 Scan receipts instantly with AI</li>
        <li>🔔 Get expiry alerts before warranties expire</li>
        <li>📱 Track warranties across all devices</li>
        <li>📊 Never miss a warranty claim again</li>
      </ul>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        If you didn't request this code, please ignore this email.
      </p>
      <p style="color: #6b7280; font-size: 12px; margin: 8px 0 0 0;">
        © ${new Date().getFullYear()} Warranto - Track with confidence
      </p>
    </div>

  </div>
</body>
</html>
        `;

    const mailOptions = {
      from: `"Warranto" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `${code} is your Warranto verification code`,
      html: htmlContent,
      text: `${greeting}\n\nYour Warranto verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: `Verification email sent to ${recipientEmail}`
    };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

module.exports = {
  sendExpiryNotificationEmail,
  sendTestEmail,
  sendVerificationEmail
};
