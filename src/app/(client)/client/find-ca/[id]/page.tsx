"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Award, Star, MapPin, Building2, CheckCircle2, ArrowLeft, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ClientCADetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const ca = {
    id: params.id,
    name: 'CA Rajesh Sharma',
    membershipNo: 'FCA-402918',
    firm: 'Sharma & Associates Chartered Accountants',
    location: 'Mumbai, Maharashtra',
    experience: '12 Years',
    rating: 4.9,
    reviewsCount: 128,
    bio: 'Senior FCA with 12+ years experience in corporate income tax computation, GST compliance, and statutory audit representation.',
    specializations: ['Corporate Tax', 'GST Audit', 'Transfer Pricing', 'Internal Financial Controls'],
    fee: '₹1,500 / consultation',
    hourly: '₹2,500 / hr'
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="border-slate-800 bg-slate-900 text-slate-300" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            {ca.name} <ShieldCheck className="w-5 h-5 text-lime-400" />
          </h1>
          <p className="text-sm text-slate-400">{ca.firm} | {ca.membershipNo}</p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm border-b border-slate-800 pb-6">
          <div>
            <span className="text-slate-400 text-xs block">Experience</span>
            <span className="font-semibold text-slate-100">{ca.experience}</span>
          </div>
          <div>
            <span className="text-slate-400 text-xs block">Rating</span>
            <span className="font-bold text-lime-400 flex items-center gap-1">
              <Star className="w-4 h-4 fill-lime-400" /> {ca.rating} ({ca.reviewsCount} reviews)
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-xs block">Consultation Rate</span>
            <span className="font-bold text-slate-100">{ca.fee}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-semibold text-slate-100">About Practitioner</h3>
          <p className="text-slate-300 text-sm leading-relaxed">{ca.bio}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-semibold text-slate-100">Specializations</h3>
          <div className="flex flex-wrap gap-2">
            {ca.specializations.map((s, idx) => (
              <Badge key={idx} className="bg-slate-800 text-lime-400 border-slate-700 py-1 px-3">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {s}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Link href={`/client/hire/${ca.id}`}>
            <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2 py-5 px-6">
              <Send className="w-4 h-4" /> Send Engagement Hire Request
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
