# NUFV Lost & Found Management System

Modern Lost & Found system for National University Fairview (NUFV), built with Next.js, TypeScript, Prisma, and PostgreSQL.

This project replaces the older PHP-based workflow with a single web app for:

- public browsing of available found items
- staff item intake and management
- admin reporting, user management, audit logs, and database tools

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL / Neon
- JWT authentication with `jose`
- Password hashing with `bcryptjs`
- Email delivery with `nodemailer`
- CSV import/export with `papaparse`
- Vercel Blob for file storage

## Current Feature Set

### Public Site

- browse available items without logging in
- search and filter by keyword, category, and date range
- public detail modal with aligned item codes
- support-the-developer widget on the public page

### Staff / Dashboard

- login with JWT session cookies
- add found items using the current intake flow
- edit item records
- delete items with confirmation modal and audit logging
- claim items with verification details
- dispose items with disposal reason
- manage claimed items

### Admin

- admin-only access to user management
- reports with item code support in preview and CSV export
- audit logs
- settings
- database page under `/admin/database`
  - storage usage
  - backup downloads

### Background / Utility

- disposal and overdue cron endpoints
- legacy SQL migration and reconciliation scripts
- backup/export endpoints for database tools

## Recent Updates

The repository now includes the following major fixes and improvements:

- sequential item code format: `ITEM-YYYY-####`
- migrated and reconciled legacy item codes from older SQL exports
- settings/session identity fixes so users no longer fall back to a fake default account
- stricter admin-only protection for database/admin tools
- delete flow in both manage-items and edit-item screens
- remember-me support in login
- session persistence fixes across dashboard navigation
- public page filtering tightened to exclude:
  - flagged items
  - disposed items
  - items scheduled for disposal
  - non-pending items
- forgot-password flow and reset-password flow
- IT support contact flow
- public and admin item code display alignment
- dark mode table contrast fixes for dashboard tables

## Authentication Behavior

### Session Duration

- normal login: 24 hours
- login with remember me: 30 days

### Cookie Settings

- `httpOnly: true`
- `sameSite: lax`
- `secure: true` in production
- path-wide auth cookie

### Access Rules

- public homepage does not require login
- dashboard pages require authentication
- admin pages require a current database user with `role = ADMIN`

## Public Item Visibility Rules

Public pages only show items that match all of the following:

- `status = PENDING`
- `isFlagged = false`
- `isDisposed = false`
- `disposalDate = null`

## Project Structure

```text
src/
  app/
    page.tsx                    public homepage
    (auth)/login/               login page
    (dashboard)/                dashboard pages
    api/                        route handlers
  components/
    admin/                      admin UI
    auth/                       login, forgot password, support
    items/                      item forms, modals, tables
    layout/                     header, sidebar, dashboard shell
    public/                     homepage and public browse UI
  lib/
    auth.ts                     JWT and cookie helpers
    admin.ts                    admin/session helpers
    items.ts                    shared item queries
    prisma.ts                   Prisma client

prisma/
  schema.prisma

scripts/
  legacy.sql
  migrate-data.ts
  reconcile-legacy-item-codes.ts
```

## Environment Variables

Use `.env.local` or Vercel project environment variables.

```env
# Database
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_xxx"

# Auth
JWT_SECRET="your-jwt-secret-here"
CRON_SECRET="your-cron-secret-here"
NEXTAUTH_URL="http://localhost:3000"
APP_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_NAME="NUFV Lost and Found"
NEXT_PUBLIC_MAX_FILE_SIZE=5242880

# Email
LOST_AND_FOUND_EMAIL_USER="lostandfound@nu-fairview.edu.ph"
LOST_AND_FOUND_EMAIL_PASS="your-app-password-here"
IT_SUPPORT_EMAIL="aureocv@students.nu-fairview.edu.ph"
```

## Local Development

Install dependencies:

```bash
npm install
```

Generate Prisma client:

```bash
npx prisma generate
```

Push schema to the database:

```bash
npx prisma db push
```

Run the app:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Useful Scripts

```bash
npm run dev
npm run build
npm run start
npm run db:push
npm run db:migrate
npm run db:seed
```

## Deployment Notes

Recommended deployment target: Vercel.

Before deploying:

- set all required environment variables in Vercel
- ensure `DATABASE_URL` points to the production Neon/PostgreSQL database
- ensure `JWT_SECRET` is set
- ensure email variables are valid if forgot-password and IT support features are enabled
- redeploy without cache if Prisma schema or generated client changed

## Data Migration Notes

This project includes scripts used to import and reconcile data from legacy SQL exports.

Typical flow:

1. replace `scripts/legacy.sql` with the newer export
2. run the migration script
3. run item-code reconciliation if needed
4. verify counts and item code coverage

## Status

The application is currently set up as the active Next.js replacement for the older NUFV Lost & Found workflow, with:

- updated imported data
- working session persistence
- remember-me login support
- admin database tools
- item claim, dispose, edit, and delete flows

