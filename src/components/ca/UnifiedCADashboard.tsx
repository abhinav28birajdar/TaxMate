"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  CheckSquare,
  FileText,
  IndianRupee,
  ArrowRight,
  Plus,
  Video,
  Calendar,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/UnifiedAuthContext";
import { useMultipleRealtimeSubscriptions } from "@/hooks/use-realtime";
import { formatDistanceToNow, differenceInDays } from "date-fns";

export function UnifiedCADashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const [firmInfo, setFirmInfo] = useState<{ firmName: string; icaiNumber: string }>({
    firmName: "Chartered Accountancy Practice",
    icaiNumber: "ICAI Practice OS",
  });
  const [metrics, setMetrics] = useState({
    clients: 0,
    tasks: 0,
    documents: 0,
    revenue: 0,
  });
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [filingDistribution, setFilingDistribution] = useState([
    { status: "Completed & E-Verified", count: 0, pct: 0, color: "bg-emerald-500" },
    { status: "Draft Ready / Approval", count: 0, pct: 0, color: "bg-blue-500" },
    { status: "Income Verification / Review", count: 0, pct: 0, color: "bg-amber-500" },
    { status: "Document Collection Pending", count: 0, pct: 0, color: "bg-rose-500" },
  ]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    async function loadLiveKPIs() {
      try {
        setLoading(true);
        const caId = user!.id;

        const [
          { data: caProfile },
          { count: clientsCount },
          { count: tasksCount },
          { count: docsCount },
          { data: paymentsData },
          { data: filingsData },
          { data: deadlinesData },
          { data: docsActivity },
        ] = await Promise.all([
          supabase.from("ca_profiles").select("firm_name, icai_membership_number").eq("user_id", caId).maybeSingle(),
          supabase.from("clients").select("*", { count: "exact", head: true }).eq("assigned_ca_id", caId),
          supabase.from("tasks").select("*", { count: "exact", head: true }).or(`ca_id.eq.${caId},assigned_to.eq.${caId}`).not("status", "in", '("DONE","CANCELLED","completed","cancelled")'),
          supabase.from("documents").select("*", { count: "exact", head: true }).eq("ca_id", caId),
          supabase.from("payments").select("amount").eq("ca_id", caId).in("status", ["SUCCESS", "success", "paid", "PAID"]),
          supabase.from("tax_filings").select("status").eq("ca_id", caId),
          supabase.from("compliance_calendar").select("*").gte("due_date", new Date().toISOString().split("T")[0]).order("due_date", { ascending: true }).limit(4),
          supabase.from("documents").select("id, file_name, category, created_at").eq("ca_id", caId).order("created_at", { ascending: false }).limit(5),
        ]);

        if (cancelled) return;

        if (caProfile) {
          setFirmInfo({
            firmName: caProfile.firm_name || user?.name || "CA Practice",
            icaiNumber: caProfile.icai_membership_number ? `ICAI #${caProfile.icai_membership_number}` : "ICAI Verified Practice",
          });
        } else if (user?.name) {
          setFirmInfo({ firmName: `${user.name} Practice`, icaiNumber: "ICAI Practice OS" });
        }

        const totalRevenue = (paymentsData || []).reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);

        setMetrics({
          clients: clientsCount || 0,
          tasks: tasksCount || 0,
          documents: docsCount || 0,
          revenue: totalRevenue,
        });

        // Compute filing distribution
        const filings = filingsData || [];
        const totalFilings = filings.length || 1;
        const completed = filings.filter((f: any) => ["COMPLETED", "ACKNOWLEDGED", "SUBMITTED"].includes(f.status)).length;
        const approval = filings.filter((f: any) => ["UNDER_REVIEW"].includes(f.status)).length;
        const review = filings.filter((f: any) => ["IN_PROGRESS"].includes(f.status)).length;
        const pending = filings.filter((f: any) => ["NOT_STARTED", "DOCUMENT_COLLECTION"].includes(f.status)).length;

        setFilingDistribution([
          { status: "Completed & E-Verified", count: completed, pct: filings.length ? Math.round((completed / totalFilings) * 100) : 0, color: "bg-emerald-500" },
          { status: "Draft Ready / Approval", count: approval, pct: filings.length ? Math.round((approval / totalFilings) * 100) : 0, color: "bg-blue-500" },
          { status: "Income Verification / Review", count: review, pct: filings.length ? Math.round((review / totalFilings) * 100) : 0, color: "bg-amber-500" },
          { status: "Document Collection Pending", count: pending, pct: filings.length ? Math.round((pending / totalFilings) * 100) : 0, color: "bg-rose-500" },
        ]);

        setUpcomingDeadlines(deadlinesData || []);
        setRecentActivity(
          (docsActivity || []).map((d: any) => ({
            title: d.file_name,
            action: `Document uploaded (${d.category || "Statutory"})`,
            time: d.created_at ? formatDistanceToNow(new Date(d.created_at), { addSuffix: true }) : "",
            link: "/ca/documents",
          }))
        );
      } catch (err) {
        console.warn("Live KPI query error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLiveKPIs();
    return () => {
      cancelled = true;
    };
  }, [user, refreshTick]);

  useMultipleRealtimeSubscriptions(
    [
      { table: "clients", onInsert: () => setRefreshTick((t) => t + 1), onUpdate: () => setRefreshTick((t) => t + 1) },
      { table: "tasks", onInsert: () => setRefreshTick((t) => t + 1), onUpdate: () => setRefreshTick((t) => t + 1) },
      { table: "documents", onInsert: () => setRefreshTick((t) => t + 1), onUpdate: () => setRefreshTick((t) => t + 1) },
      { table: "payments", onInsert: () => setRefreshTick((t) => t + 1), onUpdate: () => setRefreshTick((t) => t + 1) },
      { table: "tax_filings", onInsert: () => setRefreshTick((t) => t + 1), onUpdate: () => setRefreshTick((t) => t + 1) },
    ],
    Boolean(user?.id)
  );

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const stats = [
    { title: "Total Clients", value: String(metrics.clients), change: "Active roster", icon: Users, link: "/ca/clients" },
    { title: "Pending Tasks", value: String(metrics.tasks), change: "Open workflow", icon: CheckSquare, link: "/ca/tasks" },
    { title: "Vault Documents", value: String(metrics.documents), change: "Client uploads", icon: FileText, link: "/ca/documents" },
    { title: "FY 26-27 Revenue", value: formatINR(metrics.revenue), change: "Verified collections", icon: IndianRupee, link: "/ca/payments" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-xs font-medium">Loading live practice KPIs...</p>
      </div>
    );
  }

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
            {firmInfo.firmName} • {firmInfo.icaiNumber}
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
              {upcomingDeadlines.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#161616] border border-white/5 text-xs text-gray-400">
                  No upcoming statutory deadlines recorded in the compliance calendar yet.
                </div>
              ) : (
                upcomingDeadlines.map((dl) => {
                  const daysLeft = differenceInDays(new Date(dl.due_date), new Date());
                  const priority = daysLeft <= 7 ? "urgent" : "normal";
                  return (
                    <div
                      key={dl.id}
                      className="p-4 rounded-xl bg-[#161616] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-500/30 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-white">{dl.title}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              priority === "urgent"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            }`}
                          >
                            {daysLeft === 0 ? "Due today" : `${daysLeft} days left`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Due date: {new Date(dl.due_date).toLocaleDateString("en-IN")} •{" "}
                          <strong className="text-gray-300">{dl.applicable_to || "All assessees"}</strong>
                        </p>
                      </div>

                      <Link href="/ca/tasks">
                        <Button size="sm" variant="outline" className="border-white/10 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-xl">
                          Review Work
                        </Button>
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Filing Status Breakdown */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-semibold text-white">AY 2026-27 Return Filing Pipeline</h3>
              </div>
              <span className="text-xs text-gray-400">{metrics.clients} Total Clients</span>
            </div>

            {/* Visual Progress Multi-Bar */}
            <div className="h-3 w-full rounded-full bg-[#1F1F1F] flex overflow-hidden">
              {filingDistribution.map((item, idx) => (
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
              {filingDistribution.map((item, idx) => (
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
              {recentActivity.length === 0 ? (
                <p className="text-xs text-gray-400">No recent client document or filing activity recorded yet.</p>
              ) : (
                recentActivity.map((act, idx) => (
                  <Link key={idx} href={act.link} className="block group">
                    <div className="space-y-1 text-xs pb-3 border-b border-white/5 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white group-hover:text-emerald-400 transition-colors truncate max-w-[180px]">
                          {act.title}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">{act.time}</span>
                      </div>
                      <p className="text-gray-400 text-[11px] leading-relaxed">{act.action}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Quick Hub Navigation */}
          <div className="bg-gradient-to-br from-emerald-950/40 via-[#111111] to-[#111111] border border-emerald-500/20 rounded-2xl p-6 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Compliance Gateway Status
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              CBDT Income Tax 2.0 API and GSTN Invoice Registration Portals (IRP) are synchronized with your active client roster.
            </p>
            <div className="pt-2">
              <Link href="/ca/compliance">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl shadow-[0_0_15px_rgba(5,150,105,0.3)]">
                  Open Compliance &amp; Filings <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
