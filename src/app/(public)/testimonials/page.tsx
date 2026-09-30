"use client";

import React from "react";
import Link from "next/link";
import { Star, ShieldCheck, Sparkles, Quote, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TestimonialsPage() {
  const reviews = [
    {
      author: "Vikram Mehta",
      role: "Founder & CEO, CloudScale Technologies",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
      rating: 5,
      service: "Pvt Ltd Tax Filing & 80-IAC Exemption",
      comment: "TaxMate transformed our tax compliance. Our assigned CA handled complex Section 56 angel tax documentation with zero back-and-forth email loops. The video consultation with synchronized document viewer saved us weeks."
    },
    {
      author: "CA Priya Swaminathan, FCA",
      role: "Managing Partner, Swaminathan & Associates",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop",
      rating: 5,
      service: "CA Practice Operating System",
      comment: "Running our firm of 14 articled assistants was chaotic until TaxMate. The 6-stage Kanban workflow, automatic Form 26AS reconciliation, and client WhatsApp alerts reduced client churn to virtually zero."
    },
    {
      author: "Rohan Singhal",
      role: "Staff Software Engineer, Google India",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop",
      rating: 5,
      service: "Salaried ITR-2 with US RSU Disclosures",
      comment: "Filing Schedule FA for foreign stock options used to be terrifying. My TaxMate CA completed the entire computation sheet with exact foreign exchange SBI TT rates in 24 hours. Flawless execution."
    },
    {
      author: "Sunita Narang",
      role: "Director, Narang Exports Ltd.",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop",
      rating: 5,
      service: "GSTR-3B & Export LUT Filings",
      comment: "The automated GSTR-2B ITC reconciliation engine flagged over ₹4.8 Lakhs in unclaimed input tax credits that our previous accountant missed. TaxMate paid for itself ten times over in month one."
    },
    {
      author: "Dr. Arvind Chawla",
      role: "Consultant Cardiologist, Max Healthcare",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop",
      rating: 5,
      service: "Section 44ADA Presumptive Taxation",
      comment: "As a busy doctor, I don't have time to understand tax law intricacies. The booking system was instantaneous, and the CA answered all questions directly on screen during our evening video appointment."
    },
    {
      author: "CA Rajesh Goel",
      role: "Solo Practitioner, Delhi NCR",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop",
      rating: 5,
      service: "TaxMate Solo CA Plan",
      comment: "The built-in billing, instant Razorpay payment receipts, and automated client KYC checks allowed me to scale from 40 clients to 180 clients in a single assessment year without hiring extra staff."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[350px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Trusted by India&apos;s Finest Professionals
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            What CAs & Taxpayers Say.
          </h1>
          <p className="text-base text-gray-400 font-light">
            Read authentic reviews from Chartered Accountants, startup founders, and high-net-worth individuals.
          </p>
        </div>

        {/* Overall Trust Bar */}
        <div className="p-6 bg-[#111111] border border-white/10 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-around gap-6 text-center">
          <div>
            <div className="text-3xl font-extrabold text-white">4.92 / 5.0</div>
            <div className="flex justify-center gap-1 text-emerald-400 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-emerald-500" />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">Overall Satisfaction</p>
          </div>
          <div className="border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-8">
            <div className="text-3xl font-extrabold text-white">2,000+</div>
            <p className="text-xs text-gray-400 mt-1">Active Indian CAs</p>
          </div>
          <div className="border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-8">
            <div className="text-3xl font-extrabold text-white">₹150 Cr+</div>
            <p className="text-xs text-gray-400 mt-1">Taxes Filed & Reconciled</p>
          </div>
          <div className="border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-8">
            <div className="text-3xl font-extrabold text-emerald-400">99.8%</div>
            <p className="text-xs text-gray-400 mt-1">On-Time Filing Rate</p>
          </div>
        </div>

        {/* Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div 
              key={idx}
              className="bg-[#111111] border border-white/10 hover:border-emerald-500/40 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-2xl transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 text-emerald-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-emerald-500" />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">{rev.service}</span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center gap-3">
                <img 
                  src={rev.avatar} 
                  alt={rev.author}
                  className="w-10 h-10 rounded-xl object-cover border border-white/10"
                />
                <div>
                  <h4 className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">
                    {rev.author}
                  </h4>
                  <p className="text-[10px] text-gray-400">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center pt-8">
          <Link href="/register">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-8 py-3 rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]">
              Join 15,000+ Satisfied Indian Taxpayers <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
