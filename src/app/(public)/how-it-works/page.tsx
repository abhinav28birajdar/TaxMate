"use client";

import React from "react";
import Link from "next/link";
import { 
  FileUp, 
  UserCheck, 
  FileCheck2, 
  Send, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Video, 
  Receipt 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      title: "Quick Registration & KYC Onboarding",
      description: "Sign up in 60 seconds as a taxpayer or enterprise. Enter your PAN and Aadhaar for instant NSDL verification and cryptographic cloud vault setup.",
      icon: UserCheck,
      details: ["Instant Aadhaar e-KYC", "Military-grade AES-256 vault", "Pre-filled master profile"]
    },
    {
      num: "02",
      title: "Upload Documents or Auto-Sync Form 26AS",
      description: "Drag and drop Form 16, bank statements, or capital gains P&L. Our OCR pipeline automatically extracts line items with 99.4% accuracy.",
      icon: FileUp,
      details: ["Direct broker P&L ingestion", "Form 26AS AIS tax ledger sync", "Camera scan & batch PDF upload"]
    },
    {
      num: "03",
      title: "Assigned CA Optimization & Review",
      description: "An ICAI-registered Chartered Accountant personally verifies exemptions under Section 80C, 80D, and computes Old vs New regime benefit.",
      icon: ShieldCheck,
      details: ["Certified FCA assigned to case", "Maximum refund optimization", "1-on-1 screen share consultation"]
    },
    {
      num: "04",
      title: "Client OTP Approval & CBDT E-Filing",
      description: "Inspect the final draft computation sheet. Once you approve with Aadhaar OTP, your return is submitted directly to the ITD gateway with instant ITR-V generation.",
      icon: Send,
      details: ["Formal audit trail & sign-off", "Instant ACK confirmation number", "E-verification status tracking"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto space-y-16 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Frictionless Compliance Workflow
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            How TaxMate Works.
          </h1>
          <p className="text-base text-gray-400 font-light">
            We combined the speed of modern cloud software with the deep legal precision of certified Chartered Accountants.
          </p>
        </div>

        {/* 4 Steps Timeline */}
        <div className="space-y-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div 
                key={idx}
                className="bg-[#111111] border border-white/10 hover:border-emerald-500/40 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl transition-all"
              >
                <div className="flex items-start gap-5 flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xl shrink-0">
                    {s.num}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {s.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xl">
                      {s.description}
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      {s.details.map((d, i) => (
                        <span key={i} className="text-xs text-gray-300 flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="self-end md:self-center shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-emerald-400">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center pt-8">
          <Link href="/register">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-8 py-3.5 rounded-xl shadow-[0_0_25px_rgba(5,150,105,0.4)]">
              Experience the New Standard in Tax Filing <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
