'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Filter, 
  Briefcase, 
  Award, 
  CheckCircle2,
  Calendar,
  Grid,
  Map as MapIcon
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const MOCK_CAS = [
  {
    id: 'ca-1',
    name: 'CA Rajesh Sharma',
    membership: 'FCA #409218',
    city: 'Mumbai',
    state: 'Maharashtra',
    rating: 4.9,
    reviews: 124,
    experience: 12,
    fee: '₹2,500',
    specializations: ['GST Return Filing', 'Corporate Tax Audit', 'Start-up Compliance'],
    available: true,
  },
  {
    id: 'ca-2',
    name: 'CA Ananya Sundaram',
    membership: 'ACA #512903',
    city: 'Chennai',
    state: 'Tamil Nadu',
    rating: 4.8,
    reviews: 98,
    experience: 8,
    fee: '₹2,000',
    specializations: ['Income Tax Appeals', 'NRI Taxation', 'Transfer Pricing'],
    available: true,
  },
  {
    id: 'ca-3',
    name: 'CA Vikram Patel',
    membership: 'FCA #398102',
    city: 'Ahmedabad',
    state: 'Gujarat',
    rating: 4.95,
    reviews: 185,
    experience: 15,
    fee: '₹3,500',
    specializations: ['GST Audit & Litigation', 'Business Valuation', 'ROC Filings'],
    available: true,
  },
];

export default function FindCAPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const filteredCAs = MOCK_CAS.filter((ca) =>
    ca.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ca.specializations.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
    ca.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-100 flex items-center gap-2">
            Find Verified Chartered Accountants
            <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/30">ICAI Verified</Badge>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Browse expert CAs for individual tax returns, corporate compliance, and advisory.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <Button
            size="sm"
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-lime-600 text-slate-950 font-semibold' : 'text-slate-400'}
          >
            <Grid className="w-4 h-4 mr-1.5" /> Grid View
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'map' ? 'default' : 'ghost'}
            onClick={() => setViewMode('map')}
            className={viewMode === 'map' ? 'bg-lime-600 text-slate-950 font-semibold' : 'text-slate-400'}
          >
            <MapIcon className="w-4 h-4 mr-1.5" /> Nearby Map
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <Input
            placeholder="Search by CA name, city (e.g. Mumbai), or service (GST, ITR)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-950 border-slate-800 text-slate-200"
          />
        </div>
        <Button variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800">
          <Filter className="w-4 h-4 mr-2 text-lime-400" /> Filters
        </Button>
      </div>

      {/* Grid or Map View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCAs.map((ca) => (
            <Card key={ca.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-lime-600/20 text-lime-400 font-bold flex items-center justify-center border border-lime-500/30 text-lg">
                      {ca.name.split(' ')[1]?.[0] || 'C'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 flex items-center gap-1">
                        {ca.name}
                        <ShieldCheck className="w-4 h-4 text-lime-400" />
                      </h3>
                      <p className="text-xs text-slate-400">{ca.membership}</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                    Online
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current" /> {ca.rating} ({ca.reviews})
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> {ca.city}, {ca.state}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-slate-500" /> {ca.experience} yrs exp
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {ca.specializations.map((spec) => (
                    <span key={spec} className="px-2 py-0.5 rounded text-[11px] bg-slate-950 text-slate-300 border border-slate-800">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Consultation Fee</span>
                    <span className="text-base font-bold text-lime-400">{ca.fee}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/client/hire/${ca.id}`}>
                      <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold">
                        Hire CA
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-900/50 border-slate-800 p-8 text-center">
          <MapPin className="w-12 h-12 text-lime-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-100">Interactive OpenStreetMap View</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mt-1">
            Displaying CA firm locations in your vicinity via Leaflet.js & Nominatim API.
          </p>
        </Card>
      )}
    </div>
  );
}
