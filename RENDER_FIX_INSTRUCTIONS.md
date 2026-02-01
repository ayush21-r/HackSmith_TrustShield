# 🔧 CRITICAL: Fix Render Database Schema

## The Problem

The health endpoint still shows old code, and complaint submissions fail. This is likely because:

1. **Prisma migrations haven't run on Render's database**
2. Database tables don't exist yet
3. Render needs to be configured to run migrations on deploy

## Solution: Configure Render Build Command

### Step 1: Go to Render Dashboard
1. Go to https://dashboard.render.com
2. Click on "TrustShield Backend" service
3. Click "Settings"

### Step 2: Update Build Command
Find the "Build Command" field and set it to:

```bash
npm install && npx prisma migrate deploy && npm run seed
```

**Current (probably):** `npm install`
**Change to:** `npm install && npx prisma migrate deploy && npm run seed`

### Step 3: Verify Environment Variables
In Settings, scroll to "Environment", make sure these are set:
- ✅ `DATABASE_URL` - Should be your Supabase PostgreSQL URL
- ✅ `JWT_SECRET` - Should be a secure random string

### Step 4: Save and Redeploy
1. Click "Save" button at the bottom
2. Then click "Redeploy" button (top right)
3. Watch the deploy logs - you should see:
   ```
   Running build command: npm install && npx prisma migrate deploy && npm run seed
   🌱 Seeding database...
   ✅ Database seeded successfully
   ```

## What the Build Command Does

```bash
npm install              # Install dependencies
npx prisma migrate deploy # Apply database migrations (CREATE TABLES)
npm run seed            # Create demo users
```

**WITHOUT this:** Database tables don't exist → 500 errors when submitting complaints
**WITH this:** Tables created → Demo users created → Everything works ✅

---

## Timeline

| Step | Time | Status |
|------|------|--------|
| Update Build Command | Now | You do this |
| Click Save & Redeploy | Now | You do this |
| Render redeploys | 2-5 min | Auto |
| Tables created | 2-5 min | Auto |
| Demo users seeded | 2-5 min | Auto |
| Test complaint submission | After 5 min | You test |

---

## After Deployment

### Test 1: Check Health Endpoint
Go to: `https://hacksmith-trustshield.onrender.com/health`

Should show:
```json
{
  "status": "TrustShield backend is running",
  "database": "connected",
  "users": 2
}
```

If it shows:
- `"database":"disconnected"` → DATABASE_URL is wrong
- `"users":0` → Seed didn't run
- `"users":2` → ✅ SUCCESS

### Test 2: Submit a Complaint
1. Go to Vercel frontend
2. Login: `employee@example.com` / `password123`
3. Submit test complaint
4. Should see success (not 500 error)

### Test 3: Check Render Logs
If complaint still fails:
1. Go to Render dashboard
2. Click "TrustShield Backend"
3. Go to "Logs"
4. Look for error message
5. Send it to me

---

## If Render Build Command Can't Be Changed

Some Render plans don't allow changing build commands. If that's the case:

**Alternative: Manually run migration**

1. Install Prisma CLI locally: `npm install -g @prisma/client`
2. Set your DATABASE_URL environment variable
3. Run: `npx prisma migrate deploy`
4. Run: `npm run seed`
5. Then redeploy on Render

OR

**Create a one-time migration script:**

1. Create `backend/migrate-prod.js`:
```javascript
import { exec } from 'child_process';
exec('npx prisma migrate deploy && npm run seed', (err, stdout) => {
  console.log(stdout);
  if (err) console.error(err);
  process.exit(0);
});
```
2. Run it once to migrate production
3. Then Render auto-restart will work

---

## What's Actually Wrong

### Current State ❌
1. Database tables DON'T EXIST
2. When you submit complaint, Prisma tries to INSERT
3. Gets "table doesn't exist" error
4. Returns 500 error

### After Fix ✅
1. Build command runs migrations
2. All tables CREATED
3. Demo users INSERTED
4. Server starts
5. Complaint submission WORKS

---

## Quick Checklist

- [ ] Go to Render dashboard
- [ ] Click TrustShield Backend service
- [ ] Click Settings
- [ ] Find "Build Command" field
- [ ] Change to: `npm install && npx prisma migrate deploy && npm run seed`
- [ ] Click Save
- [ ] Click Redeploy
- [ ] Wait 5 minutes
- [ ] Test health endpoint
- [ ] Test complaint submission
- [ ] Report error if still broken

---

**This is the KEY FIX for the 500 errors!** The database schema doesn't exist on Render yet.
