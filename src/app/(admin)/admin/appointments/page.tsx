"use client";

import React, { useState } from "react";
import { 
  Calendar, 
  Search, 
  Filter, 
  Video, 
  CheckCircle2, 
  Clock, 
  User, 
  Users, 
  AlertCircle,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminAppointmentsPage() {
  const [filter, setFilter] = useState("all");

  const appointments = [
    { id: "apt-1", ca: "CA Rajesh Sharma, FCA", customer: "Abhinav Birajdar", topic: "ITR-2 Capital Gains & Foreign RSUs", date: "25 Oct 2026, 04:00 PM", fee: "₹1,500", status: "Upcoming", mode: "Video Call" },
    { id: "apt-2", ca: "CA Rajesh Sharma, FCA", customer: "Ananya Deshmukh", topic: "GSTR-3B Input Tax Credit Audit", date: "12 Oct 2026, 02:00 PM", fee: "₹2,000", status: "Completed", mode: "Video Call" },
    { id: "apt-3", ca: "CA Priya Mehta, ACA", customer: "Vikramaditya Rao", topic: "Advance Tax Q2 Liability Estimation", date: "14 Sep 2026, 11:00 AM", fee: "₹1,500", status: "Completed", mode: "Video Call" },
    { id: "apt-4", ca: "CA Anish Kumar, FCA", customer: "Karan Malhotra", topic: "NRI Bank Remittance 15CA/CB", date: "02 Oct 2026, 05:00 PM", fee: "₹3,000", status: "Cancelled", mode: "Video Call" }
  ];

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-400" /> Platform Consultations & Appointments
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Global monitoring of video consultations, booking completion velocity, and dispute resolutions.
          </p>
        </div>

        <Button
          onClick={() => toast.success("Consultation metrics report exported.")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export Bookings Report
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-[#111111] border border-white/10 rounded-2xl space-y-1">
          <span className="text-gray-400">Total Bookings</span>
          <div className="text-xl font-bold text-white">1,480</div>
          <span className="text-[10px] text-emerald-400">96.2% completion rate</span>
        </div>
        <div className="p-4 bg-[#111111] border border-white/10 rounded-2xl space-y-1">
          <span className="text-gray-400">Upcoming This Week</span>
          <div className="text-xl font-bold text-emerald-400">42</div>
          <span className="text-[10px] text-gray-500">Video consultation rooms</span>
        </div>
        <div className="p-4 bg-[#111111] border border-white/10 rounded-2xl space-y-1">
          <span className="text-gray-400">Total Consultation GMV</span>
          <div className="text-xl font-bold font-mono text-white">₹24,80,000</div>
          <span className="text-[10px] text-emerald-400">Escrow settled</span>
        </div>
        <div className="p-4 bg-[#111111] border border-white/10 rounded-2xl space-y-1">
          <span className="text-gray-400">Disputes / Cancellations</span>
          <div className="text-xl font-bold text-rose-400">1.8%</div>
          <span className="text-[10px] text-gray-500">Auto-refunded</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#18181b] text-white font-semibold border-b border-white/10">
            <tr>
              <th className="py-3.5 px-4">Chartered Accountant</th>
              <th className="py-3.5 px-4">Customer / Taxpayer</th>
              <th className="py-3.5 px-4">Consultation Topic</th>
              <th className="py-3.5 px-4">Scheduled Slot</th>
              <th className="py-3.5 px-4">Fee</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {appointments.map((a) => (
              <tr key={a.id} className="hover:bg-[#18181b]/50 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">{a.ca}</td>
                <td className="py-3.5 px-4 text-emerald-300 font-medium">{a.customer}</td>
                <td className="py-3.5 px-4 text-gray-300">{a.topic}</td>
                <td className="py-3.5 px-4 font-mono text-gray-400">{a.date}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-white">{a.fee}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    a.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                    a.status === "Upcoming" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                    "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  }`}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
