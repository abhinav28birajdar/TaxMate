# TaxMate - External Services & API Configuration Guide

This guide provides step-by-step instructions for acquiring, configuring, and verifying all external third-party services and API credentials required by TaxMate.

---

## Service Overview & Credential Matrix

| Service | Environment Variable | Scope | Required / Optional | Where to Obtain |
|---|---|---|---|---|
| **Supabase** | `NEXT_PUBLIC_SUPABASE_URL` | Public (Client + Server) | **Required** | [Supabase Project Settings -> API](https://supabase.com/dashboard/project/_/settings/api) |
| **Supabase** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (Client + Server) | **Required** | Supabase Project Settings -> API |
| **Supabase** | `SUPABASE_SERVICE_ROLE_KEY` | **Server-Only (Secret)** | **Required** | Supabase Project Settings -> API |
| **Razorpay** | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public (Client + Server) | **Required (Payments)** | [Razorpay Dashboard -> API Keys](https://dashboard.razorpay.com/#/app/keys) |
| **Razorpay** | `RAZORPAY_KEY_SECRET` | **Server-Only (Secret)** | **Required (Payments)** | Razorpay Dashboard -> API Keys |
| **Razorpay** | `RAZORPAY_WEBHOOK_SECRET` | **Server-Only (Secret)** | **Required (Payments)** | [Razorpay Dashboard -> Webhooks](https://dashboard.razorpay.com/#/app/webhooks) |
| **Resend** | `RESEND_API_KEY` | **Server-Only (Secret)** | **Required (Email)** | [Resend Dashboard -> API Keys](https://resend.com/api-keys) |
| **Resend** | `RESEND_FROM_EMAIL` | Server-Only | **Required (Email)** | Verified sender domain in Resend |
| **Upstash Redis** | `UPSTASH_REDIS_REST_URL` | **Server-Only (Secret)** | Optional (Rate Limiting) | [Upstash Console -> Databases](https://console.upstash.com/redis) |
| **Upstash Redis** | `UPSTASH_REDIS_REST_TOKEN` | **Server-Only (Secret)** | Optional (Rate Limiting) | Upstash Console -> Databases |
| **Sentry** | `NEXT_PUBLIC_SENTRY_DSN` | Public (Client + Server) | Optional (Error Tracking) | [Sentry Project Settings](https://sentry.io) |

---

## 1. Supabase Setup (Database, Auth, Storage & Realtime)

### 1.1 Account & Project Creation
1. Go to [https://supabase.com](https://supabase.com) and create or select your project.
2. Select your closest AWS/GCP region (e.g., `ap-south-1` Mumbai for India).
3. Under **Project Settings -> API**:
   - Copy **Project URL** to `NEXT_PUBLIC_SUPABASE_URL`.
   - Copy **Project API keys -> anon (public)** to `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Copy **Project API keys -> service_role (secret)** to `SUPABASE_SERVICE_ROLE_KEY`.

### 1.2 Database Migration Execution
In the Supabase **SQL Editor**, execute:
```sql
-- Run the complete authoritative schema
-- File: supabase/complete_schema.sql
```
This provisions:
- All schema tables (`profiles`, `clients`, `cases`, `tasks`, `invoices`, `payments`, `appointments`, etc.)
- Multi-role Row Level Security policies
- Realtime publication enablement

### 1.3 Auth & Redirect URLs
In **Authentication -> URL Configuration**:
- **Site URL**: `http://localhost:3000` (Local) / `https://your-domain.com` (Production)
- **Redirect URLs**:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/portal/dashboard`
  - `http://localhost:3000/ca/dashboard`
  - `https://your-domain.com/auth/callback`

### 1.4 Storage Buckets
In **Storage -> Buckets**, ensure these 3 buckets are created:
1. `documents` (Private, 50MB limit)
2. `invoices` (Private, 10MB limit)
3. `avatars` (Public, 2MB limit)

---

## 2. Razorpay Payment Gateway Setup

### 2.1 API Keys Generation
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Toggle between **Test Mode** (during development) and **Live Mode** (production).
3. Navigate to **Account & Settings -> API Keys -> Generate Key**.
4. Set:
   ```dotenv
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   ```

### 2.2 Webhook Configuration
1. Go to **Account & Settings -> Webhooks -> Add New Webhook**.
2. **Webhook URL**:
   - Production: `https://your-domain.com/api/payments/webhook`
   - Local testing: Use an HTTPS tunnel like ngrok (`https://<ngrok-id>.ngrok-free.app/api/payments/webhook`)
3. **Secret**: Enter a strong random secret and copy it to `RAZORPAY_WEBHOOK_SECRET` in `.env.local`.
4. **Active Events**: Select:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
5. Click **Create Webhook**.

### 2.3 Verification Workflow
- TaxMate's `/api/payments/verify` and `/api/payments/webhook` cryptographically verify the Razorpay HMAC-SHA256 signature on the server before updating invoice states to `PAID`.
- No client-side payment confirmation is trusted without server signature validation.

---

## 3. Resend Transactional Email Setup

### 3.1 Obtaining API Key
1. Sign up at [https://resend.com](https://resend.com).
2. Go to **API Keys -> Create API Key**.
3. Name: `TaxMate Production`, Permission: `Full access`.
4. Copy the key to `RESEND_API_KEY`.

### 3.2 Domain Verification
1. Navigate to **Domains -> Add Domain**.
2. Enter your domain (e.g., `taxmate.in`).
3. Add the generated DNS records (`DKIM`, `SPF`, `DMARC`) in your domain registrar (GoDaddy, Cloudflare, Namecheap, Route 53).
4. Once verified, set:
   ```dotenv
   RESEND_FROM_EMAIL=TaxMate <noreply@taxmate.in>
   ```
*(For sandbox testing without a domain, you can send to your registered email using `onboarding@resend.dev`)*.

---

## 4. Upstash Redis Setup (Distributed Rate Limiting)

1. Sign up at [https://console.upstash.com](https://console.upstash.com).
2. Click **Create Database**:
   - Type: Regional
   - Region: AWS ap-south-1 (Mumbai)
3. Under **REST API** section:
   - Copy `UPSTASH_REDIS_REST_URL`
   - Copy `UPSTASH_REDIS_REST_TOKEN`
4. Set these in `.env.local`. If not configured, TaxMate automatically falls back to high-performance in-memory sliding-window rate limiting.

---

## 5. Security Checklist Before Production Deployment

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is kept server-side only and never logged.
- [ ] `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` are never referenced in client code.
- [ ] `JWT_SECRET` is generated with at least 32 cryptographically random characters:
  ```bash
  openssl rand -base64 32
  ```
- [ ] Supabase RLS is enabled on all tables (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
- [ ] Razorpay mode is switched from `rzp_test_...` to `rzp_live_...` with verified bank account details.
- [ ] Production webhook endpoint is active and answering HTTP 200 with verified HMAC signatures.
