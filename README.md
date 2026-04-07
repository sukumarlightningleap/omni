# UNRWLY STOREFRONT ENGINE

## DATABASE INFRASTRUCTURE
The `DATABASE_URL` is the single source of truth for all products, collections, and configurations. 

### PERSISTENT DATA CLAIM
When migrating to a new database (or if the client provides their own DB URL):
1.  **Identity Claim**: Ensure you set `MASTER_ADMIN_EMAIL` in your environment variables.
2.  **Registration**: Sign up with that email at `/auth`. You will be automatically granted the `ADMIN` role.
3.  **Data Synchronization**: Your new database will be empty. To backfill all products from the Printify master catalog, navigate to the **Products** section in the Admin Dashboard and click the **"Sync Printify"** button. This will pull all live products into your new institutional database.

### ENVIRONMENT VARIABLES
- `DATABASE_URL`: Your PostgreSQL connection string.
- `MASTER_ADMIN_EMAIL`: The email address that inherits all administrative rights.
- `NEXT_PUBLIC_APP_URL`: Your production URL (e.g., `https://unrwly.com`).
- `STRIPE_SECRET_KEY`: For production payment processing.
- `AUTH_SECRET`: Your Auth.js v5 secret for secure sessions.

---
**DATA: PERSISTENT // IDENTITY: TRANSFERABLE // UI: POLARIS_SYNC**
