"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  FileText, 
  Download, 
  Calculator, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle,
  FileSpreadsheet,
  Layers,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TaxResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const resources = [
    {
      title: "Master Guide: Section 115BAC Old vs New Tax Regime AY 2026-27",
      category: "guides",
      type: "Comprehensive Guide",
      description: "Detailed slab-by-slab comparison with break-even income threshold analysis for salaried and self-employed individuals.",
      readTime: "8 min read",
      link: "/tax-calculator"
    },
    {
      title: "Salaried Taxpayer Form 16 & AIS Reconciliation Checklist",
      category: "checklists",
      type: "PDF Checklist",
      description: "Step-by-step checklist to reconcile Form 16 Part A & B with Annual Information Statement (AIS) and Form 26AS.",
      size: "1.2 MB",
      link: "#download-checklist"
    },
    {
      title: "Capital Gains Tax Handbook: Equity, Real Estate & Crypto",
      category: "guides",
      type: "E-Book",
      description: "Grandfathering provisions under Section 112A, indexation updates for property sales, and VDA flat 30% tax rules.",
      readTime: "12 min read",
      link: "/services"
    },
    {
      title: "CBDT Statutory Tax Deadlines Calendar (FY 2025-26 / AY 2026-27)",
      category: "deadlines",
      type: "Interactive Calendar",
      description: "Full compliance calendar for advance tax quarters, quarterly TDS statements, and non-audit/audit ITR cutoffs.",
      link: "/tax-calendar"
    },
    {
      title: "Chapter VI-A Tax Deductions Optimization Toolkit (80C, 80D, 80CCD)",
      category: "checklists",
      type: "Excel Model",
      description: "Formula-driven spreadsheet to calculate maximum tax savings through ELSS, PPF, NPS Tier-1, and mediclaim policies.",
      size: "2.4 MB",
      link: "#download-model"
    },
    {
      title: "Responding to Income Tax Notices under Section 143(1) and 139(9)",
      category: "guides",
      type: "Legal Guide",
      description: "How to handle automated CBDT adjustment intimation notices, defective return intimations, and rectification petitions.",
      readTime: "10 min read",
      link: "/contact"
    }
  ];

  const filteredResources = resources.filter(res => {
    const matchesCat = selectedCategory === "all" || res.category === selectedCategory;
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          res.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleDownload = (name: string) => {
    toast.success(`Downloading ${name}...`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide">
            <BookOpen className="w-3.5 h-3.5" /> TaxMate Knowledge Hub
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Tax Resources, Guides & Downloadable Tools
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Authored by certified Chartered Accountants to help you navigate Income Tax rules, GST updates, deductions, and statutory compliance.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111111] border border-white/10 p-4 rounded-2xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search guides, forms, checklists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {["all", "guides", "checklists", "deadlines"].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                  selectedCategory === cat 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold" 
                    : "bg-black/30 text-gray-400 hover:text-white border border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res, i) => (
            <div 
              key={i} 
              className="bg-[#111111] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all group hover:shadow-[0_0_30px_rgba(5,150,105,0.15)]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    {res.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {res.readTime || res.size || "Interactive"}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                    {res.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    {res.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between">
                {res.category === "checklists" ? (
                  <Button 
                    onClick={() => handleDownload(res.title)}
                    variant="outline" 
                    className="w-full border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Download Document
                  </Button>
                ) : (
                  <Link href={res.link} className="w-full">
                    <Button className="w-full bg-emerald-600/90 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl">
                      Access Resource <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Tools Callout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 flex items-start gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <Calculator className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h4 className="text-base font-bold text-white">Free Tax Calculator (AY 2026-27)</h4>
              <p className="text-xs text-gray-400">
                Simulate your tax liability, evaluate deductions under 80C and 80D, and find your ideal tax regime in under 60 seconds.
              </p>
              <Link href="/tax-calculator" className="inline-flex items-center text-xs font-semibold text-emerald-400 hover:underline pt-1">
                Open Calculator <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 flex items-start gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h4 className="text-base font-bold text-white">Tax Deadline Calendar</h4>
              <p className="text-xs text-gray-400">
                Never incur Section 234F late fees or Section 234A penal interest. Sync official CBDT compliance dates with Google Calendar.
              </p>
              <Link href="/tax-calendar" className="inline-flex items-center text-xs font-semibold text-blue-400 hover:underline pt-1">
                View Calendar <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
