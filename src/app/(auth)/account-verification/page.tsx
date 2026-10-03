"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  ArrowRight, 
  RefreshCw, 
  Building2, 
  CreditCard,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AccountVerificationPage() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stages, setStages] = useState([
    { id: 1, title: "Email Address Verification", status: "completed", date: "Verified on signup", icon: CheckCircle2 },
    { id: 2, title: "Mobile OTP Authentication", status: "completed", date: "Verified via SMS OTP", icon: CheckCircle2 },
    { id: 3, title: "PAN & NSDL Registry Validation", status: "completed", date: "Instant e-KYC Verified", icon: CheckCircle2 },
    { id: 4, title: "Aadhaar e-KYC & Biometric Match", status: "completed", date: "UIDAI Vault Tokenized", icon: CheckCircle2 },
    { id: 5, title: "Bank Account Penny-Drop Verification", status: "in_progress", date: "Validating IFSC & Account Name", icon: Clock },
    { id: 6, title: "CA Firm Compliance Review", status: "pending", date: "Assigned to Audit Partner", icon: ShieldCheck },
  ]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setStages(prev => prev.map(s => s.id === 5 ? { ...s, status: "completed", date: "Penny-Drop Match 100%" } : s));
      toast.success("Verification check updated: Bank verification completed!");
    }, 1200);
  };

  return (
    <div className="space-y-6 w-full max-w-xl mx-auto py-6">
      <div className="space-y-2 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" /> Identity & Compliance Gateway
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Account Verification
        </h1>
        <p className="text-sm text-slate-400">
          In compliance with Income Tax Department (CBDT) and PMLA norms, verify your credentials to unlock full e-filing privileges.
        </p>
      </div>

      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              83%
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Verification Level 3</p>
              <p className="text-[11px] text-emerald-400 font-medium">Standard E-Filing Enabled</p>
            </div>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            variant="outline" 
            size="sm"
            className="border-white/10 text-xs rounded-xl hover:bg-white/5 text-gray-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} /> Check Status
          </Button>
        </div>

        <div className="space-y-3">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isDone = stage.status === "completed";
            const isInProgress = stage.status === "in_progress";
            return (
              <div 
                key={stage.id} 
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  isDone 
                    ? "bg-[#161616] border-white/5" 
                    : isInProgress 
                    ? "bg-amber-500/5 border-amber-500/30 ring-1 ring-amber-500/20" 
                    : "bg-[#111111] border-white/5 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isDone 
                      ? "bg-emerald-500/20 text-emerald-400" 
                      : isInProgress 
                      ? "bg-amber-500/20 text-amber-400 animate-pulse" 
                      : "bg-white/5 text-gray-500"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{stage.title}</h4>
                    <p className="text-[11px] text-gray-400">{stage.date}</p>
                  </div>
                </div>

                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isDone 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : isInProgress 
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                    : "bg-white/5 text-gray-500 border-white/5"
                }`}>
                  {isDone ? "Verified" : isInProgress ? "Checking" : "Pending"}
                </span>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link href="/client/dashboard" className="flex-1">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)]">
              Continue to Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
          <Link href="/onboarding/client">
            <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 text-xs py-2.5 rounded-xl">
              Edit KYC Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
