# 📱 Firebase Push Notifications Setup Guide

## Step 1: Create Firebase Project

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Click "Add project" (or "Create a project")

2. **Project Setup:**
   - **Project name:** `Warranto` (or your preferred name)
   - Click "Continue"
   - **Google Analytics:** You can disable it for now (toggle off)
   - Click "Create project"
   - Wait for it to finish (takes ~30 seconds)
   - Click "Continue"

---

## Step 2: Add Android App

1. **In Firebase Console:**
   - Click the **Android** icon (robot icon)
   - Or go to Project Settings → Your apps → Add app → Android

2. **Register App:**
   - **Android package name:** `com.warranto.app`
     - This MUST match the `appId` in your `capacitor.config.ts`
   - **App nickname (optional):** `Warranto`
   - **Debug signing certificate SHA-1 (optional):** Leave blank for now
   - Click "Register app"

3. **Download config file:**
   - Click "Download google-services.json"
   - **IMPORTANT:** Save this file, we'll use it soon!
   - Click "Next" → "Next" → "Continue to console"

---

## Step 3: Get Firebase Server Key

1. **In Firebase Console:**
   - Click the ⚙️ (gear icon) → "Project settings"
   - Go to the "Cloud Messaging" tab

2. **Server Key:**
   - Find "Server key" (under "Cloud Messaging API (Legacy)")
   - **IMPORTANT:** Copy this entire key
   - It looks like: `AAAAxxx...yyy`
   - We'll add this to `.env.local`

3. **If you don't see Server Key:**
   - Click "Manage API in Google Cloud Console"
   - Enable "Cloud Messaging API"
   - Come back and refresh

---

## Step 4: Place Files in Project

### Firebase Config (Backend)

1. **In Firebase Console:**
   - Go to Project Settings → Service accounts
   - Click "Generate new private key"
   - Click "Generate key" → Download JSON file
   - **Rename it to:** `firebase-service-account.json`
   - **Place it in:** `c:/Users/hp/Desktop/app/server/`

### Google Services (Android)

1. **Take the `google-services.json` you downloaded earlier**
2. **Place it in:** `c:/Users/hp/Desktop/app/android/app/`
   - Create the `app` folder if it doesn't exist

---

## Step 5: Add Firebase Server Key to .env.local

Open `c:/Users/hp/Desktop/app/.env.local` and add:

```
FIREBASE_SERVER_KEY=AAAAxxx...yyy
```

Replace `AAAAxxx...yyy` with your actual Firebase Server Key.

---

## Summary Checklist

Before proceeding, make sure you have:

- [ ] Created Firebase project
- [ ] Added Android app to Firebase
- [ ] Downloaded `google-services.json` → placed in `android/app/`
- [ ] Generated service account JSON → placed in `server/` as `firebase-service-account.json`
- [ ] Copied Firebase Server Key → added to `.env.local`

---

## Next Steps

Once you complete these steps, I'll:
1. ✅ Configure the Capacitor plugin
2. ✅ Implement push notification service
3. ✅ Update backend to send notifications
4. ✅ Build and test on Android!

**Let me know when you've completed the Firebase setup!** 🚀
