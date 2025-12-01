# Deployment Architecture

**Last Updated:** December 1, 2025

## Frontend (Vercel)
- **URL:** https://warranties-app.vercel.app
- **Deploys:** React app from root directory
- **Triggers:** Git push to main branch
- **Build:** `npm run build` 
- **Files:** App.tsx, components/, etc.

## Backend (Render)  
- **URL:** https://warranto-backend.onrender.com
- **Deploys:** Node.js server from `/server` directory
- **Triggers:** Git push to main branch
- **Files:** server/index.js, server/database.js, etc.

---

## Recent Changes
We modified **server/index.js** (backend), so:
- ✅ Vercel deployment SHOULD succeed (no frontend changes)
- ⚠️ Render deployment needs to be checked

## Action Required
**Check Render deployment logs at:**
https://dashboard.render.com

The backend deployment might have an issue with the logger import or another dependency.

---

## Quick Fix
If Render shows an error, the logs will tell us exactly what's wrong. Most likely:
1. Missing dependency import
2. Syntax error
3. Logger not found

Let me know what the Render logs show!
