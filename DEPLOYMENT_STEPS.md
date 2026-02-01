# Quick Deployment Checklist - Production API Routing

## ✅ Code Changes (Already Done)

- [x] Updated `frontend/src/api/client.js` with better error handling
- [x] Fixed `frontend/vite.config.js` for SPA routing
- [x] Created `frontend/vercel.json` for direct route access
- [x] Updated `backend/src/server.js` for dynamic CORS

---

## 🎯 What You Need to Do (3 Steps)

### Step 1: Set Environment Variable on Vercel (CRITICAL)

1. Go to https://vercel.com/dashboard
2. Click your TrustShield project
3. Settings → Environment Variables
4. Add variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://hacksmith-trustshield.onrender.com`
5. Click "Save"
6. Go to Deployments
7. Click "Redeploy" on the latest commit (or just push code to auto-deploy)

### Step 2: Push Code to GitHub

```bash
cd c:\Project\TrustShield
git add .
git commit -m "Fix: Production API routing for Vercel + Render

- Improve API client error handling and logging
- Add SPA routing configuration (vercel.json)
- Dynamic CORS for all environments
- Better debugging for development"
git push origin main
```

### Step 3: Verify Deployment

1. Wait for Vercel to finish deploying (2-3 min)
2. Open your Vercel frontend URL
3. Open browser Developer Tools (F12)
4. Go to Console tab
5. Look for logs like:
   ```
   🚀 Production Mode
   📋 VITE_API_URL: https://hacksmith-trustshield.onrender.com
   🔗 API Base URL: https://hacksmith-trustshield.onrender.com/api
   ```
6. Try login with `employee@example.com` / `password123`
7. Check Network tab to verify API calls go to Render backend

---

## 🔍 What Was Fixed

### Problem ❌
- API calls were hitting `/api/*` on Vercel instead of Render
- Getting 405 Method Not Allowed
- Login failed in production
- Direct routes returned 404

### Solution ✅
- API client now uses `VITE_API_URL` environment variable
- All requests go through proper axios baseURL
- SPA routing configured for Vercel (vercel.json)
- CORS dynamically accepts Vercel domain
- Better error messages for debugging

---

## 📋 Files That Changed

| File | Type | What Changed |
|------|------|---|
| `frontend/src/api/client.js` | Modified | Enhanced error handling, development logging |
| `frontend/vite.config.js` | Modified | Explicit proxy config |
| `frontend/vercel.json` | NEW | SPA routing for Vercel |
| `backend/src/server.js` | Modified | Dynamic CORS configuration |

---

## 🧪 How to Test

### In Browser (Production)
1. Login page loads ✅
2. Enter credentials ✅
3. Login button works (no 405 error) ✅
4. Redirects to dashboard ✅
5. Can click "View Details" ✅
6. Direct URL access: `/complaint/123` works ✅
7. Page refresh doesn't return 404 ✅

### In Browser Console
```javascript
// Check API URL
console.log(import.meta.env.VITE_API_URL)
// Should show: https://hacksmith-trustshield.onrender.com

// Check network requests
// Go to Network tab, perform login
// Should see: https://hacksmith-trustshield.onrender.com/api/auth/login
// NOT: https://your-vercel-domain/api/auth/login
```

---

## 🆘 If Login Still Fails

### Check 1: Environment Variable Set
```
Vercel → Settings → Environment Variables
Look for: VITE_API_URL = https://hacksmith-trustshield.onrender.com
```

### Check 2: Render Backend Running
```
https://dashboard.render.com
Select your backend service
Check Logs - should see: ✅ Server running on port 5000
```

### Check 3: Browser Console Logs
```
F12 → Console tab
Should see: 🚀 Production Mode
Should see: 🔗 Backend URL: https://hacksmith-trustshield.onrender.com
```

### Check 4: Network Tab
```
F12 → Network tab → Perform login
Look at request URL:
✅ CORRECT: https://hacksmith-trustshield.onrender.com/api/auth/login
❌ WRONG: https://your-vercel-domain/api/auth/login
```

---

## ⏱️ Expected Timeline

| Step | Time |
|------|------|
| Set VITE_API_URL on Vercel | 1 min |
| Push code to GitHub | 1 min |
| Vercel build & deploy | 2-3 min |
| Total | ~5 min |

---

## 🎉 Success Indicators

When everything is working:
- ✅ Login page loads
- ✅ Login with demo credentials succeeds
- ✅ Redirected to dashboard
- ✅ Complaints load
- ✅ Can create new complaint
- ✅ HR can view and manage
- ✅ No 405 errors
- ✅ No "Cannot reach API" errors
- ✅ Console shows correct backend URL

---

## Demo Credentials

```
Employee Account:
Email: employee@example.com
Password: password123

HR Account:
Email: hr@example.com
Password: password123
```

---

## Support Resources

- **API Routing Details:** [PRODUCTION_API_ROUTING_FIX.md](PRODUCTION_API_ROUTING_FIX.md)
- **Backend Configuration:** [backend/SECURITY_AUDIT.md](backend/SECURITY_AUDIT.md)
- **Production Tests:** [PRODUCTION_TEST_REPORT.md](PRODUCTION_TEST_REPORT.md)

---

**Status: Ready to Deploy! 🚀**

Follow the 3 steps above and your production API routing will be fixed!
