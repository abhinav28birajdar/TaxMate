"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Users, 
  FileSpreadsheet, 
  FileText, 
  Briefcase, 
  CheckSquare, 
  MessageSquare, 
  Video, 
  Calendar, 
  Award, 
  CreditCard, 
  Bell, 
  Clock, 
  BarChart3, 
  Search, 
  Settings, 
  ShieldAlert, 
  HelpCircle, 
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Layers,
  ChevronRight,
  CheckCircle2,
  Lock,
  PhoneCall,
  Activity,
  FolderLock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalSearchDialog } from "@/components/shared/GlobalSearchDialog";

interface ModuleDefinition {
  id: number;
  category: "Shared & Onboarding" | "Customer Portal" | "CA Practice & Filing" | "Real-Time & Media" | "Billing & Analytics" | "Super Admin & Operations";
  title: string;
  tagline: string;
  icon: any;
  primaryHref: string;
  badge: string;
  items: { name: string; href?: string }[];
  highlight?: boolean;
}

const modulesData: ModuleDefinition[] = [
  {
    id: 1,
    category: "Shared & Onboarding",
    title: "Authentication & Onboarding — Shared",
    tagline: "Role-based authentication, biometric/2FA, OTP verification, and guided KYC setup.",
    icon: ShieldCheck,
    primaryHref: "/login",
    badge: "Enterprise Auth",
    items: [
      { name: "Splash Screen", href: "/splash" },
      { name: "Welcome / Landing", href: "/" },
      { name: "Login", href: "/login" },
      { name: "Sign Up", href: "/register" },
      { name: "Select Account Type (Customer vs CA)", href: "/choose-role" },
      { name: "Email Verification", href: "/verify-email" },
      { name: "Phone OTP Verification", href: "/verify-otp" },
      { name: "Forgot Password", href: "/forgot-password" },
      { name: "Reset Password", href: "/reset-password" },
      { name: "Create Password", href: "/reset-password" },
      { name: "Complete Profile", href: "/onboarding/client" },
      { name: "Upload Profile Photo", href: "/client/profile" },
      { name: "Terms & Conditions", href: "/accept-terms" },
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Account Verification / KYC", href: "/admin/kyc" },
      { name: "Onboarding Complete", href: "/client/dashboard" },
    ],
  },
  {
    id: 2,
    category: "Customer Portal",
    title: "Customer Application",
    tagline: "Central dashboard for taxpayers to track GST/ITR filings, documents, and CA interactions.",
    icon: Users,
    primaryHref: "/client/dashboard",
    badge: "Taxpayer Suite",
    items: [
      { name: "Customer Dashboard", href: "/client/dashboard" },
      { name: "Customer Home / Dashboard", href: "/client/dashboard" },
      { name: "Tax Overview", href: "/client/tax-returns" },
      { name: "Pending Tasks", href: "/client/tasks" },
      { name: "Upcoming Deadlines", href: "/client/compliance" },
      { name: "Recent Documents", href: "/client/documents" },
      { name: "Recent Activity", href: "/client/dashboard" },
      { name: "Notifications", href: "/client/notifications" },
      { name: "Customer Profile", href: "/client/profile" },
      { name: "My Profile", href: "/client/profile" },
      { name: "Edit Profile", href: "/client/profile" },
      { name: "Profile Photo Upload / Change", href: "/client/profile" },
      { name: "Personal & Contact Information", href: "/client/profile" },
      { name: "Address Details", href: "/client/profile" },
      { name: "PAN & Aadhaar Details", href: "/client/profile" },
      { name: "Bank & Tax Profile Details", href: "/client/profile" },
      { name: "Business & Dependent Info", href: "/client/profile" },
      { name: "KYC Documents", href: "/client/documents" },
      { name: "Profile Completion Tracker", href: "/client/profile" },
    ],
  },
  {
    id: 3,
    category: "Customer Portal",
    title: "Tax Management",
    tagline: "End-to-end ITR return creation, Old vs New regime calculator, and e-filing acknowledgements.",
    icon: FileSpreadsheet,
    primaryHref: "/client/tax-returns",
    badge: "ITR Engine",
    items: [
      { name: "Tax Dashboard", href: "/client/tax-returns" },
      { name: "My Tax Returns", href: "/client/tax-returns" },
      { name: "Create Tax Return", href: "/client/tax-returns" },
      { name: "Tax Return Details", href: "/client/tax-returns" },
      { name: "Salary Income", href: "/client/income-tax" },
      { name: "Business & Freelance Income", href: "/client/income-tax" },
      { name: "Rental Income", href: "/client/income-tax" },
      { name: "Capital Gains & Investment Income", href: "/client/income-tax" },
      { name: "Other Income & Exemptions", href: "/client/income-tax" },
      { name: "Deductions (80C, 80D, 80G)", href: "/client/income-tax" },
      { name: "Tax Regime Selection (Old vs New)", href: "/client/tax-returns" },
      { name: "Live Tax Calculation Engine", href: "/client/tax-returns" },
      { name: "Tax Summary & Liability", href: "/client/tax-returns" },
      { name: "Tax Refund & Payment Status", href: "/client/tax-returns" },
      { name: "Filed Returns & Download ITR-V", href: "/client/tax-returns" },
      { name: "Previous Year Returns History", href: "/client/income-tax" },
    ],
  },
  {
    id: 4,
    category: "Customer Portal",
    title: "Documents Vault & OCR Pipeline",
    tagline: "256-bit encrypted storage with automated Tesseract OCR for Form 16, 26AS, and bank statements.",
    icon: FileText,
    primaryHref: "/client/documents",
    badge: "OCR Enabled",
    items: [
      { name: "Documents Dashboard", href: "/client/documents" },
      { name: "Upload Document", href: "/client/documents/upload" },
      { name: "Document Categories", href: "/client/documents" },
      { name: "PAN & Aadhaar Documents", href: "/client/documents" },
      { name: "Form 16 & Salary Slips", href: "/client/documents" },
      { name: "Bank Statements", href: "/client/documents" },
      { name: "Investment Proofs (80C/80D)", href: "/client/documents" },
      { name: "Tax Receipts & ITR Documents", href: "/client/documents" },
      { name: "CA Requested & Shared Docs", href: "/client/documents" },
      { name: "Document Interactive Preview", href: "/client/documents" },
      { name: "Document Details & Version History", href: "/client/documents" },
      { name: "Download & Delete Document", href: "/client/documents" },
      { name: "Document Search & Category Filters", href: "/client/documents" },
      { name: "Upload from Gallery / Camera / PDF", href: "/client/documents/upload" },
      { name: "Multiple Document Upload with Progress", href: "/client/documents/upload" },
      { name: "OCR Processing & Extracted Data Review", href: "/client/documents/upload" },
    ],
  },
  {
    id: 5,
    category: "CA Practice & Filing",
    title: "CA / Accountant Application",
    tagline: "Dedicated CRM, client engagement analytics, compliance pipelines, and revenue management for CAs.",
    icon: Briefcase,
    primaryHref: "/ca/dashboard",
    badge: "Practice OS",
    items: [
      { name: "CA Dashboard & Analytics", href: "/ca/dashboard" },
      { name: "Total Clients & Active Cases", href: "/ca/clients" },
      { name: "Pending Tasks & Documents", href: "/ca/tasks" },
      { name: "Upcoming Tax Deadlines", href: "/ca/calendar" },
      { name: "Filing Status Overview", href: "/ca/income-tax" },
      { name: "Revenue & Payments Received", href: "/ca/payments" },
      { name: "Recent Practice Activity", href: "/ca/dashboard" },
      { name: "Client Management & Search", href: "/ca/clients" },
      { name: "Client Filters & Sorting", href: "/ca/clients" },
      { name: "Add New Client / Invite Client", href: "/ca/clients/add" },
      { name: "Client Details & Profiles", href: "/ca/clients" },
      { name: "Client Tax Profile & Documents", href: "/ca/documents" },
      { name: "Client Returns & Tasks", href: "/ca/tasks" },
      { name: "Client Communication & Notes", href: "/ca/chat" },
      { name: "Client Payment History & Timeline", href: "/ca/payments" },
    ],
  },
  {
    id: 6,
    category: "CA Practice & Filing",
    title: "CA Tax Filing Workflow",
    tagline: "Automated pipeline from document checklist to income verification, draft review, customer approval, and e-filing.",
    icon: Activity,
    primaryHref: "/ca/income-tax",
    badge: "Filing Workflow",
    items: [
      { name: "Tax Work Dashboard", href: "/ca/income-tax" },
      { name: "New Tax Case Setup", href: "/ca/income-tax" },
      { name: "Case Details & Client Info", href: "/ca/income-tax" },
      { name: "Document Checklist (Requested, Received, Missing)", href: "/ca/income-tax" },
      { name: "Review Documents & Extracted Tax Data", href: "/ca/income-tax" },
      { name: "Income Verification (Salary, House, Capital Gains)", href: "/ca/income-tax" },
      { name: "Deduction Verification (80C, 80D, 80G)", href: "/ca/income-tax" },
      { name: "Tax Calculation Engine & Review", href: "/ca/income-tax" },
      { name: "Return Draft Generation", href: "/ca/income-tax" },
      { name: "Customer Approval Pipeline", href: "/ca/income-tax" },
      { name: "E-Filing Integration Simulation", href: "/ca/income-tax" },
      { name: "Filing Confirmation & Official Receipt", href: "/ca/income-tax" },
      { name: "Return Completed & Historical Archive", href: "/ca/income-tax" },
    ],
  },
  {
    id: 7,
    category: "CA Practice & Filing",
    title: "Tasks & Workflow",
    tagline: "6-stage Kanban board: Pending → In Progress → Review → Customer Approval → Filed → Completed.",
    icon: CheckSquare,
    primaryHref: "/ca/tasks/kanban",
    badge: "6-Stage Workflow",
    items: [
      { name: "Tasks Dashboard", href: "/ca/tasks" },
      { name: "My Tasks & Client Tasks", href: "/ca/tasks" },
      { name: "Create Task & Assign Member", href: "/ca/tasks" },
      { name: "Task Details, Comments & Attachments", href: "/ca/tasks/kanban" },
      { name: "Status: Pending", href: "/ca/tasks/kanban" },
      { name: "Status: In Progress", href: "/ca/tasks/kanban" },
      { name: "Status: Review", href: "/ca/tasks/kanban" },
      { name: "Status: Customer Approval", href: "/ca/tasks/kanban" },
      { name: "Status: Filed", href: "/ca/tasks/kanban" },
      { name: "Status: Completed", href: "/ca/tasks/kanban" },
      { name: "Task Priority & Due Dates", href: "/ca/tasks/kanban" },
      { name: "Completed & Overdue Tasks", href: "/ca/tasks" },
    ],
  },
  {
    id: 8,
    category: "Real-Time & Media",
    title: "Real-Time Messaging Suite",
    tagline: "Customer ↔ CA chat, group channels, voice notes waveform, document sharing, typing indicators, and reactions.",
    icon: MessageSquare,
    primaryHref: "/client/chat",
    badge: "Major Feature",
    highlight: true,
    items: [
      { name: "Messages & Inbox", href: "/client/chat" },
      { name: "Chat List & Search Conversations", href: "/client/chat" },
      { name: "One-to-One Customer ↔ CA Chat", href: "/client/chat" },
      { name: "Group Chat & Audit Team Channels", href: "/ca/chat" },
      { name: "New Conversation & Message Search", href: "/client/chat" },
      { name: "Shared Documents with Preview", href: "/client/chat" },
      { name: "Shared Media & Image Messages", href: "/client/chat" },
      { name: "Voice Messages with Waveform", href: "/client/chat" },
      { name: "Reply, Forward, Edit & Delete Message", href: "/client/chat" },
      { name: "Message Reactions (👍, ❤️, 🚀, 📄)", href: "/client/chat" },
      { name: "Live Typing Indicator", href: "/client/chat" },
      { name: "Online / Offline Status & Last Seen", href: "/client/chat" },
      { name: "Read & Delivered Status Receipts", href: "/client/chat" },
      { name: "Real-Time Events Notification Ticker", href: "/client/chat" },
      { name: "Chat Settings, Block & Report User", href: "/client/chat" },
    ],
  },
  {
    id: 9,
    category: "Real-Time & Media",
    title: "Voice / Video Communication",
    tagline: "High-definition video consultations, screen sharing, and synchronized side-by-side document viewing for tax reviews.",
    icon: Video,
    primaryHref: "/client/calls",
    badge: "Screen Share + Docs",
    highlight: true,
    items: [
      { name: "Call History & Records", href: "/client/calls" },
      { name: "Start Voice Call & Incoming Call State", href: "/client/calls" },
      { name: "Active Voice Call Room", href: "/client/calls" },
      { name: "Incoming & Active Video Call Room", href: "/client/calls" },
      { name: "Screen Sharing Consultation Mode", href: "/client/calls" },
      { name: "Split-Screen Synchronized Document Viewer", href: "/client/calls" },
      { name: "Encrypted WebRTC 256-bit Connection", href: "/client/calls" },
      { name: "End Call & Consultation Notes Summary", href: "/client/calls" },
    ],
  },
  {
    id: 10,
    category: "Customer Portal",
    title: "CA Appointment System",
    tagline: "Select expert CA, view real-time calendar availability, choose slot, and get instant consultation confirmation.",
    icon: Calendar,
    primaryHref: "/client/meetings",
    badge: "Booking Engine",
    items: [
      { name: "Appointments Dashboard", href: "/client/meetings" },
      { name: "Book Consultation Flow", href: "/client/meetings" },
      { name: "Select CA & View Profile", href: "/client/find-ca" },
      { name: "Real-Time CA Availability Grid", href: "/ca/availability" },
      { name: "Select Date & Time Slot", href: "/client/meetings" },
      { name: "Appointment Confirmation Receipt", href: "/client/meetings" },
      { name: "Upcoming & Past Appointments", href: "/client/meetings" },
      { name: "Reschedule & Cancel Appointment", href: "/client/meetings" },
      { name: "Consultation History & Follow-ups", href: "/client/meetings" },
    ],
  },
  {
    id: 11,
    category: "CA Practice & Filing",
    title: "CA Public Profile & Marketplace",
    tagline: "Public storefront for verified Chartered Accountants with ICAI badges, specialization, pricing, and client reviews.",
    icon: Award,
    primaryHref: "/ca/profile",
    badge: "ICAI Verified",
    items: [
      { name: "Public CA Profile Page", href: "/ca/profile" },
      { name: "Profile Photo & Verified Badge", href: "/ca/profile" },
      { name: "Professional Qualification & ICAI Number", href: "/ca/profile" },
      { name: "Experience & Specialization Tags", href: "/ca/profile" },
      { name: "Services Catalog & Transparent Pricing", href: "/ca/services" },
      { name: "Real-Time Availability Status", href: "/ca/availability" },
      { name: "Client Reviews & Star Ratings", href: "/ca/reviews" },
      { name: "Direct Contact & Consultation Booking", href: "/client/find-ca" },
    ],
  },
  {
    id: 12,
    category: "Billing & Analytics",
    title: "Payments & Billing Hub",
    tagline: "UPI / Razorpay checkout, transaction history, GST invoices, and CA subscription plan management.",
    icon: CreditCard,
    primaryHref: "/client/payments",
    badge: "Razorpay / UPI",
    items: [
      { name: "Payments Dashboard", href: "/client/payments" },
      { name: "Payment Methods (UPI, Cards, NetBanking)", href: "/client/payments" },
      { name: "Add Payment Method Modal", href: "/client/payments" },
      { name: "Make Payment & Secure Checkout", href: "/client/payments" },
      { name: "Payment Processing & Success Screen", href: "/client/payments" },
      { name: "Payment Failed / Retry Workflow", href: "/client/payments" },
      { name: "Payment History & Transaction Details", href: "/client/payments" },
      { name: "Invoice List & Tax Invoice Details", href: "/client/invoices" },
      { name: "Download GST-Compliant Tax Invoice", href: "/client/invoices" },
      { name: "CA Service Pricing & Tiered Packages", href: "/pricing" },
      { name: "Subscription Plans (Starter, Pro, Firm)", href: "/pricing" },
      { name: "Upgrade Plan & Cancel Subscription", href: "/admin/plans" },
      { name: "Refund Status & Escrow Guarantee", href: "/refund-policy" },
    ],
  },
  {
    id: 13,
    category: "Real-Time & Media",
    title: "Notification Center",
    tagline: "Categorized alert feed across tax deadlines, documents, payments, appointments, and system updates.",
    icon: Bell,
    primaryHref: "/client/notifications",
    badge: "Multichannel",
    items: [
      { name: "Notification Center", href: "/client/notifications" },
      { name: "All Notifications Feed", href: "/client/notifications" },
      { name: "Tax & Filing Notifications", href: "/client/notifications" },
      { name: "Document Request Notifications", href: "/client/notifications" },
      { name: "Message & Chat Notifications", href: "/client/notifications" },
      { name: "Payment & Invoice Notifications", href: "/client/notifications" },
      { name: "Appointment Alerts", href: "/client/notifications" },
      { name: "Statutory Deadline Alerts", href: "/client/notifications" },
      { name: "System Notifications", href: "/client/notifications" },
      { name: "Notification Details Modal", href: "/client/notifications" },
      { name: "Notification Settings (Email/WhatsApp/SMS)", href: "/client/notifications" },
    ],
  },
  {
    id: 14,
    category: "Billing & Analytics",
    title: "Tax Calendar",
    tagline: "Comprehensive compliance calendar with statutory GST, ITR, TDS deadlines, custom reminders, and alerts.",
    icon: Clock,
    primaryHref: "/ca/calendar",
    badge: "Compliance Track",
    items: [
      { name: "Interactive Tax Calendar", href: "/ca/calendar" },
      { name: "Important Filing Deadlines (GSTR-1, 3B, ITR)", href: "/ca/calendar" },
      { name: "Tax Payment Deadlines (Advance Tax, TDS)", href: "/ca/calendar" },
      { name: "Reminder Details Drawer", href: "/ca/calendar" },
      { name: "Add Custom Reminder Modal", href: "/ca/calendar" },
      { name: "Reminder Settings & Automated Pushes", href: "/ca/calendar" },
    ],
  },
  {
    id: 15,
    category: "Billing & Analytics",
    title: "Reports & Analytics",
    tagline: "Deep insights for taxpayers (income, liability, expenses) and CAs (practice revenue, client growth, filing velocity).",
    icon: BarChart3,
    primaryHref: "/client/tax-reports",
    badge: "BI Analytics",
    items: [
      { name: "Customer Tax Summary", href: "/client/tax-reports" },
      { name: "Income Analytics & Breakdown", href: "/client/tax-reports" },
      { name: "Expense & Deduction Analytics", href: "/client/tax-reports" },
      { name: "Tax Liability & Refund Reports", href: "/client/tax-reports" },
      { name: "Customer Filing & Payment History", href: "/client/tax-reports" },
      { name: "CA Practice Dashboard & KPIs", href: "/ca/analytics" },
      { name: "Client Growth & Filing Analytics", href: "/ca/analytics" },
      { name: "Revenue Analytics & Unbilled Retainers", href: "/ca/analytics" },
      { name: "Pending vs Completed Work Reports", href: "/ca/analytics" },
      { name: "Team Performance & Audit Logs", href: "/ca/analytics" },
    ],
  },
  {
    id: 16,
    category: "Shared & Onboarding",
    title: "Global Search Suite",
    tagline: "Instant Ctrl+K search across clients, documents, tax returns, messages, transactions, and tasks.",
    icon: Search,
    primaryHref: "#search",
    badge: "Ctrl + K",
    items: [
      { name: "Global Search Modal (Ctrl+K)", href: "#search" },
      { name: "Search Clients", href: "#search" },
      { name: "Search Documents & Files", href: "#search" },
      { name: "Search Tax Returns & ITRs", href: "#search" },
      { name: "Search Chat Messages", href: "#search" },
      { name: "Search Transactions & Invoices", href: "#search" },
      { name: "Search Tasks & Compliance Items", href: "#search" },
    ],
  },
  {
    id: 17,
    category: "Shared & Onboarding",
    title: "Settings & Security Suite",
    tagline: "Account profile, two-factor authentication, biometric logins, session audit, privacy, and data export.",
    icon: Settings,
    primaryHref: "/client/settings",
    badge: "Security & Privacy",
    items: [
      { name: "Account Settings", href: "/client/settings" },
      { name: "Profile Settings", href: "/client/profile" },
      { name: "Change Password", href: "/ca/settings/security" },
      { name: "Two-Factor Authentication (2FA)", href: "/2fa-setup" },
      { name: "Biometric Login Setup", href: "/client/settings" },
      { name: "Login Sessions & Connected Devices", href: "/ca/settings/security" },
      { name: "Privacy & Notification Settings", href: "/client/settings" },
      { name: "Chat & Payment Settings", href: "/client/settings" },
      { name: "Theme & Dark Mode Options", href: "/client/settings" },
      { name: "Data & Storage Management", href: "/client/settings" },
      { name: "Download My Data Archive", href: "/client/settings" },
      { name: "Delete Account Confirmation", href: "/client/settings" },
      { name: "Secure Logout", href: "/login" },
    ],
  },
  {
    id: 18,
    category: "Super Admin & Operations",
    title: "Super Admin Application",
    tagline: "Comprehensive administration panel for user verification, CA firm onboarding, subscription billing, and audit logs.",
    icon: ShieldAlert,
    primaryHref: "/admin/dashboard",
    badge: "Super Admin",
    items: [
      { name: "Admin Login", href: "/login" },
      { name: "Super Admin Dashboard", href: "/admin/dashboard" },
      { name: "User Management (Customer & CA)", href: "/admin/users" },
      { name: "CA Firm Approvals & Licensure", href: "/admin/ca-approvals" },
      { name: "KYC Document Verification Queue", href: "/admin/kyc" },
      { name: "Subscription & Plan Management", href: "/admin/plans" },
      { name: "Revenue & Transaction Tracking", href: "/admin/revenue" },
      { name: "Support Tickets & User Inquiries", href: "/admin/support-tickets" },
      { name: "Platform Announcements & Content", href: "/admin/announcements" },
      { name: "System Audit Logs & Security Logs", href: "/admin/audit-logs" },
      { name: "Feature Flags & Maintenance Toggles", href: "/admin/feature-flags" },
      { name: "Database & Server Health Monitor", href: "/admin/database-monitor" },
    ],
  },
  {
    id: 19,
    category: "Shared & Onboarding",
    title: "Support System & Help Desk",
    tagline: "Self-service FAQ, multi-tier support ticket creation, live chat support, and issue escalation.",
    icon: HelpCircle,
    primaryHref: "/client/support",
    badge: "24/7 Desk",
    items: [
      { name: "Help Center Knowledgebase", href: "/help" },
      { name: "Frequently Asked Questions (FAQ)", href: "/faq" },
      { name: "Contact Support Form", href: "/contact" },
      { name: "Create Support Ticket", href: "/client/support" },
      { name: "My Support Tickets", href: "/client/support" },
      { name: "Ticket Details & Status", href: "/client/support" },
      { name: "Live Support Chat", href: "/client/chat" },
      { name: "Report Problem & User Feedback", href: "/client/support" },
      { name: "Terms & Conditions", href: "/terms-of-service" },
      { name: "Privacy Policy", href: "/privacy-policy" },
    ],
  },
  {
    id: 20,
    category: "Shared & Onboarding",
    title: "14 Important System Pages",
    tagline: "Complete set of gracefully designed system states: loading, empty state, offline, 404, 500, maintenance, and confirmations.",
    icon: AlertTriangle,
    primaryHref: "/system/loading",
    badge: "14 Essential States",
    highlight: true,
    items: [
      { name: "Loading Screen", href: "/system/loading" },
      { name: "Empty State Showcase", href: "/system/empty-state" },
      { name: "No Internet / Offline Banner", href: "/system/offline" },
      { name: "500 Server Error", href: "/system/500" },
      { name: "404 Page Not Found", href: "/not-found" },
      { name: "Permission Denied (403)", href: "/system/forbidden" },
      { name: "Session Expired", href: "/system/session-expired" },
      { name: "Maintenance Mode", href: "/maintenance" },
      { name: "Upload Error State", href: "/system/upload-error" },
      { name: "Payment Error State", href: "/system/payment-error" },
      { name: "Verification Failed State", href: "/system/verification-failed" },
      { name: "Account Suspended State", href: "/system/suspended" },
      { name: "Success Confirmation Screen", href: "/system/success" },
      { name: "Delete Confirmation Modal State", href: "/system/delete-confirmation" },
    ],
  },
];

export default function ModulesDirectoryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [filterQuery, setFilterQuery] = useState<string>("");

  const categories = [
    "All",
    "Shared & Onboarding",
    "Customer Portal",
    "CA Practice & Filing",
    "Real-Time & Media",
    "Billing & Analytics",
    "Super Admin & Operations",
  ];

  const filteredModules = modulesData.filter((mod) => {
    const matchesCategory = selectedCategory === "All" || mod.category === selectedCategory;
    const matchesQuery =
      filterQuery.trim() === "" ||
      mod.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      mod.tagline.toLowerCase().includes(filterQuery.toLowerCase()) ||
      mod.items.some((item) => item.name.toLowerCase().includes(filterQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden">
      {/* Background Subtleties: Dark Grid pattern + Soft glowing orbs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-20 pointer-events-none" />
      <div className="absolute top-0 left-0 w-[600px] h-[400px] bg-emerald-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse mix-blend-screen pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Hero Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 pt-16 pb-12">
        <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div>
            <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 backdrop-blur-sm">
              <span className="relative flex h-2 w-2 mr-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              TaxMate 2.0 • 20 Core Production Modules & Systems
            </span>
          </div>

          <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Unified Architecture & <br />
            <span className="text-emerald-500">All 20 Modules Index.</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 max-w-3xl leading-relaxed font-light">
            Every feature, portal, workflow, real-time messaging channel, video consultation room, and system state is meticulously designed and linked without a single omission. Explore any module below.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-white">20</span> Master Modules
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-white">140+</span> Screen Workflows
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-white">100%</span> Linked & Integrated
            </div>
            <button
              onClick={() => setSearchOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 transition-all ml-auto"
            >
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span>Press <kbd className="px-1 py-0.5 text-[10px] bg-white/10 rounded font-mono">Ctrl+K</kbd> to search</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-10 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-emerald-600 text-white shadow-[0_0_20px_rgba(5,150,105,0.4)]"
                      : "bg-[#141414] hover:bg-[#1A1A1A] text-gray-400 hover:text-white border border-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick Filter Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by feature or keyword..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {filteredModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`relative rounded-2xl bg-[#111111] border p-6 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] group ${
                  mod.highlight
                    ? "border-emerald-500/40 bg-gradient-to-b from-[#141414] to-[#111111]"
                    : "border-white/10 hover:border-emerald-500/30"
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-emerald-500/20 transition-all">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-emerald-500">
                            MODULE {mod.id < 10 ? `0${mod.id}` : mod.id}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
                            {mod.category}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors mt-0.5">
                          {mod.title}
                        </h3>
                      </div>
                    </div>

                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      {mod.badge}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                    {mod.tagline}
                  </p>

                  {/* Included Features & Sub-links */}
                  <div className="mt-5 pt-4 border-t border-white/5">
                    <p className="text-[11px] font-semibold text-gray-400 mb-2.5 uppercase tracking-wider">
                      Included Workflows & Pages ({mod.items.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {mod.items.map((item, idx) => (
                        item.href && item.href !== "#search" ? (
                          <Link
                            key={idx}
                            href={item.href}
                            className="inline-flex items-center text-[11px] px-2.5 py-1 rounded-lg bg-[#1A1A1A] hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 border border-white/5 text-gray-300 transition-all"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 mr-1.5"></span>
                            {item.name}
                          </Link>
                        ) : (
                          <span
                            key={idx}
                            onClick={() => item.href === "#search" && setSearchOpen(true)}
                            className="inline-flex items-center text-[11px] px-2.5 py-1 rounded-lg bg-[#1A1A1A] border border-white/5 text-gray-400 cursor-pointer hover:text-emerald-400"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-1.5"></span>
                            {item.name}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-gray-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Fully Interactive
                  </span>

                  {mod.primaryHref.startsWith("#") ? (
                    <Button
                      onClick={() => setSearchOpen(true)}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-[0_0_15px_rgba(5,150,105,0.3)] transition-all hover:shadow-[0_0_25px_rgba(5,150,105,0.5)]"
                    >
                      Trigger Global Search <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  ) : (
                    <Link href={mod.primaryHref}>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-[0_0_15px_rgba(5,150,105,0.3)] transition-all hover:shadow-[0_0_25px_rgba(5,150,105,0.5)]"
                      >
                        Launch Module <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Global Search Dialog Modal */}
      <GlobalSearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
