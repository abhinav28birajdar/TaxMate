'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  HelpCircle, 
  Megaphone, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function AdminContentManagementPage() {
  const [blogs, setBlogs] = useState([
    { id: 1, title: 'Union Budget 2026: Direct & Indirect Tax Reforms', category: 'Budget', author: 'CA Rajesh Sharma', status: 'Published', views: '14.2k', date: '10 Aug 2026' },
    { id: 2, title: 'Mastering GST Annual Return GSTR-9/9C Reconciliation', category: 'GST', author: 'CA Priya Patel', status: 'Published', views: '8.9k', date: '04 Aug 2026' },
    { id: 3, title: 'How Generative AI and OCR are Transforming Indian CAs', category: 'AI Tech', author: 'Ananya Verma', status: 'Draft', views: '0', date: '28 Jul 2026' },
  ]);

  const [faqs, setFaqs] = useState([
    { id: 1, q: 'How does TaxMate verify Chartered Accountant credentials?', a: 'Every CA must provide their active ICAI Membership number and COP, verified against the Institute records before profile activation.', category: 'CA Verification' },
    { id: 2, q: 'Is client financial data encrypted under Indian DPDP Act?', a: 'Yes, all bank statements, returns, and PANs are encrypted with AES-256 at rest and TLS 1.3 in transit.', category: 'Security' },
    { id: 3, q: 'What are the platform fee rates for escrow payments?', a: 'TaxMate charges a flat 2% payment gateway processing fee on client milestone invoices.', category: 'Billing' }
  ]);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-lime-400" /> Platform Content Management (CMS)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage public blog publications, FAQ knowledgebase entries, system banners, and tax legal guides.
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/admin/content/blogs">
            <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-white font-bold text-xs rounded-xl shadow-md shadow-lime-600/20">
              <Plus className="w-3.5 h-3.5 mr-1" /> New Blog Article
            </Button>
          </Link>
          <Link href="/admin/content/faqs">
            <Button size="sm" variant="outline" className="text-xs rounded-xl border-slate-700 text-slate-300">
              <HelpCircle className="w-3.5 h-3.5 mr-1 text-lime-400" /> Manage FAQs
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="blogs" className="w-full space-y-4">
        <TabsList className="bg-slate-900 p-1 rounded-2xl border border-slate-800">
          <TabsTrigger value="blogs" className="rounded-xl text-xs font-semibold text-slate-300 data-[state=active]:bg-lime-600 data-[state=active]:text-white">
            Blog Articles ({blogs.length})
          </TabsTrigger>
          <TabsTrigger value="faqs" className="rounded-xl text-xs font-semibold text-slate-300 data-[state=active]:bg-lime-600 data-[state=active]:text-white">
            FAQs & Knowledgebase ({faqs.length})
          </TabsTrigger>
        </TabsList>

        {/* Blogs Content */}
        <TabsContent value="blogs" className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-3">Article Title</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Author</th>
                    <th className="py-3 px-3">Views</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {blogs.map((b) => (
                    <tr key={b.id}>
                      <td className="py-3.5 px-3 font-semibold text-white max-w-xs truncate">{b.title}</td>
                      <td className="py-3.5 px-3">
                        <Badge variant="outline" className="border-lime-500/30 text-lime-400 text-[10px]">
                          {b.category}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">{b.author}</td>
                      <td className="py-3.5 px-3 text-slate-400">{b.views}</td>
                      <td className="py-3.5 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.status === 'Published' ? 'bg-lime-600/20 text-lime-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right space-x-2">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-white" onClick={() => toast.info('Edit blog')}>
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-300" onClick={() => toast.success('Article deleted')}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* FAQs Content */}
        <TabsContent value="faqs" className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="space-y-3">
              {faqs.map((f) => (
                <div key={f.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{f.q}</span>
                      <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">
                        {f.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{f.a}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-white">
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-300">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
