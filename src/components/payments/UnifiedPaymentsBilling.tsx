"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  CreditCard,
  Download,
  CheckCircle2,
  AlertCircle,
  Plus,
  ShieldCheck,
  IndianRupee,
  Receipt,
  RefreshCw,
  X,
  Zap,
  Smartphone,
  Building,
  Check,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/hooks/UnifiedAuthContext";
import { useRealtimeInvoices, useRealtimeSubscription } from "@/hooks/use-realtime";

interface Transaction {
  id: string;
  invoiceId?: string | null;
  ref: string;
  service: string;
  amount: number;
  date: string;
  method: string;
  status: "Completed" | "Processing" | "Refunded" | "Failed";
  invoiceNumber: string;
}

interface UnpaidInvoice {
  id: string;
  invoiceNumber: string;
  description: string;
  amount: number;
  status: string;
  dueDate?: string | null;
}

interface SavedPaymentMethod {
  id: string;
  method_type: "upi" | "card" | "netbanking";
  label: string;
  upi_id?: string | null;
  card_last4?: string | null;
  bank_name?: string | null;
  is_default: boolean;
}

interface UserSubscription {
  id: string;
  plan: string;
  status: string;
  billing_cycle?: string | null;
  next_billing_date?: string | null;
}

function loadRazorpaySdk(): Promise<boolean> {
  if (typeof window !== "undefined" && (window as any).Razorpay) {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function downloadGstInvoiceHtml(tx: Transaction, taxpayerName: string, taxpayerEmail: string) {
  const taxable = (tx.amount / 1.18).toFixed(2);
  const igst = (tx.amount - tx.amount / 1.18).toFixed(2);
  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Tax Invoice ${escapeHtml(tx.invoiceNumber)}</title>
<style>
  body { font-family: system-ui, sans-serif; color: #111; max-width: 720px; margin: 40px auto; padding: 24px; }
  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 24px; }
  .badge { color: #059669; font-weight: 700; text-transform: uppercase; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  th, td { border-bottom: 1px solid #ddd; padding: 10px 8px; text-align: left; font-size: 14px; }
  .right { text-align: right; }
  .total { font-weight: 800; font-size: 16px; }
</style></head>
<body>
  <div class="header">
    <div>
      <div class="badge">TaxMate Financial &amp; CA Services</div>
      <h1>Tax Invoice</h1>
      <p>SAC: 998231 (Accounting &amp; Tax Consulting)</p>
    </div>
    <div class="right">
      <p><strong>Invoice No:</strong> ${escapeHtml(tx.invoiceNumber)}</p>
      <p><strong>Reference:</strong> ${escapeHtml(tx.ref)}</p>
      <p><strong>Date:</strong> ${escapeHtml(tx.date)}</p>
      <p><strong>Status:</strong> ${escapeHtml(tx.status)}</p>
    </div>
  </div>
  <p><strong>Billed To:</strong> ${escapeHtml(taxpayerName)} (${escapeHtml(taxpayerEmail)})</p>
  <p><strong>Payment Method:</strong> ${escapeHtml(tx.method)}</p>
  <table>
    <thead><tr><th>Description</th><th class="right">Amount (INR)</th></tr></thead>
    <tbody>
      <tr><td>${escapeHtml(tx.service)}</td><td class="right">Rs. ${taxable}</td></tr>
      <tr><td>IGST @ 18%</td><td class="right">Rs. ${igst}</td></tr>
      <tr class="total"><td>Total Paid</td><td class="right">Rs. ${tx.amount.toLocaleString("en-IN")}</td></tr>
    </tbody>
  </table>
</body></html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${tx.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, "_")}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function UnifiedPaymentsBilling() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "plans" | "refunds">("overview");
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState<UnpaidInvoice[]>([]);
  const [methods, setMethods] = useState<SavedPaymentMethod[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [profile, setProfile] = useState<{ fullName: string; email: string }>({
    fullName: "",
    email: "",
  });

  // Checkout Modal State
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<
    "select" | "processing" | "success" | "failed"
  >("select");
  const [checkoutError, setCheckoutError] = useState("");
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState({
    name: "ITR-2 Filing & Advisory Package",
    price: 2999,
  });
  const [selectedMethod, setSelectedMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [lastCompletedTx, setLastCompletedTx] = useState<Transaction | null>(null);

  const [selectedInvoice, setSelectedInvoice] = useState<Transaction | null>(null);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [newMethodType, setNewMethodType] = useState<"upi" | "card" | "netbanking">("upi");
  const [newUpiId, setNewUpiId] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [savingMethod, setSavingMethod] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  const loadBillingData = useCallback(async () => {
    try {
      setLoading(true);
      const [payRes, methodsRes, profRes] = await Promise.all([
        fetch("/api/payments?limit=50", { credentials: "include" }),
        fetch("/api/payments/methods", { credentials: "include" }),
        fetch("/api/v1/profile", { credentials: "include" }),
      ]);

      if (payRes.ok) {
        const payJson = await payRes.json();
        const rawInvoices: any[] = payJson.data?.invoices || [];
        const rawPayments: any[] = payJson.data?.payments || [];

        const invoiceMap = new Map(rawInvoices.map((inv) => [inv.id, inv]));

        const mappedPayments: Transaction[] = rawPayments.map((p) => {
          const linkedInv = p.invoiceId ? invoiceMap.get(p.invoiceId) : null;
          const statusUpper = String(p.status || "").toUpperCase();
          const uiStatus: Transaction["status"] =
            statusUpper === "SUCCESS" || statusUpper === "COMPLETED"
              ? "Completed"
              : statusUpper === "REFUNDED"
                ? "Refunded"
                : statusUpper === "FAILED" || statusUpper === "CANCELLED"
                  ? "Failed"
                  : "Processing";

          return {
            id: p.id,
            invoiceId: p.invoiceId || null,
            ref: p.paymentId || p.orderId || p.id.slice(0, 12).toUpperCase(),
            service:
              p.notes ||
              p.metadata?.serviceName ||
              linkedInv?.description ||
              "Tax & Compliance Service",
            amount: Number(p.amount || 0),
            date: new Date(p.paidAt || p.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            method: (p.paymentMethod || p.gateway || "RAZORPAY").toUpperCase(),
            status: uiStatus,
            invoiceNumber:
              linkedInv?.invoiceNumber ||
              p.metadata?.invoiceNumber ||
              `TXN-${String(p.id).slice(0, 8).toUpperCase()}`,
          };
        });

        const openInvList: UnpaidInvoice[] = rawInvoices
          .filter(
            (inv) =>
              !["PAID", "CANCELLED", "REFUNDED"].includes(String(inv.status || "").toUpperCase())
          )
          .map((inv) => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber || `INV-${String(inv.id).slice(0, 8).toUpperCase()}`,
            description: inv.description || "CA Professional Retainer",
            amount: Number(inv.totalAmount ?? inv.amount ?? 0),
            status: inv.status,
            dueDate: inv.dueDate,
          }));

        setTransactions(mappedPayments);
        setUnpaidInvoices(openInvList);
      }

      if (methodsRes.ok) {
        const mJson = await methodsRes.json();
        setMethods(mJson.methods || []);
        setSubscription(mJson.subscriptions?.[0] || null);
      }

      if (profRes.ok) {
        const pJson = await profRes.json();
        if (pJson.data) {
          setProfile({
            fullName: pJson.data.fullName || pJson.data.email || "",
            email: pJson.data.email || "",
          });
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load billing information");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  useRealtimeInvoices(
    user?.id || "",
    () => { void loadBillingData(); },
    () => { void loadBillingData(); },
    () => { void loadBillingData(); }
  );

  useRealtimeSubscription(
    "payments",
    undefined,
    () => { void loadBillingData(); },
    () => { void loadBillingData(); },
    undefined,
    [user?.id],
    Boolean(user?.id)
  );

  const handleStartCheckout = async () => {
    setCheckoutError("");
    setCheckoutStep("processing");

    try {
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
      if (!keyId || keyId.includes("placeholder")) {
        throw new Error(
          "Payment gateway is not configured in this environment (NEXT_PUBLIC_RAZORPAY_KEY_ID missing)."
        );
      }

      const sdkLoaded = await loadRazorpaySdk();
      if (!sdkLoaded || typeof (window as any).Razorpay !== "function") {
        throw new Error("Could not load Razorpay checkout SDK. Check network access.");
      }

      const totalPayableRupees = activeInvoiceId
        ? selectedService.price
        : Number((selectedService.price * 1.18).toFixed(2));

      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...(activeInvoiceId ? { invoiceId: activeInvoiceId } : {}),
          amount: Math.round(totalPayableRupees * 100),
          currency: "INR",
          serviceName: selectedService.name,
          paymentMethod: selectedMethod,
          clientName: profile.fullName,
          clientEmail: profile.email,
        }),
      });

      const orderJson = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderJson.error || "Failed to initialize payment order");
      }

      const rzp = new (window as any).Razorpay({
        key: keyId,
        amount: orderJson.amount,
        currency: orderJson.currency || "INR",
        name: "TaxMate",
        description: selectedService.name,
        order_id: orderJson.orderId,
        prefill: {
          name: profile.fullName,
          email: profile.email,
        },
        theme: { color: "#059669" },
        modal: {
          ondismiss: () => {
            setCheckoutStep("select");
          },
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/payments/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id || orderJson.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                invoiceId: activeInvoiceId || undefined,
              }),
            });

            const verifyJson = await verifyRes.json();
            if (!verifyRes.ok || !verifyJson.success) {
              throw new Error(verifyJson.error || "Signature verification failed");
            }

            const completedTx: Transaction = {
              id: orderJson.paymentId || response.razorpay_payment_id,
              invoiceId: activeInvoiceId,
              ref: response.razorpay_payment_id || orderJson.orderId,
              service: selectedService.name,
              amount: totalPayableRupees,
              date: new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              method: selectedMethod.toUpperCase(),
              status: "Completed",
              invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            };

            setLastCompletedTx(completedTx);
            setCheckoutStep("success");
            toast.success("Payment verified and recorded!");
            await loadBillingData();
          } catch (verifyErr: any) {
            setCheckoutError(verifyErr.message || "Payment verification failed");
            setCheckoutStep("failed");
            toast.error(verifyErr.message || "Payment verification failed");
          }
        },
      });

      rzp.on("payment.failed", (resp: any) => {
        const reason = resp?.error?.description || "Payment declined by bank/UPI app.";
        setCheckoutError(reason);
        setCheckoutStep("failed");
        toast.error(reason);
      });

      rzp.open();
    } catch (err: any) {
      setCheckoutError(err.message || "Payment could not be completed");
      setCheckoutStep("failed");
      toast.error(err.message || "Payment initialization failed");
    }
  };

  const handleSubscribePlan = async (planKey: "basic" | "pro" | "enterprise", label: string) => {
    try {
      setUpgradingPlan(planKey);
      const res = await fetch("/api/payments/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planType: planKey, interval: "annual" }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to update subscription");
      }
      toast.success(`Subscription switched to ${label}.`);
      await loadBillingData();
    } catch (err: any) {
      toast.error(err.message || "Plan update failed");
    } finally {
      setUpgradingPlan(null);
    }
  };

  const handleSavePaymentMethod = async () => {
    if (!newLabel.trim()) {
      toast.error("Please enter a nickname/label for this payment method.");
      return;
    }
    if (newMethodType === "upi" && (!newUpiId.trim() || !newUpiId.includes("@"))) {
      toast.error("Please enter a valid UPI ID (e.g. name@okhdfcbank).");
      return;
    }

    try {
      setSavingMethod(true);
      const res = await fetch("/api/payments/methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          methodType: newMethodType,
          label: newLabel.trim(),
          upiId: newMethodType === "upi" ? newUpiId.trim() : null,
          isDefault: methods.length === 0,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Could not save payment method");
      }
      toast.success("Payment method saved.");
      setShowAddMethod(false);
      setNewUpiId("");
      setNewLabel("");
      await loadBillingData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save payment method");
    } finally {
      setSavingMethod(false);
    }
  };

  const handleDeleteMethod = async (id: string) => {
    try {
      const res = await fetch(`/api/payments/methods?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to delete method");
      }
      toast.success("Payment method removed.");
      await loadBillingData();
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  const totalPaid = transactions
    .filter((t) => t.status === "Completed")
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingDuesTotal = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const activePlanUpper = String(subscription?.plan || "FREE").toUpperCase();
  const refundedTransactions = transactions.filter((t) => t.status === "Refunded");

  const plans = [
    {
      key: "basic" as const,
      dbPlan: "BASIC",
      name: "Individual Taxpayer",
      price: "₹0",
      period: "forever",
      description: "For individual salaried taxpayers with Form 16.",
      features: [
        "ITR-1 Sahaj filing wizard",
        "Encrypted Tax Vault",
        "Compliance Deadline Reminders",
        "CA Discovery Access",
      ],
      current: activePlanUpper === "FREE" || activePlanUpper === "BASIC",
      cta: activePlanUpper === "FREE" || activePlanUpper === "BASIC" ? "Active Plan" : "Switch to Basic",
    },
    {
      key: "pro" as const,
      dbPlan: "PRO",
      name: "Pro Taxpayer & Freelancer",
      price: "₹2,499",
      period: "per year",
      description: "Dedicated CA review, capital gains import & notices help.",
      features: [
        "Everything in Individual",
        "Assigned Certified CA",
        "Capital Gains & Foreign Schedule FSI",
        "Form 26AS & AIS Reconciliation",
        "Real-Time Chat & Video Room",
        "Notice Assessment Support",
      ],
      current: activePlanUpper === "PRO",
      popular: true,
      cta: activePlanUpper === "PRO" ? "Active Plan" : "Activate Pro Plan",
    },
    {
      key: "enterprise" as const,
      dbPlan: "ENTERPRISE",
      name: "Corporate & LLP Suite",
      price: "₹14,999",
      period: "per year",
      description: "Full compliance for businesses, GST returns, and TDS.",
      features: [
        "Business Returns & Audit Support",
        "Monthly GST Return Filings",
        "Quarterly TDS Returns 24Q/26Q",
        "Priority Video Consultations",
        "Dedicated Chartered Accountant Team",
        "Invoice & Compliance Automation",
      ],
      current: activePlanUpper === "ENTERPRISE",
      cta: activePlanUpper === "ENTERPRISE" ? "Active Plan" : "Upgrade to Enterprise",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4" /> Payments &amp; Billing Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Payments, Invoices &amp; Subscriptions
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage CA retainers, tax filing packages, saved payment methods, and GST tax invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowAddMethod(true)}
            variant="outline"
            className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Payment Method
          </Button>
          <Button
            onClick={() => {
              setActiveInvoiceId(null);
              setSelectedService({ name: "ITR-2 Filing & Advisory Package", price: 2999 });
              setCheckoutStep("select");
              setShowCheckout(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)]"
          >
            <IndianRupee className="w-3.5 h-3.5 mr-1" /> Make Payment / Buy Service
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-gray-400 font-medium">Total Settled</span>
          <div className="text-2xl font-bold text-white mt-1">
            ₹{totalPaid.toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified transactions
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-gray-400 font-medium">Current Subscription</span>
          <div className="text-2xl font-bold text-white mt-1">{activePlanUpper}</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-medium">
            <Zap className="w-3.5 h-3.5" /> {subscription?.status || "ACTIVE"}
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-gray-400 font-medium">Saved Payment Methods</span>
          <div className="text-2xl font-bold text-white mt-1">
            {methods.length} Method{methods.length === 1 ? "" : "s"}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2 font-medium truncate">
            <CreditCard className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            {methods[0]?.label || "No saved method yet"}
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-gray-400 font-medium">Pending Dues</span>
          <div
            className={`text-2xl font-bold mt-1 ${
              pendingDuesTotal > 0 ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            ₹{pendingDuesTotal.toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {unpaidInvoices.length} open invoice{unpaidInvoices.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-white/10 gap-6 text-sm font-medium overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "overview"
              ? "text-emerald-400 border-b-2 border-emerald-500 font-semibold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Receipt className="w-4 h-4" /> Overview &amp; Transactions
        </button>
        <button
          onClick={() => setActiveTab("plans")}
          className={`pb-3 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "plans"
              ? "text-emerald-400 border-b-2 border-emerald-500 font-semibold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Zap className="w-4 h-4" /> Subscription Plans
        </button>
        <button
          onClick={() => setActiveTab("refunds")}
          className={`pb-3 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "refunds"
              ? "text-emerald-400 border-b-2 border-emerald-500 font-semibold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <RefreshCw className="w-4 h-4" /> Refund Tracker ({refundedTransactions.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Open Invoices */}
          {unpaidInvoices.length > 0 && (
            <div className="bg-[#111111] rounded-2xl border border-amber-500/20 p-5 space-y-3">
              <h3 className="text-sm font-bold text-amber-400">Open Invoices Due</h3>
              <div className="divide-y divide-white/5">
                {unpaidInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-white">{inv.invoiceNumber}</span>
                      <p className="text-gray-400 mt-0.5">{inv.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white text-sm">
                        ₹{inv.amount.toLocaleString("en-IN")}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => {
                          setActiveInvoiceId(inv.id);
                          setSelectedService({ name: inv.description, price: inv.amount });
                          setCheckoutStep("select");
                          setShowCheckout(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
                      >
                        Pay Invoice
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Payment Methods */}
          {methods.length > 0 && (
            <div className="bg-[#111111] rounded-2xl border border-white/10 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white">Saved Payment Methods</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {methods.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-[#18181b] border border-white/10 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{m.label}</p>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                        {m.upi_id ||
                          (m.card_last4 ? `Card •••• ${m.card_last4}` : m.bank_name || m.method_type)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteMethod(m.id)}
                      className="text-gray-400 hover:text-red-400 p-1"
                      title="Remove payment method"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transaction History */}
          <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161616]">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Payment History &amp; Tax Invoices
                </h3>
                <p className="text-xs text-gray-400">
                  Download GST tax invoice breakdowns (SAC 998231).
                </p>
              </div>
              <div className="text-xs text-gray-400 font-mono">
                Showing {transactions.length} records
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1A1A1A] text-gray-300 font-semibold border-b border-white/10 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Invoice / Ref</th>
                    <th className="py-3.5 px-4">Service Description</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-gray-400">
                        Loading payment history...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500">
                        No completed or pending payment transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-mono font-bold text-emerald-400">
                            {tx.invoiceNumber}
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5">{tx.ref}</div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-white">{tx.service}</td>
                        <td className="py-4 px-4 text-gray-300">{tx.method}</td>
                        <td className="py-4 px-4 text-gray-400">{tx.date}</td>
                        <td className="py-4 px-4 font-mono font-extrabold text-white text-sm">
                          ₹{tx.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              tx.status === "Completed"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : tx.status === "Refunded"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                  : tx.status === "Processing"
                                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                    : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                          <Button
                            onClick={() => setSelectedInvoice(tx)}
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-gray-300 hover:text-white hover:bg-white/5"
                          >
                            View
                          </Button>
                          <Button
                            onClick={() => {
                              downloadGstInvoiceHtml(tx, profile.fullName, profile.email);
                              toast.success(`Downloaded GST Invoice ${tx.invoiceNumber}`);
                            }}
                            size="sm"
                            className="h-8 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                          >
                            <Download className="w-3.5 h-3.5 mr-1" /> Invoice
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Subscription Plans */}
      {activeTab === "plans" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.key}
              className={`rounded-2xl border p-6 flex flex-col justify-between relative transition-all ${
                p.current
                  ? "bg-[#141414] border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30"
                  : "bg-[#111111] border-white/10 hover:border-white/20"
              }`}
            >
              {p.current && (
                <div className="absolute -top-3 right-6 bg-emerald-500 text-black font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  Active Plan
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{p.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{p.description}</p>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-white">{p.price}</span>
                  <span className="text-xs text-gray-400">/{p.period}</span>
                </div>
                <div className="space-y-2.5 pt-4 border-t border-white/10">
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <Button
                  disabled={p.current || upgradingPlan === p.key}
                  onClick={() => handleSubscribePlan(p.key, p.name)}
                  className={`w-full rounded-xl text-xs font-semibold py-2.5 ${
                    p.current
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {upgradingPlan === p.key ? "Updating..." : p.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Refunds */}
      {activeTab === "refunds" && (
        <div className="bg-[#111111] rounded-2xl border border-white/10 p-6 space-y-4">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-lg font-semibold text-white">Refund Status Tracker</h3>
            <p className="text-xs text-gray-400 mt-1">
              Gateway-verified refunded transactions associated with your account.
            </p>
          </div>
          {refundedTransactions.length === 0 ? (
            <p className="text-xs text-gray-500 py-8 text-center">
              No refund requests or reversals have been processed on your account.
            </p>
          ) : (
            <div className="divide-y divide-white/10">
              {refundedTransactions.map((tx) => (
                <div key={tx.id} className="py-4 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">{tx.service}</p>
                    <p className="text-gray-400 mt-0.5">
                      {tx.invoiceNumber} • {tx.ref} • {tx.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-emerald-400">
                      ₹{tx.amount.toLocaleString("en-IN")}
                    </p>
                    <span className="text-[10px] text-amber-400 font-semibold">Refunded</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#141414] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative"
          >
            <button
              onClick={() => setShowCheckout(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {checkoutStep === "select" && (
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Razorpay Secure Gateway
                  </span>
                  <h3 className="text-xl font-bold text-white mt-2">
                    {activeInvoiceId ? "Settle Invoice" : "Checkout & CA Service Booking"}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Authoritative server-verified order creation &amp; GST invoice generation
                  </p>
                </div>

                {!activeInvoiceId && (
                  <div className="space-y-2">
                    <label className="text-xs text-gray-300 font-medium">Select Service</label>
                    <select
                      value={selectedService.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        let price = 2999;
                        if (name.includes("Corporate")) price = 14999;
                        if (name.includes("Notice")) price = 4999;
                        if (name.includes("Consultation")) price = 1499;
                        setSelectedService({ name, price });
                      }}
                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="ITR-2 Filing & Advisory Package">
                        ITR-2 Filing &amp; Advisory Package (₹2,999)
                      </option>
                      <option value="CBDT Notice 148A Advisory">
                        CBDT Notice 148A Advisory (₹4,999)
                      </option>
                      <option value="Hourly CA Video Consultation">
                        Hourly CA Video Consultation (₹1,499)
                      </option>
                      <option value="Corporate Annual Audit Retainer">
                        Corporate Annual Audit Retainer (₹14,999)
                      </option>
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs text-gray-300 font-medium">Preferred Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "upi", label: "Instant UPI", sub: "GPay, PhonePe", icon: Smartphone },
                        { id: "card", label: "Card", sub: "Visa, Mastercard", icon: CreditCard },
                        { id: "netbanking", label: "NetBanking", sub: "All Banks", icon: Building },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMethod(m.id)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          selectedMethod === m.id
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                            : "bg-[#1A1A1A] border-white/10 text-gray-400 hover:text-white"
                        }`}
                      >
                        <m.icon className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                        <span className="text-xs font-semibold block">{m.label}</span>
                        <span className="text-[10px] text-gray-400">{m.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>{activeInvoiceId ? "Invoice Amount" : "Service Fee"}</span>
                    <span>₹{selectedService.price.toLocaleString("en-IN")}</span>
                  </div>
                  {!activeInvoiceId && (
                    <div className="flex justify-between text-gray-400">
                      <span>GST (18% SAC 998231)</span>
                      <span>₹{(selectedService.price * 0.18).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-white text-sm">
                    <span>Total Amount Payable</span>
                    <span className="text-emerald-400">
                      ₹
                      {(activeInvoiceId
                        ? selectedService.price
                        : selectedService.price * 1.18
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleStartCheckout}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3 rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]"
                >
                  Proceed to Razorpay Checkout
                </Button>
              </div>
            )}

            {checkoutStep === "processing" && (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                <h4 className="text-lg font-bold text-white">Initializing Secure Gateway...</h4>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Connecting with Razorpay order API. Complete payment in the checkout window.
                </p>
              </div>
            )}

            {checkoutStep === "success" && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-white">Payment Verified!</h4>
                <p className="text-xs text-gray-300 max-w-sm mx-auto">
                  Payment for <strong className="text-white">{selectedService.name}</strong> has
                  been verified via HMAC signature and saved to your ledger.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <Button
                    onClick={() => setShowCheckout(false)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-5 rounded-xl"
                  >
                    Done
                  </Button>
                  {lastCompletedTx && (
                    <Button
                      onClick={() => {
                        downloadGstInvoiceHtml(
                          lastCompletedTx,
                          profile.fullName,
                          profile.email
                        );
                        setShowCheckout(false);
                      }}
                      variant="outline"
                      className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> Download Invoice
                    </Button>
                  )}
                </div>
              </div>
            )}

            {checkoutStep === "failed" && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-white">Payment Failed</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  {checkoutError || "The payment could not be verified."}
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <Button
                    onClick={() => setCheckoutStep("select")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-5 rounded-xl"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={() => setShowCheckout(false)}
                    variant="outline"
                    className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#141414] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative"
          >
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Receipt className="w-4 h-4" /> Tax Invoice Summary
            </div>

            <div className="border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">{selectedInvoice.invoiceNumber}</h3>
              <p className="text-xs text-gray-400">
                Ref: {selectedInvoice.ref} • {selectedInvoice.date}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Service:</span>
                <span className="text-white font-medium text-right max-w-[200px]">
                  {selectedInvoice.service}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">SAC Code:</span>
                <span className="text-white font-mono">998231 (Legal &amp; Accounting)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Taxable Value:</span>
                <span className="text-white font-mono">
                  ₹{(selectedInvoice.amount / 1.18).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">IGST (18%):</span>
                <span className="text-white font-mono">
                  ₹{(selectedInvoice.amount - selectedInvoice.amount / 1.18).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 font-bold text-sm text-emerald-400">
                <span>Total Amount:</span>
                <span>₹{selectedInvoice.amount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                onClick={() => setSelectedInvoice(null)}
                variant="outline"
                className="text-xs border-white/10 text-gray-300 rounded-xl"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  downloadGstInvoiceHtml(selectedInvoice, profile.fullName, profile.email);
                  toast.success(`Downloaded ${selectedInvoice.invoiceNumber}`);
                  setSelectedInvoice(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> Download Invoice
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      {showAddMethod && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowAddMethod(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" /> Add Payment Method
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-gray-300 font-medium">Method Type</label>
                <select
                  value={newMethodType}
                  onChange={(e) => setNewMethodType(e.target.value as any)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-white mt-1"
                >
                  <option value="upi">UPI ID / VPA</option>
                  <option value="card">Debit / Credit Card</option>
                  <option value="netbanking">NetBanking Account</option>
                </select>
              </div>

              {newMethodType === "upi" && (
                <div>
                  <label className="text-gray-300 font-medium">UPI ID / VPA</label>
                  <input
                    type="text"
                    value={newUpiId}
                    onChange={(e) => setNewUpiId(e.target.value)}
                    placeholder="e.g. yourname@okhdfcbank"
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-white mt-1 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="text-gray-300 font-medium">Account Nickname</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Primary Bank UPI"
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-white mt-1 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setShowAddMethod(false)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                disabled={savingMethod}
                onClick={handleSavePaymentMethod}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
              >
                {savingMethod ? "Saving..." : "Save Method"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
