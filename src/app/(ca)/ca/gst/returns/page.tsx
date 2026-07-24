"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, Download, CheckCircle2, AlertTriangle, Search, Filter, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';

export default function CAGSTReturnsPage() {
  const [search, setSearch] = useState('');

  const returns = [
    { id: '1', gstin: '27AABCU9603R1ZM', client: 'Acme Solutions Pvt Ltd', returnType: 'GSTR-3B', period: 'June 2026', dueDate: '2026-07-20', status: 'filed', arn: 'AA2706260192831' },
    { id: '2', gstin: '27AABCU9603R1ZM', client: 'Acme Solutions Pvt Ltd', returnType: 'GSTR-1', period: 'June 2026', dueDate: '2026-07-11', status: 'filed', arn: 'AA2706260111234' },
    { id: '3', gstin: '33AABCT1234R1ZN', client: 'Mehta Logistics', returnType: 'GSTR-3B', period: 'June 2026', dueDate: '2026-07-20', status: 'pending', arn: '-' },
    { id: '4', gstin: '29AABCT5678R1ZO', client: 'TechNova Solutions', returnType: 'GSTR-1', period: 'July 2026', dueDate: '2026-08-11', status: 'in_progress', arn: '-' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/ca/gst">
            <Button variant="outline" size="icon" className="border-slate-800 bg-slate-900 text-slate-300">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-6 h-6 text-lime-500" /> GST Returns Filing Management
            </h1>
            <p className="text-sm text-slate-400">Track GSTR-1, GSTR-3B, GSTR-9 annual returns for all assigned clients</p>
          </div>
        </div>
        <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
          <Upload className="w-4 h-4" /> File New Return
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <Input 
              placeholder="Search by Client Name or GSTIN..." 
              className="pl-9 bg-slate-950 border-slate-800 text-slate-100" 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Client Name</TableHead>
                <TableHead className="text-slate-400">GSTIN</TableHead>
                <TableHead className="text-slate-400">Form Type</TableHead>
                <TableHead className="text-slate-400">Tax Period</TableHead>
                <TableHead className="text-slate-400">Due Date</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">ARN Number</TableHead>
                <TableHead className="text-slate-400 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returns.filter(r => r.client.toLowerCase().includes(search.toLowerCase()) || r.gstin.toLowerCase().includes(search.toLowerCase())).map(r => (
                <TableRow key={r.id} className="border-slate-800 hover:bg-slate-950/50">
                  <TableCell className="font-semibold text-slate-100">{r.client}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-300">{r.gstin}</TableCell>
                  <TableCell><Badge className="bg-slate-800 text-lime-400 border-slate-700">{r.returnType}</Badge></TableCell>
                  <TableCell className="text-slate-300 text-xs">{r.period}</TableCell>
                  <TableCell className="text-slate-300 text-xs">{r.dueDate}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${
                      r.status === 'filed' ? 'bg-lime-600/20 text-lime-400 border-lime-500/30' :
                      r.status === 'in_progress' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {r.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-400">{r.arn}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-lime-400 hover:text-lime-300 hover:bg-slate-800">
                      View Computation
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
