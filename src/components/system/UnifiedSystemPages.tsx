"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Loader2, 
  Inbox, 
  WifiOff, 
  ServerCrash, 
  FileQuestion, 
  ShieldAlert, 
  Clock, 
  Wrench, 
  UploadCloud, 
  CreditCard, 
  UserX, 
  AlertOctagon, 
  CheckCircle2, 
  Trash2, 
  ArrowLeft, 
  RefreshCw, 
  Home, 
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type SystemPageState = 
  | "loading"
  | "empty"
  | "no-internet"
  | "server-error"
  | "404"
  | "permission-denied"
  | "session-expired"
  | "maintenance"
  | "upload-error"
  | "payment-error"
  | "verification-failed"
  | "account-suspended"
  | "success-confirmation"
  | "delete-confirmation";

interface UnifiedSystemPagesProps {
  initialState?: SystemPageState;
}

export function UnifiedSystemPages({ initialState = "loading" }: UnifiedSystemPagesProps) {
  const [activeState, setActiveState] = useState<SystemPageState>(initialState);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemDeleted, setItemDeleted] = useState(false);

  const simulateAction = (msg: string) => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      alert(msg);
    }, 1200);
  };

  const systemStates: { id: SystemPageState; label: string; icon: React.ReactNode; badge: string; color: string }[] = [
    { id: "loading", label: "Loading Screen", icon: <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />, badge: "State", color: "border-emerald-500/30 text-emerald-400" },
    { id: "empty", label: "Empty State", icon: <Inbox className="w-4 h-4 text-gray-400" />, badge: "Data", color: "border-gray-500/30 text-gray-400" },
    { id: "no-internet", label: "No Internet", icon: <WifiOff className="w-4 h-4 text-amber-400" />, badge: "Network", color: "border-amber-500/30 text-amber-400" },
    { id: "server-error", label: "500 Server Error", icon: <ServerCrash className="w-4 h-4 text-rose-400" />, badge: "HTTP 500", color: "border-rose-500/30 text-rose-400" },
    { id: "404", label: "404 Not Found", icon: <FileQuestion className="w-4 h-4 text-cyan-400" />, badge: "HTTP 404", color: "border-cyan-500/30 text-cyan-400" },
    { id: "permission-denied", label: "Permission Denied", icon: <ShieldAlert className="w-4 h-4 text-orange-400" />, badge: "HTTP 403", color: "border-orange-500/30 text-orange-400" },
    { id: "session-expired", label: "Session Expired", icon: <Clock className="w-4 h-4 text-yellow-400" />, badge: "Auth", color: "border-yellow-500/30 text-yellow-400" },
    { id: "maintenance", label: "Maintenance Mode", icon: <Wrench className="w-4 h-4 text-blue-400" />, badge: "System", color: "border-blue-500/30 text-blue-400" },
    { id: "upload-error", label: "Upload Error", icon: <UploadCloud className="w-4 h-4 text-rose-400" />, badge: "Files", color: "border-rose-500/30 text-rose-400" },
    { id: "payment-error", label: "Payment Error", icon: <CreditCard className="w-4 h-4 text-rose-400" />, badge: "Billing", color: "border-rose-500/30 text-rose-400" },
    { id: "verification-failed", label: "Verification Failed", icon: <UserX className="w-4 h-4 text-amber-400" />, badge: "KYC", color: "border-amber-500/30 text-amber-400" },
    { id: "account-suspended", label: "Account Suspended", icon: <AlertOctagon className="w-4 h-4 text-red-500" />, badge: "Security", color: "border-red-500/30 text-red-400" },
    { id: "success-confirmation", label: "Success Confirmation", icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, badge: "Success", color: "border-emerald-500/30 text-emerald-400" },
    { id: "delete-confirmation", label: "Delete Confirmation", icon: <Trash2 className="w-4 h-4 text-rose-400" />, badge: "Action", color: "border-rose-500/30 text-rose-400" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[350px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Top Bar Navigator */}
      <header className="border-b border-white/10 bg-[#111111]/80 backdrop-blur-md sticky top-0 z-30 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/modules" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Modules
          </Link>
          <span className="text-white/20">|</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Module 20: 14 System Pages
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:inline">Active State:</span>
          <select 
            value={activeState} 
            onChange={(e) => setActiveState(e.target.value as SystemPageState)}
            className="bg-[#1A1A1A] border border-white/10 text-white rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-emerald-500"
          >
            {systemStates.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Horizontal Switcher Tabs */}
      <div className="border-b border-white/10 bg-[#0E0E0E] px-6 py-2 overflow-x-auto flex items-center gap-1.5 scrollbar-thin">
        {systemStates.map(s => (
          <button
            key={s.id}
            onClick={() => {
              setActiveState(s.id);
              setItemDeleted(false);
            }}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
              activeState === s.id
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* Main Content Area Rendering Selected State */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="max-w-xl w-full">
          {/* 1. Loading Screen */}
          {activeState === "loading" && (
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl relative">
              <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-sm">
                  TM
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                System Initializing
              </span>
              <h2 className="text-2xl font-bold text-white mt-4">Syncing Tax Records & Vault</h2>
              <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                Establishing end-to-end encrypted connection with the Income Tax Department & GSTN gateways...
              </p>
              <div className="w-full bg-[#1A1A1A] rounded-full h-1.5 mt-8 overflow-hidden">
                <div className="bg-emerald-500 h-full w-2/3 rounded-full animate-pulse" />
              </div>
              <p className="text-[11px] text-gray-500 mt-3 font-mono">Verifying SHA-256 Checksums • 78%</p>
            </div>
          )}

          {/* 2. Empty State */}
          {activeState === "empty" && (
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5 text-gray-400">
                <Inbox className="w-8 h-8 text-emerald-500/70" />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-white/5 border border-white/10 text-gray-400">
                No Records Found
              </span>
              <h2 className="text-2xl font-bold text-white mt-4">No Tax Documents Yet</h2>
              <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                You haven&apos;t uploaded any Form 16, bank statements, or capital gains proofs for Assessment Year 2026-27.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                <Link href="/client/documents">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-5 py-2.5 rounded-xl font-medium">
                    <UploadCloud className="w-4 h-4 mr-2" /> Upload First Document
                  </Button>
                </Link>
                <Link href="/client/dashboard">
                  <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 text-xs px-5 py-2.5 rounded-xl">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* 3. No Internet */}
          {activeState === "no-internet" && (
            <div className="bg-[#111111] border border-amber-500/20 rounded-2xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-5 text-amber-400">
                <WifiOff className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400">
                Network Disconnected
              </span>
              <h2 className="text-2xl font-bold text-white mt-4">Offline Mode Activated</h2>
              <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                Unable to reach the TaxMate cloud servers. Your local draft changes are preserved in your browser storage.
              </p>
              <div className="mt-8 flex justify-center">
                <Button 
                  onClick={() => simulateAction("Network connection verified! Syncing pending changes.")}
                  disabled={isRetrying}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-6 py-2.5 rounded-xl font-medium"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? "animate-spin" : ""}`} />
                  {isRetrying ? "Reconnecting..." : "Check Connection Again"}
                </Button>
              </div>
            </div>
          )}

          {/* 4. 500 Server Error */}
          {activeState === "server-error" && (
            <div className="bg-[#111111] border border-rose-500/20 rounded-2xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-5 text-rose-400">
                <ServerCrash className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-rose-500/10 border border-rose-500/20 text-rose-400">
                HTTP 500 Internal Error
              </span>
              <h2 className="text-2xl font-bold text-white mt-4">Something went wrong on our end</h2>
              <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                Our engineering team has been automatically alerted. Trace ID: <span className="font-mono text-xs text-rose-300">TM-ERR-88219</span>
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                <Button 
                  onClick={() => simulateAction("Server responded OK. Reloading.")}
                  disabled={isRetrying}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-5 py-2.5 rounded-xl font-medium"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? "animate-spin" : ""}`} />
                  Retry Request
                </Button>
                <Link href="/support">
                  <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 text-xs px-5 py-2.5 rounded-xl">
                    Report Incident
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* 5. 404 Page Not Found */}
          {activeState === "404" && (
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-5 text-cyan-400">
                <FileQuestion className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                HTTP 404
              </span>
              <h2 className="text-2xl font-bold text-white mt-4">Page or Docket Not Found</h2>
              <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                The URL you requested does not exist, was moved to a new tax assessment year, or requires authorization.
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <Link href="/">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-5 py-2.5 rounded-xl font-medium">
                    <Home className="w-4 h-4 mr-2" /> Go to Homepage
                  </Button>
                </Link>
                <Link href="/modules">
                  <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 text-xs px-5 py-2.5 rounded-xl">
                    Explore 20 Modules
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* 6. Permission Denied (403) */}
          {activeState === "permission-denied" && (
            <div className="bg-[#111111] border border-orange-500/20 rounded-2xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto mb-5 text-orange-400">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-orange-500/10 border border-orange-500/20 text-orange-400">
                HTTP 403 Forbidden
              </span>
              <h2 className="text-2xl font-bold text-white mt-4">Access Restricted</h2>
              <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                You do not have the required Chartered Accountant or Firm Partner role to review confidential client dossiers.
              </p>
              <div className="mt-6 flex justify-center">
                <Link href="/ca/dashboard">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-5 py-2.5 rounded-xl font-medium">
                    Switch to Authorized Portal
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* 7. Session Expired */}
          {activeState === "session-expired" && (
            <div className="bg-[#111111] border border-yellow-500/20 rounded-2xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl">
              <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto mb-5 text-yellow-400">
                <Clock className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                Session Inactive
              </span>
              <h2 className="text-2xl font-bold text-white mt-4">Session Timed Out</h2>
              <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                For compliance with ICAI and RBI security standards, your session was locked after 15 minutes of inactivity.
              </p>
              <div className="mt-6 flex justify-center">
                <Link href="/login">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-6 py-2.5 rounded-xl font-medium">
                    Re-authenticate Securely
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* 8. Maintenance Mode */}
          {activeState === "maintenance" && (
            <div className="bg-[#111111] border border-blue-500/20 rounded-2xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-5 text-blue-400">
                <Wrench className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-blue-500/10 border border-blue-500/20 text-blue-400">
                Scheduled Maintenance
              </span>
              <h2 className="text-2xl font-bold text-white mt-4">Upgrading Tax Engine</h2>
              <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                We are applying Budget 2026 tax slab updates and CBDT schema patches. We expect to be back online at 04:00 AM IST.
              </p>
              <div className="mt-6 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 max-w-xs mx-auto">
                All client filings already queued will auto-submit once CBDT APIs reopen.
              </div>
            </div>
          )}

          {/* 9. Upload Error */}
          {activeState === "upload-error" && (
            <div className="bg-[#111111] border border-rose-500/20 rounded-2xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-5 text-rose-400">
                <UploadCloud className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-rose-500/10 border border-rose-500/20 text-rose-400">
                File Processing Failed
              </span>
              <h2 className="text-2xl font-bold text-white mt-4">Document Upload Rejected</h2>
              <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                &ldquo;Form16_PartB_Corrupted.pdf&rdquo; could not be parsed by the OCR pipeline due to password encryption or unsupported format.
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <Button 
                  onClick={() => simulateAction("Retrying OCR ingestion with bypass...")}
                  disabled={isRetrying}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-5 py-2.5 rounded-xl font-medium"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? "animate-spin" : ""}`} />
                  Re-upload Without Password
                </Button>
                <Link href="/client/documents">
                  <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 text-xs px-5 py-2.5 rounded-xl">
                    Back to Vault
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* 10. Payment Error */}
          {activeState === "payment-error" && (
            <div className="bg-[#111111] border border-rose-500/20 rounded-2xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-5 text-rose-400">
                <CreditCard className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-rose-500/10 border border-rose-500/20 text-rose-400">
                Payment Declined
              </span>
              <h2 className="text-2xl font-bold text-white mt-4">Transaction Could Not Complete</h2>
              <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                Your bank declined the UPI / Card payment of ₹4,999. No money was deducted from your account.
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <Link href="/client/payments">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-5 py-2.5 rounded-xl font-medium">
                    Try Alternate Payment Method
                  </Button>
                </Link>
                <Link href="/support">
                  <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 text-xs px-5 py-2.5 rounded-xl">
                    Contact Billing Desk
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* 11. Verification Failed */}
          {activeState === "verification-failed" && (
            <div className="bg-[#111111] border border-amber-500/20 rounded-2xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-5 text-amber-400">
                <UserX className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400">
                KYC Verification Failed
              </span>
              <h2 className="text-2xl font-bold text-white mt-4">PAN-Aadhaar Name Mismatch</h2>
              <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                The name printed on your PAN card does not match the demographic details retrieved from UIDAI Aadhaar e-KYC.
              </p>
              <div className="mt-6 flex justify-center">
                <Link href="/client/profile">
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-6 py-2.5 rounded-xl font-medium">
                    Correct Profile Information
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* 12. Account Suspended */}
          {activeState === "account-suspended" && (
            <div className="bg-[#111111] border border-red-500/30 rounded-2xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-5 text-red-500">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-red-500/10 border border-red-500/30 text-red-400">
                Policy Enforcement
              </span>
              <h2 className="text-2xl font-bold text-white mt-4">Account Suspended</h2>
              <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                This account has been temporarily frozen pending verification of professional membership credentials with ICAI.
              </p>
              <div className="mt-6 flex justify-center">
                <Link href="/support">
                  <Button className="bg-red-600 hover:bg-red-700 text-white text-xs px-6 py-2.5 rounded-xl font-medium">
                    Submit Appeal to Compliance Officer
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* 13. Success Confirmation */}
          {activeState === "success-confirmation" && (
            <div className="bg-[#111111] border border-emerald-500/30 rounded-2xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                Action Completed
              </span>
              <h2 className="text-2xl font-bold text-white mt-4">ITR Filing Submitted!</h2>
              <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                Acknowledgment number <span className="font-mono text-emerald-400 font-bold">ACK-2026-ITR1-99214</span> generated. E-verification token sent to your registered mobile.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                <Link href="/client/tax-returns">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-5 py-2.5 rounded-xl font-medium">
                    View ITR Status
                  </Button>
                </Link>
                <Link href="/client/dashboard">
                  <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 text-xs px-5 py-2.5 rounded-xl">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* 14. Delete Confirmation */}
          {activeState === "delete-confirmation" && (
            <div className="bg-[#111111] border border-rose-500/20 rounded-2xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-5 text-rose-400">
                <Trash2 className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-rose-500/10 border border-rose-500/20 text-rose-400">
                Permanent Destruction
              </span>
              <h2 className="text-2xl font-bold text-white mt-4">
                {itemDeleted ? "Document Deleted Forever" : "Delete Client Tax Vault?"}
              </h2>
              <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                {itemDeleted
                  ? "The client folder, all Form 16s, and computation sheets have been expunged from cold storage."
                  : "This action cannot be undone. All 18 uploaded documents, computed tax drafts, and audit trails will be wiped immediately."}
              </p>

              {!itemDeleted ? (
                <div className="flex items-center justify-center gap-3 mt-6">
                  <Button 
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-5 py-2.5 rounded-xl font-medium"
                  >
                    Confirm Permanent Deletion
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveState("empty")}
                    className="border-white/10 text-gray-300 hover:bg-white/5 text-xs px-5 py-2.5 rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="mt-6 flex justify-center">
                  <Button 
                    onClick={() => setItemDeleted(false)}
                    variant="outline"
                    className="border-white/10 text-gray-300 hover:bg-white/5 text-xs px-5 py-2.5 rounded-xl"
                  >
                    Reset Demo State
                  </Button>
                </div>
              )}

              {/* Interactive Modal */}
              {showDeleteModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-[#181818] border border-rose-500/40 rounded-2xl p-6 max-w-md w-full text-left space-y-4 shadow-2xl">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                      <AlertTriangle className="w-5 h-5" /> Are you absolutely sure?
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Please type <strong className="text-white font-mono">DELETE-PERMANENTLY</strong> to confirm this irreversible destruction.
                    </p>
                    <input 
                      type="text" 
                      placeholder="DELETE-PERMANENTLY"
                      className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                    />
                    <div className="flex justify-end gap-2 pt-2">
                      <Button 
                        variant="ghost" 
                        onClick={() => setShowDeleteModal(false)}
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        Abort
                      </Button>
                      <Button 
                        onClick={() => {
                          setShowDeleteModal(false);
                          setItemDeleted(true);
                        }}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-4 rounded-xl"
                      >
                        Yes, Erase Everything
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="border-t border-white/10 bg-[#0E0E0E] px-6 py-4 text-center text-xs text-gray-500">
        TaxMate System Status Engine • Built for Indian CAs & Taxpayers • 14 Critical System States
      </footer>
    </div>
  );
}
