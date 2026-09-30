"use client";

import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  MessageSquare, 
  Calculator, 
  FileText, 
  CheckSquare, 
  Bell, 
  ShieldCheck, 
  ArrowRight,
  Video,
  CreditCard,
  Search,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FeaturesPage() {
  const features = [
    {
      title: "Real-Time Messaging & In-Call Collaboration",
      description: "Chat directly with your assigned CA. Share documents, record voice notes, and jump into synchronized video calls with dual-pane tax schedule viewing.",
      icon: MessageSquare,
      badge: "Flagship Feature"
    },
    {
      title: "Automated Old vs New Tax Regime Engine",
      description: "Live Budget 2026 tax slab comparison. Computes Chapter VI-A deductions, standard deductions, and automatically recommends the lowest tax liability.",
      icon: Calculator,
      badge: "Tax Intelligence"
    },
    {
      title: "Encrypted Document Vault & AI OCR Parsing",
      description: "Upload Form 16, capital gains statements, and bank PDFs. Our parser auto-extracts line items, TDS values, and salary components in under 5 seconds.",
      icon: FileText,
      badge: "Automation"
    },
    {
      title: "6-Stage CA Practice Workflow Kanban",
      description: "Track filings across exact compliance stages: Pending → In Progress → Review → Customer Approval → Filed → Completed.",
      icon: CheckSquare,
      badge: "Practice Management"
    },
    {
      title: "Multi-Channel Statutory Deadline Calendar",
      description: "Automated alerts via WhatsApp, SMS, and Email for GSTR-3B, TDS Form 26Q, and advance tax quarterly installments.",
      icon: Bell,
      badge: "Compliance"
    },
    {
      title: "ICAI & ITD Compliance Gateway Integration",
      description: "Built strictly adhering to Section 138 confidentiality. Direct integration with CBDT e-Filing 2.0 and GSTN invoice registration portals.",
      icon: ShieldCheck,
      badge: "Security"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[350px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Built for Scale & Compliance
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Platform Capabilities Designed for <br />
            <span className="text-emerald-500">Modern CA Practices.</span>
          </h1>
          <p className="text-base text-gray-400 font-light leading-relaxed">
            Eliminate fragmented WhatsApp chats, lost email attachments, and manual tax calculations with one unified cloud operating system.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div 
                key={idx}
                className="bg-[#111111] border border-white/10 hover:border-emerald-500/40 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-4 shadow-2xl transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {f.title}
                  </h3>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    {f.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 text-[11px] text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Explore module <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="p-8 rounded-3xl bg-[#141414] border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-white">Experience all 20 modules in action</h3>
            <p className="text-xs text-gray-400">Test drive the complete client portal, CA workspace, and filing pipelines.</p>
          </div>
          <Link href="/modules">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]">
              Open 20 Modules Showcase <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
