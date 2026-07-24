"use client";

import React from 'react';
import { BookOpen, Plus, Edit, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminBlogsPage() {
  const blogs = [
    { id: '1', title: 'Complete Guide to Union Budget 2026 Direct Tax Amendments', author: 'TaxMate Editorial', status: 'published', views: '4,120', date: '2026-07-10' },
    { id: '2', title: 'How CAs Can Automate GSTR-2B Matching with AI', author: 'Rajesh Sharma FCA', status: 'published', views: '2,890', date: '2026-07-15' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-lime-500" /> Blog Content & Tax Resource Manager
          </h1>
          <p className="text-sm text-slate-400">Publish knowledge base articles and SEO guides</p>
        </div>
        <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
          <Plus className="w-4 h-4" /> Create New Post
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Title</TableHead>
                <TableHead className="text-slate-400">Author</TableHead>
                <TableHead className="text-slate-400">Views</TableHead>
                <TableHead className="text-slate-400">Published Date</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.map(b => (
                <TableRow key={b.id} className="border-slate-800 hover:bg-slate-950/50">
                  <TableCell className="font-semibold text-slate-100">{b.title}</TableCell>
                  <TableCell className="text-slate-300 text-xs">{b.author}</TableCell>
                  <TableCell className="font-mono text-xs text-lime-400">{b.views}</TableCell>
                  <TableCell className="text-slate-300 text-xs">{b.date}</TableCell>
                  <TableCell>
                    <Badge className="bg-lime-600/20 text-lime-400 border-lime-500/30 text-xs">
                      {b.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                      <Edit className="w-4 h-4" />
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
