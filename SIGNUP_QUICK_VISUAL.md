# Quick Sign-Up Flow - Visual Guide

## Step-by-Step Visual

```
START
  ↓
[Open Browser]
  ↓
Go to: https://warranties-app.vercel.app
  ↓
[See Login Page]
  ↓
Click "SIGN UP" tab
  ↓
[Fill Form]
  ├─ Name: John Doe
  ├─ Email: john@gmail.com
  └─ Password: MyPassword123
  ↓
Click "CREATE ACCOUNT →"
  ↓
[System sends email]
  ↓
Check Email Inbox ✉️
  ├─ Open email from "Warranto"
  ├─ Find 6-digit code
  ├─ Example: 123456
  └─ Copy code
  ↓
Back in App
  ↓
[Enter Code in 6 Boxes]
  ├─ Box 1: 1
  ├─ Box 2: 2
  ├─ Box 3: 3
  ├─ Box 4: 4
  ├─ Box 5: 5
  └─ Box 6: 6
  ↓
Click "VERIFY CODE"
  ↓
✅ SUCCESS!
  ↓
[See Dashboard]
  ↓
Ready to add warranties!
  ↓
END
```

---

## What to Do If Email Doesn't Arrive

```
Email not received?
  ↓
  ├─→ Check SPAM folder (look there first!)
  │
  ├─→ In app: Click "RESEND CODE"
  │
  ├─→ Wait 30 seconds
  │
  └─→ Check email again
      ↓
      Code arrived? ✅ Continue with Step 6
      Still nothing? Check WiFi/Internet connection
```

---

## After Sign-Up: Adding Your First Warranty

```
Now in Dashboard
  ↓
Click "+" Button (top right)
  ↓
Choose How to Add:
  ├─→ TAKE PHOTO 📷
  │   ├─ Point camera at receipt
  │   ├─ Click photo
  │   ├─ Wait 3-5 seconds (AI working)
  │   └─ Review & Save
  │
  ├─→ UPLOAD RECEIPT 📁
  │   ├─ Click "Upload"
  │   ├─ Choose file from computer
  │   ├─ Wait 3-5 seconds (AI working)
  │   └─ Review & Save
  │
  └─→ ADD MANUALLY ✏️
      ├─ Type product name
      ├─ Enter purchase date
      ├─ Enter warranty period
      ├─ Enter retailer (optional)
      └─ Click "Save Warranty"
  ↓
✅ Warranty Added!
  ↓
See on Dashboard
```

---

## Dashboard Overview

```
┌─────────────────────────────────────────┐
│          WARRANTO DASHBOARD             │
├─────────────────────────────────────────┤
│                                         │
│  Your Warranties       [⚙️ Settings]    │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ 📱 Samsung Galaxy S21           │   │ ← Valid
│  │ Expires: May 2026 (1y 6m left)  │ 🟢 │
│  │ ✏️ Edit | 📥 Download | 🗑️ Delete   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ 💻 Dell Laptop XPS              │   │ ← Expiring Soon
│  │ Expires: Dec 15 (18 days left)  │ 🟡 │
│  │ ✏️ Edit | 📥 Download | 🗑️ Delete   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ ⌚ Apple Watch Series 7          │   │ ← Expired
│  │ Expired: Oct 2024 (EXPIRED)     │ 🔴 │
│  │ ✏️ Edit | 📥 Download | 🗑️ Delete   │
│  └──────────────────────────────────┘   │
│                                         │
│         [+] Add New Warranty            │
│                                         │
└─────────────────────────────────────────┘
```

---

## Sign-Up Troubleshooting Decision Tree

```
Something went wrong?
  │
  ├─→ "Email not received"
  │   └─→ Check spam folder
  │       └─→ Click "Resend Code" in app
  │           └─→ Try again in 1 minute
  │
  ├─→ "Code expired"
  │   └─→ 10-minute limit, just click "Resend Code"
  │       └─→ You'll get a new code
  │
  ├─→ "Wrong password"
  │   └─→ Min 6 characters, case-sensitive
  │       └─→ Check CAPS LOCK is off
  │           └─→ Try again
  │
  ├─→ "Email already registered"
  │   └─→ You already have an account!
  │       └─→ Click "Login" instead of "Sign Up"
  │           └─→ Use your email & password
  │
  └─→ "Server error"
      └─→ Check internet connection
          └─→ Refresh page (F5)
              └─→ Try again in 30 seconds
```

---

## Key Points to Remember

**Email Verification**
- ✉️ Check inbox for code email
- ⏱️ Code expires in 10 minutes
- 🔄 Click "Resend Code" if needed
- 🔐 Code is unique & one-time use

**Password**
- 🔑 Minimum 6 characters
- 📝 Case-sensitive (A ≠ a)
- 🔒 Never shared with us
- 💾 Encrypted in database

**First Warranty**
- 📷 Use camera for quick upload
- 🤖 AI auto-extracts warranty info
- ✏️ Or add manually if no receipt
- 💾 Saves automatically

---

## Success Checklist

- [ ] Created account with email & password
- [ ] Received verification code email
- [ ] Entered code and verified
- [ ] Saw Dashboard
- [ ] Added first warranty (photo or manual)
- [ ] Can see warranty on dashboard
- [ ] Got alert if expiring soon

**All checked?** ✅ You're ready to use Warranto!

---

**Next Step:** Add more warranties and set your alert preferences!

**App URL:** https://warranties-app.vercel.app
