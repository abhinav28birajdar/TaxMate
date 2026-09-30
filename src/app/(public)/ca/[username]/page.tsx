"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  Briefcase, 
  Award, 
  CheckCircle2, 
  Calendar, 
  MessageSquare, 
  Phone, 
  Mail, 
  Share2, 
  FileText,
  Clock,
  IndianRupee,
  Building,
  UserCheck,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function PublicCAProfilePage() {
  const params = useParams();
  const username = params?.username as string || "rajesh-sharma-ca";

  const caData = {
    name: "CA Rajesh Sharma, FCA",
    title: "Senior Tax Advisor & Statutory Auditor",
    firmName: "Sharma & Associates Chartered Accountants",
    icaiNumber: "ICAI Mem. #402918",
    experienceYears: 14,
    ratingAvg: 4.9,
    totalReviews: 142,
    totalClients: 380,
    hourlyRate: 2500,
    consultationFee: 1500,
    location: "Connaught Place, New Delhi, India",
    languages: ["English", "Hindi", "Punjabi"],
    bio: "Fellow Chartered Accountant (FCA) with 14+ years of expertise in Corporate Taxation, International Transfer Pricing, GST Litigation, and Startup Due Diligence. Advisor to 50+ funded startups and medium-sized enterprises across India.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
    specializations: [
      "Corporate Tax Planning",
      "GST Audit & Litigation",
      "Transfer Pricing",
      "Startup Valuation (Sec 56)",
      "Statutory Audit",
      "FEMA & FDI Compliance"
    ],
    services: [
      {
        title: "Individual & Business ITR Filing (AY 2026-27)",
        description: "Complete tax optimization, capital gains computation, foreign asset disclosure, and ITR-1 to ITR-4 filing.",
        price: 2499,
        duration: "2-3 Business Days"
      },
      {
        title: "Monthly GST Return Filing & ITC Reconciliation",
        description: "GSTR-1, GSTR-3B preparation, automated 2B reconciliation, error resolution, and return filing.",
        price: 3999,
        duration: "Monthly Ongoing"
      },
      {
        title: "Private Limited Company Incorporation & Compliance",
        description: "Name approval, SPICe+ filing, PAN, TAN, GST registration, bank account setup, and ROC compliance.",
        price: 7999,
        duration: "5-7 Business Days"
      },
      {
        title: "1-on-1 Strategic Tax Consultation (45 Min)",
        description: "Direct video consultation for dispute analysis, notice response strategy, or corporate tax structuring.",
        price: 1500,
        duration: "45 Minutes"
      }
    ],
    reviews: [
      {
        clientName: "Vikram Mehta",
        company: "Founder, CloudScale Technologies",
        rating: 5,
        date: "2 weeks ago",
        comment: "CA Rajesh Sharma helped our startup navigate angel tax exemptions and 80-IAC certification effortlessly. Highly recommended!"
      },
      {
        clientName: "Sunita Narang",
        company: "Director, Narang Exports Ltd.",
        rating: 5,
        date: "1 month ago",
        comment: "Exceptional knowledge of GST litigation. Represented our firm in a complex audit and resolved all discrepancies smoothly."
      }
    ]
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      toast.success("CA Profile link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background subtleties matching HeroSection */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Profile Banner Card */}
        <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
                <img
                  src={caData.avatar}
                  alt={caData.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                />
                <span className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1 rounded-full border-2 border-[#111111] shadow-sm" title="ICAI Verified">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {caData.name}
                  </h1>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    ICAI Verified CA
                  </span>
                </div>

                <p className="text-sm font-medium text-gray-400">
                  {caData.title} • <span className="text-gray-200">{caData.firmName}</span>
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-1">
                  <span className="flex items-center gap-1 font-semibold text-gray-300">
                    <Award className="w-3.5 h-3.5 text-emerald-400" /> {caData.icaiNumber}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" /> {caData.location}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" /> {caData.ratingAvg} ({caData.totalReviews} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto">
              <Link href={`/client/meetings?ca=${username}`} className="w-full">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)]">
                  Hire for Tax / GST Service
                </Button>
              </Link>
              <div className="flex gap-2">
                <Link href={`/client/meetings?ca=${username}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs rounded-xl border-white/10 text-gray-300 hover:bg-white/5">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Book Call (₹{caData.consultationFee})
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleShare} className="rounded-xl border-white/10 px-3 text-gray-400 hover:text-white hover:bg-white/5">
                  <Share2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="text-center sm:text-left">
              <div className="text-xs text-gray-400">Experience</div>
              <div className="text-lg font-extrabold text-white">{caData.experienceYears}+ Years</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-xs text-gray-400">Clients Served</div>
              <div className="text-lg font-extrabold text-white">{caData.totalClients}+</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-xs text-gray-400">Consultation Fee</div>
              <div className="text-lg font-extrabold text-emerald-400">₹{caData.consultationFee} <span className="text-xs font-normal text-gray-500">/ 45m</span></div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-xs text-gray-400">Languages</div>
              <div className="text-sm font-semibold text-white">{caData.languages.join(", ")}</div>
            </div>
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Services & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About & Bio */}
            <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" /> About Practice & Experience
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                {caData.bio}
              </p>

              <div className="pt-4 space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Practice Specializations</h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {caData.specializations.map((spec) => (
                    <span key={spec} className="bg-white/5 border border-white/10 text-gray-300 text-xs px-3 py-1 rounded-xl flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Services Offered */}
            <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" /> Standard Services & Transparent Pricing
              </h2>

              <div className="space-y-4">
                {caData.services.map((svc, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-white/10 bg-[#161616] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-emerald-500/30 transition-all">
                    <div className="space-y-1 flex-1">
                      <h3 className="text-sm font-bold text-white">{svc.title}</h3>
                      <p className="text-xs text-gray-400">{svc.description}</p>
                      <div className="text-[11px] text-gray-400 flex items-center gap-1 pt-1">
                        <Clock className="w-3 h-3 text-emerald-400" /> Delivery: {svc.duration}
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      <div className="text-base font-extrabold text-emerald-400">
                        ₹{svc.price.toLocaleString("en-IN")}
                      </div>
                      <Link href={`/client/meetings?ca=${username}&service=${encodeURIComponent(svc.title)}`}>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm">
                          Select Service
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Reviews */}
            <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-emerald-400" /> Verified Client Reviews ({caData.totalReviews})
                </h2>
              </div>

              <div className="space-y-4">
                {caData.reviews.map((rev, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-white/5 bg-[#161616] space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{rev.clientName}</div>
                        <div className="text-[10px] text-gray-400">{rev.company}</div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                        <Star className="w-3.5 h-3.5 fill-emerald-500" /> {rev.rating}.0
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                    <div className="text-[10px] text-gray-500">{rev.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Consultation Booking & Firm Info */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#111111] shadow-2xl overflow-hidden">
              <div className="bg-[#161616] border-b border-white/10 p-6">
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" /> Book Direct Consultation
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Instant slot confirmation with video meeting link sent via WhatsApp and Email.
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-300">Consultation Format</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-bold text-center">
                      Live Video Call
                    </div>
                    <div className="p-2.5 rounded-xl border border-white/10 text-gray-400 text-center">
                      In-Person Office
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#161616] rounded-xl text-xs space-y-1 border border-white/5">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="font-semibold text-white">45 Minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fee:</span>
                    <span className="font-bold text-emerald-400">₹{caData.consultationFee} (Incl. GST)</span>
                  </div>
                </div>

                <Link href={`/client/meetings?ca=${username}`} className="block">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]">
                    Schedule Slot Now
                  </Button>
                </Link>
              </div>
            </div>

            {/* Firm Address & Trust Badge */}
            <div className="p-6 rounded-3xl bg-[#111111] border border-white/10 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-400" /> Office & Contact Details
              </h3>

              <div className="space-y-2.5 text-xs text-gray-300">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Suite 402, Statesman House, Barakhamba Road, Connaught Place, New Delhi 110001</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Working Hours: Mon – Sat (9:30 AM – 6:30 PM IST)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-medium">
                🔒 Protected by TaxMate Secure Client Escrow & NDA Guarantee.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
