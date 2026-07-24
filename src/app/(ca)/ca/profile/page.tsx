"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  User, Mail, Phone, MapPin, Award, BookOpen, Star, Calendar, 
  ShieldCheck, Edit, CheckCircle2, Clock, FileText, Users, Building2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CAProfilePage() {
  const [caData] = useState({
    name: 'CA Rajesh Sharma',
    membershipNo: 'FCA-402918',
    icaiReg: 'ICAI/2012/98124',
    email: 'rajesh.sharma@taxmate.in',
    phone: '+91 98765 43210',
    location: 'Mumbai, Maharashtra',
    experience: '12 Years',
    firmName: 'Sharma & Associates Chartered Accountants',
    bio: 'Senior Chartered Accountant specializing in Corporate Taxation, GST Advisory, Transfer Pricing, and Statutory Audits. Serving over 150+ corporate and HNI clients across India.',
    rating: 4.9,
    reviewCount: 128,
    clientsServed: 185,
    specializations: ['Corporate Tax', 'GST Compliance', 'Audit & Assurance', 'International Tax', 'Financial Advisory'],
    languages: ['English', 'Hindi', 'Gujarati'],
    hourlyRate: '₹2,500 / hr',
    consultationFee: '₹1,500 / session',
    status: 'Verified FCA',
    recentReviews: [
      { id: '1', client: 'Acme Solutions Pvt Ltd', rating: 5, date: '2 days ago', comment: 'Excellent guidance on GST audit filing. Highly professional and timely response.' },
      { id: '2', client: 'Priya Mehta', rating: 5, date: '1 week ago', comment: 'Saved me significant tax through proper advance tax planning. Extremely satisfied!' },
    ]
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Profile Card */}
      <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden shadow-xl relative">
        <div className="h-32 bg-gradient-to-r from-lime-900/40 via-slate-800 to-slate-900 border-b border-slate-800" />
        <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row items-start md:items-end justify-between gap-4 -mt-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="w-28 h-28 rounded-2xl bg-slate-800 border-4 border-slate-900 flex items-center justify-center text-lime-400 font-bold text-3xl shadow-xl">
              RS
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{caData.name}</h1>
                <Badge className="bg-lime-600/20 text-lime-400 border-lime-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400" /> {caData.status}
                </Badge>
              </div>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-500" /> {caData.firmName}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {caData.location}</span>
                <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-lime-400" /> {caData.experience} Experience</span>
                <span className="flex items-center gap-1 text-lime-400 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-lime-400 text-lime-400" /> {caData.rating} ({caData.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <Link href="/ca/edit-profile">
              <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
                <Edit className="w-4 h-4" /> Edit Profile
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/50 border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Clients Served</p>
              <p className="text-2xl font-bold text-slate-100">{caData.clientsServed}+</p>
            </div>
            <div className="p-3 bg-lime-600/10 text-lime-500 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-slate-900/50 border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Membership No.</p>
              <p className="text-lg font-bold text-slate-100">{caData.membershipNo}</p>
            </div>
            <div className="p-3 bg-lime-600/10 text-lime-500 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-slate-900/50 border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Consultation Fee</p>
              <p className="text-xl font-bold text-lime-400">{caData.consultationFee}</p>
            </div>
            <div className="p-3 bg-lime-600/10 text-lime-500 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-slate-900/50 border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Hourly Rate</p>
              <p className="text-xl font-bold text-slate-100">{caData.hourlyRate}</p>
            </div>
            <div className="p-3 bg-lime-600/10 text-lime-500 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-lime-600 data-[state=active]:text-slate-950 font-medium">Overview & Bio</TabsTrigger>
          <TabsTrigger value="specializations" className="data-[state=active]:bg-lime-600 data-[state=active]:text-slate-950 font-medium">Specializations</TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-lime-600 data-[state=active]:text-slate-950 font-medium">Client Reviews ({caData.reviewCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card className="bg-slate-900 border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-2">About Me</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{caData.bio}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800 text-sm">
              <div>
                <span className="text-slate-400">ICAI Registration:</span>
                <span className="ml-2 font-medium text-slate-200">{caData.icaiReg}</span>
              </div>
              <div>
                <span className="text-slate-400">Email Address:</span>
                <span className="ml-2 font-medium text-slate-200">{caData.email}</span>
              </div>
              <div>
                <span className="text-slate-400">Contact Number:</span>
                <span className="ml-2 font-medium text-slate-200">{caData.phone}</span>
              </div>
              <div>
                <span className="text-slate-400">Languages Spoken:</span>
                <span className="ml-2 font-medium text-slate-200">{caData.languages.join(', ')}</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="specializations" className="mt-4">
          <Card className="bg-slate-900 border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Core Areas of Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {caData.specializations.map((spec, i) => (
                <Badge key={i} className="bg-slate-800 hover:bg-slate-700 text-lime-400 border-slate-700 py-1.5 px-3 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-lime-500" /> {spec}
                </Badge>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4 space-y-4">
          {caData.recentReviews.map((rev) => (
            <Card key={rev.id} className="bg-slate-900 border-slate-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200 text-sm">{rev.client}</span>
                  <span className="text-xs text-slate-500">{rev.date}</span>
                </div>
                <div className="flex items-center text-lime-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-lime-400 text-lime-400 mr-1" /> {rev.rating}.0
                </div>
              </div>
              <p className="text-slate-300 text-sm italic">&quot;{rev.comment}&quot;</p>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
