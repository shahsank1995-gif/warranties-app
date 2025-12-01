# PostgreSQL Setup Guide

## Quick Setup for Render Deployment

### 1. Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "PostgreSQL"
3. Configure:
   - Name: `warranties-db`
   - Database: `warranties`
   - User: `warranties_user`
   - Region: Same as your web service
   - Plan: Free (or paid for production)
4. Create Database
5. Copy the **External Database URL** (starts with `postgres://`)

### 2. Add to Environment Variables

In your Render web service:
1. Go to Environment tab
2. Add new variable:
   - Key: `DATABASE_URL`
   - Value: `postgres://warranties_user:password@host/warranties` (paste the URL you copied)
3. Save Changes

### 3. Migration Runs Automatically

The database will auto-initialize on the next deployment because `server/database.js` runs migrations automatically.

## Local Development with PostgreSQL

If you want to use PostgreSQL locally instead of SQLite:

### Option 1: Docker (Recommended)

```bash
docker run --name warranties-postgres -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=warranties -p 5432:5432 -d postgres:15

# Add to .env.local:
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/warranties
```

### Option 2: Install PostgreSQL Locally

Windows:
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use chocolatey:
choco install postgresql
```

Then create database:
```sql
CREATE DATABASE warranties;
CREATE USER warranties_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE warranties TO warranties_user;
```

Add to `.env.local`:
```
DATABASE_URL=postgresql://warranties_user:yourpassword@localhost:5432/warranties
```

## Verify Connection

```bash
cd server
node -e "require('./database.js')"
```

You should see: `✅ Connected to PostgreSQL database`

## Migration Status

The system automatically:
- Creates all required tables
- Runs organization migration
- Sets up indexes
- Seeds default data

No manual migration needed!
