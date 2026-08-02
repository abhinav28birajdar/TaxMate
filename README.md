# TaxMate

<p align="center">
  <img src="https://raw.githubusercontent.com/supabase/supabase/master/packages/common/assets/images/supabase-logo-icon.png" alt="Supabase" width="55"/>
  &nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/resendlabs/resend/master/apps/web/public/static/resend-logo.png" alt="Resend" width="55"/>
  &nbsp;&nbsp;&nbsp;
  <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" width="55"/>
  &nbsp;&nbsp;&nbsp;
  <img src="https://stripe.com/img/v3/home/twitter.png" alt="Stripe" width="55"/>
</p>

<h3 align="center">Modern Tax & Accounting Management Platform</h3>

<p align="center">
  A full-stack tax and accounting platform built with Next.js, Supabase, PostgreSQL, Razorpay, Resend, and modern web technologies.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Razorpay-Payments-3395FF?style=for-the-badge" alt="Razorpay"/>
  <img src="https://img.shields.io/badge/Resend-Email-000000?style=for-the-badge" alt="Resend"/>
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe" alt="Stripe"/>
</p>

---

## 📌 Overview

**TaxMate** is a full-stack tax and accounting platform designed to connect **clients, Chartered Accountants (CAs), and administrators** through a centralized digital workspace.

The platform provides role-based dashboards, secure authentication, document management, notifications, payment processing, email communication, and administrative workflows.

The application is built around a scalable architecture using **Next.js + Supabase + PostgreSQL**, with integrations for payments, email, caching, rate limiting, and real-time functionality.

---

## ✨ Key Features

### 🔐 Authentication & Authorization

* Supabase Authentication
* Sign up / Sign in
* Sign out
* Password reset
* Email verification
* Auth callback handling
* Protected routes
* Role-based access control
* Automatic role-based redirects
* Client / CA / Admin authorization

### 👤 Client Dashboard

* Personal profile management
* Tax service requests
* Document uploads
* Document tracking
* Payment management
* Notifications
* Application/request status
* Communication with assigned CA
* Tax-related workflow management

### 👨‍💼 CA Dashboard

* Client management
* Client document access
* Tax request management
* Document review
* Request status management
* Notifications
* Client communication
* Payment/status tracking

### 🛡️ Admin Dashboard

* User management
* Client management
* CA management
* Role management
* Application monitoring
* Payment monitoring
* Document/workflow monitoring
* Notifications
* Administrative controls

### 📄 Document Management

* Secure document uploads
* Supabase Storage
* Document metadata
* Client/CA access control
* Protected document workflows
* Storage-based permissions

### 🔔 Notifications

* In-app notifications
* Email notifications
* Notification status tracking
* Read/unread management
* Event-based notification infrastructure

### 💳 Payments

TaxMate supports payment infrastructure through:

* Razorpay
* Stripe
* Payment order creation
* Payment verification
* Webhook processing
* Transaction tracking
* Server-side payment validation

> Payment providers should only be enabled when their corresponding environment variables and webhook configuration are available.

### 📧 Email

Transactional email infrastructure using:

* Resend
* Verification emails
* Password reset emails
* Payment notifications
* Application updates
* System notifications

### ⚡ Performance & Infrastructure

* Upstash Redis
* Rate limiting
* Caching
* Server-side utilities
* Serverless-compatible architecture
* PostgreSQL database
* Supabase Realtime

### 🌙 UI & Experience

* Responsive design
* Dark mode
* Light mode
* `next-themes`
* Tailwind CSS
* Radix UI
* Lucide icons
* Framer Motion
* Sonner notifications

---

# 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │      TaxMate        │
                         │    Next.js 14       │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
       │   Client    │       │     CA      │       │    Admin    │
       │  Dashboard  │       │  Dashboard  │       │  Dashboard  │
       └──────┬──────┘       └──────┬──────┘       └──────┬──────┘
              │                     │                     │
              └─────────────────────┼─────────────────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Next.js APIs      │
                         │   Route Handlers    │
                         └──────────┬──────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
      ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
      │  Supabase   │       │  Payments   │       │   Resend    │
      │ Auth + DB   │       │ Razorpay    │       │   Email     │
      │ Storage     │       │ Stripe      │       │             │
      │ Realtime    │       └─────────────┘       └─────────────┘
      └──────┬──────┘
             │
             ▼
      ┌─────────────┐
      │ PostgreSQL  │
      │    + RLS    │
      └─────────────┘

                    ┌─────────────────┐
                    │ Upstash Redis   │
                    │ Cache / Limits  │
                    └─────────────────┘
```

---

# 🧰 Tech Stack

## Frontend

| Technology    | Purpose                    |
| ------------- | -------------------------- |
| Next.js 14    | Full-stack React framework |
| React 18      | UI development             |
| TypeScript    | Type safety                |
| Tailwind CSS  | Styling                    |
| Radix UI      | Accessible UI primitives   |
| Lucide        | Icons                      |
| Framer Motion | Animations                 |
| Sonner        | Toast notifications        |
| next-themes   | Dark / light mode          |

## Backend

| Technology             | Purpose               |
| ---------------------- | --------------------- |
| Next.js Route Handlers | API endpoints         |
| Supabase SSR           | Server authentication |
| Supabase               | Backend platform      |
| PostgreSQL             | Database              |
| Supabase Storage       | File storage          |
| Supabase Realtime      | Real-time updates     |

## Authentication

* Supabase Auth
* Cookie-based SSR authentication
* Role-based authorization
* Protected route handling
* Auth callback handling

## Payments

### Razorpay

Used for:

* Payment checkout
* Payment order creation
* Payment verification
* Webhooks
* Transaction tracking

### Stripe

Can be used for:

* Payment checkout
* Payment intents
* Payment confirmation
* Webhooks
* Subscription/payment workflows

## Email

### Resend

Used for:

* Transactional emails
* Verification emails
* Password reset emails
* Payment notifications
* Application notifications

## Infrastructure

* Upstash Redis
* Vercel-compatible deployment
* Supabase
* PostgreSQL
* Serverless API architecture

---

# 📁 Project Structure

```text
TaxMate/
│
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   ├── (auth)/
│   │   ├── (client)/
│   │   ├── (ca)/
│   │   ├── (admin)/
│   │   └── api/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── client/
│   │   ├── ca/
│   │   ├── admin/
│   │   └── shared/
│   │
│   ├── hooks/
│   │   └── UnifiedAuthContext.tsx
│   │
│   ├── lib/
│   │   ├── auth-routing.ts
│   │   ├── supabase/
│   │   ├── payments/
│   │   ├── email/
│   │   └── redis/
│   │
│   └── utils/
│       └── supabase/
│
├── supabase/
│   └── schema.sql
│
├── docs/
│   └── ENVIRONMENT_SETUP.md
│
├── public/
│
├── .env.example
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

# 🔑 Environment Variables

Create a `.env.local` file in the project root.

```env
# ==========================================
# SUPABASE
# ==========================================

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=


# ==========================================
# APPLICATION
# ==========================================

NEXT_PUBLIC_APP_URL=http://localhost:3000


# ==========================================
# RAZORPAY
# ==========================================

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_WEBHOOK_SECRET=


# ==========================================
# STRIPE
# ==========================================

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=


# ==========================================
# RESEND
# ==========================================

RESEND_API_KEY=
RESEND_FROM_EMAIL=


# ==========================================
# UPSTASH REDIS
# ==========================================

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=


# ==========================================
# LIVEKIT
# ==========================================

LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
NEXT_PUBLIC_LIVEKIT_URL=
```

> Never commit `.env.local` or expose server-only secrets to the browser.

For a complete explanation of every variable, see:

```text
docs/ENVIRONMENT_SETUP.md
```

---

# 🚀 Installation

## 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>

cd TaxMate
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Create Environment File

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

## 4. Configure Environment Variables

Open:

```text
.env.local
```

Add your Supabase credentials and any optional third-party service credentials.

## 5. Start Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🗄️ Supabase Setup

TaxMate uses Supabase as the primary backend.

### Step 1 — Create Supabase Project

Create a new Supabase project.

### Step 2 — Get Credentials

From the Supabase project dashboard, obtain:

```text
Project URL
Anon / Publishable Key
Service Role Key
```

### Step 3 — Configure `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 4 — Run Database Schema

Open the Supabase SQL Editor and execute:

```text
supabase/schema.sql
```

This is the authoritative database schema for the application.

### Step 5 — Configure Authentication

Configure the required:

* Site URL
* Redirect URLs
* `/auth/callback`
* Email authentication settings

### Step 6 — Configure Storage

Create/configure the storage buckets required by document upload workflows.

### Step 7 — Verify RLS

Ensure Row Level Security is enabled and policies correctly restrict access based on user roles.

---

# 💳 Payment Integration

TaxMate supports payment infrastructure for financial workflows.

## Razorpay

Required variables:

```env
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_WEBHOOK_SECRET=
```

The public key can be used by the browser.

The following must remain server-only:

```text
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
```

Configure the Razorpay webhook endpoint according to the API routes implemented in the project.

## Stripe

If Stripe is enabled:

```env
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

The following must remain server-only:

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

---

# 📧 Email Integration

TaxMate uses Resend for transactional email.

Required:

```env
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

Typical email workflows include:

```text
User Registration
       ↓
Email Verification
       ↓
Application Updates
       ↓
Payment Confirmation
       ↓
Document / Workflow Notifications
```

---

# ⚡ Redis & Rate Limiting

Upstash Redis can be used for:

* API rate limiting
* Authentication protection
* Request throttling
* Caching
* Temporary data
* Security-related controls

Environment variables:

```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

# 🎥 Video Calling

The repository includes LiveKit-related dependencies and hooks.

Configure:

```env
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
NEXT_PUBLIC_LIVEKIT_URL=
```

Video calling should only be enabled in production after configuring the required LiveKit infrastructure.

---

# 🔐 Authentication Flow

```text
User
 │
 ▼
Sign Up / Sign In
 │
 ▼
Supabase Auth
 │
 ▼
Session Created
 │
 ▼
UnifiedAuthContext
 │
 ▼
Load User Profile
 │
 ▼
Determine Role
 │
 ├── Client ──► Client Dashboard
 │
 ├── CA ──────► CA Dashboard
 │
 └── Admin ───► Admin Dashboard
```

Role routing is centralized through:

```text
src/lib/auth-routing.ts
```

Authentication state is managed through:

```text
src/hooks/UnifiedAuthContext.tsx
```

---

# 🛡️ Security

TaxMate follows a server-first security approach.

### Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
UPSTASH_REDIS_REST_TOKEN
LIVEKIT_API_SECRET
```

### Security checklist

* [x] Use `.env.local` for secrets
* [x] Never commit secrets
* [x] Use Supabase RLS
* [x] Validate webhook signatures
* [x] Validate API input
* [x] Protect role-based routes
* [x] Keep service-role operations server-side
* [x] Use secure authentication cookies
* [x] Apply rate limiting to sensitive APIs

---

# 🧪 Development Commands

### Start development server

```bash
npm run dev
```

### Production build

```bash
npm run build
```

### Start production server

```bash
npm start
```

### Lint

```bash
npm run lint
```

### Type checking

```bash
npm run typecheck
```

If `typecheck` does not exist:

```bash
npx tsc --noEmit
```

### Tests

```bash
npm test
```

---

# 🧪 Recommended Verification

Before deployment, verify:

```text
Authentication
├── Sign up
├── Sign in
├── Sign out
├── Password reset
└── Auth callback

Authorization
├── Client routes
├── CA routes
├── Admin routes
└── Unauthorized access

Database
├── CRUD operations
├── RLS policies
├── Profile creation
└── Database triggers

Storage
├── Upload
├── Download
├── Delete
└── Access control

Payments
├── Razorpay order
├── Payment verification
├── Stripe payment (if enabled)
└── Webhooks

Email
├── Resend configuration
├── Email delivery
└── Application notifications

Infrastructure
├── Redis
├── Rate limiting
└── Realtime

UI
├── Desktop
├── Tablet
├── Mobile
├── Light mode
└── Dark mode
```

---

# 🚀 Production Deployment

Before deploying TaxMate:

### 1. Configure Production Environment

Add all required environment variables to your hosting provider.

### 2. Configure Supabase

Use the production Supabase project and execute:

```text
supabase/schema.sql
```

### 3. Configure Authentication

Update:

```text
Site URL
Redirect URLs
Auth callback
```

### 4. Configure Payment Webhooks

Configure production webhook endpoints for:

```text
Razorpay
Stripe
```

Only enable the payment provider(s) actually used by the application.

### 5. Configure Resend

Configure:

```text
API Key
Verified domain
From email
```

### 6. Configure Redis

Add the production Upstash credentials.

### 7. Build

```bash
npm run build
```

### 8. Deploy

Deploy the Next.js application to your preferred hosting provider.

---

# 🧩 Legacy Compatibility

TaxMate includes compatibility handling for older:

```text
/dashboard/*
```

routes.

These routes can redirect users to the newer role-specific application surfaces without breaking existing links.

---

# 🗃️ Database

The canonical database schema is:

```text
supabase/schema.sql
```

It contains the application's core PostgreSQL structures, including:

* Profiles
* Authentication-related structures
* Application entities
* Relationships
* RLS policies
* Triggers
* Required database logic

The SQL file should remain the **single source of truth** for the database structure.

---

# 🔄 External Services

<p align="center">

| Service     | Purpose                                       |
| ----------- | --------------------------------------------- |
| 🟢 Supabase | Authentication, PostgreSQL, Storage, Realtime |
| 📧 Resend   | Transactional email                           |
| 💳 Razorpay | Payment processing                            |
| 💳 Stripe   | Optional payment processing                   |
| ⚡ Upstash   | Redis, caching, rate limiting                 |
| 🎥 LiveKit  | Video calling                                 |

</p>

---

# 🧭 Application Flow

```text
                    ┌──────────────┐
                    │   TaxMate    │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
          Public Pages              Auth Pages
              │                         │
              │                    Supabase Auth
              │                         │
              └────────────┬────────────┘
                           │
                    Role Detection
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
         Client            CA           Admin
            │              │              │
            └──────────────┼──────────────┘
                           │
                           ▼
                    Backend APIs
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
       ▼                   ▼                   ▼
   PostgreSQL          Storage             Payments
       │                   │              ┌────┴────┐
       │                   │              │         │
       │                   │           Razorpay   Stripe
       │                   │
       └───────────────────┼──────────────────────┐
                           │                      │
                           ▼                      ▼
                        Resend                Redis
                         Email              Rate Limit
```

---

# 🛠️ Troubleshooting

## Authentication redirect loop

Check:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
```

Also verify the Supabase Auth redirect configuration.

---

## Profile is not created after signup

Verify that:

```text
supabase/schema.sql
```

has been executed successfully.

Check:

* Auth triggers
* Profiles table
* RLS policies
* User metadata

---

## Razorpay verification fails

Verify:

```text
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
```

Never use the secret key on the client.

---

## Stripe payment fails

Verify:

```text
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
```

Also verify the configured Stripe webhook endpoint.

---

## Emails are not delivered

Check:

```text
RESEND_API_KEY
RESEND_FROM_EMAIL
```

Also verify that your sending domain is properly configured.

---

## Redis is not working

Verify:

```text
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

---

## Environment variables are not detected

Restart the development server after modifying:

```text
.env.local
```

```bash
npm run dev
```

---

# 📚 Documentation

Additional configuration documentation:

```text
docs/
└── ENVIRONMENT_SETUP.md
```

Database:

```text
supabase/
└── schema.sql
```

---

# 🔒 Production Checklist

Before going live:

```text
[ ] Production Supabase project created
[ ] Database schema deployed
[ ] RLS verified
[ ] Storage buckets configured
[ ] Auth redirect URLs configured
[ ] Production APP URL configured
[ ] Razorpay configured
[ ] Razorpay webhook configured
[ ] Stripe configured if required
[ ] Stripe webhook configured if required
[ ] Resend configured
[ ] Sending domain verified
[ ] Upstash Redis configured
[ ] LiveKit configured if required
[ ] Environment variables configured
[ ] No secrets committed to Git
[ ] npm run lint passes
[ ] npm run typecheck passes
[ ] npm run build passes
[ ] Authentication tested
[ ] Role-based authorization tested
[ ] Payment flow tested
[ ] Webhooks tested
[ ] Email flow tested
[ ] Document upload tested
[ ] Mobile responsive UI tested
[ ] Dark mode tested
[ ] Production deployment verified
```

---

# 🤝 Contributing

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Make your changes.
4. Run tests and checks.

```bash
npm run lint
npm run typecheck
npm run build
```

5. Commit your changes.

```bash
git commit -m "feat: add your feature"
```

6. Push the branch.

```bash
git push origin feature/your-feature
```

7. Open a Pull Request.

---

# 📄 License

Add your project's license information here.

Example:

```text
MIT License
```

---

# 👨‍💻 TaxMate

<p align="center">
  Built with ❤️ using modern full-stack technologies.
</p>

<p align="center">
  <strong>Next.js • React • TypeScript • Supabase • PostgreSQL • Razorpay • Stripe • Resend • Redis</strong>
</p>

<p align="center">
  <sub>TaxMate — Simplifying tax and accounting workflows through technology.</sub>
</p>
