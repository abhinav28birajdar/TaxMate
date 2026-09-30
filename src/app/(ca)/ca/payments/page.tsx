"use client";

import { useState } from "react";
import { CreditCard, Download, Search, CheckCircle2, ArrowDownLeft, Clock, Filter, Plus, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CAPaymentsPage() {
  const [search, setSearch] = useState("");

  const payments = [
    { id: "PAY-8901", client: "TechNova Solutions Pvt Ltd", invoiceNo: "INV-1004", method: "Razorpay UPI", amount: "₹1,50,000", date: "22 Oct 2026", status: "SETTLED" },
    { id: "PAY-8902", client: "Dr. Vikramaditya Rao", invoiceNo: "INV-1002", method: "Bank Transfer (NEFT)", amount: "₹15,000", date: "20 Oct 2026", status: "SETTLED" },
    { id: "PAY-8903", client: "Apex Logistics India LLP", invoiceNo: "INV-1001", method: "Credit Card (Stripe)", amount: "₹85,000", date: "18 Oct 2026", status: "SETTLED" },
    { id: "PAY-8904", client: "Mehta Consultancy", invoiceNo: "INV-1005", method: "Direct Bank Deposit", amount: "₹35,000", date: "15 Oct 2026", status: "PROCESSING" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4" /> Practice Financials & Billing
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Payments Received & Gateway Settlements
          </h1>
          <p className="text-xs text-gray-400 mt-1">Track Razorpay, Stripe, and direct bank fee collections with automatic reconciliation.</p>
        </div>
        <Button onClick={() => toast.success("Manual payment entry logged!")} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-[0_0_20px_rgba(5,150,105,0.3)]">
          <Plus className="w-4 h-4 mr-1.5" /> Log Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-[#111111] border border-emerald-500/20 rounded-2xl">
          <span className="text-xs font-semibold text-emerald-400">Total Collections (Current FY)</span>
          <div className="text-3xl font-extrabold text-white mt-1">₹28,50,000</div>
          <p className="text-[11px] text-gray-400 mt-1">+18.4% vs last FY</p>
        </div>
        <div className="p-5 bg-[#111111] border border-white/10 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-gray-400">Settled to Practice Bank Vault</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">₹26,80,000</div>
          <p className="text-[11px] text-gray-400 mt-1">ICICI Bank ••8819</p>
        </div>
        <div className="p-5 bg-[#111111] border border-white/10 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-gray-400">Pending Gateway Payouts</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">₹1,70,000</div>
          <p className="text-[11px] text-gray-400 mt-1">Scheduled for tomorrow 10 AM</p>
        </div>
      </div>

      <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#1A1A1A] text-gray-300 font-semibold border-b border-white/10 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4">Payment Ref #</th>
              <th className="py-3.5 px-4">Client Name</th>
              <th className="py-3.5 px-4">Invoice #</th>
              <th className="py-3.5 px-4">Method / Channel</th>
              <th className="py-3.5 px-4">Received Date</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{p.id}</td>
                <td className="py-3.5 px-4 font-bold text-white">{p.client}</td>
                <td className="py-3.5 px-4 font-mono text-gray-400">{p.invoiceNo}</td>
                <td className="py-3.5 px-4 text-gray-300">{p.method}</td>
                <td className="py-3.5 px-4 text-gray-400">{p.date}</td>
                <td className="py-3.5 px-4 font-mono font-extrabold text-white">{p.amount}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    p.status === "SETTLED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Button size="sm" variant="ghost" onClick={() => toast.info(`Downloading payment receipt for ${p.id}`)} className="text-gray-400 hover:text-white hover:bg-white/5">
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
