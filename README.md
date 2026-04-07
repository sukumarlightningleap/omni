# Unrwly: Admin Command Center
Premium administrative interface for Unrwly storefront management.

## 🚨 DANGER ZONE: DATABASE IMMORTALITY PROTOCOL

To prevent accidental data loss, the following rules are strictly enforced:

### 1. NO `prisma db push` IN PRODUCTION
Never run `npx prisma db push` against the production database. This command can be destructive and may wipe your tables if Prisma cannot resolve a schema conflict incrementally.

### 2. USE MIGRATIONS + SHADOW DATABASE
All production schema changes MUST use the migration workflow:
1. Ensure `DIRECT_URL` (for migrations) and `DATABASE_URL` (for connection pooling) are correctly set.
2. Run `npx prisma migrate dev` in a development environment to generate a migration file.
3. This process uses a **Shadow Database** to safely test the migration before it touches any real data (standard on Supabase and most Cloud DBs).
4. Deploy migrations using `npx prisma migrate deploy`.

### 3. DELETION GUARDS
The Prisma client is hardened with guards that block **bulk `deleteMany`** operations on core models (`Product`, `Order`, `User`) when `NODE_ENV=production`. These guards will throw a "RED ALERT" error if a bulk wipe is attempted.

### 4. AUTO-RECOVERY
If the `Product` table is ever detected as empty (0 Skus), the **Sync Printify** action will automatically initiate a **Full Restore** mode, rebuilding your catalog and core collections ("New Arrivals", "Best Sellers") from your Printify API source-of-truth.
