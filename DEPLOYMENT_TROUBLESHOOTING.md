# 🚀 TrustShield Deployment Troubleshooting Guide

## Problem 1: Login Always Says "Invalid"

### Checklist:
✅ Check credentials are correct:
- Email: `employee@example.com`
- Password: `password123`

✅ Check Render logs for errors:
1. Go to https://dashboard.render.com
2. Select your backend service
3. Check "Logs" tab for error messages

✅ Verify environment variables on Render:
- Settings → Environment
- JWT_SECRET should be set
- FRONTEND_URL should match your Vercel domain

---

## Problem 2: API Calls Fail After Deployment

### Check these in order:

**1. Check CORS Error:**
```
❌ CORS blocked request from: https://your-vercel-domain.vercel.app
```
This means the Vercel domain isn't in the CORS whitelist.

**Fix:**
- Update `backend/src/server.js` line 17:
  ```javascript
  'https://your-actual-vercel-domain.vercel.app',
  ```
- Or set FRONTEND_URL in Render environment variables

**2. Check Network Error:**
```
❌ Network Error - Cannot reach API at: https://hacksmith-trustshield.onrender.com
```
This means the API URL is wrong or service is down.

**Fix:**
- Check VITE_API_URL in Vercel Environment Variables
- Make sure it matches your Render backend URL exactly
- Remove `/api` from the end if present

**3. Check 401 Unauthorized:**
```
Status: 401
Message: Invalid credentials
```
This means the login endpoint is working, but credentials are wrong.

**Fix:**
- Double-check email and password
- Check backend logs on Render for which credentials were sent

---

## Environment Variables Setup

### On Vercel (Frontend):
1. Go to Project Settings → Environment Variables
2. Add:
   ```
   VITE_API_URL = https://hacksmith-trustshield.onrender.com
   ```
3. Redeploy

### On Render (Backend):
1. Go to Service Settings → Environment
2. Make sure these are set:
   ```
   PORT=5000
   JWT_SECRET=your-random-secret-key
   FRONTEND_URL=https://your-vercel-domain.vercel.app
   DATABASE_URL=file:./prisma/dev.db
   ```

---

## Debugging Steps

### 1. Check Frontend Console (Browser):
Open DevTools (F12) → Console tab
Look for blue/red API messages:
```
🔗 API Base URL: https://hacksmith-trustshield.onrender.com
❌ API Error: {status: 401, message: "Invalid credentials", ...}
```

### 2. Check Backend Logs (Render):
1. Dashboard → Your Service → Logs
2. Look for:
   ```
   ✅ Successful login: employee@example.com (EMPLOYEE)
   ⚠️  Failed login attempt for: test@example.com
   ❌ CORS blocked request from: https://wrong-domain.vercel.app
   ```

### 3. Test API Directly:
```bash
# Test backend is running
curl https://hacksmith-trustshield.onrender.com/health

# Test login endpoint
curl -X POST https://hacksmith-trustshield.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee@example.com","password":"password123"}'
```

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Invalid credentials" | Wrong email/password | Use: employee@example.com / password123 |
| CORS error | Vercel domain not whitelisted | Update CORS origins in backend |
| Network error | Wrong API URL | Check VITE_API_URL in Vercel settings |
| 500 error | JWT_SECRET not set | Add JWT_SECRET to Render env vars |
| Slow responses | Cold start on Render | Free tier has slow cold starts, upgrade if needed |

---

## Files Changed for Deployment

✅ `frontend/src/api/client.js` - Uses VITE_API_URL
✅ `backend/src/server.js` - CORS configuration for Vercel
✅ `backend/src/controllers/authController.js` - Better error logging
✅ `frontend/.env.production.example` - Environment template
✅ `backend/.env.production.example` - Environment template

---

## Quick Verification Checklist

- [ ] VITE_API_URL set in Vercel to correct Render URL
- [ ] FRONTEND_URL set in Render to correct Vercel URL
- [ ] JWT_SECRET set in Render
- [ ] Frontend deployed after environment changes
- [ ] Backend redeployed after environment changes
- [ ] Login credentials: employee@example.com / password123
- [ ] No localhost URLs remaining
- [ ] CORS allows your Vercel domain

---

## Still Having Issues?

1. Clear browser cache (Ctrl+Shift+Del)
2. Check browser console for specific error messages
3. Check Render logs for backend errors
4. Verify environment variables are exactly correct
5. Redeploy both frontend and backend after any changes
