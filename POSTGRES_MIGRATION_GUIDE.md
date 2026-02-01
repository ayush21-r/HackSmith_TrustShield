# 🚀 SQLite to PostgreSQL Migration Guide

## Migration Completed ✅

Your TrustShield backend has been configured to use PostgreSQL (Supabase) instead of SQLite.

### What Changed

| File | Change | Purpose |
|------|--------|---------|
| `backend/prisma/schema.prisma` | `provider = "postgresql"` | Use PostgreSQL instead of SQLite |
| `backend/.env` | PostgreSQL connection string | Local development database |
| `backend/.env.production.example` | Updated with Supabase URL format | Production deployment guide |

---

## 📋 Quick Setup

### Option 1: Local PostgreSQL Development (Optional)

If you want to test locally with PostgreSQL:

```bash
# 1. Install PostgreSQL locally or use Docker:
docker run --name trustshield-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=trustshield \
  -p 5432:5432 \
  -d postgres:latest

# 2. Update .env file:
DATABASE_URL="postgresql://postgres:password@localhost:5432/trustshield"

# 3. Run migrations:
cd backend
npx prisma migrate deploy

# 4. Start backend:
npm start
```

### Option 2: Use Supabase (Production) ⭐ Recommended

1. **Create Supabase Project**:
   - Go to https://supabase.com
   - Create new project
   - Wait for it to initialize (5-10 minutes)

2. **Get Connection String**:
   - Project Settings → Database
   - Connection pooling → Session mode
   - Copy the connection string
   - Format: `postgresql://postgres:[password]@[host]:5432/postgres`

3. **Deploy to Render**:
   - Go to https://dashboard.render.com
   - Go to your backend service
   - Settings → Environment Variables
   - Add:
     ```
     DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
     ```
   - Render will auto-redeploy

---

## 🔧 Deployment Steps

### Step 1: Push Code to GitHub

```bash
cd C:\Project\TrustShield
git add backend/prisma/schema.prisma backend/.env* 
git commit -m "Migrate: SQLite to PostgreSQL (Supabase)"
git push origin main
```

### Step 2: Set Environment Variable on Render

1. Go to Render Dashboard
2. Select your backend service
3. Settings → Environment
4. Add or update:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   ```
5. Click "Save"
6. Render will auto-redeploy

### Step 3: Verify Deployment

Watch the Render logs:
```
✓ Build started
✓ Building image...
✓ Pushing image to registry...
✓ Deploying new version...
✓ Database migrations applied
✓ Service is live
```

---

## ✅ Verification Checklist

- [ ] Code pushed to GitHub with schema changes
- [ ] DATABASE_URL set in Render environment variables
- [ ] Render redeploy completed successfully
- [ ] Check Render logs - no database connection errors
- [ ] Test login on frontend - should work
- [ ] Check HR dashboard - should load complaints
- [ ] Test creating new complaint - should save to Postgres

---

## 🛡️ Safety Verification

✅ **No API Logic Changed** - All routes, controllers, and logic untouched
✅ **No Frontend Changes** - Frontend works the same way
✅ **No Auth Changes** - Login/signup still uses same logic
✅ **Data Models Preserved** - All Prisma models unchanged
✅ **Connection String Format** - PostgreSQL compatible

---

## 📊 Data Migration

### If You Have Existing SQLite Data

To migrate existing data from SQLite:

```bash
# 1. Export SQLite data
sqlite3 backend/prisma/dev.db ".dump" > dump.sql

# 2. Create new PostgreSQL database tables
npx prisma migrate deploy --name sqlite_to_postgres

# 3. Import data (requires manual scripting based on your tables)
# For hackathon: You can start fresh as data is test data
```

**For this hackathon project**, starting with a fresh PostgreSQL database is recommended since all data is demo/test data.

---

## 🚨 Troubleshooting

### Error: "Cannot find a valid DATABASE_URL"

**Fix**: Ensure environment variable is set on Render
- Check Render Settings → Environment
- DATABASE_URL must be present and valid
- Redeploy after adding variable

### Error: "connection refused"

**Fix**: Check Supabase connection:
- Verify DATABASE_URL format: `postgresql://postgres:PASSWORD@HOST:5432/postgres`
- Test connection locally first
- Check Supabase status page

### Error: "authentication failed"

**Fix**: Database password issue:
- Confirm password is correct in Supabase
- Ensure special characters are URL-encoded
- Test with Supabase's connection tester

### Database still showing SQLite data

**Fix**: Ensure Render is using the new environment variable:
- Check environment variables in Render
- Verify DATABASE_URL is actually set (not empty)
- View Render logs during deployment
- Check that old SQLite file wasn't used as fallback

---

## 📝 What's Different

### SQLite (Before)
```javascript
// File-based database
DATABASE_URL="file:./prisma/dev.db"
// Limited concurrent connections
// Not suitable for production
```

### PostgreSQL (After)
```javascript
// Network-based database
DATABASE_URL="postgresql://user:password@host:5432/database"
// Unlimited concurrent connections
// Production-ready
// Can be accessed from anywhere with proper credentials
```

---

## ✨ Benefits of PostgreSQL

✅ **Production Ready** - Enterprise-grade database
✅ **Scalable** - Handles growth better than SQLite
✅ **Reliable** - Built-in replication and backups (Supabase)
✅ **Persistent** - Data survives application restarts
✅ **Accessible** - Can query database directly if needed
✅ **Hackathon Ready** - Free tier on Supabase with generous limits

---

## 🎯 Next Steps

1. **Immediately**: Push code to GitHub
2. **Today**: Set DATABASE_URL on Render
3. **Today**: Verify logs show successful deployment
4. **Today**: Test login and complaints work
5. **Optional**: Verify data persists across application restarts

---

## ❓ Questions?

Check Render logs for detailed error messages:
- Render Dashboard → Your Service → Logs
- Look for database connection errors
- Check if migrations ran successfully

All errors will be logged with full details for debugging.

---

## 🔒 Security Notes

⚠️ **Never commit DATABASE_URL to GitHub**
- Always use environment variables on Render
- `.env` file is in `.gitignore`
- Supabase credentials are secure

✅ **Supabase handles**:
- Automatic backups
- Point-in-time recovery
- Encrypted passwords
- Network-level security

---

**Migration Status: ✅ COMPLETE & READY FOR DEPLOYMENT**
