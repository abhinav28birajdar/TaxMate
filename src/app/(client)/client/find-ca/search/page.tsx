"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Star, Filter, ShieldCheck, Award, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function FindCASearchPage() {
  const [query, setQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');

  const cas = [
    {
      id: 'ca1',
      name: 'CA Rajesh Sharma',
      firm: 'Sharma & Associates CA',
      location: 'Mumbai, Maharashtra',
      experience: '12 Years',
      rating: 4.9,
      reviews: 128,
      specializations: ['Corporate Tax', 'GST Audit', 'Transfer Pricing'],
      fee: '₹1,500 / session'
    },
    {
      id: 'ca2',
      name: 'CA Anjali Patel',
      firm: 'Patel & Co Tax Consultants',
      location: 'Ahmedabad, Gujarat',
      experience: '9 Years',
      rating: 4.8,
      reviews: 94,
      specializations: ['Income Tax Filing', 'Startups', 'FDI'],
      fee: '₹1,200 / session'
    },
    {
      id: 'ca3',
      name: 'CA Vikram Sundaram',
      firm: 'Sundaram Financial Advisory',
      location: 'Chennai, Tamil Nadu',
      experience: '15 Years',
      rating: 5.0,
      reviews: 210,
      specializations: ['Statutory Audit', 'GST Litigation', 'International Tax'],
      fee: '₹2,000 / session'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Search className="w-6 h-6 text-lime-500" /> Search Verified Chartered Accountants
        </h1>
        <p className="text-sm text-slate-400">Filter by specialization, location, ratings, and consultation fee</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
            <Input 
              placeholder="Search by CA Name, Specialization (e.g. GST, Audit)..." 
              className="pl-9 bg-slate-950 border-slate-800 text-slate-100" 
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
            <Filter className="w-4 h-4" /> Filter Results
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cas.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.specializations.some(s => s.toLowerCase().includes(query.toLowerCase()))).map(ca => (
          <Card key={ca.id} className="bg-slate-900 border-slate-800 p-6 space-y-4 hover:border-lime-500/40 transition-colors">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-100 text-lg">{ca.name}</h3>
                  <ShieldCheck className="w-4 h-4 text-lime-400" />
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" /> {ca.firm}
                </p>
              </div>
              <Badge className="bg-lime-600/20 text-lime-400 border-lime-500/30 flex items-center gap-1">
                <Star className="w-3 h-3 fill-lime-400" /> {ca.rating}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 border-y border-slate-800 py-3">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {ca.location}</span>
              <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> {ca.experience}</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {ca.specializations.map((s, idx) => (
                <Badge key={idx} className="bg-slate-800 text-slate-300 text-xs border-slate-700">{s}</Badge>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="font-bold text-lime-400 text-sm">{ca.fee}</span>
              <Link href={`/client/find-ca/${ca.id}`}>
                <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold text-xs">
                  View Profile & Hire
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
