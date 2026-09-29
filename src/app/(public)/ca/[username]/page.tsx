'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function PublicCAProfilePage() {
  const params = useParams();
  const username = params?.username as string || 'rajesh-sharma-ca';

  const caData = {
    name: 'CA Rajesh Sharma, FCA',
    title: 'Senior Tax Advisor & Statutory Auditor',
    firmName: 'Sharma & Associates Chartered Accountants',
    icaiNumber: 'ICAI Mem. #402918',
    experienceYears: 14,
    ratingAvg: 4.9,
    totalReviews: 142,
    totalClients: 380,
    hourlyRate: 2500,
    consultationFee: 1500,
    location: 'Connaught Place, New Delhi, India',
    languages: ['English', 'Hindi', 'Punjabi'],
    bio: 'Fellow Chartered Accountant (FCA) with 14+ years of expertise in Corporate Taxation, International Transfer Pricing, GST Litigation, and Startup Due Diligence. Advisor to 50+ funded startups and medium-sized enterprises across India.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
    specializations: [
      'Corporate Tax Planning',
      'GST Audit & Litigation',
      'Transfer Pricing',
      'Startup Valuation (Sec 56)',
      'Statutory Audit',
      'FEMA & FDI Compliance'
    ],
    services: [
      {
        title: 'Individual & Business ITR Filing (FY 2025-26)',
        description: 'Complete tax optimization, capital gains computation, foreign asset disclosure, and ITR-1 to ITR-4 filing.',
        price: 2499,
        duration: '2-3 Business Days'
      },
      {
        title: 'Monthly GST Return Filing & ITC Reconciliation',
        description: 'GSTR-1, GSTR-3B preparation, automated 2B reconciliation, error resolution, and return filing.',
        price: 3999,
        duration: 'Monthly Ongoing'
      },
      {
        title: 'Private Limited Company Incorporation & Compliance',
        description: 'Name approval, SPICe+ filing, PAN, TAN, GST registration, bank account setup, and ROC compliance.',
        price: 7999,
        duration: '5-7 Business Days'
      },
      {
        title: '1-on-1 Strategic Tax Consultation (45 Min)',
        description: 'Direct video consultation for dispute analysis, notice response strategy, or corporate tax structuring.',
        price: 1500,
        duration: '45 Minutes'
      }
    ],
    reviews: [
      {
        clientName: 'Vikram Mehta',
        company: 'Founder, CloudScale Technologies',
        rating: 5,
        date: '2 weeks ago',
        comment: 'CA Rajesh Sharma helped our startup navigate angel tax exemptions and 80-IAC certification effortlessly. Highly recommended!'
      },
      {
        clientName: 'Sunita Narang',
        company: 'Director, Narang Exports Ltd.',
        rating: 5,
        date: '1 month ago',
        comment: 'Exceptional knowledge of GST litigation. Represented our firm in a complex audit and resolved all discrepancies smoothly.'
      }
    ]
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('CA Profile link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Profile Banner Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
                <img
                  src={caData.avatar}
                  alt={caData.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-lime-600 shadow-md shadow-lime-600/20"
                />
                <span className="absolute -bottom-2 -right-2 bg-lime-600 text-white p-1 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" title="ICAI Verified">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white">
                    {caData.name}
                  </h1>
                  <Badge className="bg-lime-600 text-white text-[10px] font-bold px-2 py-0.5">
                    ICAI Verified CA
                  </Badge>
                </div>

                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {caData.title} • <span className="text-slate-800 dark:text-slate-200">{caData.firmName}</span>
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    <Award className="w-3.5 h-3.5 text-lime-600" /> {caData.icaiNumber}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {caData.location}
                  </span>
                  <span className="flex items-center gap-1 text-lime-700 dark:text-lime-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-lime-600 text-lime-600" /> {caData.ratingAvg} ({caData.totalReviews} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto">
              <Link href={`/client/hire/${username}`} className="w-full">
                <Button className="w-full bg-lime-600 hover:bg-lime-500 text-white font-bold text-xs rounded-xl shadow-md shadow-lime-600/30">
                  Hire for Tax / GST Service
                </Button>
              </Link>
              <div className="flex gap-2">
                <Link href={`/client/meetings?ca=${username}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs rounded-xl border-slate-200 dark:border-slate-800">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-lime-600" /> Book Call (₹{caData.consultationFee})
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleShare} className="rounded-xl border-slate-200 dark:border-slate-800 px-3">
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="text-center sm:text-left">
              <div className="text-xs text-slate-500">Experience</div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white">{caData.experienceYears}+ Years</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-xs text-slate-500">Clients Served</div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white">{caData.totalClients}+</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-xs text-slate-500">Consultation Fee</div>
              <div className="text-lg font-extrabold text-lime-600 dark:text-lime-400">₹{caData.consultationFee} <span className="text-xs font-normal text-slate-500">/ 45m</span></div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-xs text-slate-500">Languages</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{caData.languages.join(', ')}</div>
            </div>
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Services & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About & Bio */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-lime-600" /> About Practice & Experience
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {caData.bio}
              </p>

              <div className="pt-4 space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Practice Specializations</h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {caData.specializations.map((spec) => (
                    <Badge key={spec} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-3 py-1 rounded-xl">
                      <CheckCircle2 className="w-3 h-3 text-lime-600 mr-1" /> {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Services Offered */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-lime-600" /> Standard Services & Transparent Pricing
              </h2>

              <div className="space-y-4">
                {caData.services.map((svc, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{svc.title}</h3>
                      <p className="text-xs text-slate-500">{svc.description}</p>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                        <Clock className="w-3 h-3" /> Delivery: {svc.duration}
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      <div className="text-base font-extrabold text-lime-600 dark:text-lime-400">
                        ₹{svc.price.toLocaleString('en-IN')}
                      </div>
                      <Link href={`/client/hire/${username}?service=${encodeURIComponent(svc.title)}`}>
                        <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-white font-bold text-xs rounded-xl shadow-sm">
                          Select Service
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Reviews */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-lime-600" /> Verified Client Reviews ({caData.totalReviews})
                </h2>
              </div>

              <div className="space-y-4">
                {caData.reviews.map((rev, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{rev.clientName}</div>
                        <div className="text-[10px] text-slate-500">{rev.company}</div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-lime-600">
                        <Star className="w-3.5 h-3.5 fill-lime-600" /> {rev.rating}.0
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      "{rev.comment}"
                    </p>
                    <div className="text-[10px] text-slate-400">{rev.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Consultation Booking & Firm Info */}
          <div className="space-y-6">
            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-900 text-white p-6">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-lime-400" /> Book Direct Consultation
                </CardTitle>
                <p className="text-xs text-slate-400">
                  Instant slot confirmation with video meeting link sent via WhatsApp and Email.
                </p>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Consultation Format</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl border border-lime-600 bg-lime-600/10 text-lime-700 dark:text-lime-400 font-bold text-center">
                      Live Video Call
                    </div>
                    <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-center">
                      In-Person Office
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">45 Minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fee:</span>
                    <span className="font-bold text-lime-600">₹{caData.consultationFee} (Incl. GST)</span>
                  </div>
                </div>

                <Link href={`/client/meetings?ca=${username}`} className="block">
                  <Button className="w-full bg-lime-600 hover:bg-lime-500 text-white font-bold text-xs rounded-xl shadow-md shadow-lime-600/30">
                    Schedule Slot Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Firm Address & Trust Badge */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-lime-600" /> Office & Contact Details
              </h3>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>Suite 402, Statesman House, Barakhamba Road, Connaught Place, New Delhi 110001</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Working Hours: Mon – Sat (9:30 AM – 6:30 PM IST)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-lime-600/10 border border-lime-600/20 text-[11px] text-lime-800 dark:text-lime-300 font-medium">
                🔒 Protected by TaxMate Secure Client Escrow & NDA Guarantee.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
