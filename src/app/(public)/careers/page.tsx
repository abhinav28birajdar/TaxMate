"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Send,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CareersPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const openings = [
    {
      title: "Senior Chartered Accountant (Direct Tax & Appeals)",
      department: "Legal & Compliance",
      location: "New Delhi / Remote",
      type: "Full-Time",
      experience: "5+ Years PQE",
      description: "Lead litigation advisory, Section 148A defense petitions, and review complex corporate assessment dossiers."
    },
    {
      title: "GST Lead Counsel (Indirect Tax)",
      department: "Indirect Taxation",
      location: "Mumbai / Hybrid",
      type: "Full-Time",
      experience: "4+ Years PQE",
      description: "Spearhead GSTR-9/9C audit sign-offs, export of services refunds, and automated 2B ITC mismatch algorithms."
    },
    {
      title: "Staff Software Engineer (Fintech & Cloud Systems)",
      department: "Engineering",
      location: "Bengaluru / Pune",
      type: "Full-Time",
      experience: "4+ Years",
      description: "Architect real-time WebRTC consultation infrastructure, encrypted document vaults, and high-throughput ITD API bridges."
    },
    {
      title: "Tax Content & Knowledge Base Lead",
      department: "Product Operations",
      location: "Remote",
      type: "Full-Time",
      experience: "2+ Years",
      description: "Curate statutory deadline breakdowns, CBDT circular explanations, and author deep-dive tax optimization playbooks."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[350px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto space-y-16 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Shape the Future of Indian Taxation
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Careers at TaxMate.
          </h1>
          <p className="text-base text-gray-400 font-light">
            We are building India&apos;s most advanced operating system for Chartered Accountants and taxpayers. Join our mission.
          </p>
        </div>

        {/* Benefits bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#111111] border border-white/10 text-center space-y-1">
            <div className="font-bold text-white text-base">Top-Tier Compensation</div>
            <p className="text-xs text-gray-400">Competitive salaries, ESOP equity grants, and performance bonuses.</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#111111] border border-white/10 text-center space-y-1">
            <div className="font-bold text-white text-base">Work From Anywhere</div>
            <p className="text-xs text-gray-400">Remote-first flexibility with co-working access across Tier-1 hubs.</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#111111] border border-white/10 text-center space-y-1">
            <div className="font-bold text-white text-base">Comprehensive Healthcare</div>
            <p className="text-xs text-gray-400">₹10 Lakhs family medical insurance including OPD & mental wellness.</p>
          </div>
        </div>

        {/* Openings List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Current Openings ({openings.length})</h2>
          
          <div className="space-y-4">
            {openings.map((op, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-3xl bg-[#111111] border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-2xl"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-base text-white">{op.title}</h3>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                      {op.department}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 max-w-xl">{op.description}</p>
                  <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-400" /> {op.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-gray-500" /> {op.type}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3 text-gray-500" /> {op.experience}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    toast.success(`Application form opened for ${op.title}. Please send resume to careers@taxmate.in`);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(5,150,105,0.3)] shrink-0"
                >
                  Apply for Role <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
