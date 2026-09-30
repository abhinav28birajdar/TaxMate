"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  MapPin, 
  Star, 
  Award, 
  ShieldCheck, 
  Calendar, 
  ArrowRight, 
  Filter, 
  Briefcase, 
  CheckCircle2, 
  Sparkles,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FindCAPage() {
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedSpec, setSelectedSpec] = useState("all");

  const cas = [
    {
      username: "rajesh-sharma-ca",
      name: "CA Rajesh Sharma, FCA",
      title: "Senior Tax Advisor & Statutory Auditor",
      firm: "Sharma & Associates Chartered Accountants",
      location: "New Delhi",
      experience: "14+ Years",
      rating: 4.9,
      reviews: 142,
      fee: "₹1,500",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
      specialization: "Corporate Tax & Sec 115BAC",
      tags: ["Corporate Tax", "Statutory Audit", "GST Litigation"]
    },
    {
      username: "ananya-deshmukh-ca",
      name: "CA Ananya Deshmukh",
      title: "GST Specialist & Indirect Tax Counsel",
      firm: "Deshmukh Tax Consultants",
      location: "Mumbai",
      experience: "9+ Years",
      rating: 4.8,
      reviews: 98,
      fee: "₹2,000",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop",
      specialization: "GST Audit & ITC Optimization",
      tags: ["GSTR-9/9C", "Export LUT", "ITC Reconciliations"]
    },
    {
      username: "vikramaditya-rao-ca",
      name: "CA Vikramaditya Rao, FCA",
      title: "Cross-Border Tax & Startup Due Diligence",
      firm: "Rao & Partners Advisory LLP",
      location: "Bengaluru",
      experience: "16+ Years",
      rating: 4.95,
      reviews: 210,
      fee: "₹2,500",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      specialization: "NRI & Section 148A Appeals",
      tags: ["DTAA Relief", "Schedule FA", "Angel Tax (Sec 56)"]
    },
    {
      username: "priya-mehta-ca",
      name: "CA Priya Mehta",
      title: "Transfer Pricing & MSME Compliance",
      firm: "Mehta & Co.",
      location: "Pune",
      experience: "11+ Years",
      rating: 4.85,
      reviews: 84,
      fee: "₹1,800",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop",
      specialization: "Transfer Pricing & 44AD",
      tags: ["Form 3CEB", "Presumptive Tax", "MSME Subsidies"]
    }
  ];

  const filtered = cas.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.specialization.toLowerCase().includes(search.toLowerCase()) ||
                          c.location.toLowerCase().includes(search.toLowerCase());
    const matchesCity = selectedCity === "all" || c.location.toLowerCase() === selectedCity.toLowerCase();
    const matchesSpec = selectedSpec === "all" || c.specialization.toLowerCase().includes(selectedSpec.toLowerCase());
    return matchesSearch && matchesCity && matchesSpec;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
      <div className="absolute top-0 left-1/3 w-[500px] h-[350px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> 100% ICAI Verified Practitioners
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Find & Hire a Chartered Accountant.
          </h1>
          <p className="text-base text-gray-400 font-light">
            Search top-tier tax practitioners by city, specialization, and verified client ratings across India.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-[#111111] p-4 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by CA name, city, or specialization (e.g. GST, Transfer Pricing)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#181818] border border-white/5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-[#181818] border border-white/5 text-gray-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Cities</option>
              <option value="New Delhi">New Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Pune">Pune</option>
            </select>

            <select
              value={selectedSpec}
              onChange={(e) => setSelectedSpec(e.target.value)}
              className="bg-[#181818] border border-white/5 text-gray-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Practice Areas</option>
              <option value="Corporate">Corporate Tax</option>
              <option value="GST">GST & Indirect Tax</option>
              <option value="NRI">NRI & Foreign Asset</option>
            </select>
          </div>
        </div>

        {/* CA Cards Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((ca, idx) => (
            <div
              key={idx}
              className="bg-[#111111] border border-white/10 hover:border-emerald-500/40 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-2xl transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img 
                      src={ca.avatar} 
                      alt={ca.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-md"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full text-[8px] font-bold">
                      ✓
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-white group-hover:text-emerald-400 transition-colors">
                        {ca.name}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-400">{ca.title}</p>
                    <p className="text-xs text-gray-400">{ca.firm}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 pt-0.5">
                      <span className="flex items-center gap-1 text-gray-300">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {ca.location}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-emerald-500" /> {ca.rating} ({ca.reviews})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ca.tags.map((tag, i) => (
                    <span key={i} className="text-[11px] text-gray-300 bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block">Consultation Fee</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">{ca.fee} <span className="text-[10px] text-gray-400 font-normal">/ 45m</span></span>
                </div>

                <div className="flex gap-2">
                  <Link href={`/ca/${ca.username}`}>
                    <Button variant="outline" size="sm" className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl">
                      View Profile
                    </Button>
                  </Link>
                  <Link href={`/client/meetings?ca=${ca.username}`}>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_15px_rgba(5,150,105,0.3)]">
                      Book Session
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
