"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  FileText, 
  CreditCard, 
  Calendar, 
  LifeBuoy, 
  CheckCircle2, 
  AlertCircle, 
  UserX, 
  ArrowRight,
  MoreVertical,
  Plus,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminCustomerManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [customers, setCustomers] = useState([
    {
      id: "cust-1",
      name: "Abhinav Birajdar",
      email: "abhinav@example.com",
      phone: "+91 98200 12345",
      pan: "ABCDE1234F",
      kycStatus: "Verified",
      returnsCount: 3,
      assignedCA: "CA Rajesh Sharma, FCA",
      totalSpent: "₹18,500",
      activeCases: 1,
      joinedDate: "12 Jan 2025"
    },
    {
      id: "cust-2",
      name: "Ananya Deshmukh",
      email: "ananya.d@gmail.com",
      phone: "+91 98111 22334",
      pan: "BKPD19876K",
      kycStatus: "Verified",
      returnsCount: 2,
      assignedCA: "CA Rajesh Sharma, FCA",
      totalSpent: "₹9,500",
      activeCases: 1,
      joinedDate: "18 Mar 2025"
    },
    {
      id: "cust-3",
      name: "Vikramaditya Rao",
      email: "dr.rao@apollo.org",
      phone: "+91 97654 32109",
      pan: "AAAPR4910M",
      kycStatus: "Verified",
      returnsCount: 4,
      assignedCA: "CA Priya Mehta, ACA",
      totalSpent: "₹35,000",
      activeCases: 2,
      joinedDate: "05 Nov 2024"
    },
    {
      id: "cust-4",
      name: "Karan Malhotra",
      email: "karan.m@outlook.com",
      phone: "+91 99887 65432",
      pan: "CPQPM8812L",
      kycStatus: "Pending KYC",
      returnsCount: 0,
      assignedCA: "Unassigned",
      totalSpent: "₹0",
      activeCases: 0,
      joinedDate: "Yesterday"
    }
  ]);

  const filteredCustomers = customers.filter(c => {
    if (statusFilter !== "all" && c.kycStatus.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.pan.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" /> Customer Management Hub
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage individual taxpayers, KYC documents, tax returns history, billing dossiers, and CA assignments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => toast.success("Exported customer database to CSV.")}
            variant="outline"
            className="border-white/10 text-xs text-gray-300 hover:text-white"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-[#111111] border border-white/10 rounded-2xl space-y-1">
          <span className="text-gray-400">Total Taxpayers</span>
          <div className="text-xl font-bold text-white">1,234</div>
          <span className="text-[10px] text-emerald-400 font-semibold">+8.4% this month</span>
        </div>
        <div className="p-4 bg-[#111111] border border-white/10 rounded-2xl space-y-1">
          <span className="text-gray-400">Verified KYC</span>
          <div className="text-xl font-bold text-emerald-400">1,180</div>
          <span className="text-[10px] text-gray-500">Aadhaar & PAN matched</span>
        </div>
        <div className="p-4 bg-[#111111] border border-white/10 rounded-2xl space-y-1">
          <span className="text-gray-400">Returns E-Filed</span>
          <div className="text-xl font-bold text-white">2,890</div>
          <span className="text-[10px] text-gray-500">AY 2026-27 filings</span>
        </div>
        <div className="p-4 bg-[#111111] border border-white/10 rounded-2xl space-y-1">
          <span className="text-gray-400">Average Spend / User</span>
          <div className="text-xl font-bold font-mono text-white">₹4,250</div>
          <span className="text-[10px] text-emerald-400">Consultations & filings</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-[#111111] rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, or PAN number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181b] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#18181b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All KYC Statuses</option>
            <option value="verified">Verified</option>
            <option value="pending kyc">Pending KYC</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#18181b] text-white font-semibold border-b border-white/10">
            <tr>
              <th className="py-3.5 px-4">Taxpayer Profile</th>
              <th className="py-3.5 px-4">PAN Details</th>
              <th className="py-3.5 px-4">KYC Status</th>
              <th className="py-3.5 px-4">Assigned CA</th>
              <th className="py-3.5 px-4">Returns Filed</th>
              <th className="py-3.5 px-4">Total Billed</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-[#18181b]/50 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">
                  <div>{c.name}</div>
                  <div className="text-[10px] text-gray-400 font-normal">{c.email} • {c.phone}</div>
                </td>
                <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">{c.pan}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    c.kycStatus === "Verified" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}>
                    {c.kycStatus}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-gray-200">{c.assignedCA}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-white">{c.returnsCount} Returns</td>
                <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">{c.totalSpent}</td>
                <td className="py-3.5 px-4 text-right space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toast.info(`Viewing taxpayer dossier for ${c.name}`)}
                    className="text-emerald-400 hover:text-emerald-300 text-xs h-7 px-2"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" /> Dossier
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
