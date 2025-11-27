# 📧 Email Notification Setup Guide

Follow these steps to configure email notifications for your warranty tracker.

## Step 1: Gmail Account Setup

### Option A: Use Existing Gmail
Use any Gmail account you have access to.

### Option B: Create New Gmail (Recommended)
Create a dedicated Gmail account for the app:
1. Go to gmail.com
2. Click "Create account"
3. Use a name like "Warranto Notifications"
4. Complete setup

---

## Step 2: Generate App Password

**Important:** You CANNOT use your regular Gmail password. You must create an "App Password":

### Instructions:

1. **Go to your Google Account:**
   - Visit: https://myaccount.google.com/

2. **Enable 2-Step Verification (if not already enabled):**
   - Click "Security" in left sidebar
   - Click "2-Step Verification"  
   - Follow prompts to enable

3. **Create App Password:**
   - Go back to "Security"
   - Click "App passwords" (near bottom)
   - Select "Mail" for app
   - Select "Windows Computer" for device
   - Click "Generate"
   - **COPY THE 16-CHARACTER PASSWORD** (you won't see it again!)

---

## Step 3: Configure .env.local

1. Open `c:/Users/hp/Desktop/app/.env.local`

2. Add these lines (replace with your actual values):

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
NOTIFICATION_TIME=09:00
```

**Example:**
```
EMAIL_USER=warranto.alerts@gmail.com
EMAIL_PASSWORD=xmpl qwer tyui asdf
NOTIFICATION_TIME=09:00
```

**Notes:**
- `EMAIL_USER`: Your full Gmail address
- `EMAIL_PASSWORD`: The 16-character app password (spaces are okay)
- `NOTIFICATION_TIME`: What time to send daily alerts (24-hour format)

---

## Step 4: Restart Server

After saving `.env.local`:

```bash
# Stop the current server (Ctrl+C in the terminal)
# Then start again:
node index.js
```

---

## Step 5: Test Email

1. Open the app in your browser
2. Go to Settings (we'll create the UI next)
3. Enter your email address
4. Click "Send Test Email"
5. Check your inbox!

---

## Troubleshooting

### "Invalid login" error
- ✅ Make sure you're using App Password, not regular password
- ✅ Ensure 2-Step Verification is enabled
- ✅ Check for typos in email/password

### "Connection refused" error
- ✅ Check internet connection
- ✅ Gmail might be temporarily blocked - try again in a few minutes

### Emails going to spam
- Mark first email as "Not Spam"
- Future emails should go to inbox

---

## Next Steps

Once email is configured, you'll be able to:
- ✅ Receive daily alerts for expiring warranties
- ✅ Customize alert threshold (15/30/60 days)
- ✅ Toggle notifications on/off
- ✅ Set custom notification time

**Ready to configure your Gmail?** Follow Step 2 above!
