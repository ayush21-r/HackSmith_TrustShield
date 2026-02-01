# 🚀 PostgreSQL Migration - Quick Reference

## ✅ Files Changed (Database Config Only)

```
backend/prisma/schema.prisma         provider: sqlite → postgresql
backend/.env                          SQLite path → PostgreSQL connection string
backend/.env.production.example       Updated with Supabase format
POSTGRES_MIGRATION_GUIDE.md           This guide (new file)
```

## 🔄 Database Migration Flow

```
SQLite (dev.db)
    ↓ [Migration Applied]
    ↓
PostgreSQL (Supabase)
    ↓
Render Backend
    ↓
Production Ready ✅
```

## 📝 Changes Summary

### Before (SQLite)
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

### After (PostgreSQL)
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 🎯 Deployment Commands

```bash
# 1. Push to GitHub
git add backend/
git commit -m "Migrate: SQLite to PostgreSQL"
git push origin main

# 2. Set on Render Dashboard
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# 3. Watch logs
# Render auto-redeploys when env vars change
```

## ✨ Environment Variable Format

**Supabase Connection String:**
```
postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres
```

**Where to Find:**
- Supabase → Project Settings → Database → Connection String
- Select "Session" mode for Render compatibility

## 🔐 Security Checklist

✅ DATABASE_URL set on Render (not GitHub)
✅ Supabase project created and initialized
✅ Connection string properly formatted
✅ Password URL-encoded if special characters
✅ .env file excluded from git (in .gitignore)

## 📊 Data Handling

**For Hackathon Project:**
- ✅ Start with fresh PostgreSQL database
- ✅ Don't need to migrate old SQLite data
- ✅ Test data can be seeded if needed

**If You Need Old Data:**
- Export SQLite dump
- Import to PostgreSQL
- (Not recommended for demo project)

## 🧪 Testing After Deployment

1. **Check Logs**
   ```
   Render Dashboard → Logs
   Look for: "Database ready" or "Connected"
   ```

2. **Test API**
   ```
   curl https://your-backend.onrender.com/health
   Expected: {"status": "TrustShield backend is running"}
   ```

3. **Test Login**
   ```
   POST /api/auth/login
   Body: {"email": "employee@example.com", "password": "password123"}
   Expected: JWT token returned
   ```

4. **Check Data Persistence**
   ```
   Create complaint → Close tab → Reopen → Data still there ✅
   ```

## ⚠️ Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Cannot connect to database" | DATABASE_URL not set | Add to Render env vars |
| "Invalid connection string" | Wrong format | Use Supabase session string |
| "Authentication failed" | Wrong password | Check Supabase credentials |
| "Database doesn't exist" | New postgres db | Supabase creates it automatically |

## 📱 Monitoring

**Supabase Monitoring:**
- Project → Logs
- View query performance
- Monitor connection pool

**Render Monitoring:**
- Metrics → Database uptime
- Check response times
- Monitor error rates

## 🎯 Migration Status

```
✅ Schema updated to PostgreSQL
✅ Environment files configured
✅ Documentation provided
✅ Safe to deploy (no logic changes)
✅ No API changes
✅ No frontend changes
✅ No auth changes
```

**Ready to Deploy! 🚀**

---

## Quick Start (TL;DR)

```bash
# 1. Create Supabase account & project
# 2. Get DATABASE_URL from Supabase
# 3. Push code: git push origin main
# 4. Set DATABASE_URL on Render dashboard
# 5. Done! Auto-redeploys and uses PostgreSQL
```

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Prisma PostgreSQL**: https://www.prisma.io/docs/orm/overview/databases/postgresql
- **Render Env Vars**: https://render.com/docs/configure-environment-variables
- **Database Troubleshooting**: Check Render logs first!
