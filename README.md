# TaxMate - Production-Grade CA Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=flat-square)](./PROJECT_STATUS_REPORT.md)

---

## 📋 Quick Navigation

| Section | Link |
|---------|------|
| 🎯 Overview | [Jump to Overview](#-overview) |
| ✨ Features | [Jump to Features](#-key-features) |
| 🛠️ Tech Stack | [Jump to Tech Stack](#-tech-stack) |
| 📁 Project Structure | [Jump to Structure](#-project-structure) |
| 🚀 Setup Guide | [Jump to Installation](#-installation--setup) |
| 👨‍💻 Development | [Jump to Development](#-development) |
| 📖 API Docs | [Jump to API](#-api-documentation) |
| 🚀 Deployment | [Jump to Deployment](#-deployment) |

---

## 🎯 Overview

**TaxMate** is an enterprise-grade Chartered Accountant (CA) and client management platform designed for modern accounting practices. It streamlines tax work, compliance management, client communications, and administrative operations in a secure, real-time collaborative environment.

### 🎯 Target Users
- **CA Firms** - Multi-user tax practices
- **Individual CAs** - Solo practitioners
- **Accounting Teams** - Staff and associate management
- **Corporate Clients** - Large client organizations
- **Individual Clients** - Personal tax clients
- **Tax Consultants** - Advisory professionals

### 💡 Core Value Propositions
- **Centralized Hub** - All client data, documents, and communications in one unified platform
- **Compliance Automation** - Intelligent deadline tracking and compliance status monitoring
- **Real-Time Collaboration** - Live chat, document sharing, and team coordination
- **Client Portal** - Secure self-service portal for document uploads and request tracking
- **Advanced Analytics** - Revenue tracking, client profitability analysis, and performance KPIs
- **Enterprise Security** - Row-level security, JWT authentication, 2FA, audit logging

---

## ✨ Key Features

### 🔐 Enterprise Authentication
- ✅ Email/password authentication with verification
- ✅ Two-factor authentication (2FA) with TOTP
- ✅ Password reset and recovery workflows
- ✅ JWT-based session management
- ✅ Role-based access control (RBAC) - 4 roles
- ✅ Row-level security (RLS) for data isolation
- ✅ Account lockout protection
- ✅ Session tracking and management

### 📋 Advanced Task Management
- ✅ Create, assign, prioritize, and track tasks
- ✅ Deadline management with automated reminders
- ✅ Team assignment and delegation
- ✅ Task dependencies and subtasks
- ✅ Status tracking (Not Started → In Progress → Complete)
- ✅ Activity audit logs
- ✅ Real-time task updates
- ✅ Task filtering and search

### 📄 Document Management Suite
- ✅ Upload and organize tax/financial documents
- ✅ Secure storage with encryption
- ✅ Version control and document history
- ✅ Share documents with team and clients
- ✅ Client self-service upload portal
- ✅ Document categorization and tagging
- ✅ Full-text search
- ✅ Expiration date tracking

### 💰 Invoice & Payment Management
- ✅ Create and customize invoices
- ✅ Email delivery with tracking
- ✅ Payment processing with Razorpay
- ✅ Payment status tracking
- ✅ Invoice templates and recurring invoices
- ✅ Revenue analytics
- ✅ Expense tracking
- ✅ Invoice reminders

### ✅ Compliance Tracking Dashboard
- ✅ GST filing deadlines and status
- ✅ ITR submission tracking
- ✅ TDS compliance monitoring
- ✅ Compliance metrics dashboard
- ✅ Automated deadline notifications
- ✅ Compliance checklist management
- ✅ Filing status updates
- ✅ Deadline alerts and reminders

### 💬 Real-Time Communication
- ✅ Live chat between CAs and clients
- ✅ Team messaging channels
- ✅ Message threading and organization
- ✅ File attachments in messages
- ✅ Message search and history
- ✅ Read receipts and typing indicators
- ✅ Notification preferences
- ✅ Conversation archiving

### 📞 Appointment & Meeting Management
- ✅ Schedule consultations and meetings
- ✅ Video conference integration (LiveKit)
- ✅ Automated meeting links and reminders
- ✅ Calendar view
- ✅ Recurring appointments
- ✅ Email confirmations
- ✅ Availability management
- ✅ Meeting recordings (optional)

### 📊 Business Intelligence & Analytics
- ✅ Revenue tracking and trends
- ✅ Client profitability analysis
- ✅ Compliance status overview
- ✅ Task completion metrics
- ✅ Performance KPIs
- ✅ Custom report generation
- ✅ Data export (CSV, PDF)
- ✅ Actionable insights dashboard

### 🔧 Admin Control Panel
- ✅ User management (CRUD)
- ✅ Activity audit logs
- ✅ Feature flag management
- ✅ System configuration
- ✅ Security settings
- ✅ User role management
- ✅ System health monitoring
- ✅ Data management tools

### 🌐 Multi-Tenant Architecture
- ✅ Multiple user roles (Super Admin, CA, Staff, Client)
- ✅ Organization-level data isolation
- ✅ Secure client portal
- ✅ Role-specific dashboards
- ✅ Custom branding support
- ✅ Subscription management
- ✅ Team member management
- ✅ Resource sharing controls

---

## 🛠️ Tech Stack

### Frontend Technologies
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.x | UI component library |
| **Next.js** | 14.x | React framework with SSR |
| **TypeScript** | 5.x | Type-safe development |
| **Tailwind CSS** | 3.x | Utility-first styling |
| **Radix UI** | Latest | Accessible component library |
| **React Hook Form** | 7.x | Form state management |
| **Zod** | Latest | Schema validation |
| **TanStack Query** | v4/v5 | Server state management |

### Backend & Database
| Technology | Purpose |
|-----------|---------|
| **Supabase** | Backend-as-a-Service (BaaS) |
| **PostgreSQL** | Relational database (27 tables) |
| **PostgREST** | Auto-generated REST API |
| **Supabase Auth** | Authentication & JWT management |
| **Realtime** | WebSocket subscriptions |
| **Storage** | File storage and CDN |

### External Services
| Service | Purpose | Region |
|---------|---------|--------|
| **Razorpay** | Payment processing | India-based |
| **Resend** | Email delivery | Transactional emails |
| **LiveKit** | Video conferencing | Real-time video |
| **Socket.io** | Real-time communication | Fallback messaging |

### Developer Tools & Testing
| Tool | Purpose |
|------|---------|
| **Prisma** | ORM & database client |
| **Jest** | Unit testing framework |
| **Playwright** | End-to-end testing |
| **ESLint** | Code quality linting |
| **Prettier** | Code formatting |
| **TypeScript Compiler** | Type checking |

---

## 📁 Project Structure

```
taxmate/
├── 📦 Root Configuration Files
│   ├── package.json                 # Dependencies and npm scripts
│   ├── tsconfig.json                # TypeScript strict mode config
│   ├── tailwind.config.ts           # Tailwind CSS theme and plugins
│   ├── postcss.config.js            # PostCSS configuration
│   ├── next.config.mjs              # Next.js app configuration
│   ├── eslint.config.mjs            # ESLint rules and settings
│   ├── .gitignore                   # Git ignore rules
│   ├── .env.example                 # Environment variable template
│   ├── env.d.ts                     # Environment type definitions
│   └── middleware.ts                # Next.js middleware for routing
│
├── 🌐 Public Assets
│   └── public/
│       └── assets/                  # Static images, icons, fonts
│
├── 🗄️ Database & Infrastructure
│   ├── prisma/
│   │   ├── schema.prisma            # Prisma ORM schema definition
│   │   ├── seed.ts                  # Database seeding script
│   │   └── seed-complete.ts         # Complete sample data seed
│   │
│   └── supabase/
│       ├── schema.sql               # Complete PostgreSQL schema (27 tables)
│       ├── migrations/              # Database migration scripts
│       ├── production_schema.sql    # Production-optimized schema
│       └── drop_all_objects.sql     # Database cleanup utility
│
├── 🚀 Server & Workers
│   └── server/
│       ├── socket.ts                # WebSocket server configuration
│       └── workers/
│           └── reminder-worker.ts   # Background job worker for reminders
│
├── 📱 Frontend Application (src/)
│   │
│   ├── 🎨 App & Routing (src/app/)
│   │   ├── layout.tsx               # Root layout with providers
│   │   ├── page.tsx                 # Home page
│   │   ├── error.tsx                # Global error boundary
│   │   ├── loading.tsx              # Global loading state
│   │   ├── not-found.tsx            # 404 error page
│   │   ├── globals.css              # Global styles
│   │   │
│   │   ├── (auth)/                  # Auth routes group
│   │   │   ├── login/               # Login page
│   │   │   ├── signup/              # Registration page
│   │   │   ├── forgot-password/     # Password reset request
│   │   │   ├── reset-password/      # Password reset form
│   │   │   └── verify-email/        # Email verification
│   │   │
│   │   ├── (dashboard)/             # Protected dashboard routes
│   │   │   ├── layout.tsx           # Dashboard layout
│   │   │   ├── page.tsx             # Dashboard home
│   │   │   │
│   │   │   ├── tasks/               # Task management pages
│   │   │   │   ├── page.tsx         # Tasks list
│   │   │   │   ├── [id]/            # Task detail page
│   │   │   │   └── create/          # Create task page
│   │   │   │
│   │   │   ├── invoices/            # Invoice management pages
│   │   │   │   ├── page.tsx         # Invoices list
│   │   │   │   ├── [id]/            # Invoice detail
│   │   │   │   └── create/          # Create invoice page
│   │   │   │
│   │   │   ├── documents/           # Document management pages
│   │   │   │   ├── page.tsx         # Documents list
│   │   │   │   ├── [id]/            # Document detail
│   │   │   │   └── upload/          # Upload page
│   │   │   │
│   │   │   ├── compliance/          # Compliance management pages
│   │   │   │   ├── page.tsx         # Compliance dashboard
│   │   │   │   ├── gst/             # GST filing tracking
│   │   │   │   ├── itr/             # ITR submission tracking
│   │   │   │   └── timeline/        # Deadline timeline
│   │   │   │
│   │   │   ├── chat/                # Communication pages
│   │   │   │   ├── page.tsx         # Chat list
│   │   │   │   ├── [id]/            # Chat conversation
│   │   │   │   └── groups/          # Group chats
│   │   │   │
│   │   │   ├── appointments/        # Appointment pages
│   │   │   │   ├── page.tsx         # Calendar view
│   │   │   │   ├── [id]/            # Appointment detail
│   │   │   │   └── schedule/        # Schedule meeting
│   │   │   │
│   │   │   ├── analytics/           # Business intelligence
│   │   │   │   ├── page.tsx         # Analytics dashboard
│   │   │   │   ├── revenue/         # Revenue analytics
│   │   │   │   ├── clients/         # Client profitability
│   │   │   │   └── reports/         # Report generation
│   │   │   │
│   │   │   ├── clients/             # Client management
│   │   │   │   ├── page.tsx         # Clients list
│   │   │   │   ├── [id]/            # Client profile
│   │   │   │   └── add/             # Add new client
│   │   │   │
│   │   │   ├── admin/               # Admin panel routes
│   │   │   │   ├── page.tsx         # Admin dashboard
│   │   │   │   ├── users/           # User management
│   │   │   │   ├── activity/        # Activity logs
│   │   │   │   ├── settings/        # System settings
│   │   │   │   └── security/        # Security settings
│   │   │   │
│   │   │   └── profile/             # User profile pages
│   │   │       ├── page.tsx         # Profile view
│   │   │       └── settings/        # Profile settings
│   │   │
│   │   ├── (public)/                # Public pages (no auth required)
│   │   │   ├── about/               # About page
│   │   │   ├── pricing/             # Pricing page
│   │   │   └── contact/             # Contact page
│   │   │
│   │   └── api/                     # API route handlers
│   │       ├── auth/                # Authentication endpoints
│   │       │   ├── signin/          # Login endpoint
│   │       │   ├── signup/          # Registration endpoint
│   │       │   ├── logout/          # Logout endpoint
│   │       │   └── 2fa/             # 2FA setup and verify
│   │       │
│   │       ├── tasks/               # Task CRUD endpoints
│   │       ├── invoices/            # Invoice CRUD endpoints
│   │       ├── documents/           # Document CRUD endpoints
│   │       ├── compliance/          # Compliance endpoints
│   │       ├── chat/                # Messaging endpoints
│   │       ├── appointments/        # Appointment endpoints
│   │       ├── analytics/           # Analytics endpoints
│   │       ├── users/               # User management endpoints
│   │       └── webhooks/            # Payment webhooks
│   │
│   ├── 🧩 Components (src/components/)
│   │   ├── ErrorBoundary.tsx        # Global error boundary
│   │   │
│   │   ├── ui/                      # Radix UI base components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── ... (20+ more base components)
│   │   │
│   │   ├── auth/                    # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── TwoFactorSetup.tsx
│   │   │   ├── ResetPasswordForm.tsx
│   │   │   ├── EmailVerification.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   │
│   │   ├── dashboard/               # Dashboard feature components
│   │   │   ├── DashboardStats.tsx
│   │   │   ├── RecentActivity.tsx
│   │   │   ├── MetricsCard.tsx
│   │   │   └── WelcomeCard.tsx
│   │   │
│   │   ├── tasks/                   # Task management components
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskFilters.tsx
│   │   │   ├── TaskDetail.tsx
│   │   │   └── TaskPriority.tsx
│   │   │
│   │   ├── invoices/                # Invoice management components
│   │   │   ├── InvoiceList.tsx
│   │   │   ├── InvoiceForm.tsx
│   │   │   ├── InvoicePreview.tsx
│   │   │   ├── PaymentTracker.tsx
│   │   │   ├── InvoiceTemplate.tsx
│   │   │   └── SendInvoice.tsx
│   │   │
│   │   ├── documents/               # Document management components
│   │   │   ├── DocumentList.tsx
│   │   │   ├── DocumentUpload.tsx
│   │   │   ├── DocumentPreview.tsx
│   │   │   ├── DocumentShare.tsx
│   │   │   ├── DocumentViewer.tsx
│   │   │   └── DocumentFilters.tsx
│   │   │
│   │   ├── compliance/              # Compliance tracking components
│   │   │   ├── ComplianceChecklist.tsx
│   │   │   ├── DeadlineTracker.tsx
│   │   │   ├── FilingStatus.tsx
│   │   │   ├── GSTTracker.tsx
│   │   │   ├── ITRTracker.tsx
│   │   │   └── ComplianceTimeline.tsx
│   │   │
│   │   ├── chat/                    # Chat & messaging components
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── FileAttachment.tsx
│   │   │   ├── TypingIndicator.tsx
│   │   │   └── ConversationList.tsx
│   │   │
│   │   ├── layout/                  # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── LayoutWrapper.tsx
│   │   │
│   │   ├── notifications/           # Notification components
│   │   │   ├── NotificationCenter.tsx
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── NotificationItem.tsx
│   │   │   └── NotificationPreferences.tsx
│   │   │
│   │   ├── admin/                   # Admin panel components
│   │   │   ├── UserManagement.tsx
│   │   │   ├── ActivityLog.tsx
│   │   │   ├── SystemSettings.tsx
│   │   │   └── FeatureFlags.tsx
│   │   │
│   │   ├── analytics/               # Analytics components
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── ClientAnalytics.tsx
│   │   │   ├── MetricsPanel.tsx
│   │   │   └── ReportGenerator.tsx
│   │   │
│   │   └── ... (additional feature components)
│   │
│   ├── 🪝 Hooks & Context (src/hooks/)
│   │   ├── UnifiedAuthContext.tsx   # Auth state provider
│   │   ├── ChatContext.tsx          # Chat state provider
│   │   ├── ThemeContext.tsx         # Theme state provider
│   │   ├── use-realtime.ts          # Real-time subscriptions
│   │   ├── use-socket.ts            # Socket.io integration
│   │   ├── use-toast.ts             # Toast notifications
│   │   ├── useChat.ts               # Chat logic hook
│   │   ├── useNotifications.ts      # Notifications hook
│   │   ├── usePresence.ts           # User presence tracking
│   │   ├── useRealtimePresence.ts   # Presence subscription
│   │   ├── AuthHook.tsx             # Legacy auth hook
│   │   └── ... (additional custom hooks)
│   │
│   ├── 📚 Library & Utilities (src/lib/)
│   │   ├── auth-service.ts          # Authentication business logic
│   │   ├── enhanced-services.ts     # Core business logic (CRUDL)
│   │   ├── document-service.ts      # Document operations
│   │   ├── invoice-service.ts       # Invoice operations
│   │   ├── notification-service.ts  # Notification management
│   │   ├── validators-unified.ts    # Zod validation schemas
│   │   ├── permissions.ts           # RBAC and permissions logic
│   │   ├── prisma.ts                # Prisma client instance
│   │   ├── redis.ts                 # Redis client instance
│   │   ├── utils.ts                 # General helper functions
│   │   ├── loading-states.tsx       # Skeleton & loader components
│   │   ├── api-handler.ts           # API wrapper and utilities
│   │   ├── client-service.ts        # Client management operations
│   │   ├── advanced-utils.ts        # Advanced utility functions
│   │   ├── storage.ts               # File storage operations
│   │   │
│   │   ├── api/                     # API utilities
│   │   │   ├── client.ts            # Fetch client setup
│   │   │   └── config.ts            # API configuration constants
│   │   │
│   │   ├── backend/                 # Backend-only utilities
│   │   │   ├── email.ts             # Email sending service
│   │   │   └── verification.ts      # Email verification logic
│   │   │
│   │   ├── services/                # Business domain services
│   │   │   ├── gst-service.ts       # GST filing logic
│   │   │   ├── itr-service.ts       # ITR filing logic
│   │   │   ├── compliance-service.ts # Compliance management
│   │   │   ├── analytics-service.ts # Analytics calculations
│   │   │   └── reporting-service.ts # Report generation
│   │   │
│   │   ├── storage/                 # File storage utilities
│   │   │   ├── document-storage.ts  # Document upload/download
│   │   │   └── file-uploader.ts     # File upload handler
│   │   │
│   │   ├── supabase/                # Supabase integration
│   │   │   ├── client.ts            # Supabase client setup
│   │   │   ├── admin.ts             # Admin client (service role)
│   │   │   ├── server.ts            # Server-side client
│   │   │   ├── operations.ts        # CRUD operations
│   │   │   ├── realtime.ts          # Real-time subscriptions
│   │   │   └── hooks.ts             # Supabase custom hooks
│   │   │
│   │   ├── utils/                   # Utility modules
│   │   │   ├── date-utils.ts        # Date formatting and manipulation
│   │   │   ├── format-utils.ts      # String formatting utilities
│   │   │   ├── validation-utils.ts  # Input validation helpers
│   │   │   └── math-utils.ts        # Mathematical utilities
│   │   │
│   │   └── validators/              # Validation schemas
│   │       ├── auth-validators.ts   # Auth form schemas
│   │       ├── invoice-validators.ts # Invoice schemas
│   │       └── task-validators.ts   # Task schemas
│   │
│   ├── 🎨 Theme & Styling (src/theme/)
│   │   ├── colors.ts                # Color palette definitions
│   │   ├── fonts.ts                 # Font configuration
│   │   ├── variables.ts             # CSS variables
│   │   └── ... (additional theme files)
│   │
│   ├── 📝 Type Definitions (src/types/)
│   │   ├── auth.types.ts            # Auth related types
│   │   ├── database.types.ts        # Database schema types
│   │   ├── complete.types.ts        # Complete application types
│   │   └── ... (additional type files)
│   │
│   └── ⚙️ Utils (src/utils/)
│       └── supabase/                # Supabase utilities mirror
│
├── 📚 Documentation
│   ├── README.md                    # This comprehensive guide
│   ├── QUICK_REFERENCE.md           # Quick command reference
│   ├── PROJECT_STATUS_REPORT.md     # Current project status
│   ├── IMPLEMENTATION_SUMMARY.md    # Implementation details
│   ├── MVP_DEPLOYMENT_GUIDE.md      # Deployment instructions
│   ├── SUPABASE_IMPLEMENTATION_GUIDE.md  # Supabase integration guide
│   └── TROUBLESHOOTING.md           # Common issues and solutions
│
└── 📜 Configuration & Meta
    ├── .env.example                 # Example env variables
    ├── .env.local                   # Local dev env (not committed)
    ├── .env.production              # Production env
    ├── .github/workflows/           # GitHub Actions workflows
    ├── vercel.json                  # Vercel deployment config
    ├── docker-compose.yml           # Docker development setup
    └── package.json                 # NPM scripts and dependencies
```

---

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.17.0 or later ([Download](https://nodejs.org/))
- **npm/yarn/pnpm**: Latest version
- **Git**: 2.0 or later ([Download](https://git-scm.com/))
- **Supabase Account**: Free or paid ([Sign up](https://supabase.com/))

### Optional Requirements
- **PostgreSQL**: 14+ (for local development)
- **Docker**: For containerized development
- **Vercel Account**: For production deployment
- **Code Editor**: VS Code with TypeScript extension recommended

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/taxmate.git
cd taxmate
```

### Step 2: Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install

# Or using pnpm
pnpm install
```

### Step 3: Setup Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your configuration
# See Environment Configuration section below
```

### Step 4: Initialize Supabase Database

See [Database Setup](#-database-setup) section below.

### Step 5: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

---

## ⚙️ Environment Configuration

### Create `.env.local` File

```bash
# ============================================================================
# SUPABASE CONFIGURATION (Required)
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret-32-chars-minimum

# ============================================================================
# EMAIL CONFIGURATION (Resend)
# ============================================================================
RESEND_API_KEY=re_your_api_key_here

# ============================================================================
# PAYMENT CONFIGURATION (Razorpay)
# ============================================================================
RAZORPAY_KEY_ID=razorpay_key_id_here
RAZORPAY_KEY_SECRET=razorpay_key_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=razorpay_public_key

# ============================================================================
# APPLICATION CONFIGURATION
# ============================================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=TaxMate
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-32-chars-minimum-randomized

# ============================================================================
# DATABASE (Optional - if using local PostgreSQL)
# ============================================================================
DATABASE_URL=postgresql://user:password@localhost:5432/taxmate

# ============================================================================
# EXTERNAL SERVICES (Optional)
# ============================================================================
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
REDIS_URL=redis://localhost:6379
LIVEKIT_API_KEY=your-livekit-key
LIVEKIT_API_SECRET=your-livekit-secret
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-instance.com
```

### Get API Keys

**Supabase** (Required)
1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project (choose your region)
3. Go to Project Settings → API
4. Copy `Project URL` and `anon key`
5. Go to Project Settings → Database
6. Copy `Service Role Key`

**Resend** (For Email)
1. Sign up at [resend.com](https://resend.com)
2. Go to API Keys
3. Create new API key and copy

**Razorpay** (For Payments)
1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to Settings → API Keys
3. Copy Key ID and Key Secret

---

## 🗄️ Database Setup

### Option 1: Using Supabase (Recommended)

1. **Create Supabase Project**:
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Enter project name, password, select region
   - Wait for project to initialize

2. **Execute Database Schema**:
   - Open SQL Editor in Supabase
   - Create new query
   - Copy contents of `supabase/schema.sql`
   - Paste and run (takes ~30 seconds for 27 tables)

3. **Enable Real-Time Replication**:
   - Go to Database → Replication
   - Enable for: messages, tasks, documents, invoices, notifications
   - This enables real-time updates in the app

4. **Verify RLS Policies**:
   - Go to Database → Policies
   - All policies should be created automatically from schema
   - Verify at least 40+ policies exist

5. **Optional: Seed Test Data**:
   ```bash
   npm run db:seed
   ```

### Option 2: Using Local PostgreSQL

1. **Install PostgreSQL** (macOS):
   ```bash
   brew install postgresql@14
   brew services start postgresql@14
   ```

2. **Create Database**:
   ```bash
   createdb taxmate
   ```

3. **Update .env.local**:
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/taxmate"
   ```

4. **Run Prisma Migrations**:
   ```bash
   npm run db:push
   ```

5. **Seed Sample Data**:
   ```bash
   npm run db:seed
   ```

---

## 👨‍💻 Development

### Development Scripts

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code with ESLint
npm run lint

# Format code with Prettier
npm run format

# Type check entire project
npx tsc --noEmit

# Run unit tests
npm run test

# Run e2e tests with Playwright
npm run test:e2e

# Database commands
npm run db:push      # Sync Prisma schema
npm run db:seed      # Seed test data
npm run db:studio    # Open Prisma GUI
npm run generate     # Generate Prisma types

# Start background workers
npm run workers

# Analyze bundle size
npm run build:analyze
```

### Code Style Conventions

**TypeScript**
- Strict mode enabled
- No `any` types in new code
- Full type safety for functions and components

**Components**
- Functional components with hooks
- PascalCase naming (`TaskForm.tsx`)
- Props interface typing
- Error boundaries for UI safety

**Styling**
- Tailwind CSS utility classes
- CSS modules for scoped styles
- Dark mode support with `class` strategy

**Validation**
- Zod schemas for all forms
- Runtime validation on backend
- Type inference from schemas

**State Management**
- React Context for global state
- Custom hooks for reusable logic
- TanStack Query for server state

### File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `TaskForm.tsx` |
| Hooks | camelCase with `use` | `useChat.ts` |
| Utilities | camelCase | `dateUtils.ts` |
| Types | PascalCase with `.types` | `User.types.ts` |
| Constants | UPPER_SNAKE_CASE | `API_ENDPOINTS.ts` |

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/descriptive-name

# Make changes and commit
git add .
git commit -m "feat: add new feature description"

# Push to remote
git push origin feature/descriptive-name

# Create Pull Request on GitHub for code review
# Ensure all tests pass and linting succeeds before merging
```

### Commit Message Format

```
feat: add new feature
fix: fix a bug
docs: update documentation
style: code style changes
refactor: code refactoring
perf: performance improvements
test: add or update tests
ci: CI/CD changes
chore: dependency updates
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

**Option 1: Using Git**

1. Push code to GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Vercel auto-detects Next.js
6. Add environment variables:
   - All variables from `.env.local` (except DATABASE_URL if using Supabase)
7. Click "Deploy"

**Option 2: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel deploy --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
# ... add all other variables
```

### Environment Variables for Production

Add these in Vercel Dashboard → Project Settings → Environment Variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=

# Email & Payments
RESEND_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=
```

### Production Deployment Checklist

- [ ] All environment variables configured in production
- [ ] Supabase RLS policies enabled and verified
- [ ] Email service configured (Resend)
- [ ] Payment webhooks setup in Razorpay
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Error tracking setup (Sentry)
- [ ] Database backups configured
- [ ] CDN configured for static assets
- [ ] Rate limiting enabled for APIs
- [ ] Monitoring and alerts configured
- [ ] Database indexes verified
- [ ] Search functionality tested
- [ ] Real-time features tested
- [ ] All API endpoints tested

### Deploy with Docker

```bash
# Build image
docker build -t taxmate:latest .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  -e SUPABASE_SERVICE_ROLE_KEY=your-key \
  -e RESEND_API_KEY=your-key \
  -e RAZORPAY_KEY_ID=your-id \
  -e RAZORPAY_KEY_SECRET=your-secret \
  taxmate:latest
```

---

## 📖 API Documentation

### Base URL

```
Development: http://localhost:3000/api
Production:  https://yourdomain.com/api
```

### Authentication Endpoints

```
POST   /auth/signup              Create new user account
POST   /auth/signin              User login with credentials
POST   /auth/logout              Logout user
POST   /auth/verify-email        Verify email address
POST   /auth/forgot-password     Request password reset
POST   /auth/reset-password      Reset password with token
POST   /auth/setup-2fa           Setup two-factor auth
POST   /auth/verify-2fa          Verify TOTP code
POST   /auth/refresh-token       Get new JWT token
GET    /auth/user                Get current user profile
```

### Task Management Endpoints

```
GET    /tasks                    List all tasks
GET    /tasks/:id                Get task by ID
POST   /tasks                    Create new task
PUT    /tasks/:id                Update task
DELETE /tasks/:id                Delete task
PATCH  /tasks/:id/status         Update task status
GET    /tasks/assigned-to-me     Get assigned tasks
```

### Invoice Management Endpoints

```
GET    /invoices                 List all invoices
GET    /invoices/:id             Get invoice by ID
POST   /invoices                 Create invoice
PUT    /invoices/:id             Update invoice
DELETE /invoices/:id             Delete invoice
POST   /invoices/:id/send        Send invoice via email
PATCH  /invoices/:id/status      Update payment status
```

### Document Management Endpoints

```
GET    /documents                List all documents
GET    /documents/:id            Get document by ID
POST   /documents                Upload document
PUT    /documents/:id            Update document
DELETE /documents/:id            Delete document
POST   /documents/:id/share      Share document
GET    /documents/:id/download   Download document
```

### Compliance Tracking Endpoints

```
GET    /compliance               List compliance items
GET    /compliance/timeline      Get deadline timeline
GET    /compliance/gst           Get GST filings
GET    /compliance/itr           Get ITR filings
POST   /compliance               Create compliance item
PATCH  /compliance/:id/status    Update filing status
```

### Chat & Messaging Endpoints

```
GET    /chat                     List conversations
GET    /chat/:id                 Get conversation details
POST   /chat                     Create conversation
POST   /chat/:id/messages        Send message
GET    /chat/:id/messages        Get conversation messages
DELETE /chat/:id/messages/:msgId Delete message
```

### Analytics Endpoints

```
GET    /analytics                Get analytics dashboard
GET    /analytics/revenue        Get revenue data
GET    /analytics/clients        Get client profitability
GET    /analytics/compliance     Get compliance metrics
GET    /analytics/export         Export analytics data
```

### Admin Endpoints

```
GET    /admin/users              List all users
GET    /admin/users/:id          Get user details
POST   /admin/users              Create user
PUT    /admin/users/:id          Update user
DELETE /admin/users/:id          Delete user
GET    /admin/activity-logs      Get activity logs
GET    /admin/settings           Get system settings
PATCH  /admin/settings           Update system settings
```

**Note**: Full OpenAPI/Swagger documentation available at `/api/docs`

---

## 🧩 Components & Pages Alignment

### Authentication Pages
| Page | Components | Status |
|------|-----------|--------|
| `/auth/signin` | LoginForm, SocialLogin, RememberMe | ✅ Complete |
| `/auth/signup` | SignupForm, TermsCheckbox, VerifyEmail | ✅ Complete |
| `/auth/reset-password` | ResetPasswordForm, CodeInput | ✅ Complete |
| `/auth/verify-email` | EmailVerification, ResendCode | ✅ Complete |
| `/auth/setup-2fa` | TwoFactorSetup, QRCode, TestCode | ✅ Complete |

### Dashboard Pages  
| Page | Primary Components | Status |
|------|------------------|--------|
| `/dashboard` | DashboardStats, RecentActivity, MetricsCard, WelcomeCard | ✅ Complete |
| `/dashboard/tasks` | TaskList, TaskCard, TaskFilters, TaskForm, TaskPriority | ✅ Complete |
| `/dashboard/invoices` | InvoiceList, InvoiceForm, InvoicePreview, PaymentTracker | ✅ Complete |
| `/dashboard/documents` | DocumentList, DocumentUpload, DocumentShare, DocumentPreview | ✅ Complete |
| `/dashboard/compliance` | ComplianceChecklist, DeadlineTracker, FilingStatus, Timeline | ✅ Complete |
| `/dashboard/chat` | ChatWindow, MessageList, MessageInput, ConversationList | ✅ Complete |
| `/dashboard/appointments` | AppointmentList, AppointmentForm, AppointmentDetail, VideoCall | ✅ Complete |
| `/dashboard/analytics` | RevenueChart, ClientAnalytics, MetricsPanel, ReportGenerator | ✅ Complete |

### Admin Pages
| Page | Components | Status |
|------|-----------|--------|
| `/dashboard/admin/users` | UserList, UserForm, UserActions, UserDetail | ✅ Complete |
| `/dashboard/admin/activity` | ActivityLog, LogFilters, LogViewer, ExportLog | ✅ Complete |
| `/dashboard/admin/settings` | FeatureFlags, SystemSettings, SecuritySettings | ✅ Complete |
| `/dashboard/admin/security` | RoleManagement, PermissionMatrix, AuditLog | ✅ Complete |

### Component Quality Standards

All components follow these standards:
- ✅ Full TypeScript typing with no `any`
- ✅ Uses Radix UI primitives
- ✅ Error boundary wrapped
- ✅ Loading states implemented
- ✅ Responsive (mobile-first design)
- ✅ Accessibility (a11y) compliant
- ✅ Proper prop documentation
- ✅ Aligned with page requirements

---

## 🔐 Authentication Flow

### User Signup Flow
```
1. User enters email & password
2. Validation via Zod schema
3. Account created in Supabase Auth
4. Verification email sent (Resend)
5. User clicks email link
6. Email verified, account activated
7. User can login
8. JWT token generated
9. Session stored (httpOnly cookie)
10. Redirected to onboarding wizard
```

### User Login Flow
```
1. User enters email & password
2. Credentials verified with Supabase
3. If 2FA enabled → 2FA verification required
4. JWT token generated
5. Session stored (httpOnly cookie)
6. Redirected to dashboard
7. Auth context updated
8. Page protected by middleware
```

### 2FA Setup Flow
```
1. User navigates to Security Settings
2. System generates TOTP secret
3. QR code displayed for scanning
4. User scans with authenticator app
5. User enters 6-digit code to verify
6. 2FA enabled on account
7. User must use 2FA on next login
```

### Password Reset Flow
```
1. User clicks "Forgot Password"
2. Enters email address
3. Reset email sent (link valid 1 hour)
4. User clicks link in email
5. Redirected to reset password page
6. User enters new password
7. Password validated and updated
8. Email confirmation sent
9. User can login with new password
```

---

## 🔄 Real-Time Features

### Real-Time Subscriptions

```typescript
// Tasks - Real-time updates
const { tasks, loading } = useRealtimeTasks(userId);

// Messages - New messages arrive instantly
const { messages } = useRealtimeMessages(conversationId);

// Notifications - Instant notification delivery
const { notifications } = useRealtimeNotifications(userId);

// User Presence - See who's online
const { onlineUsers } = useRealtimePresence();

// Typing Indicator - See when others are typing
const { isTyping } = useTypingIndicator(conversationId);

// Document Collaboration - Real-time document edits
const { editors, changes } = useCollaboration(documentId);
```

### WebSocket Events

| Event | Triggered When | Data |
|-------|---|---|
| `presence:user_online` | User comes online | user_id, timestamp |
| `presence:user_offline` | User goes offline | user_id, timestamp |
| `message:new` | New message received | message, sender |
| `task:created` | Task created | task_id, title |
| `task:updated` | Task status changed | task_id, status |
| `invoice:paid` | Invoice marked paid | invoice_id, amount |
| `notification:new` | New notification | notification_id, type |
| `document:modified` | Document uploaded/changed | document_id, action |
| `chat:user_typing` | User typing indicator | user_id, conversation_id |

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Issue: Supabase Connection Error
```
Error: Failed to connect to https://...supabase.co
```

**Solution**:
- Verify `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
- Check internet connection
- Verify Supabase project is active in dashboard
- Check CORS settings in Supabase

#### Issue: Infinite Authentication Loop
```
Redirected to /auth/signin infinitely
```

**Solution**:
- Clear browser cookies and cache
- Verify JWT token is valid
- Check `UnifiedAuthContext.tsx` setup
- Restart dev server
- Check auth service in browser console

#### Issue: Database Migration Errors
```
Error: Failed to migrate database
```

**Solution**:
- Verify `DATABASE_URL` is correct
- Use `npm run db:push -- --force-reset` carefully
- Check `supabase/schema.sql` syntax
- Verify PostgreSQL version 14+
- Check table and column names for typos

#### Issue: Environment Variables Not Loading
```
Error: NEXT_PUBLIC_SUPABASE_URL is undefined
```

**Solution**:
- Create `.env.local` in project root
- Restart dev server after adding variables
- Check variable names match exactly
- Ensure no spaces in variable values
- Use `NEXT_PUBLIC_` prefix for client-side vars

#### Issue: Real-Time Updates Not Working
```
Realtime subscribed but no events received
```

**Solution**:
- Enable Realtime in Supabase → Database → Replication
- Check RLS policies allow subscriptions
- Verify `useRealtime` hook cleanup function
- Check browser console for WebSocket errors
- Verify table is in Replication publication list

#### Issue: Email Not Sending
```
Error: Failed to send verification email
```

**Solution**:
- Verify `RESEND_API_KEY` is valid
- Check email address format
- Review email templates in code
- Check Resend quota and rate limits
- Enable Resend domain verification

#### Issue: Payment Webhook Not Triggered
```
Invoice paid but webhook not received
```

**Solution**:
- Verify `RAZORPAY_KEY_SECRET` is correct
- Configure webhook URL in Razorpay dashboard
- Check webhook endpoint accessibility
- Verify IP whitelist in Razorpay settings
- Check payment status manually in Razorpay

### Enable Debug Logging

```typescript
// In browser console
localStorage.setItem('debug', 'taxmate:*');

// View logs in browser developer tools
console.log('Debug mode enabled');
```

### Check Application Health

```bash
# Verify environment variables
npm run verify:env

# Check database connectivity
npm run db:studio

# Verify auth system
npm run verify-auth-system.sh

# Check TypeScript compilation
npx tsc --noEmit

# Check ESLint issues
npm run lint
```

---

## 🤝 Contributing

We welcome contributions from the community! Please follow these guidelines:

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/taxmate.git
   cd taxmate
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Make your changes**
   - Follow code style conventions
   - Add tests for new features
   - Update documentation

4. **Commit with clear messages**
   ```bash
   git commit -m 'feat: add amazing feature'
   ```

5. **Push to branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

6. **Open a Pull Request**
   - Describe changes clearly
   - Link related issues
   - Request reviewers

### Code Quality Standards

- ✅ TypeScript strict mode
- ✅ 80%+ test coverage for new code
- ✅ ESLint passing
- ✅ No console warnings
- ✅ Proper error handling
- ✅ Type-safe components
- ✅ Updated documentation

### Testing Requirements

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- TaskForm.test.tsx

# Run tests with coverage
npm run test -- --coverage

# Run e2e tests
npm run test:e2e

# Run specific e2e test
npm run test:e2e -- auth.spec.ts
```

---

## 📋 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Supabase** - Backend infrastructure and real-time database
- **Vercel** - Hosting and deployment platform
- **Radix UI** - Accessible component library
- **Tailwind CSS** - Utility-first CSS framework
- **Next.js** - React framework with excellent DX
- **TypeScript** - Type safety and developer experience
- All open-source contributors

---

## 📞 Support & Contact

### Getting Help

- 📖 **Documentation**: Read [docs](./docs) directory
- 🐛 **Issues**: Check [GitHub Issues](https://github.com/yourusername/taxmate/issues)
- 💬 **Discussions**: Ask in [Discussions](https://github.com/yourusername/taxmate/discussions)
- 📧 **Email**: support@taxmate.example.com

### Connect With Us

- 🌐 **Website**: https://taxmate.example.com
- 🐦 **Twitter**: @taxmate
- 💼 **LinkedIn**: /company/taxmate
- 📞 **Phone**: +1 (555) TAXMATE-1

---

## 📊 Project Status

**Current Version**: 1.0.0 (Production Ready) ✅

| Component | Status | Coverage |
|-----------|--------|----------|
| Database | ✅ Complete | 27 tables, RLS, triggers |
| Authentication | ✅ Complete | Email, 2FA, password reset |
| Dashboard | ✅ Complete | Home, stats, metrics |
| Tasks | ✅ Complete | CRUD, filtering, assignment |
| Invoices | ✅ Complete | CRUD, payment tracking |
| Documents | ✅ Complete | Upload, share, preview |
| Compliance | ✅ Complete | GST, ITR, TDS tracking |
| Chat | ✅ Complete | Real-time messaging |
| Appointments | ✅ Complete | Scheduling, video calls |
| Analytics | ✅ Complete | Revenue, clients, KPIs |
| Admin Panel | ✅ Complete | Users, logs, settings |
| API Routes | ✅ Complete | All endpoints |
| Real-Time | ✅ Complete | Subscriptions, webhooks |
| Testing | ⚠️ 70% | Unit & E2E tests |
| Documentation | ✅ Complete | All guides and references |

**Last Updated**: May 30, 2026  
**Maintainers**: TaxMate Development Team  
**License**: MIT

---

**Questions?** Open an issue on GitHub or contact support@taxmate.example.com

