# TaxMate Application Site Map

## Overview
TaxMate is a comprehensive tax & accounting management platform connecting clients with Chartered Accountants. The application supports three user types: **Clients**, **Chartered Accountants (CAs)**, and **CA Firms**.

### User Journey Flow
```
Public Landing (/) 
    ↓
Find CA: /find-ca
    ↓
Authentication:
  - Login: /login
  - Register (role selection): /register
    - Clients: /register/client
    - CAs: /register/ca
    - Firms: /register/firm
  - Email Verification: /verify-email
  - Password Recovery: /forgot-password → /auth/callback → /reset-password
    ↓
Dashboard: /dashboard/* (authenticated users only)
```

---

## 1. ROOT LEVEL PAGES (`src/app/`)

### `/` - Landing Page
- **Route Path**: `/`
- **Purpose**: Public-facing homepage showcasing platform features and value proposition
- **Type**: Marketing landing page
- **Key Components Used**:
  - Navbar with scroll detection
  - Feature sections highlighting platform benefits
  - CTA buttons to Login/Register
  - Hero sections with animations
- **Key Navigation Links**:
  - `/login` - Existing users login
  - `/register` - New users sign up
  - `/find-ca` - Browse available CAs
  - Scroll to sections: Features, Pricing, Testimonials, FAQ, CTA
- **Navigation Status**: ✅ Complete - comprehensive CTAs throughout
- **Key Features**:
  - Animated hero section
  - Feature highlights with icons
  - Social proof (testimonials)
  - Trust indicators (12,000+ CAs)
  - Responsive navbar

###  `/auth-redirect` - Smart Auth Redirect
- **Route Path**: `/auth-redirect`
- **Purpose**: Server-side redirect handler that intelligently routes authenticated users
- **Type**: Redirect/Auth middleware
- **Logic**:
  - Authenticated users → `/dashboard`
  - Unauthenticated users → `/login`
  - Shows loading spinner during redirect
- **Key Components Used**:
  - useAuth hook for user state
  - useRouter for navigation
- **Key Navigation Links**: (Dynamic based on auth state)
  - Authenticated: `/dashboard`
  - Unauthenticated: `/login`
- **Navigation Status**: ✅ Complete - Smart redirect logic

### `/verify-email` - Email Verification
- **Route Path**: `/verify-email`
- **Purpose**: Post-signup email verification and confirmation page
- **Type**: Auth flow confirmation page
- **Key Components Used**:
  - Mail icon animation
  - Step-by-step instructions
  - Email verification UI
  - Links to troubleshooting
- **Displayed After**: User completes sign-up
- **Key Navigation Links**:
  - `/` - Home (if verification expires)
  - `/login` - Login after verification
  - Resend verification email button
- **Navigation Status**: ✅ Complete - Clear instructions and next steps
- **Features**:
  - Animated mail icon
  - 3-step verification process display
  - Email troubleshooting tips
  - Auto-redirect to dashboard after verification (via email link)

---

## 2. PUBLIC PAGES (`src/app/(public)/`)

### `/find-ca` - CA Discovery & Marketplace
- **Route Path**: `/find-ca`
- **Purpose**: Browse and search verified Chartered Accountants with filtering
- **Type**: Public marketplace/discovery page
- **Key Components Used**:
  - CAList component - displays CA cards
  - CAFilters component - advanced filtering interface
  - Search input with live filtering
  - Filter drawer (mobile-responsive)
  - CA profile cards with ratings and services
- **Key Features**:
  - Search by name/keyword
  - Filter by:
    - Experience level
    - Service types (GST, ITR, Audit, etc.)
    - Location/city
    - Rating/reviews
    - Premium status
    - Availability
  - Sort options (Rating, Experience, Reviews)
  - CA profile cards showing:
    - Avatar and basic info
    - ICAI membership number
    - Years of experience
    - Average rating & review count
    - Service list with pricing
    - Location(s) served
    - Premium/verified badges
- **Key Navigation Links**:
  - CA profile detail pages (if implemented)
  - `/login` - Login to hire CA
  - `/register` - Register as client
  - Back to `/` - Home
- **Navigation Status**: ✅ Complete - Clear discovery and action paths
- **Sample Mock Data**: Includes 12,000+ CAs with realistic data

---

## 3. AUTH PAGES (`src/app/(auth)/`)

### Auth Layout (`layout.tsx`)
- **Type**: Shared layout for all auth pages
- **Purpose**: Provides consistent branding and visual identity for auth flows
- **Layout Structure**:
  - **Left Side**: Gradient primary background with platform messaging
    - Logo and branding
    - Value proposition messaging
    - Social proof (CA user count)
    - Trust indicators
  - **Right Side**: White background with form content
- **Persistence**: All auth pages use this layout for consistency

### `/login` - User Login
- **Route Path**: `/login`
- **Purpose**: Authenticate existing users (CAs, Clients, Firms)
- **Type**: Authentication form
- **Key Components Used**:
  - Email input field
  - Password input field
  - "Remember me" checkbox
  - Submit button with loading state
  - Link to signup
  - Link to forgot password
- **Form Fields**:
  - Email (required, validated)
  - Password (required, validated)
- **Key Navigation Links**:
  - `/register` - New user signup
  - `/forgot-password` - Password recovery
  - Post-login: `/dashboard` (via auth redirect)
  - Resend verification link option (if email not verified)
- **Navigation Status**: ✅ Complete - Clear recovery and signup paths
- **Features**:
  - Form validation
  - Toast notifications for errors
  - Loader state during submission
  - Search params handling for redirects

### `/register` - Role Selection
- **Route Path**: `/register`
- **Purpose**: Role selection page - determine user type before signup
- **Type**: Decision/routing page
- **Key Components Used**:
  - Role cards (Client, CA, Firm)
  - Icon indicators for each role
  - Card click navigation
- **Role Options**:
  1. **Client** (`/register/client`)
     - Icon: User
     - Description: "I want to hire a CA for tax filing or financial advice"
  2. **Chartered Accountant** (`/register/ca`)
     - Icon: Briefcase
     - Description: "I am a practicing CA looking to manage clients and cases"
  3. **CA Firm** (`/register/firm`)
     - Icon: Users
     - Description: "We are a firm managing multiple CAs and large successions"
- **Key Navigation Links**:
  - `/register/client` - Client signup
  - `/register/ca` - CA signup
  - `/register/firm` - Firm signup
  - `/login` - Back to login
- **Navigation Status**: ✅ Complete - Clear role selection path
- **Features**:
  - Animated role cards
  - Clear descriptions for each role
  - Direct navigation to role-specific signup

### `/register/client` - Client Signup
- **Route Path**: `/register/client`
- **Purpose**: Registration form for clients (individuals seeking CA services)
- **Type**: Registration form
- **Key Components Used**:
  - Form inputs (First Name, Last Name, Email, Password, Phone)
  - Form validation
  - Password strength indicator
  - Phone number formatting
  - Submit button with loader
- **Form Fields**:
  - First Name (required)
  - Last Name (required)
  - Email (required, validated)
  - Password (required, min length, strength validation)
  - Phone (required, Indian format)
  - Terms & Conditions checkbox
- **Key Navigation Links**:
  - `/login` - Already have account
  - `/register` - Back to role selection
  - Post-signup: `/verify-email` (email verification pending)
- **Navigation Status**: ✅ Complete - Clear paths and error guidance
- **Backend**: Creates user in Supabase auth + profiles table

### `/register/ca` - Chartered Accountant Signup
- **Route Path**: `/register/ca`
- **Purpose**: Registration form for Chartered Accountants (CAs)
- **Type**: Registration form + CA-specific details
- **Key Components Used**:
  - Form inputs (Name, Email, Password, Phone)
  - CA-specific fields:
    - ICAI Membership Number
    - Years of Experience
    - Specializations/Services
    - Service locations
  - Form validation
  - Submit button with loader
- **Form Fields**:
  - First Name (required)
  - Last Name (required)
  - Email (required, validated)
  - Password (required)
  - Phone (required)
  - ICAI Membership Number (required, validated)
  - Years of Experience (required, number)
  - Specializations (multiple select)
  - Service Locations (multiple select)
- **Key Navigation Links**:
  - `/login` - Already have account
  - `/register` - Back to role selection
  - Post-signup: `/verify-email` → `/dashboard` (CA onboarding)
- **Navigation Status**: ✅ Complete - CA-specific details captured
- **Backend**: Creates CA profile with verified status pending ICAI validation

### `/register/firm` - CA Firm Signup
- **Route Path**: `/register/firm`
- **Purpose**: Registration form for CA Firms (organizations managing multiple CAs)
- **Type**: Registration form + Firm-specific details
- **Key Components Used**:
  - Form inputs for firm owner and firm details
  - Firm-specific fields:
    - Firm name
    - Registration number
    - Number of CAs in firm
    - Headquarters location
  - Form validation
  - Submit button with loader
- **Form Fields**:
  - Owner Name (First, Last) (required)
  - Email (required, validated)
  - Password (required)
  - Phone (required)
  - Firm Name (required)
  - Firm Registration Number (required)
  - Number of CAs (required)
  - Headquarters Location (required)
  - Firm Website (optional)
- **Key Navigation Links**:
  - `/login` - Already have account
  - `/register` - Back to role selection
  - Post-signup: `/verify-email` → `/dashboard` (Firm onboarding)
- **Navigation Status**: ✅ Complete - Firm-specific details captured
- **Backend**: Creates firm profile with verification pending

### `/forgot-password` - Password Recovery Request
- **Route Path**: `/forgot-password`
- **Purpose**: Initiate password reset flow
- **Type**: Password recovery form (2-step flow)
- **Key Components Used**:
  - Email input field
  - Submit button for request
  - Step indicator (Request → Sent)
  - Resend email option
- **Step 1: Request**
  - Email input
  - "Send Reset Link" button
- **Step 2: Sent**
  - Confirmation message
  - "Resend Email" button
  - Link back to login
- **Key Navigation Links**:
  - `/login` - Back to login
  - `/reset-password` - Once email link clicked (via email callback)
- **Navigation Status**: ✅ Complete - Clear recovery path
- **Features**:
  - Email validation
  - Resend functionality
  - Loading states

### `/reset-password` - Password Reset
- **Route Path**: `/reset-password`
- **Purpose**: Set new password after reset link confirmation
- **Type**: Password reset form
- **Key Components Used**:
  - New password input
  - Confirm password input
  - Password strength indicator
  - Submit button
  - Validation UI
- **Form Fields**:
  - New Password (required, min length, complexity)
  - Confirm Password (required, must match)
  - Password strength met indicator
- **Key Navigation Links**:
  - `/login` - After successful reset
  - Back to `/forgot-password` if error
- **Navigation Status**: ✅ Complete - Clear success path
- **Flow**:
  - Accessed via email link: `/auth/callback?next=/reset-password`
  - Supabase callback processes token
  - User redirected to `/reset-password` with valid session
  - User sets new password
  - Redirects to `/login` with success message

---

## 4. DASHBOARD PAGES (`src/app/(dashboard)/`)

### Dashboard Layout (`layout.tsx`)
- **Type**: Shared layout for all authenticated dashboard pages
- **Purpose**: Provides consistent dashboard UI with sidebar and header
- **Layout Structure**:
  - **Sidebar**: DashboardSidebar component with navigation menu
  - **Header**: DashboardHeader component with user info, notifications, search
  - **Main Content**: Flex layout with scrollable content area
  - **Styling**: Dark theme with primary accent color
- **Features**:
  - Responsive layout (sidebar collapsible on mobile)
  - Custom scrollbar styling
  - Background gradient effects
  - Fixed header with user profile access

### `/dashboard` - Dashboard Home/Landing
- **Route Path**: `/dashboard`
- **Purpose**: Primary dashboard landing page showing overview and quick access
- **Type**: Dashboard homepage
- **Key Components Used**:
  - TaxRefundTracker component
  - AiConsultant component
  - Dashboard statistics cards
  - Quick action cards
  - Recent activity feed
  - Calendar widget
- **Key Sections**:
  - **User Profile Summary**: Name, firm, client count, revenue, rating
  - **Quick Stats**: Total revenue, active cases, total clients, pending tasks, completed tasks
  - **Feature Cards** (linked to main features):
    - Advanced Analytics
    - Client Portal
    - AI Documents
    - Compliance Management
    - Invoicing System
  - **Tax Refund Tracker**: Track refund status across clients
  - **AI Consultant**: AI-powered assistance for tax queries
  - **Calendar**: Upcoming appointments and deadlines
- **Key Navigation Links**:
  - `/dashboard/advanced-analytics` - Analytics feature
  - `/dashboard/client-portal` - Client portal
  - `/dashboard/ai-documents` - AI document processing
  - `/dashboard/compliance` - Compliance management
  - `/dashboard/invoices` - Invoice management
  - `/dashboard/tasks` - Task management
  - `/dashboard/appointments` - Schedule management
  - Settings, Profile, Notifications (via header)
- **Navigation Status**: ✅ Complete - Hub-style navigation to all features
- **Key Features**:
  - Real-time statistics fetch
  - Skeleton loading states
  - Recent cases/activities display
  - KPI tracking

---

## 4.1 CORE BUSINESS FEATURES

### `/dashboard/clients` - Client Management
- **Route Path**: `/dashboard/clients`
- **Purpose**: Manage all clients - view profiles, add, edit, manage relationships
- **Type**: CRUD management page
- **Key Components Used**:
  - Client list with table/card view
  - Search and filter functionality
  - Add/Edit client modals
  - Client profile cards
  - Dropdown menus for actions
- **Key Features**:
  - **Search**: By name, email, phone
  - **Filters**: By status, city, service type, rating
  - **Actions**: 
    - Add new client
    - View client profile/details
    - Edit client info
    - Delete/archive client
    - Send message/assign task
    - View associated documents
    - Check payment status
  - **Display Fields**: Name, email, phone, status, city, cases count, revenue, joined date
- **Key Navigation Links**:
  - `/dashboard/clients/[id]` - Individual client profile (if implemented)
  - `/dashboard/chat` - Message a client
  - `/dashboard/invoices` - Client invoices
  - `/dashboard/documents` - Client documents
  - `/dashboard/cases` - Client cases
- **Navigation Status**: ✅ Complete - Full CRUD operations
- **Related API**: `/api/clients/`

### `/dashboard/invoices` - Invoice Management
- **Route Path**: `/dashboard/invoices`
- **Purpose**: Create, manage, and track invoices sent to clients
- **Type**: Invoicing management page
- **Key Components Used**:
  - InvoicesList component
  - CreateInvoiceModal component
  - Invoice table with status badges
  - Filter options
- **Key Features**:
  - **View/Filter Invoices**:
    - By status: Draft, Sent, Paid, Overdue, Cancelled
    - By date range
    - By client
    - By amount range
  - **Create Invoice**:
    - Select client
    - Add line items (service descriptions, amount, tax)
    - Set due date
    - Add notes/terms
    - Apply discounts/additional charges
  - **Invoice Actions**:
    - View/Preview
    - Send to client
    - Download as PDF
    - Mark as paid
    - Edit (if not paid)
    - Delete/archive
    - Track payment status
  - **Payments Integration**:
    - Online payment links
    - Payment due reminder
    - Payment history
- **Display Fields**: Invoice ID, client name, amount, status, due date, date issued, payment date
- **Key Navigation Links**:
  - `/dashboard/clients` - Select client
  - `/dashboard/payments` - Payment tracking
  - Client portal for payment (if applicable)
  - `/dashboard/analytics` - Revenue reports
- **Navigation Status**: ✅ Complete - Full invoicing workflow
- **Related API**: `/api/invoices/`

### `/dashboard/documents` - Document Management
- **Route Path**: `/dashboard/documents`
- **Purpose**: Upload, organize, and manage client documents and files
- **Type**: File management page
- **Key Components Used**:
  - Document table/list
  - Upload zone
  - Search functionality
  - Document preview/download
  - Folder organization
- **Key Features**:
  - **Upload Documents**:
    - Drag and drop upload
    - Multiple file selection
    - File type validation
    - File size limits
  - **Organize**:
    - Folder structure by client/category
    - Tag documents
    - Add descriptions
  - **AI Processing** (via `/dashboard/ai-documents`):
    - Auto-categorize documents
    - Extract key data (amounts, dates, etc.)
    - OCR text extraction
  - **Document Actions**:
    - Preview
    - Download
    - Share with client (permission-based)
    - Delete
    - Move to folder
    - Change visibility/permissions
  - **Search**: By filename, category, client, date
- **Display Fields**: Filename, type, size, upload date, category, client, shared status
- **Key Navigation Links**:
  - `/dashboard/ai-documents` - AI analysis
  - `/dashboard/clients` - Organize by client
  - `/dashboard/compliance` - Tax documents section
  - `/dashboard/chat` - Share document in conversation
- **Navigation Status**: ✅ Complete - Full document workflow
- **Related API**: `/api/documents/`

### `/dashboard/tasks` - Task Management
- **Route Path**: `/dashboard/tasks`
- **Purpose**: Create, track, and manage work tasks with priorities and deadlines
- **Type**: Task management page
- **Key Components Used**:
  - Task list/kanban view
  - Create task dialog
  - Status filter buttons
  - Priority filter options
- **Key Features**:
  - **Create Tasks**:
    - Task title and description
    - Assign to CA/team member
    - Set priority (Low, Medium, High, Urgent)
    - Set due date
    - Attach documents/files
    - Add checklists (sub-tasks)
  - **Manage Tasks**:
    - Change status (Pending, In Progress, Completed, On Hold)
    - Update priority
    - Reassign to another CA
    - Add comments/notes
    - Attach files
    - Mark as complete
  - **Filter/Sort**:
    - By status (All, Pending, In Progress, Completed)
    - By priority
    - By assigned person
    - By due date (Overdue first)
    - By client
- **Display Fields**: Title, status, priority, due date, assigned to, created date, completion %
- **Key Navigation Links**:
  - `/dashboard/appointments` - Schedule related tasks
  - `/dashboard/clients` - Task by client
  - `/dashboard/chat` - Discuss task
  - Notifications - Task reminders
- **Navigation Status**: ✅ Complete - Full task workflow
- **Related API**: `/api/tasks/`

### `/dashboard/appointments` - Appointment/Scheduling
- **Route Path**: `/dashboard/appointments`
- **Purpose**: Schedule and manage appointments with clients
- **Type**: Calendar/scheduling page
- **Key Components Used**:
  - Calendar widget
  - Appointment list
  - Calendar navigation (prev/next month)
  - Appointment creation dialog
  - Time slot picker
- **Key Features**:
  - **Create Appointments**:
    - Select client
    - Choose date and time
    - Set duration
    - Mark as Online/Offline/Hybrid
    - Add meeting link (if online)
    - Add location (if offline)
    - Add notes/agenda
    - Set reminders
  - **Manage Appointments**:
    - View calendar (Month, Week, Day views)
    - Edit appointment details
    - Change time/date
    - Cancel/reschedule
    - Add notes during/after appointment
    - Mark as attended/no-show
    - Send reminders to clients
  - **Filters**:
    - View by date range
    - By client
    - By status (Scheduled, Completed, Cancelled, No-show)
    - By appointment type (Consultation, Follow-up, Review, etc.)
- **Display Fields**: Date, time, client name, type, duration, location/meeting link, status
- **Key Navigation Links**:
  - `/dashboard/clients` - Select client
  - `/dashboard/chat` - Message before/after appointment
  - `/dashboard/tasks` - Create follow-up task
  - Notifications - Appointment reminders
  - Calendar integrations (Google Calendar sync if implemented)
- **Navigation Status**: ✅ Complete - Full scheduling workflow
- **Features**:
  - Calendar drag-and-drop (if implemented)
  - Timezone handling
  - Appointment reminders
  - Client-facing booking (if portal enabled)
- **Related API**: `/api/appointments/`

### `/dashboard/chat` - Messaging/Communication
- **Route Path**: `/dashboard/chat`
- **Purpose**: Real-time messaging with clients and team members
- **Type**: Communication/messaging page
- **Key Components Used**:
  - Conversation list (sidebar)
  - Message thread (main area)
  - Search conversations
  - Attachment upload
  - Typing indicators
- **Key Features**:
  - **Conversations**:
    - View all conversations
    - Search by person/client
    - Sort by recent/unread
    - Pin important conversations
  - **Messaging**:
    - Send text messages
    - Attach files/documents
    - Share screen (if video enabled)
    - Typing indicators
    - Read receipts
    - Message timestamps
  - **Features**:
    - Create new conversation
    - Add multiple participants (group chat)
    - Leave conversation
    - Archive conversation
    - Mute notifications
    - Message reactions/emoji
    - Pinned messages
  - **Integration**:
    - Auto-link related documents
    - Link to appointments/tasks
    - Share invoices
- **Display Fields**: Sender, message content, timestamp, read status, attachments
- **Key Navigation Links**:
  - `/dashboard/clients` - Send message to specific client
  - `/dashboard/documents` - Share document link
  - `/dashboard/invoices` - Share invoice link
  - `/dashboard/appointments` - Schedule from chat
- **Navigation Status**: ✅ Complete - Integrated communication hub
- **Features**:
  - Real-time messaging (WebSocket)
  - Presence indicators
  - Notification integration
  - File upload support
- **Related API**: `/api/messages/`

### `/dashboard/compliance` - Compliance Management
- **Route Path**: `/dashboard/compliance`
- **Purpose**: Track and manage GST, ITR, and statutory compliance deadlines
- **Type**: Compliance tracking page
- **Key Components Used**:
  - GSTDashboard component
  - Compliance tabs (Overview, GST, ITR, Other)
  - Timeline/calendar view
  - Alert indicators
- **Key Sections**:
  - **GST Management**:
    - GST filing status by client
    - Due dates for GST returns
    - Filing history
    - Non-compliance alerts
    - Penalties tracking
  - **ITR Management**:
    - ITR filing status
    - Deadline tracking
    - Filed vs pending
    - Refund status
  - **Other Compliance**:
    - Annual filings
    - Statutory audits
    - TDS returns
    - Professional tax
  - **Calendar View**:
    - Monthly compliance deadlines
    - Color-coded by type/status
    - Click to see details
  - **Reports**:
    - Compliance summary
    - Export reports
    - Non-compliance alerts
- **Key Navigation Links**:
  - `/dashboard/clients` - Client compliance details
  - `/dashboard/documents` - Tax documents
  - `/dashboard/tasks` - Create compliance tasks
  - `/dashboard/invoices` - Related billing
- **Navigation Status**: ✅ Complete - Comprehensive compliance tracking
- **Features**:
  - Deadline reminders
  - Status indicators (On-track, At-risk, Overdue)
  - Export capabilities
  - Email notifications
- **Related API**: `/api/compliance/`, `/api/gst/`, `/api/itr/`

---

## 4.2 ANALYTICS & INTELLIGENCE

### `/dashboard/analytics` - Basic Analytics
- **Route Path**: `/dashboard/analytics`
- **Purpose**: Overview analytics dashboard with key metrics
- **Type**: Analytics page
- **Key Components Used**:
  - Statistics cards
  - Charts (revenue, cases, etc.)
  - Trend indicators
- **Key Metrics**:
  - Revenue metrics
  - Case metrics
  - Client acquisition
  - Completion rates
- **Related API**: `/api/analytics/`

### `/dashboard/advanced-analytics` - Advanced Analytics
- **Route Path**: `/dashboard/advanced-analytics`
- **Purpose**: In-depth analytics with predictive insights and forecasting
- **Type**: Advanced analytics page
- **Key Components Used**:
  - Advanced charts (line, bar, pie, funnel)
  - Predictive indicators
  - Date range selectors
  - Custom report builder
- **Key Metrics**:
  - Revenue forecasting
  - Client lifetime value
  - Churn prediction
  - Seasonal trends
  - Performance KPIs
- **Features**:
  - Custom date ranges
  - Export reports
  - Drill-down capabilities
  - Compare periods
- **Related API**: `/api/advanced-analytics/`

### `/dashboard/business-intelligence` - Business Intelligence
- **Route Path**: `/dashboard/business-intelligence`
- **Purpose**: Strategic business insights and recommendations
- **Type**: BI/Strategic page
- **Key Metrics**:
  - Market trends
  - Competitive analysis
  - Growth opportunities
  - Client segmentation
- **Related API**: `/api/business-intelligence/`

### `/dashboard/performance-kpi` - Performance KPIs
- **Route Path**: `/dashboard/performance-kpi`
- **Purpose**: Track and monitor key performance indicators
- **Type**: KPI tracking page
- **Key KPIs**:
  - Revenue per CA
  - Cases per CA
  - Client satisfaction
  - Task completion rate
  - Average response time
- **Features**:
  - Goal setting
  - Performance trending
  - Team comparisons
- **Related API**: `/api/performance-kpi/`

---

## 4.3 OPERATIONAL FEATURES

### `/dashboard/expenses` - Expense Management
- **Route Path**: `/dashboard/expenses`
- **Purpose**: Track and manage business expenses
- **Type**: Expense management page
- **Key Features**:
  - Create expense entries
  - Categorize expenses
  - Add receipts
  - Approve expenses
  - Expense reports
- **Related API**: `/api/expenses/` (if exists)

### `/dashboard/payments` - Payment Processing
- **Route Path**: `/dashboard/payments`
- **Purpose**: Track and process payments from clients
- **Type**: Payment management page
- **Key Features**:
  - Payment history
  - Payment methods
  - Transaction details
  - Refund processing
  - Payment reconciliation
- **Related API**: `/api/payments/`

### `/dashboard/billing` - Billing Management
- **Route Path**: `/dashboard/billing`
- **Purpose**: Manage billing cycles and subscriptions
- **Type**: Billing page
- **Key Features**:
  - Billing history
  - Current subscription
  - Plan management
  - Payment methods
  - Invoices
- **Related API**: May link to `/api/invoices/`

### `/dashboard/cases` - Case Management
- **Route Path**: `/dashboard/cases`
- **Purpose**: Manage client cases (tax audits, compliance issues, etc.)
- **Type**: Case management page
- **Key Features**:
  - Create new case
  - View case details
  - Track case status
  - Assign CAs to cases
  - Document management per case
  - Timeline tracking
- **Related API**: `/api/cases/`

### `/dashboard/calls` - Call Management
- **Route Path**: `/dashboard/calls`
- **Purpose**: Manage and track client calls/consultations
- **Type**: Call tracking page
- **Key Features**:
  - Call history
  - Call recordings (if available)
  - Call notes
  - Call scheduling
  - Call duration tracking
- **Related API**: (May integrate with call service)

### `/dashboard/team` - Team Management
- **Route Path**: `/dashboard/team`
- **Purpose**: Manage team members (for firm users)
- **Type**: Team management page
- **Key Features**:
  - Add/remove team members
  - Assign roles and permissions
  - View team activity
  - Team performance
  - Workload distribution
- **Related API**: `/api/users/` or team-specific

### `/dashboard/workflow` - Workflow Management
- **Route Path**: `/dashboard/workflows`
- **Purpose**: Create and manage automation workflows
- **Type**: Workflow builder page
- **Key Features**:
  - Create automated workflows
  - Set triggers and actions
  - Template workflows
  - Workflow history
- **Related API**: `/api/workflows/`

### `/dashboard/collaboration` - Collaboration
- **Route Path**: `/dashboard/collaboration`
- **Purpose**: Team collaboration tools and spaces
- **Type**: Collaboration page
- **Key Features**:
  - Shared workspaces
  - Team discussions
  - Shared documents
  - Collaborative editing
- **Related API**: `/api/collaboration/`

---

## 4.4 SPECIALIZED SERVICES

### `/dashboard/ai-documents` - AI Document Processing
- **Route Path**: `/dashboard/ai-documents`
- **Purpose**: Auto-categorize documents and extract key data using AI
- **Type**: AI-powered document management
- **Key Features**:
  - Upload documents
  - Auto-categorization
  - Key data extraction (amounts, dates, names)
  - OCR and text recognition
  - Document classification
  - Smart suggestions
- **Related API**: `/api/ai-document-processing/`

### `/dashboard/client-portal` - Client Self-Service Portal
- **Route Path**: `/dashboard/client-portal`
- **Purpose**: Manage client-facing self-service portal
- **Type**: Portal management page
- **Key Features**:
  - Enable/disable portal access
  - Configure portal permissions
  - View portal analytics
  - Client login stats
  - Document sharing settings
- **Related API**: `/api/client-portal/`

### `/dashboard/client-matching` - Client Matching
- **Route Path**: `/dashboard/client-matching`
- **Purpose**: AI-powered matching of clients with appropriate CAs
- **Type**: Recommendation/matching page
- **Key Features**:
  - View matched clients
  - Accept/reject matches
  - Matching algorithm explanation
  - Quality metrics
- **Related API**: `/api/client-matching/`

### `/dashboard/esignature` - E-Signature Management
- **Route Path**: `/dashboard/esignature`
- **Purpose**: Send and track documents for e-signature
- **Type**: Document signing page
- **Key Features**:
  - Upload documents for signature
  - Send signature requests
  - Track signature status
  - Download signed documents
  - Audit trail
- **Related API**: `/api/esignature/`

### `/dashboard/recommendations` - Recommendations Engine
- **Route Path**: `/dashboard/recommendations`
- **Purpose**: AI-powered recommendations for clients
- **Type**: Recommendations page
- **Key Features**:
  - Tax saving recommendations
  - Compliance recommendations
  - Service recommendations
  - Historical recommendations
- **Related API**: `/api/recommendations/`

---

## 4.5 ADMINISTRATIVE & SETTINGS

### `/dashboard/settings` - User & Account Settings
- **Route Path**: `/dashboard/settings`
- **Purpose**: Manage user account, profile, and preferences
- **Type**: Settings management page
- **Key Components Used**:
  - Tabs for different settings sections
  - Profile forms
  - Password change form
  - Notification preferences
  - Security settings
- **Key Sections**:
  - **Profile Settings**:
    - Name, email, phone
    - Avatar/profile picture
    - Bio/tagline
    - Location
  - **Account Settings**:
    - Email verification status
    - Password change
    - Two-factor authentication (2FA)
    - Active sessions
    - Login history
  - **Notification Settings**:
    - Email notifications
    - In-app notifications
    - Notification frequency
    - Notification types (tasks, appointments, payments, etc.)
  - **Business Settings** (for firms/CAs):
    - Firm details
    - Services offered
    - Pricing
    - Availability
    - Team settings
  - **Privacy & Security**:
    - Data privacy settings
    - Visibility to clients
    - API keys
    - Connected apps/integrations
- **Key Navigation Links**:
  - `/dashboard/integrations` - External service connections
  - `/dashboard/billing` - Billing information
  - `/dashboard/team` - Team member management
  - `/login` - Logout
- **Navigation Status**: ✅ Complete - Comprehensive settings management
- **Related API**: Typically uses `/api/users/` for updates

### `/dashboard/audit-logs` - Audit Logs
- **Route Path**: `/dashboard/audit-logs`
- **Purpose**: View system audit logs and activity history (admin feature)
- **Type**: Audit/logging page
- **Key Features**:
  - Activity timeline
  - Filter by user, action, date
  - Export logs
  - Search functionality
- **Related API**: `/api/audit-logs/`

### `/dashboard/support` - Support & Help
- **Route Path**: `/dashboard/support`
- **Purpose**: Access support resources and contact support
- **Type**: Support/help page
- **Key Features**:
  - FAQ section
  - Knowledge base
  - Submit support ticket
  - Contact support
  - Chat with support
  - Request callback
- **Related API**: (May link to help/support services)

### `/dashboard/integrations` - Third-Party Integrations
- **Route Path**: `/dashboard/integrations`
- **Purpose**: Manage integrations with external services
- **Type**: Integrations page
- **Key Features**:
  - View available integrations
  - Enable/disable integrations
  - Configure integration settings
  - Authorize services
  - API key management
  - Usage statistics
- **Possible Integrations**:
  - Accounting software (Tally, Busy, etc.)
  - Bank APIs
  - E-signature services
  - Email services
  - Calendar services (Google, Outlook)
  - Communication APIs
- **Related API**: `/api/integrations/`

### `/dashboard/notifications` - Notification Center
- **Route Path**: `/dashboard/notifications`
- **Purpose**: View and manage all notifications
- **Type**: Notification center
- **Key Features**:
  - Notification history
  - Mark as read/unread
  - Delete notifications
  - Filter by type
  - Notification preferences
- **Related API**: `/api/notifications/`

---

## 5. API ROUTES STRUCTURE

The application includes comprehensive API endpoints organized by feature:

```
/api/
  ├── /auth/ - Authentication endpoints
  ├── /clients/ - Client management
  ├── /invoices/ - Invoice operations
  ├── /documents/ - Document management
  ├── /tasks/ - Task management
  ├── /appointments/ - Appointment scheduling
  ├── /messages/ - Messaging/Chat
  ├── /compliance/ - Compliance tracking
  ├── /gst/ - GST-specific operations
  ├── /itr/ - ITR-specific operations
  ├── /analytics/ - Analytics data
  ├── /advanced-analytics/ - Advanced analytics
  ├── /business-intelligence/ - BI data
  ├── /performance-kpi/ - KPI metrics
  ├── /ai-document-processing/ - AI document services
  ├── /client-portal/ - Portal management
  ├── /client-matching/ - Matching algorithms
  ├── /esignature/ - E-signature operations
  ├── /recommendations/ - Recommendation engine
  ├── /users/ - User management
  ├── /notifications/ - Notification management
  ├── /payments/ - Payment processing
  ├── /cases/ - Case management
  ├── /audit-logs/ - Audit logging
  ├── /integrations/ - Third-party integrations
  ├── /workflows/ - Workflow automation
  ├── /collaboration/ - Team collaboration
  ├── /v1/ - Versioned API endpoints (if using)
  └── ...
```

---

## 6. COMPREHENSIVE USER JOURNEYS

### Journey 1: Client Onboarding
```
Home (/)
  ↓ Click "Find CA"
Find CA (/find-ca)
  ↓ Browse CAs, find one, "Hire CA" button
Register - Role Selection (/register)
  ↓ Select "Client"
Client Registration (/register/client)
  ↓ Fill form, submit
Verify Email (/verify-email)
  ↓ Verify via email link
Dashboard (/dashboard)
  ↓ Explore features
Setup: Upload documents (/dashboard/documents)
Schedule appointment (/dashboard/appointments)
Chat with CA (/dashboard/chat)
```

### Journey 2: CA/Firm Onboarding
```
Home (/)
  ↓ Click "Login" or "Join as CA"
Register - Role Selection (/register)
  ↓ Select "Chartered Accountant" or "CA Firm"
CA Registration (/register/ca) or Firm (/register/firm)
  ↓ Fill form with ICAI details, submit
Verify Email (/verify-email)
  ↓ Verify via email link
Dashboard (/dashboard)
  ↓ Complete profile setup
Settings (/dashboard/settings)
  ↓ Add services, pricing, availability
View Matched Clients (/dashboard/clients or /dashboard/client-matching)
  ↓ Review and accept client matches
Create Invoice (/dashboard/invoices)
Schedule Appointment (/dashboard/appointments)
Chat with Client (/dashboard/chat)
```

### Journey 3: Client Service Delivery
```
Dashboard (/dashboard)
  ↓ Check appointments, tasks, messages
Chat with CA (/dashboard/chat)
  ↓ Discuss requirements
Upload Documents (/dashboard/documents)
  ↓ Submit tax documents
AI Processing (/dashboard/ai-documents) [CA side]
  ↓ Auto-categorize and extract data
Create Invoice (/dashboard/invoices) [CA side]
  ↓ Generate invoice for services
Track Compliance (/dashboard/compliance) [CA side]
  ↓ Monitor GST, ITR filings
Payment (/dashboard/payments)
  ↓ Client receives invoice, makes payment
Schedule Follow-up (/dashboard/appointments)
  ↓ Consultation or review meeting
```

### Journey 4: Password Recovery
```
Login (/login)
  ↓ Click "Forgot Password?"
Forgot Password Request (/forgot-password)
  ↓ Enter email, submit
Forgot Password - Sent (/forgot-password - step 2)
  ↓ Check email for reset link
Email Callback (/auth/callback?next=/reset-password)
  ↓ Click link in email
Reset Password (/reset-password)
  ↓ Enter new password
Login (/login)
  ↓ Login with new password
Dashboard (/dashboard)
```

---

## 7. NAVIGATION COMPLETENESS ASSESSMENT

### ✅ Strong Navigation Areas:
- **Auth Flow**: Complete path from registration → email verification → login → dashboard
- **Password Recovery**: Full recovery workflow with email callback
- **Dashboard Hub**: Central landing page with clear CTAs to all features
- **Core Features**: Client management, invoices, documents, tasks have clear navigation
- **Communication**: Chat integrated throughout for client/team messaging

### ⚠️ Areas for Improvement:
- **Feature Discoverability**: Some dashboard pages (like Advanced Analytics, BI) may need better discovery from main dashboard
- **Deep Linking**: Individual client profiles, case details may need dedicated detail pages
- **Breadcrumbs**: Adding breadcrumb navigation in deeply nested sections would help
- **Quick Navigation**: Search/command palette (Cmd+K) would improve feature discovery
- **Mobile Navigation**: Hamburger menu implementation in sidebar for mobile devices

### ✅ Cross-Cutting Navigation:
- **Settings accessible from**: Dashboard header (profile menu)
- **Support accessible from**: Dashboard menu (if implemented)
- **Notifications accessible from**: Header area (if implemented)
- **Logout**: Available from settings or profile menu

---

## 8. KEY NAVIGATION PATTERNS

### Primary Navigation
- **Top-level routing**: Auth vs. Dashboard (checked at `/auth-redirect`)
- **Route groups**: `(auth)`, `(public)`, `(dashboard)` separate concerns visually

### Secondary Navigation
- **Dashboard sidebar**: Main feature navigation
- **Dashboard header**: User profile, notifications, search
- **Tab-based navigation**: Settings uses tabs for different sections
- **Modal navigation**: Inline modals for create/edit operations (no new page navigation)

### Tertiary Navigation
- **Feature-specific**: Each major feature (clients, invoices) has internal filtering/sorting
- **Breadcrumb-style**: Some pages could benefit from breadcrumb navigation

---

## 9. MISSING OR PARTIALLY IMPLEMENTED PAGES

Based on directory structure vs. page implementations:

### May Have Subdirectories/Detail Pages Not Mapped:
- `/dashboard/clients/[id]` - Individual client profile (directory exists, detail page may be modal-based)
- `/dashboard/invoices/[id]` - Individual invoice view
- `/dashboard/cases/[id]` - Individual case details
- `/dashboard/documents/[id]` - Individual document preview

### Status Unknown (directories exist):
- `/dashboard/reports` - Report generation (directory structure suggests this might exist)
- `/dashboard/email-templates` - Template management (if needed)

---

## 10. LAYOUT HIERARCHY

```
RootLayout
├── ThemeProvider
├── AuthProvider
├── ErrorBoundary
└── Children
    ├── AuthLayout (for /auth, /verify-email, /forgot-password, /reset-password)
    │   ├── Left side: Branding + messaging
    │   └── Right side: Form content
    │
    ├── PublicLayout (for / and /find-ca)
    │   ├── Navbar
    │   └── Content
    │
    └── DashboardLayout (for /dashboard/*)
        ├── DashboardSidebar
        ├── DashboardHeader
        └── Main content area
```

---

## SUMMARY

TaxMate is a comprehensive, multi-role platform with:
- **3 distinct user journeys**: Client → Register → Dashboard, CA → Register → Dashboard, Firm → Register → Dashboard
- **30+ dashboard pages** covering invoicing, compliance, analytics, messaging, and administrative functions
- **Strong core workflows**: Client management, invoice generation, compliance tracking, appointment scheduling
- **Well-structured routing**: Using Next.js route groups for clean separation of concerns
- **Integration-ready**: Extensive API routes for third-party services and future expansion
- **Consistent UX patterns**: Shared layouts, modal-based operations, sidebar navigation

**Navigation Status**: ✅ **Comprehensive** - User can complete full workflows from public landing page through authentication to full dashboard functionality with clear navigation paths throughout.
