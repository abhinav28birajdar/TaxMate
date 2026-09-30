"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Users, 
  CheckSquare, 
  FileText, 
  Clock, 
  IndianRupee, 
  TrendingUp, 
  ArrowUpRight, 
  AlertCircle, 
  Plus, 
  Video, 
  MessageSquare, 
  ChevronRight, 
  Calendar,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  Layers,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function UnifiedCADashboard() {
  const stats = [
    { title: "Total Clients", value: "380", change: "+14 this month", icon: Users, link: "/ca/clients" },
    { title: "Pending Tasks", value: "24", change: "6 due this week", icon: CheckSquare, link: "/ca/tasks" },
    { title: "Pending Documents", value: "18", change: "From 9 clients", icon: FileText, link: "/ca/documents" },
    { title: "FY 26-27 Revenue", value: "₹28,50,000", change: "+18.4% YoY", icon: IndianRupee, link: "/ca/payments" },
  ];

  const upcomingDeadlines = [
    { title: "GSTR-3B Monthly Filing (September)", date: "20 Oct 2026", daysLeft: "4 days left", count: "42 clients pending", priority: "urgent" },
    { title: "TDS Return Filing (Form 26Q Q2)", date: "31 Oct 2026", daysLeft: "15 days left", count: "19 clients pending", priority: "normal" },
    { title: "Advance Tax Quarter 3 Installment", date: "15 Dec 2026", daysLeft: "60 days left", count: "All assessees", priority: "normal" },
  ];

  const filingStatusDistribution = [
    { status: "Completed & E-Verified", count: 284, pct: 75, color: "bg-emerald-500" },
    { status: "Draft Ready / Approval", count: 46, pct: 12, color: "bg-blue-500" },
    { status: "Income Verification / Review", count: 32, pct: 8, color: "bg-amber-500" },
    { status: "Document Collection Pending", count: 18, pct: 5, color: "bg-rose-500" },
  ];

  const recentActivity = [
    { client: "TechNova Solutions Pvt Ltd", action: "Uploaded Q2 Bank Statement (HDFC Bank)", time: "12 mins ago", link: "/ca/documents" },
    { client: "Ananya Deshmukh", action: "Approved ITR-1 draft computation via OTP", time: "34 mins ago", link: "/ca/income-tax" },
    { client: "Dr. Vikramaditya Rao", action: "Settled Retainer Fee ₹15,000 via Razorpay UPI", time: "2 hours ago", link: "/ca/payments" },
    { client: "Apex Logistics India LLP", action: "Requested 45-min consultation for GST Notice 148A", time: "4 hours ago", link: "/ca/calls" },
    { client: "Sharma & Sons Traders", action: "Auto-synced Form 26AS AIS tax ledger", time: "Yesterday", link: "/ca/income-tax" },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Chartered Accountant Practice Operating System
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Practice Overview & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Sharma & Associates Chartered Accountants • ICAI Firm Reg. #019284N
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/ca/income-tax">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)]">
              <Plus className="w-4 h-4 mr-1.5" /> Start ITR Filing
            </Button>
          </Link>
          <Link href="/ca/clients">
            <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl">
              <Users className="w-3.5 h-3.5 mr-1.5" /> Add Client
            </Button>
          </Link>
          <Link href="/ca/calls">
            <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl">
              <Video className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Start Consultation
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Link key={idx} href={s.link} className="block group">
              <div className="bg-[#111111] hover:bg-[#161616] border border-white/10 hover:border-emerald-500/30 rounded-2xl p-5 shadow-2xl transition-all">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium">{s.title}</span>
                  <div className="w-8 h-8 rounded-xl bg-white/5 group-hover:bg-emerald-500/10 flex items-center justify-center transition-colors">
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">{s.value}</div>
                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2">
                  <span className="text-emerald-400 font-medium">{s.change}</span>
                  <ArrowRight className="w-3 h-3 text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Deadlines & Filing Status Distribution */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Upcoming Statutory Deadlines */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-semibold text-white">Upcoming CBDT & GSTN Deadlines</h3>
              </div>
              <Link href="/ca/calendar" className="text-xs text-emerald-400 hover:underline">
                View Calendar →
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingDeadlines.map((dl, i) => (
                <div 
                  key={i} 
                  className="p-4 rounded-xl bg-[#161616] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-500/30 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{dl.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        dl.priority === "urgent" 
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {dl.daysLeft}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">Due date: {dl.date} • <strong className="text-gray-300">{dl.count}</strong></p>
                  </div>

                  <Link href="/ca/tasks">
                    <Button size="sm" variant="outline" className="border-white/10 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-xl">
                      Review Work
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Filing Status Breakdown */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-semibold text-white">AY 2026-27 Return Filing Pipeline</h3>
              </div>
              <span className="text-xs text-gray-400">380 Total Clients</span>
            </div>

            {/* Visual Progress Multi-Bar */}
            <div className="h-3 w-full rounded-full bg-[#1F1F1F] flex overflow-hidden">
              {filingStatusDistribution.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`${item.color} h-full`} 
                  style={{ width: `${item.pct}%` }} 
                  title={`${item.status}: ${item.count} (${item.pct}%)`}
                />
              ))}
            </div>

            {/* Legend Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              {filingStatusDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#161616] border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-gray-300">{item.status}</span>
                  </div>
                  <span className="font-bold text-white font-mono">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Recent Activity Stream & Quick Links */}
        <div className="space-y-6">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-semibold text-white">Recent Activity Stream</h3>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            <div className="space-y-4">
              {recentActivity.map((act, idx) => (
                <Link key={idx} href={act.link} className="block group">
                  <div className="space-y-1 text-xs pb-3 border-b border-white/5 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {act.client}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">{act.time}</span>
                    </div>
                    <p className="text-gray-400 text-[11px] leading-relaxed">{act.action}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Hub Navigation */}
          <div className="bg-gradient-to-br from-emerald-950/40 via-[#111111] to-[#111111] border border-emerald-500/20 rounded-2xl p-6 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Compliance Gateway Status
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              CBDT Income Tax 2.0 API and GSTN Invoice Registration Portals (IRP) are operating with 99.98% uptime.
            </p>
            <div className="pt-2">
              <Link href="/modules">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl shadow-[0_0_15px_rgba(5,150,105,0.3)]">
                  Explore All 20 Platform Modules <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
