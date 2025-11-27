# ✅ Complete Deployment Checklist

Complete all items below to make your app fully live and functional.

## 🔐 Email Setup (CRITICAL)

- [ ] Get Gmail App Password from https://myaccount.google.com/apppasswords
  - [ ] 2FA enabled on Gmail account
  - [ ] Select "Mail" and your device type
  - [ ] Copy 16-character password
  
- [ ] Add to `.env.local`:
  ```env
  EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
  EMAIL_USER=shahsank1995@gmail.com
  ```

- [ ] Verify email works locally:
  ```bash
  npm run dev  # Start frontend on :5173
  cd server && npm start  # Start backend on :3000
  # Go to http://localhost:5173 and test signup
  ```

## 🗄️ Database Setup (Production)

- [ ] Create PostgreSQL on Render
  - [ ] Go to https://dashboard.render.com
  - [ ] Click **New +** → **PostgreSQL**
  - [ ] Name: `warranties-db`
  - [ ] Plan: Free tier
  - [ ] Copy **Internal Database URL**

- [ ] Set on Render `warranties-api`:
  - [ ] Go to **Environment** tab
  - [ ] Add `DATABASE_URL` = (PostgreSQL URL)
  - [ ] Click **Save** → Auto-deploys

## 🔑 Environment Variables

### Render Backend (https://dashboard.render.com)
- [ ] `NODE_ENV` = `production`
- [ ] `DATABASE_URL` = (PostgreSQL URL)
- [ ] `EMAIL_USER` = `shahsank1995@gmail.com`
- [ ] `EMAIL_PASSWORD` = (Gmail App Password)
- [ ] `VITE_GOOGLE_GENAI_API_KEY` = `AIzaSyByO7txWsL2aAX80HjWBehR3OJjZlh0GYM`
- [ ] `FRONTEND_URL` = `https://warranties-app.vercel.app`
- [ ] `PORT` = `10000`

### Vercel Frontend (https://vercel.com)
- [ ] `VITE_GOOGLE_GENAI_API_KEY` = `AIzaSyByO7txWsL2aAX80HjWBehR3OJjZlh0GYM`
- [ ] `VITE_API_URL` = `/api`

## 🧪 Testing

### Backend Health
- [ ] `curl https://warranties-api.onrender.com/api/health`
  - Expected: `{"status":"ok",...}`

### Frontend Load
- [ ] Open https://warranties-app.vercel.app
- [ ] No console errors (F12)
- [ ] Signup page displays correctly

### Full Auth Flow
- [ ] Click "Sign Up"
- [ ] Enter email & password
- [ ] **Check email inbox** for 6-digit code
- [ ] Enter code → Account created
- [ ] Login with same credentials
- [ ] Dashboard shows (even with 0 warranties)

### Gemini API (Receipt Scanning)
- [ ] Click **+** button
- [ ] Click **Upload Receipt**
- [ ] Upload receipt image
- [ ] AI should extract product name, date, price
- [ ] Save warranty
- [ ] Appears in dashboard

### Alerts & Notifications
- [ ] Set alert threshold to 30 days
- [ ] Create warranty expiring in <30 days
- [ ] Alert badge appears on header
- [ ] Click alert to see details

## 🔒 Security

- [ ] EMAIL_PASSWORD NOT in .gitignore ❌
- [ ] All secrets in env vars only ✓
- [ ] CORS restricted to Vercel domain ✓
- [ ] HTTPS enabled on both Vercel & Render ✓
- [ ] Helmet security headers configured ✓

## 📊 Monitoring

- [ ] Check Render logs: `warranties-api → Logs`
- [ ] Check Vercel logs: `Project → Deployments → Click latest → Logs`
- [ ] Monitor database: Render → `warranties-db → Dashboard`

## 🚀 Go Live

- [ ] All tests above pass ✓
- [ ] Backend health check working ✓
- [ ] Email sending works ✓
- [ ] Authentication complete (signup → verify → login) ✓
- [ ] Receipt scanning works ✓
- [ ] Share URL: https://warranties-app.vercel.app

## 📝 Documentation

- [ ] Updated README.md with:
  - [ ] Live URL
  - [ ] Feature overview
  - [ ] Tech stack
  - [ ] How to contribute

- [ ] Created PRODUCTION_SETUP.md ✓
- [ ] Created this checklist ✓

## 🔄 Continuous Deployment

- [ ] GitHub repository connected to Vercel ✓
- [ ] GitHub repository connected to Render ✓
- [ ] Auto-deploy on push enabled ✓
- [ ] Deployment status in GitHub visible ✓

## 🆘 Troubleshooting

### Issue: Email not sending
- [ ] Check Render logs for error messages
- [ ] Verify EMAIL_PASSWORD is not the placeholder
- [ ] Verify Gmail App Password (not regular password)
- [ ] Verify 2FA is enabled on Gmail

### Issue: "Failed to fetch" errors
- [ ] Check CORS settings in `server/index.js`
- [ ] Verify Render backend is running
- [ ] Check browser console (F12) for actual error
- [ ] Verify API_URL in frontend is `/api`

### Issue: Database errors
- [ ] Check DATABASE_URL format (starts with `postgresql://`)
- [ ] Verify connection from Render service
- [ ] Check database exists with correct tables
- [ ] Verify SSL certificate chain if needed

### Issue: Receipt scanning fails
- [ ] Check GEMINI_API_KEY in Vercel env vars
- [ ] Verify image file is valid (JPG, PNG, PDF)
- [ ] Check browser console for error
- [ ] Verify API key quota not exceeded

---

## 📞 Need Help?

1. Check logs: Render Dashboard → `warranties-api` → **Logs**
2. Check browser errors: F12 → Console
3. Review PRODUCTION_SETUP.md for detailed steps
4. Check server logs locally: `npm run dev` + `npm start` (server)

---

**Status**: ⏳ Deployment in progress  
**Target**: 🎯 Make app live and fully functional  
**Owner**: shahsank1995-gif  
**Last Updated**: 2025-11-27
