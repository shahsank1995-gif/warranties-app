<div align="center">
  <h1>📋 Warranto - Warranty Tracking App</h1>
  <p>Never miss a warranty again. AI-powered receipt scanning + smart expiry alerts</p>
  
  [![Live](https://img.shields.io/badge/LIVE-https%3A%2F%2Fwarranties--app.vercel.app-brightgreen?style=flat-square)](https://warranties-app.vercel.app)
  [![GitHub](https://img.shields.io/badge/GitHub-shahsank1995--gif-black?style=flat-square&logo=github)](https://github.com/shahsank1995-gif/warranties-app)
  [![Tech Stack](https://img.shields.io/badge/Stack-React%20%2B%20Express%20%2B%20PostgreSQL-blue?style=flat-square)](#tech-stack)
</div>

---

## 🌐 Live App

**Visit:** https://warranties-app.vercel.app

Try the app right now! Sign up, upload receipts, and track your warranties.

---

## ✨ Features

- **📸 AI Receipt Scanning** - Upload receipts and auto-extract warranty details using Google Gemini
- **🔔 Smart Alerts** - Get notified before warranties expire (configurable threshold)
- **📊 Dashboard** - View all warranties with expiry status at a glance
- **✉️ Email Notifications** - Receive reminders as warranties approach expiry
- **🔐 Secure Auth** - Email verification, password encryption with bcrypt
- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **🗄️ Multi-database Support** - SQLite for dev, PostgreSQL for production
- **☁️ Cloud Deployment** - Vercel frontend + Render backend

---

## 🚀 Quick Start

### Local Development

**Prerequisites:**
- Node.js 18+
- npm or yarn

**Setup:**

```bash
# 1. Clone the repository
git clone https://github.com/shahsank1995-gif/warranties-app.git
cd warranties-app

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd server
npm install
cd ..

# 4. Configure environment
# Edit .env.local and add:
# - VITE_GOOGLE_GENAI_API_KEY (get from Google AI Studio)
# - EMAIL_USER (your Gmail)
# - EMAIL_PASSWORD (Gmail App Password from myaccount.google.com/apppasswords)

# 5. Start backend (terminal 1)
cd server
npm start

# 6. Start frontend (terminal 2)
npm run dev

# 7. Open http://localhost:5173
```

### Production Deployment

See [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) for detailed deployment guide.

**Current Stack:**
- Frontend: Vercel
- Backend: Render
- Database: PostgreSQL (production) / SQLite (development)

---

## 📋 Usage

### 1. Sign Up
- Enter email and password
- Verify email with 6-digit code
- Account created!

### 2. Add Warranty
- Click **+** button
- Upload receipt image or use camera
- AI extracts product name, purchase date, warranty period
- Review and save

### 3. Track Warranties
- View all warranties on dashboard
- See expiry status (expired, expiring soon, valid)
- Get alerts for warranties expiring soon
- Configure alert threshold (days before expiry)

### 4. Manage
- Edit warranty details
- Download receipt as image
- Delete warranty
- Customize notification settings

---

## 🏗️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **React Icons** - UI components

### Backend
- **Express.js** - REST API
- **Node.js** - Runtime
- **SQLite** (dev) / **PostgreSQL** (prod) - Database
- **Nodemailer** - Email service
- **bcrypt** - Password hashing
- **Google Gemini API** - AI receipt extraction

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **GitHub** - Version control

---

## 🗂️ Project Structure

```
warranties-app/
├── index.tsx              # React entry point
├── App.tsx                # Main app component
├── components/            # React components
│   ├── LoginPage.tsx
│   ├── Dashboard.tsx
│   ├── ReceiptScanner.tsx
│   └── ...
├── services/              # API and external services
│   ├── api.ts
│   └── geminiService.ts
├── server/                # Express backend
│   ├── index.js           # Main server
│   ├── authService.js     # Authentication logic
│   ├── emailService.js    # Email sending
│   ├── database.js        # Database abstraction
│   └── ...
├── .env.local             # Local environment variables
├── vercel.json            # Vercel configuration
├── render.yaml            # Render deployment config
└── vite.config.ts         # Vite configuration
```

---

## 🔐 Security Features

- ✅ Email verification for signup
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ CORS restricted to trusted origins
- ✅ Helmet.js security headers
- ✅ No sensitive data in localStorage (auth flag only)
- ✅ Environment variables for secrets
- ✅ SSL/TLS for all connections
- ✅ Database connection pooling

---

## 📊 Database Schema

### Users Table
```sql
users (id, email, name, password_hash, email_verified, created_at)
```

### Warranties Table
```sql
warranties (id, productName, purchaseDate, warrantyPeriod, retailer, expiryDate, receiptImage, receiptMimeType, createdAt)
```

### Auth & Settings
```sql
verification_codes (id, email, code, expires_at, used, created_at)
notification_settings (user_id, email_enabled, alert_threshold, notification_time)
device_tokens (id, user_id, token, platform, created_at, last_used)
```

---

## 🚨 Troubleshooting

### Email not sending?
1. Verify Gmail App Password (not regular password)
2. Check 2FA is enabled on Gmail
3. Look for error in server logs

### Receipt scanning fails?
1. Verify Gemini API key is correct
2. Check image is valid format (JPG, PNG, PDF)
3. Ensure image is under 50MB

### Login/signup errors?
1. Check backend is running (`https://warranties-api.onrender.com/api/health`)
2. Verify DATABASE_URL is set correctly
3. Check browser console for detailed error

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more details.

---

## 📈 Performance

- **Frontend**: Vite provides ~300ms cold start
- **API Response**: Typical <200ms latency
- **Receipt Scanning**: 3-5 seconds per image
- **Database**: Connection pooling with PostgreSQL

---

## 🔄 Continuous Deployment

- Push to `main` branch
- Vercel auto-deploys frontend
- Render auto-deploys backend
- See deployment status in GitHub

---

## 📝 Environment Variables

### Frontend (.env.local)
```env
VITE_GOOGLE_GENAI_API_KEY=AIzaSyByO7txWsL2aAX80HjWBehR3OJjZlh0GYM
VITE_API_URL=/api
NODE_ENV=development
```

### Backend (server/.env.local)
```env
NODE_ENV=development
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
VITE_GOOGLE_GENAI_API_KEY=AIzaSyByO7txWsL2aAX80HjWBehR3OJjZlh0GYM
DATABASE_URL=
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 👤 Author

**shahsank1995-gif**
- GitHub: [@shahsank1995-gif](https://github.com/shahsank1995-gif)
- Live App: [https://warranties-app.vercel.app](https://warranties-app.vercel.app)

---

## 🙏 Acknowledgments

- Google Gemini API for AI receipt extraction
- Vercel for frontend hosting
- Render for backend hosting
- React and Node.js communities

---

## 📞 Support

- **Documentation**: See [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)
- **Deployment Checklist**: See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- **Troubleshooting**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Issues**: Create a GitHub issue for bugs or feature requests

---

**Last Updated**: November 27, 2025  
**Status**: ✅ Live in Production
