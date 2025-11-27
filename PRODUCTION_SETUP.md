# 🚀 Production Deployment Guide - Make Your App Live

Your app is deployed on **Vercel (Frontend) + Render (Backend)**. Follow these steps to make it fully functional.

---

## 📋 Prerequisites Checklist

- [x] Gmail account with 2-factor authentication enabled
- [x] Vercel account (for frontend)
- [x] Render account (for backend)
- [x] GitHub repository (for continuous deployment)

---

## ⚙️ STEP 1: Get Gmail App Password

**Why?** The email service needs a secure app-specific password, not your regular Gmail password.

1. Go to https://myaccount.google.com/apppasswords
2. Select **Mail** and **Windows Computer** (or your device)
3. Google generates a 16-character password like: `xxxx xxxx xxxx xxxx`
4. **Copy this exactly** (you'll need it multiple times)

**Save it somewhere safe - you'll use it in Steps 2 & 3.**

---

## 🔧 STEP 2: Configure Local Development

Edit `.env.local` in your project root:

```env
VITE_GOOGLE_GENAI_API_KEY=AIzaSyByO7txWsL2aAX80HjWBehR3OJjZlh0GYM
EMAIL_USER=shahsank1995@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
NOTIFICATION_TIME=09:00
NODE_ENV=development
```

**Replace `xxxx-xxxx-xxxx-xxxx` with your Gmail App Password from Step 1.**

---

## 🌐 STEP 3: Configure Render Backend

Your backend is deployed on Render. Configure it to connect to PostgreSQL and use email.

### 3.1 Set Up PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click **New +** → **PostgreSQL**
3. Configure:
   - **Name**: `warranties-db`
   - **Database**: `warranties`
   - **User**: `postgres` (default)
   - **Region**: Choose closest to your location
   - **Plan**: Free tier (0.5GB, auto-paused)
4. Click **Create Database**
5. Copy the **Internal Database URL** (starts with `postgresql://`)

### 3.2 Set Environment Variables on Render

1. Go to https://dashboard.render.com → Select `warranties-api` service
2. Go to **Environment** tab
3. Add these variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | (paste the PostgreSQL URL from Step 3.1) |
| `EMAIL_USER` | `shahsank1995@gmail.com` |
| `EMAIL_PASSWORD` | `xxxx-xxxx-xxxx-xxxx` (from Step 1) |
| `VITE_GOOGLE_GENAI_API_KEY` | `AIzaSyByO7txWsL2aAX80HjWBehR3OJjZlh0GYM` |
| `FRONTEND_URL` | `https://warranties-app.vercel.app` |

4. Click **Save** → Render automatically deploys with new env vars

**Verify deployment:**
```
curl https://warranties-api.onrender.com/api/health
```

Expected response:
```json
{ "status": "ok", "timestamp": "2025-11-27T...", "env": "production" }
```

---

## 🎨 STEP 4: Configure Vercel Frontend

### 4.1 Set Environment Variables

1. Go to https://vercel.com → Select `warranties-app` project
2. **Settings** → **Environment Variables**
3. Add:

| Key | Value |
|-----|-------|
| `VITE_GOOGLE_GENAI_API_KEY` | `AIzaSyByO7txWsL2aAX80HjWBehR3OJjZlh0GYM` |
| `VITE_API_URL` | `/api` |

4. **Save**

### 4.2 Redeploy Frontend

1. Go to **Deployments** tab
2. Click the three dots on the latest deployment
3. Select **Redeploy** (or push a commit to auto-redeploy)

---

## ✅ STEP 5: Test the Full Flow

### Test 1: Backend Health Check
```
curl https://warranties-api.onrender.com/api/health
```
Expected: `{ "status": "ok", ... }`

### Test 2: Frontend Load
1. Open https://warranties-app.vercel.app
2. Should show **Login/Signup** page without errors
3. Check browser console (F12) for any errors

### Test 3: Email Verification Flow
1. Click **Sign Up**
2. Enter email and password
3. Click **Create Account**
4. **Check your email inbox** for 6-digit code
5. Enter code and verify
6. You should be logged in to the app

### Test 4: Receipt Scanning (Gemini API)
1. Click the **+** button to add warranty
2. Choose **Upload Receipt** or **Camera**
3. Upload/scan a receipt with product, price, date
4. AI should extract warranty info
5. Save it

### Test 5: Dashboard
1. See your saved warranties
2. See warranty expiry alerts
3. Dashboard stats should update

---

## 🐛 Troubleshooting

### Issue: "Failed to send verification email"
**Solution:**
- Verify `EMAIL_PASSWORD` is your Gmail App Password (not regular password)
- Check it doesn't contain spaces: `xxxxxxxxxxxx` (16 chars, no spaces)
- Verify 2-factor auth is enabled on your Gmail account
- Check Render logs: `Dashboard → warranties-api → Logs`

### Issue: "Invalid email or password" during login
**Solution:**
- Make sure you completed email verification during signup
- Check database connection: Email Render logs for database errors
- Verify database credentials in env vars

### Issue: Receipt scanning returns error
**Solution:**
- Verify `VITE_GOOGLE_GENAI_API_KEY` is correct in Vercel
- Check browser console (F12) for detailed error
- Ensure image is <50MB and valid format (JPG, PNG, PDF)

### Issue: Frontend shows 404 for API calls
**Solution:**
- Check Vercel's `vercel.json` has correct rewrite rules
- Verify Render backend is running: https://warranties-api.onrender.com/api/health
- Check CORS settings in `server/index.js` include Vercel domain

---

## 📊 Database Schema

Your app uses these tables (auto-created):

```sql
-- Users
users (id, email, name, password_hash, email_verified)

-- Warranties
warranties (id, productName, purchaseDate, warrantyPeriod, retailer, expiryDate, receiptImage)

-- Auth
verification_codes (email, code, expires_at, used)

-- Settings
notification_settings (user_id, email_enabled, alert_threshold)
device_tokens (user_id, token, platform)
```

---

## 🔒 Security Checklist

- [ ] Gmail App Password generated (not regular password)
- [ ] `EMAIL_PASSWORD` not in version control (only in env vars)
- [ ] Render database has SSL enabled
- [ ] CORS restricted to Vercel domain
- [ ] Helmet security headers enabled
- [ ] No sensitive data in browser storage (only auth flag)

---

## 🚀 Continuous Deployment

Your setup supports auto-deployment:

1. **Frontend**: Push to GitHub → Vercel auto-deploys
2. **Backend**: Push to GitHub → Configure Render auto-deploy
   - Go to `warranties-api` → **Settings** → **Auto Deploy**
   - Choose your GitHub branch

---

## 📞 Support & Monitoring

### Monitor Render Logs
```
Dashboard → warranties-api → Logs
```

### Monitor Vercel Logs
```
Project → Deployments → Click deployment → Logs
```

### Test Email Manually
```bash
curl -X POST https://warranties-api.onrender.com/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

---

## 🎯 Next Steps

1. ✅ Complete Steps 1-5 above
2. ✅ Test all flows
3. ✅ Monitor logs for errors
4. ✅ Invite beta users
5. ✅ Collect feedback and iterate

**Your app is now live at: https://warranties-app.vercel.app**

---

Generated: 2025-11-27  
Last Updated: 2025-11-27
