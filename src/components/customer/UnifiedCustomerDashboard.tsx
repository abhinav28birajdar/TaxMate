"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Receipt,
  ArrowRight,
  Video,
  MessageSquare,
  CreditCard,
  CheckCircle2,
  Calendar,
  Sparkles,
  UploadCloud,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/UnifiedAuthContext";
import { createClient } from "@/utils/supabase/client";
import { useMultipleRealtimeSubscriptions } from "@/hooks/use-realtime";
import { formatDistanceToNow } from "date-fns";

interface TaxSummaryData {
  grossIncome: number;
  deductions: number;
  taxLiability: number;
  tdsPaid: number;
  estimatedRefund: number;
  filingStatus: string;
  formCode: string;
  ay: string;
}

export function UnifiedCustomerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const [assignedCaName, setAssignedCaName] = useState<string | null>(null);
  const [taxSummary, setTaxSummary] = useState<TaxSummaryData>({
    grossIncome: 0,
    deductions: 0,
    taxLiability: 0,
    tdsPaid: 0,
    estimatedRefund: 0,
    filingStatus: "Not Started",
    formCode: "ITR-1 / ITR-2",
    ay: "AY 2026-27",
  });
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    async function loadDashboard() {
      try {
        setLoading(true);
        const userId = user!.id;

        // 1. Check client profile & assigned CA
        const { data: clientRow } = await supabase
          .from("clients")
          .select("id, assigned_ca_id")
          .eq("portal_user_id", userId)
          .maybeSingle();

        const clientRecordId = clientRow?.id || userId;

        if (clientRow?.assigned_ca_id) {
          const { data: caProf } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", clientRow.assigned_ca_id)
            .maybeSingle();
          if (!cancelled && caProf) {
            setAssignedCaName(caProf.full_name || caProf.email);
          }
        }

        // 2. Fetch parallel dashboard datasets
        const [
          { data: taxForms },
          { data: taxFilings },
          { data: tasksData },
          { data: deadlinesData },
          { data: paymentsData },
          { data: convData },
        ] = await Promise.all([
          supabase
            .from("client_tax_forms")
            .select("*")
            .eq("client_id", userId)
            .order("updated_at", { ascending: false })
            .limit(1),
          supabase
            .from("tax_filings")
            .select("*")
            .or(`client_id.eq.${userId},client_id.eq.${clientRecordId}`)
            .order("updated_at", { ascending: false })
            .limit(1),
          supabase
            .from("tasks")
            .select("*")
            .or(`client_id.eq.${userId},client_id.eq.${clientRecordId}`)
            .not("status", "in", '("DONE","CANCELLED","completed","cancelled")')
            .order("due_date", { ascending: true })
            .limit(5),
          supabase
            .from("compliance_calendar")
            .select("*")
            .gte("due_date", new Date().toISOString().split("T")[0])
            .order("due_date", { ascending: true })
            .limit(3),
          supabase
            .from("payments")
            .select("*")
            .or(`client_id.eq.${userId},client_id.eq.${clientRecordId}`)
            .order("created_at", { ascending: false })
            .limit(3),
          supabase
            .from("conversations")
            .select("id, subject, last_message_at, messages(id, content, created_at, sender_id)")
            .or(`client_id.eq.${userId},participant_ids.cs.{${userId}}`)
            .order("last_message_at", { ascending: false })
            .limit(3),
        ]);

        if (cancelled) return;

        // Parse latest tax form / filing
        const activeForm = taxForms?.[0];
        const activeFiling = taxFilings?.[0];
        if (activeForm?.form_data) {
          const fd = activeForm.form_data as Record<string, any>;
          const grossIncome = Number(fd.grossIncome || fd.salary || 0) + Number(fd.otherIncome || 0);
          const deductions = Number(fd.deductions80C || 0) + Number(fd.deductions80D || 0) + Number(fd.nps80CCD || 0);
          const tdsPaid = Number(fd.tdsPaid || 0);
          const taxLiability = Number(fd.taxLiability || 0);
          const estimatedRefund = Math.max(0, tdsPaid - taxLiability);

          setTaxSummary({
            grossIncome,
            deductions,
            taxLiability,
            tdsPaid,
            estimatedRefund,
            filingStatus: activeForm.status || activeFiling?.status || "Draft",
            formCode: activeForm.form_code || "ITR-1",
            ay: activeForm.financial_year || "AY 2026-27",
          });
        } else if (activeFiling) {
          setTaxSummary((prev) => ({
            ...prev,
            filingStatus: activeFiling.status || "In Progress",
            formCode: activeFiling.filing_type || "ITR-1",
            ay: activeFiling.financial_year || "AY 2026-27",
          }));
        }

        setPendingTasks(tasksData || []);
        setUpcomingDeadlines(deadlinesData || []);
        setRecentPayments(paymentsData || []);

        const msgs: any[] = [];
        (convData || []).forEach((c: any) => {
          const latestMsg = Array.isArray(c.messages) && c.messages.length > 0
            ? c.messages[c.messages.length - 1]
            : null;
          if (latestMsg) {
            msgs.push({
              sender: c.subject || "CA Consultation Thread",
              text: latestMsg.content,
              time: latestMsg.created_at
                ? formatDistanceToNow(new Date(latestMsg.created_at), { addSuffix: true })
                : "",
              link: "/client/chat",
            });
          }
        });
        setRecentMessages(msgs);
      } catch (err) {
        console.error("Failed to load customer dashboard:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [user, refreshTick]);

  useMultipleRealtimeSubscriptions(
    [
      { table: "tasks", onInsert: () => setRefreshTick((t) => t + 1), onUpdate: () => setRefreshTick((t) => t + 1) },
      { table: "payments", onInsert: () => setRefreshTick((t) => t + 1), onUpdate: () => setRefreshTick((t) => t + 1) },
      { table: "messages", onInsert: () => setRefreshTick((t) => t + 1) },
      { table: "tax_filings", onInsert: () => setRefreshTick((t) => t + 1), onUpdate: () => setRefreshTick((t) => t + 1) },
    ],
    Boolean(user?.id)
  );

  const formatINR = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  const quickActions = [
    { title: "Upload Form 16 / Docs", desc: "Drag & drop salary or bank PDFs", href: "/client/documents", icon: UploadCloud },
    { title: "Review Tax Computation", desc: "Old vs New Sec 115BAC comparison", href: "/client/tax-returns", icon: FileSpreadsheet },
    { title: "Consult Assigned CA", desc: "Join 1-on-1 video room with screen share", href: "/client/calls", icon: Video },
    { title: "Pay Retainer / Invoices", desc: "Settle CA fee via Instant UPI", href: "/client/payments", icon: CreditCard },
  ];

  const getFilingStep = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("filed") || s.includes("ack") || s.includes("completed") || s.includes("submitted")) return 4;
    if (s.includes("approval") || s.includes("ready") || s.includes("otp")) return 3;
    if (s.includes("review") || s.includes("progress")) return 2;
    if (s.includes("draft") || s.includes("doc")) return 1;
    return 0;
  };

  const currentStep = getFilingStep(taxSummary.filingStatus);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-xs font-medium">Loading your live tax command center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> {taxSummary.ay} Active Dossier
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Customer Tax Command Center
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Welcome back, {user?.name || "Taxpayer"}.{" "}
            {taxSummary.estimatedRefund > 0
              ? `Your estimated refund is ${formatINR(taxSummary.estimatedRefund)}.`
              : `Filing status: ${taxSummary.filingStatus}.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/client/tax-returns">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)]">
              <FileSpreadsheet className="w-4 h-4 mr-1.5" /> View ITR Computation
            </Button>
          </Link>
          <Link href="/client/calls">
            <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl">
              <Video className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Call Assigned CA
            </Button>
          </Link>
        </div>
      </div>

      {/* Tax Liability & Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-2xl">
          <span className="text-xs text-gray-400 font-medium">Gross Total Income</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-mono">
            {formatINR(taxSummary.grossIncome)}
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Declared across salary & capital gains</p>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-2xl">
          <span className="text-xs text-gray-400 font-medium">Net Tax Liability</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-mono">
            {formatINR(taxSummary.taxLiability)}
          </div>
          <p className="text-[11px] text-emerald-400 mt-2">Sec 115BAC & Old Regime Computed</p>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-2xl">
          <span className="text-xs text-gray-400 font-medium">TDS Credits</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-mono">
            {formatINR(taxSummary.tdsPaid)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified against Form 16 / 26AS
          </div>
        </div>

        <div className="bg-[#111111] border border-emerald-500/30 rounded-2xl p-5 shadow-2xl bg-gradient-to-br from-emerald-950/30 via-[#111111] to-[#111111]">
          <span className="text-xs text-emerald-400 font-semibold">Estimated Refund</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1 font-mono">
            {formatINR(taxSummary.estimatedRefund)}
          </div>
          <p className="text-[11px] text-gray-300 mt-2">
            {taxSummary.estimatedRefund > 0 ? "Eligible for direct bank credit" : "Start ITR computation to calculate"}
          </p>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((qa, idx) => {
          const Icon = qa.icon;
          return (
            <Link key={idx} href={qa.href} className="block group">
              <div className="p-5 rounded-2xl bg-[#111111] border border-white/10 hover:border-emerald-500/40 transition-all shadow-2xl flex flex-col justify-between h-full">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                    {qa.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{qa.desc}</p>
                </div>
                <div className="pt-3 text-[11px] text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Proceed <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Filing Status & Pending Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Return Status Banner */}
          <div className="p-6 rounded-3xl bg-[#111111] border border-white/10 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider font-mono">Filing Status Pipeline</span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {taxSummary.ay} ({taxSummary.formCode})
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 self-start sm:self-auto capitalize">
                {taxSummary.filingStatus.replace(/_/g, " ")}
              </span>
            </div>

            {/* Stage Stepper */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-1">
              {[
                { step: 1, label: "1. Docs Ingested" },
                { step: 2, label: "2. CA Reviewed" },
                { step: 3, label: "3. OTP Sign-off" },
                { step: 4, label: "4. ITD E-filed" },
              ].map((st) => (
                <div
                  key={st.step}
                  className={`p-2.5 rounded-xl font-bold ${
                    currentStep >= st.step
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                      : currentStep === st.step - 1
                      ? "bg-amber-500/20 border border-amber-500/40 text-amber-400 ring-1 ring-amber-500/30"
                      : "bg-[#181818] border border-white/5 text-gray-500"
                  }`}
                >
                  {currentStep >= st.step ? `✓ ${st.label}` : st.label}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <p className="text-xs text-gray-400">
                {assignedCaName ? (
                  <>
                    Assigned CA: <strong className="text-white">{assignedCaName}</strong>
                  </>
                ) : (
                  <>
                    No CA assigned yet.{" "}
                    <Link href="/client/find-ca" className="text-emerald-400 hover:underline">
                      Find & hire a verified CA
                    </Link>
                  </>
                )}
              </p>
              <Link href="/client/tax-returns">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl shadow-[0_0_15px_rgba(5,150,105,0.3)]">
                  Manage Tax Returns
                </Button>
              </Link>
            </div>
          </div>

          {/* Pending Tasks & Documents */}
          <div className="p-6 rounded-3xl bg-[#111111] border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Pending Action Items ({pendingTasks.length})</h3>
              <Link href="/client/tasks" className="text-xs text-emerald-400 hover:underline">
                View All Tasks
              </Link>
            </div>
            {pendingTasks.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-[#161616] border border-white/5 space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="text-xs text-gray-300 font-semibold">You are all caught up!</p>
                <p className="text-[11px] text-gray-500">No pending compliance tasks assigned right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl bg-[#161616] border border-white/5 flex items-center justify-between gap-3 hover:border-emerald-500/30 transition-all"
                  >
                    <div className="space-y-0.5">
                      <h4 className="font-semibold text-xs sm:text-sm text-white">{t.title}</h4>
                      <p className="text-[11px] text-gray-400">
                        {t.due_date ? `Due: ${new Date(t.due_date).toLocaleDateString("en-IN")}` : "Active action item"}
                      </p>
                    </div>
                    <Link href="/client/tasks">
                      <Button size="sm" variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl">
                        View Action
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Deadlines, Messages & Payments */}
        <div className="space-y-6">
          {/* Statutory Deadlines */}
          <div className="p-6 rounded-3xl bg-[#111111] border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" /> Upcoming Deadlines
              </h3>
              <Link href="/client/calendar" className="text-xs text-emerald-400 hover:underline">
                Calendar
              </Link>
            </div>
            <div className="space-y-3 text-xs">
              {upcomingDeadlines.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-[#161616] border border-white/5 text-gray-400">
                  No upcoming statutory deadlines recorded. Check the full Tax Calendar for annual schedules.
                </div>
              ) : (
                upcomingDeadlines.map((dl) => (
                  <div key={dl.id} className="p-3.5 rounded-xl bg-[#161616] border border-white/5 space-y-1">
                    <div className="flex justify-between font-mono">
                      <span className="text-emerald-400 font-bold">
                        {new Date(dl.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span className="text-gray-400 capitalize">{dl.category || dl.filing_type}</span>
                    </div>
                    <p className="text-gray-200 font-semibold">{dl.title}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent CA Messages */}
          <div className="p-6 rounded-3xl bg-[#111111] border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" /> Messages
              </h3>
              <Link href="/client/chat" className="text-xs text-emerald-400 hover:underline">
                Open Chat
              </Link>
            </div>
            <div className="space-y-3 text-xs">
              {recentMessages.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-[#161616] border border-white/5 text-gray-400">
                  No recent conversations yet.{" "}
                  <Link href="/client/chat" className="text-emerald-400 hover:underline">
                    Start a message thread
                  </Link>
                </div>
              ) : (
                recentMessages.map((m, idx) => (
                  <Link key={idx} href={m.link} className="block group">
                    <div className="p-3.5 rounded-xl bg-[#161616] border border-white/5 space-y-1 group-hover:border-emerald-500/30 transition-all">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{m.sender}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{m.time}</span>
                      </div>
                      <p className="text-gray-400 line-clamp-2 leading-relaxed">{m.text}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Payment Receipts */}
          <div className="p-6 rounded-3xl bg-[#111111] border border-white/10 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" /> Recent Payments
              </h3>
              <Link href="/client/payments" className="text-xs text-emerald-400 hover:underline">
                View Billing
              </Link>
            </div>
            {recentPayments.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-[#161616] border border-white/5 text-xs text-gray-400">
                No transactions recorded yet.
              </div>
            ) : (
              recentPayments.map((p) => (
                <div key={p.id} className="p-3.5 rounded-xl bg-[#161616] border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono font-bold text-emerald-400">
                      {p.gateway_payment_id || p.id.slice(0, 12)}
                    </div>
                    <div className="text-gray-400 text-[11px]">{p.notes || p.payment_method || "Tax Consultation Fee"}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-white">{formatINR(Number(p.amount || 0))}</div>
                    <span className="text-[10px] text-emerald-400 font-bold">{p.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
