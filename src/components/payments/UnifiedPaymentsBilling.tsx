"use client";

import React, { useState } from "react";
import { 
  CreditCard, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ArrowUpRight, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  IndianRupee, 
  Receipt, 
  RefreshCw, 
  X, 
  ExternalLink, 
  Zap, 
  FileText,
  Smartphone,
  Building,
  Check,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Transaction {
  id: string;
  ref: string;
  service: string;
  amount: number;
  date: string;
  method: string;
  status: "Completed" | "Processing" | "Refunded" | "Failed";
  invoiceNumber: string;
}

export function UnifiedPaymentsBilling() {
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "plans" | "refunds">("overview");
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"select" | "processing" | "success" | "failed">("select");
  const [selectedService, setSelectedService] = useState({ name: "ITR-2 Filing & Advisory Package", price: 2999 });
  const [selectedMethod, setSelectedMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [selectedInvoice, setSelectedInvoice] = useState<Transaction | null>(null);
  const [showAddMethod, setShowAddMethod] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { 
      id: "tx-1", 
      ref: "PAY-2026-9012", 
      service: "Annual Tax Audit & GSTR Retainer Fee", 
      amount: 150000, 
      date: "18 Oct 2026", 
      method: "Razorpay UPI (business@okhdfcbank)", 
      status: "Completed",
      invoiceNumber: "INV-TM-2026-0042" 
    },
    { 
      id: "tx-2", 
      ref: "PAY-2026-8910", 
      service: "ITR-2 (Capital Gains & Salary) Filing", 
      amount: 4999, 
      date: "20 Jul 2026", 
      method: "HDFC Visa ending 4019", 
      status: "Completed",
      invoiceNumber: "INV-TM-2026-0038" 
    },
    { 
      id: "tx-3", 
      ref: "PAY-2026-8742", 
      service: "Advance Tax Calculation Consultation", 
      amount: 1999, 
      date: "14 Jun 2026", 
      method: "UPI (paytm@upi)", 
      status: "Refunded",
      invoiceNumber: "INV-TM-2026-0029" 
    },
    { 
      id: "tx-4", 
      ref: "PAY-2026-8611", 
      service: "CBDT Notice 148A Representation Retainer", 
      amount: 12000, 
      date: "02 May 2026", 
      method: "ICICI Corporate Netbanking", 
      status: "Completed",
      invoiceNumber: "INV-TM-2026-0015" 
    },
  ]);

  const plans = [
    {
      name: "Individual Taxpayer",
      price: "₹0",
      period: "forever",
      description: "For individual salaried taxpayers with Form 16.",
      features: ["ITR-1 Sahaj filing wizard", "100 MB Secure Tax Vault", "Community Q&A", "Email Reminders"],
      current: false,
      cta: "Current Basic",
    },
    {
      name: "Pro Taxpayer & Freelancer",
      price: "₹2,499",
      period: "per year",
      description: "Dedicated CA review, capital gains import & notices help.",
      features: [
        "Everything in Individual",
        "Assigned Certified CA",
        "Unlimited Capital Gains P&L Import",
        "Form 26AS & AIS Reconciliation",
        "Real-Time Chat & Screen Share",
        "CBDT Notice Assessment Support"
      ],
      current: true,
      popular: true,
      cta: "Active Plan",
    },
    {
      name: "Corporate & LLP Suite",
      price: "₹14,999",
      period: "per year",
      description: "Full compliance for businesses, GST returns, and TDS.",
      features: [
        "ITR-6 & Tax Audit Form 3CD",
        "Monthly GST Return Filings",
        "Quarterly TDS Returns 24Q/26Q",
        "Priority Video Consultations",
        "Dedicated Chartered Accountant Team",
        "API Invoicing & ERP Sync"
      ],
      current: false,
      cta: "Upgrade to Corporate",
    },
  ];

  const handleSimulatePayment = () => {
    setCheckoutStep("processing");
    setTimeout(() => {
      // 90% chance success
      if (Math.random() > 0.1) {
        const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          ref: `PAY-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          service: selectedService.name,
          amount: selectedService.price,
          date: "Just now",
          method: selectedMethod === "upi" ? "Instant UPI (GPay/PhonePe)" : selectedMethod === "card" ? "Credit Card ending 8821" : "Net Banking",
          status: "Completed",
          invoiceNumber: `INV-TM-2026-00${Math.floor(50 + Math.random() * 50)}`,
        };
        setTransactions([newTx, ...transactions]);
        setCheckoutStep("success");
        toast.success("Payment completed successfully!");
      } else {
        setCheckoutStep("failed");
        toast.error("Bank transaction declined.");
      }
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4" /> Module 12: Payments & Billing Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Payments, Invoices & Subscriptions
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your CA retainers, tax filing packages, payment methods, and GST tax invoices.
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
          <span className="text-xs text-gray-400 font-medium">Total Paid (FY 2026-27)</span>
          <div className="text-2xl font-bold text-white mt-1">₹1,66,999</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> All invoices settled
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-gray-400 font-medium">Current Subscription</span>
          <div className="text-2xl font-bold text-white mt-1">Pro Taxpayer</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-medium">
            <Zap className="w-3.5 h-3.5" /> Renews on 20 Jul 2027
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-gray-400 font-medium">Active Payment Methods</span>
          <div className="text-2xl font-bold text-white mt-1">2 Methods</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2 font-medium">
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> UPI & HDFC Card
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-gray-400 font-medium">Pending Dues</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">₹0.00</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Zero outstanding dues
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-white/10 gap-6 text-sm font-medium">
        <button 
          onClick={() => setActiveTab("overview")}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === "overview" 
              ? "text-emerald-400 border-b-2 border-emerald-500 font-semibold" 
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Receipt className="w-4 h-4" /> Overview & Transactions
        </button>
        <button 
          onClick={() => setActiveTab("plans")}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === "plans" 
              ? "text-emerald-400 border-b-2 border-emerald-500 font-semibold" 
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Zap className="w-4 h-4" /> Subscription Plans
        </button>
        <button 
          onClick={() => setActiveTab("refunds")}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === "refunds" 
              ? "text-emerald-400 border-b-2 border-emerald-500 font-semibold" 
              : "text-gray-400 hover:text-white"
          }`}
        >
          <RefreshCw className="w-4 h-4" /> Refund Status Tracker
        </button>
      </div>

      {/* Tab 1: Overview & Transactions */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161616]">
              <div>
                <h3 className="text-base font-semibold text-white">Payment History & Tax Invoices</h3>
                <p className="text-xs text-gray-400">Download official GST invoices with SAC code 998231.</p>
              </div>
              <div className="text-xs text-gray-400 font-mono">
                Showing {transactions.length} verified records
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
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-mono font-bold text-emerald-400">{tx.invoiceNumber}</div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">{tx.ref}</div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-white">
                        {tx.service}
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {tx.method}
                      </td>
                      <td className="py-4 px-4 text-gray-400">
                        {tx.date}
                      </td>
                      <td className="py-4 px-4 font-mono font-extrabold text-white text-sm">
                        ₹{tx.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          tx.status === "Completed" 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : tx.status === "Refunded"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <Button 
                          onClick={() => setSelectedInvoice(tx)}
                          size="sm" 
                          variant="ghost" 
                          className="h-8 text-xs text-gray-300 hover:text-white hover:bg-white/5"
                        >
                          View
                        </Button>
                        <Button 
                          onClick={() => toast.success(`Downloading ${tx.invoiceNumber}.pdf`)}
                          size="sm" 
                          className="h-8 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" /> PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Subscription Plans */}
      {activeTab === "plans" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p, idx) => (
            <div 
              key={idx}
              className={`rounded-2xl border p-6 flex flex-col justify-between relative transition-all ${
                p.current 
                  ? "bg-[#141414] border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30" 
                  : "bg-[#111111] border-white/10 hover:border-white/20"
              }`}
            >
              {p.popular && (
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
                  onClick={() => {
                    if (p.current) {
                      toast.info("You are already enjoying Pro tier benefits.");
                    } else {
                      setSelectedService({ name: `${p.name} Subscription`, price: p.name.includes("Corporate") ? 14999 : 0 });
                      setCheckoutStep("select");
                      setShowCheckout(true);
                    }
                  }}
                  className={`w-full rounded-xl text-xs font-semibold py-2.5 ${
                    p.current 
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default" 
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {p.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Refund Status Tracker */}
      {activeTab === "refunds" && (
        <div className="bg-[#111111] rounded-2xl border border-white/10 p-6 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-lg font-semibold text-white">Refund Request #REF-99201</h3>
            <p className="text-xs text-gray-400 mt-1">
              Advance Tax Consultation fee refund for Case #CAS-7712 (Dual booking).
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-6 max-w-xl mx-auto py-4">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Refund Request Initiated</h4>
                <p className="text-xs text-gray-400 mt-0.5">14 Jun 2026, 02:40 PM • Initiated by client</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">CA Desk Review & Approval</h4>
                <p className="text-xs text-gray-400 mt-0.5">14 Jun 2026, 04:15 PM • Approved by CA Vikramaditya Rao</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Payment Gateway Reversal (Razorpay)</h4>
                <p className="text-xs text-gray-400 mt-0.5">15 Jun 2026, 10:11 AM • ARN 9821736181</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center shrink-0 font-bold">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-emerald-400">Credited to Bank Account</h4>
                <p className="text-xs text-gray-300 mt-0.5">₹1,999 credited back to Paytm UPI VPA on 16 Jun 2026.</p>
              </div>
            </div>
          </div>
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
                    Secure Payment Gateway
                  </span>
                  <h3 className="text-xl font-bold text-white mt-2">Checkout & CA Service Booking</h3>
                  <p className="text-xs text-gray-400 mt-1">256-bit SSL encrypted • Instant tax invoice generation</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-300 font-medium">Select Service</label>
                  <select 
                    value={selectedService.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      let price = 2999;
                      if (name.includes("Corporate")) price = 14999;
                      if (name.includes("Notice")) price = 4999;
                      if (name.includes("Advisory")) price = 1499;
                      setSelectedService({ name, price });
                    }}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ITR-2 Filing & Advisory Package">ITR-2 Filing & Advisory Package (₹2,999)</option>
                    <option value="CBDT Notice 148A Advisory">CBDT Notice 148A Advisory (₹4,999)</option>
                    <option value="Hourly CA Video Consultation">Hourly CA Video Consultation (₹1,499)</option>
                    <option value="Corporate Annual Audit Retainer">Corporate Annual Audit Retainer (₹14,999)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-300 font-medium">Payment Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedMethod("upi")}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedMethod === "upi"
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                          : "bg-[#1A1A1A] border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      <Smartphone className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                      <span className="text-xs font-semibold block">Instant UPI</span>
                      <span className="text-[10px] text-gray-400">GPay, PhonePe</span>
                    </button>

                    <button
                      onClick={() => setSelectedMethod("card")}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedMethod === "card"
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                          : "bg-[#1A1A1A] border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                      <span className="text-xs font-semibold block">Card</span>
                      <span className="text-[10px] text-gray-400">Visa, Mastercard</span>
                    </button>

                    <button
                      onClick={() => setSelectedMethod("netbanking")}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedMethod === "netbanking"
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                          : "bg-[#1A1A1A] border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      <Building className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                      <span className="text-xs font-semibold block">NetBanking</span>
                      <span className="text-[10px] text-gray-400">All Indian Banks</span>
                    </button>
                  </div>
                </div>

                <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Service Fee</span>
                    <span>₹{selectedService.price.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>GST (18% SAC 998231)</span>
                    <span>₹{(selectedService.price * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-white text-sm">
                    <span>Total Amount Payable</span>
                    <span className="text-emerald-400">₹{(selectedService.price * 1.18).toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleSimulatePayment}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3 rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]"
                >
                  Pay ₹{(selectedService.price * 1.18).toFixed(2)} Now
                </Button>
              </div>
            )}

            {checkoutStep === "processing" && (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                <h4 className="text-lg font-bold text-white">Communicating with Bank...</h4>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Authorizing payment through NPCI UPI / Razorpay secure switch. Please do not press back or refresh.
                </p>
              </div>
            )}

            {checkoutStep === "success" && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-white">Payment Confirmed!</h4>
                <p className="text-xs text-gray-300 max-w-sm mx-auto">
                  Your booking for <strong className="text-white">{selectedService.name}</strong> is confirmed. A receipt and GST tax invoice have been generated.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <Button 
                    onClick={() => setShowCheckout(false)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-5 rounded-xl"
                  >
                    Done
                  </Button>
                  <Button 
                    onClick={() => {
                      toast.success("GST Tax Invoice downloaded successfully.");
                      setShowCheckout(false);
                    }}
                    variant="outline"
                    className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" /> Download Invoice
                  </Button>
                </div>
              </div>
            )}

            {checkoutStep === "failed" && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-white">Payment Declined</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  The transaction was declined by the issuer bank. No funds were debited.
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
              <p className="text-xs text-gray-400">Ref: {selectedInvoice.ref} • {selectedInvoice.date}</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Service:</span>
                <span className="text-white font-medium text-right max-w-[200px]">{selectedInvoice.service}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">SAC Code:</span>
                <span className="text-white font-mono">998231 (Legal & Accounting)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Taxable Value:</span>
                <span className="text-white font-mono">₹{(selectedInvoice.amount / 1.18).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">IGST (18%):</span>
                <span className="text-white font-mono">₹{(selectedInvoice.amount - selectedInvoice.amount / 1.18).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 font-bold text-sm text-emerald-400">
                <span>Total Paid:</span>
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
                  toast.success(`Exporting ${selectedInvoice.invoiceNumber}.pdf`);
                  setSelectedInvoice(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> Download PDF
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
              <CreditCard className="w-4 h-4 text-emerald-400" /> Add New Payment Method
            </h3>
            <p className="text-xs text-gray-400">Save a UPI Virtual Payment Address (VPA) or Debit/Credit Card for auto-settling retainers.</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-300 font-medium">UPI ID / VPA</label>
                <input 
                  type="text" 
                  placeholder="e.g. yourname@okhdfcbank"
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-medium">Account Nickname</label>
                <input 
                  type="text" 
                  placeholder="e.g. Primary Firm Account"
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500"
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
                onClick={() => {
                  toast.success("Payment method linked and verified via ₹1 penny-drop.");
                  setShowAddMethod(false);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
              >
                Verify & Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
