# Login & Signup Issues - Troubleshooting Guide

## ✅ What's Working
- **Gemini API Key**: Already correctly set to `AIzaSyByO7txWsL2aAX80HjWBehR3OJjZlh0GYM` in `.env.local`
- **Vite Proxy**: Backend API calls are proxied to `http://localhost:3000/api` ✓
- **Frontend Logic**: LoginPage, signup flow, and email verification UI are all functional ✓

## ❌ Problems Blocking Login/Signup

### Problem #1: EMAIL PASSWORD IS A PLACEHOLDER
**Current value in .env.local:**
```
EMAIL_PASSWORD=paste-your-16-letter-code-here
```

**This MUST be fixed** - the email service cannot send verification codes without a valid Gmail App Password.

**Solution:**
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your device)
3. Copy the 16-character password generated
4. Replace the placeholder in `.env.local`:
   ```
   EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
   ```

### Problem #2: Backend Server Not Running
The frontend expects the backend API at `http://localhost:3000`.

**Required actions before testing login:**
1. Open a **new terminal** in the `server` folder
2. Run:
   ```powershell
   npm install  # (if not done yet)
   npm start    # or npm run dev for development with auto-reload
   ```
3. You should see: `Server running on port 3000`

### Problem #3: Frontend Server Port
Make sure frontend is running on port 5173:
```powershell
npm run dev  # (in the root folder)
```

---

## 🔄 Complete Setup Steps to Get Login Working

### Step 1: Update Email Password (CRITICAL)
Edit `.env.local` and replace the EMAIL_PASSWORD placeholder with a real Gmail App Password.

### Step 2: Start Backend Server
```powershell
cd server
npm install
npm start
```
You should see: `Server running on port 3000`

### Step 3: Start Frontend Server
In a different terminal, from the root folder:
```powershell
npm run dev
```
You should see: `Local: http://localhost:5173`

### Step 4: Test Login/Signup
1. Open http://localhost:5173 in your browser
2. Click "Sign Up"
3. Enter an email and password
4. **Check your email** for the 6-digit verification code
5. Enter the code to complete signup
6. You should now be able to access the app

---

## 📧 Email Service Flow (How It Works)

1. User clicks "Sign Up" → `LoginPage.tsx` calls `registerUser()`
2. Frontend sends POST to `/api/auth/register` → Backend receives email, name, password
3. Backend generates 6-digit code and stores it in database
4. Backend calls `sendVerificationEmail()` via Nodemailer
5. **Nodemailer connects to Gmail SMTP using EMAIL_USER and EMAIL_PASSWORD**
6. Email is sent to user
7. User enters code in frontend → Frontend calls `verifyCode()`
8. Backend validates code and creates user account

**If email isn't sending:** The EMAIL_PASSWORD is definitely the culprit.

---

## 🚀 Gemini API (Already Configured)

- API Key: `AIzaSyByO7txWsL2aAX80HjWBehR3OJjZlh0GYM` ✓
- Environment Variable: `VITE_GOOGLE_GENAI_API_KEY` ✓
- Used in: `services/geminiService.ts` for receipt scanning/extraction
- Status: **Ready to use once user is logged in**

---

## 🔍 Debugging Tips

### Check if backend is running:
```powershell
curl http://localhost:3000/api/warranties
```

### Check if frontend can reach backend:
Open browser DevTools (F12) → Network tab → Try signup → Look for `/api/auth/register` call

### Check email configuration:
- Look at server logs for `sendVerificationEmail` errors
- Verify EMAIL_USER matches the account where you generated the App Password

---

## ❓ FAQ

**Q: Why is signup showing an error?**
A: Most likely EMAIL_PASSWORD is still the placeholder or backend isn't running.

**Q: I got a 404 on /api/auth/register**
A: Backend server isn't running on port 3000. Start it with `npm start` in the server folder.

**Q: Email is sent but verification code doesn't match**
A: Database issue or code expired (10 min timeout). Check server logs.

**Q: I created an account but can't login with the same credentials**
A: Make sure you completed email verification. Login requires an account created via signup flow.

---

Generated: 2025-11-27
