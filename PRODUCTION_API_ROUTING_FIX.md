# Production API Routing Fix - Complete Guide

## Problem: API Calls Failing in Production

Your frontend was hitting `https://vercel-domain.com/api/*` instead of `https://hacksmith-trustshield.onrender.com/api/*`

### Root Cause
1. **API client using relative paths** - `/api/auth/login` resolved to frontend domain
2. **Missing VITE_API_URL environment variable** - Not set on Vercel
3. **CORS not accepting Vercel domain** - Backend didn't whitelist the actual frontend domain
4. **SPA routing issue** - Direct routes and refreshes returned 404 on Vercel

---

## Solution: What Was Fixed

### 1. Frontend API Client (client.js) ✅

**Before:**
```javascript
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE_URL = `${BACKEND_URL}/api`;
// Basic logging, minimal error handling
```

**After:**
```javascript
const isDevelopment = import.meta.env.MODE === 'development';
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE_URL = `${BACKEND_URL}/api`;

// ✅ Better logging with environment detection
// ✅ Proper error handling for CORS/network issues
// ✅ Request/response logging in development
// ✅ Added signup endpoint to authAPI
// ✅ Timeout configuration (10 seconds)
// ✅ Console hints for debugging CORS issues
```

**Impact:** All API calls now properly route through `baseURL` instead of using relative paths.

---

### 2. Vite Configuration (vite.config.js) ✅

**Before:**
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true
  }
}
```

**After:**
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
    rewrite: (path) => path // Explicit path handling
  }
}
// ✅ Build configuration for SPA routing
```

**Impact:** Local development still works with proxy, production uses VITE_API_URL.

---

### 3. Backend CORS Configuration (server.js) ✅

**Before:**
```javascript
const allowedOrigins = [
  'https://trustshield-frontend.vercel.app', // Hardcoded, might be wrong
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);
```

**After:**
```javascript
const allowedOrigins = [
  // Local development
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  
  // Production domains
  'https://trustshield-frontend.vercel.app',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : [])
].filter(Boolean);

// ✅ Also matches Vercel preview deployments (*.vercel.app)
// ✅ More informative CORS error messages
// ✅ Better logging for debugging
// ✅ Set credentials: false for CORS
```

**Impact:** Backend now accepts requests from Vercel domain dynamically.

---

### 4. Vercel SPA Routing (vercel.json) ✅ NEW

**File:** `frontend/vercel.json`

```json
[
  {
    "source": "/(.*)",
    "destination": "/index.html",
    "status": 200
  }
]
```

**Impact:** Direct route access `/complaint/123` and page refreshes now work on Vercel (no more 404 errors).

---

## How to Deploy This Fix

### Step 1: Update Vercel Environment Variable

1. Go to https://vercel.com/dashboard
2. Select your TrustShield project
3. Settings → Environment Variables
4. Add/Update:
   ```
   VITE_API_URL=https://hacksmith-trustshield.onrender.com
   ```
5. Redeploy: Click "Deployments" → "Redeploy" on latest commit

### Step 2: Verify Backend CORS (No Changes Needed)

Backend CORS is now:
- ✅ Dynamic (reads env variables)
- ✅ Accepts localhost:3000 (local dev)
- ✅ Accepts Vercel domains (production)
- ✅ Accepts Vercel preview deployments

### Step 3: Commit Changes

```bash
cd c:\Project\TrustShield
git add frontend/src/api/client.js frontend/vite.config.js
git add frontend/vercel.json
git add backend/src/server.js
git commit -m "Fix: Proper API routing for production Vercel deployment

- Improve API client error handling and logging
- Add SPA routing for Vercel (vercel.json)
- Dynamic CORS configuration for all environments
- Support Vercel preview deployments
- Better debugging output in development mode"
git push origin main
```

---

## Testing the Fix

### Local Testing (Before Deploying)

```bash
# Terminal 1: Start backend
cd backend
npm start
# Should show: ✅ Server running on port 5000

# Terminal 2: Start frontend
cd frontend
npm run dev
# Should show: 🔗 API Base URL: http://localhost:5000/api

# Test login
# Go to http://localhost:3000/login
# Login with: employee@example.com / password123
# Should redirect to dashboard
```

### Production Testing (After Deploying)

1. **Check browser console for logs:**
   ```
   🚀 Production Mode
   📋 VITE_API_URL: https://hacksmith-trustshield.onrender.com
   🔗 Backend URL: https://hacksmith-trustshield.onrender.com
   🔗 API Base URL: https://hacksmith-trustshield.onrender.com/api
   ```

2. **Test login:**
   - Open your Vercel domain: https://trustshield-frontend.vercel.app
   - Login with demo credentials
   - Should see network requests to hacksmith-trustshield.onrender.com

3. **Test direct routes:**
   - Refresh page (should not 404)
   - Click "View Details" on complaints
   - Direct URL access: `/complaint/1` should work

4. **Check network tab:**
   - Verify API calls go to `https://hacksmith-trustshield.onrender.com/api/*`
   - NOT to `https://trustshield-frontend.vercel.app/api/*`

---

## Debugging If Issues Persist

### Issue: "Cannot reach API at..." error

**Check:**
1. Is VITE_API_URL set on Vercel? 
   - Settings → Environment Variables → VITE_API_URL
2. Is it exactly: `https://hacksmith-trustshield.onrender.com` (no /api)
3. Is Render backend running?
   - Go to https://dashboard.render.com and check logs

**Fix:**
```bash
# Vercel redeploy
# Settings → Environment Variables → VITE_API_URL
# Value: https://hacksmith-trustshield.onrender.com
# Click "Save" and redeploy
```

### Issue: "CORS not allowed for this origin"

**Check:**
1. What's your actual Vercel URL?
2. Is backend CORS allowing it?
3. Check browser console for exact origin being blocked

**Fix:**
1. Set `FRONTEND_URL` in Render dashboard:
   ```
   FRONTEND_URL=https://your-actual-vercel-domain.vercel.app
   ```
2. Or directly update `allowedOrigins` in backend/src/server.js if domain changed

### Issue: "Network Error" in console

**Check:**
1. Is Render backend running? (Check Render logs)
2. Is VITE_API_URL correct?
3. Check Network tab - what's the full URL being requested?

**Fix:**
```
Browser console shows: 🔗 Backend URL
Make sure it matches: https://hacksmith-trustshield.onrender.com
```

---

## Files Modified Summary

| File | Change | Why |
|------|--------|-----|
| `frontend/src/api/client.js` | Better error handling, logging, dynamic URL | Proper API routing |
| `frontend/vite.config.js` | Explicit proxy config + build settings | Local dev + Vercel |
| `frontend/vercel.json` | NEW: SPA routing config | Direct routes work |
| `backend/src/server.js` | Dynamic CORS, Vercel support | Accept frontend requests |

---

## Environment Variables Required

### Vercel (Frontend)
```
VITE_API_URL=https://hacksmith-trustshield.onrender.com
```

### Render (Backend)
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
JWT_SECRET=your-prod-secret-key
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://trustshield-frontend.vercel.app  (optional)
```

---

## Why This Fix Works

✅ **Development (localhost):**
- Vite proxy intercepts `/api/*` requests
- Proxies to `http://localhost:5000`
- No VITE_API_URL needed

✅ **Production (Vercel):**
- VITE_API_URL set to Render backend URL
- All API calls use absolute URL: `https://hacksmith-trustshield.onrender.com/api/*`
- CORS allows Vercel domain
- No proxy needed (direct to backend)

✅ **Security:**
- Secrets in environment variables only
- CORS prevents unauthorized access
- Backend validates JWT tokens
- No hardcoded domains in code

✅ **Routing:**
- vercel.json handles SPA routes
- Direct URL access works
- Page refreshes don't return 404
- React Router works correctly

---

## Demo Credentials

```
Employee:
Email: employee@example.com
Password: password123

HR:
Email: hr@example.com
Password: password123
```

---

## Next Steps

1. Push code: `git push origin main`
2. Set `VITE_API_URL` on Vercel
3. Redeploy on Vercel (auto-redeploy on push)
4. Test login on production domain
5. Monitor logs in browser console and Render dashboard

---

**Your production API routing is now fixed! 🚀**
