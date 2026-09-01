# NUFV Lost & Found Management System

A modern, high-performance Lost & Found management system for National University Fairview (NUFV), built with Next.js 15, TypeScript, Prisma, and PostgreSQL.

---

## Overview

The NUFV Lost & Found system streamlines campus item recovery by providing:

- **Public Catalog:** Non-authenticated search and filterable directory of found items.
- **Staff Operations:** Intake flow, item status updates (Claim, Dispose, Edit), and modal inspection.
- **Admin Dashboard:** Role-based user management, filtered audit logs, and automated CSV reports.
- **Privacy & Security:** GCash-style claimer name masking with on-demand click-to-reveal toggle, zero fallback authenticators, and binary magic-byte image validation.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router, Server Components)
- **UI & Styling:** React 19, Tailwind CSS, Lucide-style SVG Icons
- **Database & ORM:** PostgreSQL (Neon) / Prisma ORM
- **Authentication:** JWT via `jose`, HttpOnly SameSite=Lax Cookies, `bcryptjs` password hashing (cost factor 10)
- **Storage:** Vercel Blob Storage
- **Charts & Export:** Recharts, PapaParse CSV

---

## Key Features

### 1. Public Browse & Search
- Filter items by category, keyword, status, location, and date range.
- Standardized `ITEM-YYYY-####` sequential item codes.
- Strictly displays active, non-flagged, `PENDING` items only.

### 2. Staff Management Dashboard
- Session-based JWT authentication with optional "Remember Me".
- Add, edit, and delete item records with full audit trail logging.
- Process claims and log verification details.
- Standardized **SmartPagination** across all tables (25 items per page).

### 3. Privacy & Security Controls
- **GCash-Style Name Masking:** Claimer names are masked on-screen by default (`J***n D.`) for all viewers to prevent shoulder-surfing, with an accessible click-to-reveal toggle.
- **Image Security:** Uploads strictly validate raw binary magic-byte signatures (JPEG, PNG, WebP) and generate server-side random filenames.
- **Audit Logging:** System actions (item creation, claims, deletions, administrative user management) generate persistent audit logs.

### 4. Background Services & Maintenance
- **Overdue Cron:** Automatically identifies items past their retention window.
- **Disposal Cron:** Transitions expired items to `DISPOSED` status.
- **Purge Engine:** Automated deletion utility for old disposed records with automatic Vercel Blob storage cleanup and `--dry-run` safety net.

---

## Project Structure

```text
src/
  app/
    (auth)/login/               Auth routes
    (dashboard)/                Staff & Admin dashboard views
      admin/                    User management, reports, audit logs
      items/                    Item management & claimed directory
    api/                        REST API & Cron route handlers
  components/
    admin/                      Admin UI components
    items/                      Item tables, modals, pagination
    layout/                     Header, Footer, Dashboard Shell
    ui/                         SmartPagination, RevealableName, TableLoader
  lib/
    auth.ts                     JWT session management & password hashing
    admin.ts                    Admin payload guards & report queries
    items.ts                    Shared item database queries
    purge.ts                    Disposed item purge engine
    utils.ts                    Date formatting & name masking logic
```

---

## Setup & Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database Connection
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"

# Storage
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

# Authentication
JWT_SECRET="your-secure-jwt-secret"
CRON_SECRET="your-cron-secret-token"

# Application Configuration
NEXT_PUBLIC_APP_NAME="NUFV Lost and Found"
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
```

---

## Local Development Workflow

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Apply database migrations
npx prisma db push

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Build & Deployment

For Vercel deployment:

```bash
# Production build check
npm run build
```

Ensure all environment variables (`DATABASE_URL`, `JWT_SECRET`, `CRON_SECRET`, `BLOB_READ_WRITE_TOKEN`) are configured in your deployment platform settings.


