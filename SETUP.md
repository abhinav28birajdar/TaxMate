# TaxMate - Complete Setup & Developer Guide

TaxMate is a production-grade Chartered Accountant (CA) & Client Practice Management platform built with Next.js 14 (App Router), Supabase (PostgreSQL, Auth, Storage, Realtime), Razorpay payments, and Resend transactional emails.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Database & Supabase Setup](#database--supabase-setup)
4. [Storage Buckets Setup](#storage-buckets-setup)
5. [Realtime Subscriptions Setup](#realtime-subscriptions-setup)
6. [Database Seeding](#database-seeding)
7. [Running the Application](#running-the-application)
8. [Automated Testing & Quality Checks](#automated-testing--quality-checks)
9. [Background Workers](#background-workers)
10. [User Roles & Access Control](#user-roles--access-control)
11. [Production Deployment](#production-deployment)

---

## 1. Prerequisites

- **Node.js**: v18.18+ or v20+
- **Package Manager**: `npm` (v9+)
- **Supabase Account**: [https://supabase.com](https://supabase.com) (or local Supabase CLI)
- **Razorpay Account**: [https://razorpay.com](https://razorpay.com) (for Indian payment processing)
- **Resend Account**: [https://resend.com](https://resend.com) (for transactional emails)
- **Upstash Redis**: [https://upstash.com](https://upstash.com) (optional, for distributed rate-limiting)

---

## 2. Environment Configuration

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Configure the required keys in `.env.local`:

```dotenv
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Security / JWT
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
BCRYPT_SALT_ROUNDS=12

# Razorpay Payments (Test mode keys for development)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Resend Email Delivery
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=TaxMate <noreply@yourdomain.com>

# Rate Limiting (Optional - falls back to memory cache)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

> **Security Note**: Never expose `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, or `JWT_SECRET` in public client bundles (`NEXT_PUBLIC_`). Keep them exclusively on the server.

---

## 3. Database & Supabase Setup

### Step 1: Run PostgreSQL Database Migrations
1. Open your Supabase Dashboard: **SQL Editor**.
2. Run the authoritative schema file:
   - File: `supabase/complete_schema.sql`
   *(Or sequentially run `supabase/migrations/20261018_production_schema_and_clients.sql`)*
3. This creates:
   - Core tables: `profiles`, `clients`, `cases`, `tasks`, `invoices`, `payments`, `appointments`, `messages`, `notifications`, `documents`, `tags`, `compliance_deadlines`, `audit_logs`.
   - Comprehensive Row Level Security (RLS) policies for CA, Client, Staff, and Super Admin roles.
   - Automatic triggers for `updated_at` timestamps and user profile auto-provisioning.

### Step 2: Configure Supabase Authentication
1. Go to **Authentication -> URL Configuration**.
2. Set **Site URL**: `http://localhost:3000` (or your production domain).
3. Set **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/portal/dashboard`
   - `http://localhost:3000/ca/dashboard`
   - `https://<production-domain>/auth/callback`

---

## 4. Storage Buckets Setup

In the Supabase Dashboard, go to **Storage -> Buckets** and create:

| Bucket Name | Access | Purpose | Max Size | Allowed MIME Types |
|-------------|--------|---------|----------|--------------------|
| `documents` | Private | Client tax docs, ITR filings, GST returns | 50MB | `pdf, docx, xlsx, png, jpg` |
| `invoices`  | Private | Generated PDF bills & payment receipts | 10MB | `pdf` |
| `avatars`   | Public  | User profile images | 2MB | `png, jpg, webp` |

Apply the storage RLS policies located in `supabase/complete_schema.sql` under the storage policies section.

---

## 5. Realtime Subscriptions Setup

To enable real-time messaging, task updates, and live dashboard notifications:
1. Go to **Database -> Replication**.
2. Verify the following tables are in the `supabase_realtime` publication:
   - `notifications`
   - `messages`
   - `tasks`
   - `invoices`
   - `cases`
   - `appointments`
   - `clients`

---

## 6. Database Seeding

Populate the database with realistic development data:
```bash
npm run db:seed
```
This populates:
- Sample CA firm & practitioner profile
- Client accounts (Corporate & Individual)
- Active Cases (Income Tax Return, GST Audit, TDS Filing)
- Kanban Tasks across statuses (`TODO`, `IN_PROGRESS`, `REVIEW`, `COMPLETED`)
- Invoices & Appointments

---

## 7. Running the Application

### Development Mode:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Health Check API:
Verify system health and database connectivity:
```bash
curl http://localhost:3000/api/health
```

---

## 8. Automated Testing & Quality Checks

Run the complete test suite and code quality audits:

```bash
# Run unit & integration tests
npm test

# Run TypeScript typecheck
npm run typecheck

# Run ESLint validation
npm run lint

# Run production build
npm run build
```

---

## 9. Background Workers

TaxMate includes background worker processes for sending automated compliance reminders and due-date alerts:

```bash
npm run workers
```

In production, run the worker as a daemon process using PM2, Docker, or a scheduled cron job (e.g. AWS ECS / Railway / Render Worker).

---

## 10. User Roles & Access Control

| Role | Primary Dashboard | Capabilities |
|------|-------------------|--------------|
| `SUPER_ADMIN` | `/admin/dashboard` | Platform metrics, firm provisioning, system logs, subscription plans |
| `CA` | `/ca/dashboard` | Case management, client management, invoice generation, appointments, filing |
| `STAFF` | `/ca/dashboard` | Assigned tasks, case documentation, client communication |
| `CLIENT` | `/portal/dashboard` | View cases, pay invoices via Razorpay, upload documents, book appointments |

---

## 11. Production Deployment

### Option A: Vercel Deployment (Recommended)
1. Push repository to GitHub/GitLab.
2. Import project into [Vercel](https://vercel.com).
3. Set all environment variables from `.env.example` in Vercel Project Settings.
4. Set Build Command: `next build`, Output Directory: `.next`.
5. Deploy!

### Option B: Docker Container Deployment
Use the included `Dockerfile` and `docker-compose.yml`:
```bash
# Build and run container
docker compose up -d --build
```
The app will be available on port 3000 behind standard reverse proxy (Nginx, Traefik, or Caddy).
