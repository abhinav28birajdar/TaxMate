'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  FileText, 
  Receipt, 
  Calendar, 
  Search, 
  Bot, 
  AlertCircle, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ClientDashboard() {
  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-800 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/30">Client Portal</Badge>
            <span className="text-xs text-slate-400">KYC Verified</span>
          </div>
          <h1 className="text-2xl font-bold font-display">Welcome Back, Client</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your active filings, invoices, and CA consultations.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/client/find-ca">
            <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold shadow-lg shadow-lime-600/20">
              <Search className="w-4 h-4 mr-2" />
              Find CA
            </Button>
          </Link>
          <Link href="/client/ai-assistant">
            <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-200">
              <Bot className="w-4 h-4 mr-2 text-lime-400" />
              AI Tax Helper
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Active Projects</p>
                <p className="text-3xl font-bold text-slate-100 mt-1">3</p>
              </div>
              <div className="p-3 bg-lime-500/10 text-lime-400 rounded-xl">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">2 GST Filings, 1 ITR Review</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Pending Invoices</p>
                <p className="text-3xl font-bold text-slate-100 mt-1">₹14,500</p>
              </div>
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                <Receipt className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-amber-400/80 mt-3">1 Invoice due in 5 days</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Documents Uploaded</p>
                <p className="text-3xl font-bold text-slate-100 mt-1">24</p>
              </div>
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">Form 16, Bank Statements</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Upcoming Meeting</p>
                <p className="text-lg font-bold text-slate-100 mt-1">Today, 4:00 PM</p>
              </div>
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">With CA Rajesh Sharma</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Filings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-slate-100">Active Tax & Compliance Deadlines</CardTitle>
              <CardDescription className="text-slate-400">Track status of filings managed by your assigned CA</CardDescription>
            </div>
            <Link href="/client/compliance">
              <Button variant="ghost" size="sm" className="text-lime-400 hover:text-lime-300">
                View All <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-lime-500/10 text-lime-400 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-100">GSTR-3B Monthly Filing</h4>
                  <p className="text-xs text-slate-400">Period: Sept 2026 • Assigned to CA Rajesh Sharma</p>
                </div>
              </div>
              <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/30">Filed & Verified</Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-100">ITR-3 Income Tax Return</h4>
                  <p className="text-xs text-slate-400">Assessment Year 2026-27 • Document Collection</p>
                </div>
              </div>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">In Progress</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Assigned CA Profile Summary */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Assigned CA</CardTitle>
            <CardDescription className="text-slate-400">Primary Chartered Accountant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800">
              <div className="w-12 h-12 rounded-full bg-lime-600 text-slate-950 font-bold flex items-center justify-center text-lg">
                RS
              </div>
              <div>
                <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                  CA Rajesh Sharma
                  <ShieldCheck className="w-4 h-4 text-lime-400" />
                </h4>
                <p className="text-xs text-slate-400">FCA • ICAI Reg #409218</p>
                <p className="text-xs text-lime-400 mt-1">★ 4.9 (124 reviews)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link href="/client/chat">
                <Button variant="outline" className="w-full border-slate-700 text-slate-200 hover:bg-slate-800">
                  Message
                </Button>
              </Link>
              <Link href="/client/meetings">
                <Button className="w-full bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold">
                  Book Call
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
