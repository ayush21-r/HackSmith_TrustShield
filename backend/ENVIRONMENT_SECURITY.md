# 🔒 Environment Variables & Security Guide

## Overview

Your TrustShield backend uses environment variables to store sensitive information securely. This guide explains best practices for managing secrets.

---

## 🔐 Critical Secrets (NEVER Hardcode)

### 1. DATABASE_URL ✅ PROTECTED
- **Purpose**: PostgreSQL connection string from Supabase
- **Format**: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
- **Storage**: 
  - ✅ `.env` file (in `.gitignore` - not committed)
  - ✅ `Render Dashboard` → Environment Variables
- **Usage**: `process.env.DATABASE_URL` in `backend/src/server.js`
- **Never**: Commit to git, log to console, send to frontend

### 2. JWT_SECRET ✅ PROTECTED
- **Purpose**: Sign authentication tokens (24-hour validity)
- **Format**: Random string (minimum 32 characters)
- **Storage**:
  - ✅ `.env` file (in `.gitignore` - not committed)
  - ✅ `Render Dashboard` → Environment Variables
- **Usage**: `process.env.JWT_SECRET` in `backend/src/middleware/auth.js`
- **Never**: Commit to git, log to console, send to frontend

### 3. FRONTEND_URL (Optional)
- **Purpose**: Allow CORS requests from specific frontend domain
- **Format**: `https://your-frontend-domain.com`
- **Storage**: Environment variable (not sensitive, can be public)
- **Never**: Include credentials in this URL

---

## ✅ Security Checklist

- [x] `.env` file is in `.gitignore`
- [x] Database credentials loaded via `process.env.DATABASE_URL`
- [x] JWT secret loaded via `process.env.JWT_SECRET`
- [x] No secrets printed in console logs
- [x] No secrets exposed via API endpoints
- [x] CORS prevents unauthorized frontend access
- [x] `server.js` validates all required env vars at startup

---

## 🚀 Local Development Setup

### Step 1: Create `.env` File
```bash
cd backend
cp .env.example .env
```

### Step 2: Fill in Your Values
Edit `backend/.env`:
```dotenv
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/trustshield"
JWT_SECRET="dev-jwt-secret-12345678901234567890"
PORT=5000
NODE_ENV=development
```

### Step 3: Start Backend
```bash
npm start
```

The app will validate that `DATABASE_URL` and `JWT_SECRET` are set.

---

## 🚀 Production Deployment (Render)

### Step 1: Set Environment Variables on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your backend service
3. Go to **Settings** → **Environment**
4. Add these variables:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
JWT_SECRET=your-prod-secret-key-change-this
PORT=5000
NODE_ENV=production
```

### Step 2: What NOT to Include in `.env.production.example`

We provide a template (`.env.production.example`) with placeholder values:
```dotenv
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@[HOST]:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important**: Replace `[YOUR_PASSWORD]` and `[HOST]` with actual Supabase values before setting on Render.

### Step 3: Push Code & Deploy

```bash
git add backend/
git commit -m "Security: Add environment variable validation"
git push origin main
```

Render will:
1. Pull your code
2. Use the environment variables you set on Render dashboard
3. Start the backend with Supabase PostgreSQL

---

## 🛡️ How Secrets Are Protected

### In Code
```javascript
// ✅ CORRECT - Always use environment variables
const dbUrl = process.env.DATABASE_URL;

// ❌ WRONG - Never hardcode
const dbUrl = "postgresql://postgres:mypassword@host:5432/db";
```

### In Logs
```javascript
// ✅ CORRECT - Demo credentials only (not real)
console.log('Demo: employee@example.com / password123');

// ❌ WRONG - Never log actual DATABASE_URL
console.log(`Connecting to: ${process.env.DATABASE_URL}`);
```

### In Git
```bash
# ✅ .gitignore protects .env files
.env
.env.local
backend/.env

# ✅ .env never committed to GitHub
git status  # Should NOT show backend/.env
```

### To Frontend
```javascript
// ✅ CORRECT - Frontend never receives DATABASE_URL
res.json({ token, user });  // No secrets included

// ❌ WRONG - Never expose secrets to frontend
res.json({ token, dbUrl: process.env.DATABASE_URL });
```

---

## 🔍 Verification Commands

### Check that .env is ignored
```bash
git status  # Should NOT show backend/.env
git ls-files | grep ".env"  # Should return nothing
```

### Verify server validates env vars
```bash
cd backend
npm start
# Should see: "✅ Server running on port 5000"
# Or error: "❌ ERROR: DATABASE_URL not set..."
```

### Verify no secrets in logs
```bash
# Check that log files don't contain DATABASE_URL
grep -r "DATABASE_URL" backend/logs/
grep -r "PASSWORD" backend/logs/
# Should return nothing
```

---

## 📝 Environment Variables Reference

| Variable | Local Dev | Production | Required |
|----------|-----------|------------|----------|
| `DATABASE_URL` | PostgreSQL localhost | Supabase | ✅ Yes |
| `JWT_SECRET` | dev-secret | prod-secret | ✅ Yes |
| `PORT` | 5000 | 5000 | ⚠️ Auto |
| `NODE_ENV` | development | production | ⚠️ Auto |
| `FRONTEND_URL` | N/A | Vercel domain | ❌ Optional |

---

## 🆘 Troubleshooting

### Error: "DATABASE_URL not set"
**Fix**: 
- Local: Add `DATABASE_URL` to `.env`
- Render: Set `DATABASE_URL` in dashboard → Environment

### Error: "Cannot find module .env"
**Fix**: This is fine - .env is optional if vars set via system environment

### Error: "Connection refused"
**Fix**:
- Verify DATABASE_URL is correct
- Test with Supabase connection tester
- Check Supabase status page

### Accidentally committed .env?
**Fix** (do this immediately):
```bash
git rm --cached backend/.env
git commit -m "Security: Remove .env from git history"
git push origin main
# Then rotate all secrets!
```

---

## 🚨 Security Incidents

### If you suspect a secret was exposed:

1. **Immediately rotate all secrets**:
   - Generate new JWT_SECRET
   - Rotate Supabase password via Project Settings
   - Revoke all active JWT tokens

2. **Update environment variables**:
   - Update `.env` locally
   - Update Render dashboard
   - Restart backend

3. **Audit logs**:
   - Check `backend/logs/auth-log.txt` for suspicious activity
   - Review Supabase audit logs in Project Settings

---

## ✨ Best Practices Summary

✅ **DO**:
- Use `.env` for local development
- Use Render environment variables for production
- Validate required env vars at startup
- Generate strong JWT_SECRET (use crypto)
- Rotate secrets regularly
- Use `.env.example` as template only

❌ **DON'T**:
- Commit `.env` to git (use `.gitignore`)
- Hardcode secrets in code
- Log DATABASE_URL or JWT_SECRET
- Send secrets to frontend
- Reuse secrets across environments
- Use weak JWT_SECRET

---

## 📞 Support

For issues:
1. Check that `.env` file exists and has all required variables
2. Verify `NODE_ENV=development` or `NODE_ENV=production` is correct
3. Check Render logs for detailed error messages
4. Verify Supabase connection string format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

---

**Your backend is now production-safe! 🔒**
