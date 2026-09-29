'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Search, 
  Tag, 
  Calendar, 
  Clock, 
  User, 
  ArrowRight, 
  Sparkles,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const BLOG_POSTS = [
  {
    slug: 'budget-2026-tax-reforms-key-takeaways',
    title: 'Union Budget 2026: Comprehensive Analysis of Direct & Indirect Tax Changes',
    excerpt: 'Explore all the critical updates to Section 115BAC, Revised GST rate slabs, changes in Corporate Minimum Alternate Tax (MAT), and incentives for tech startups.',
    category: 'Union Budget',
    author: {
      name: 'CA Rajesh Sharma',
      role: 'Senior Tax Consultant',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
    },
    publishedAt: 'Aug 10, 2026',
    readTime: '6 min read',
    featured: true,
    tags: ['Income Tax', 'Budget 2026', 'Section 115BAC', 'MAT']
  },
  {
    slug: 'mastering-gst-annual-return-gstr9-gstr9c',
    title: 'Complete Step-by-Step Guide to Filing GSTR-9 & GSTR-9C Reconciliation for FY 2025-26',
    excerpt: 'Avoid penalties and demand notices by understanding table-by-table ITC reconciliation, turnover adjustments, and auditor certifications required under GST law.',
    category: 'GST & Indirect Tax',
    author: {
      name: 'CA Priya Patel',
      role: 'GST Advisory Lead',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop'
    },
    publishedAt: 'Aug 04, 2026',
    readTime: '8 min read',
    featured: false,
    tags: ['GST', 'GSTR-9', 'GSTR-9C', 'Audit']
  },
  {
    slug: 'ai-in-accounting-how-taxmate-automates-bookkeeping',
    title: 'How Generative AI and OCR are Revolutionizing Chartered Accountancy in India',
    excerpt: 'From instant bank statement parsing to automated notice responses, learn how modern CA practices are saving 25+ hours weekly with TaxMate AI.',
    category: 'Technology & AI',
    author: {
      name: 'Ananya Verma',
      role: 'Product Lead, TaxMate',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    publishedAt: 'Jul 28, 2026',
    readTime: '5 min read',
    featured: false,
    tags: ['AI Accounting', 'OCR', 'Productivity', 'Fintech']
  },
  {
    slug: 'tds-tcs-compliance-checklist-for-businesses',
    title: 'TDS & TCS Compliance Master Checklist: Rates, Due Dates, and Quarterly Filing',
    excerpt: 'A comprehensive guide on Section 194Q, 206C(1H), Form 24Q, 26Q, and how to avoid higher deduction rates under Section 206AB.',
    category: 'Compliance',
    author: {
      name: 'CA Amit Kulkarni',
      role: 'Corporate Compliance Specialist',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
    },
    publishedAt: 'Jul 20, 2026',
    readTime: '7 min read',
    featured: false,
    tags: ['TDS', 'TCS', 'Form 26Q', 'Compliance']
  },
  {
    slug: 'startup-tax-exemptions-section-80iac-guide',
    title: 'DPIIT Startup Tax Holiday (Section 80-IAC) & Angel Tax Rules: 2026 Edition',
    excerpt: 'Everything founders and their CAs need to know about getting DPIIT certification and claiming 100% tax exemption for 3 consecutive years.',
    category: 'Startup Advisory',
    author: {
      name: 'CA Neha Singhania',
      role: 'Startup Financial Strategist',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop'
    },
    publishedAt: 'Jul 12, 2026',
    readTime: '9 min read',
    featured: false,
    tags: ['Startups', 'Section 80-IAC', 'Angel Tax', 'Funding']
  }
];

const CATEGORIES = ['All', 'Union Budget', 'GST & Indirect Tax', 'Technology & AI', 'Compliance', 'Startup Advisory'];

export default function BlogIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = BLOG_POSTS.find(p => p.featured) || BLOG_POSTS[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge className="bg-lime-600/10 text-lime-700 dark:text-lime-400 border-lime-600/20 px-3 py-1 text-xs font-semibold">
            TaxMate Knowledge Hub
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
            Insights, Updates & Tax Strategies
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Curated analysis on Indian taxation, GST notifications, judicial precedents, and modern accounting automation.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search articles, sections, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`text-xs rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-lime-600'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {selectedCategory === 'All' && !searchQuery && (
          <Link href={`/blog/${featuredPost.slug}`} className="block group">
            <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 lg:p-10 shadow-sm hover:border-lime-600/50 dark:hover:border-lime-500/50 transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-lime-600/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
              <div className="flex flex-col lg:flex-row gap-8 items-start justify-between relative z-10">
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-lime-600 text-white text-xs font-bold px-3 py-0.5">
                      Featured Analysis
                    </Badge>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {featuredPost.readTime}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-slate-900 dark:text-white group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 pt-2">
                    {featuredPost.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <img 
                      src={featuredPost.author.avatar} 
                      alt={featuredPost.author.name}
                      className="w-10 h-10 rounded-full object-cover border border-lime-600/30"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{featuredPost.author.name}</div>
                      <div className="text-xs text-slate-500">{featuredPost.author.role} • {featuredPost.publishedAt}</div>
                    </div>
                  </div>
                </div>

                <div className="self-end lg:self-center">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-lime-600 dark:text-lime-400 group-hover:translate-x-1 transition-transform">
                    Read Complete Article <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:border-lime-600/40 dark:hover:border-lime-500/40 transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <Badge variant="outline" className="text-xs border-lime-600/30 text-lime-700 dark:text-lime-400">
                  {post.category}
                </Badge>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {post.readTime}
                </span>
              </div>

              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors line-clamp-2 mb-2">
                {post.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-6 flex-1">
                {post.excerpt}
              </p>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2.5">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">{post.author.name}</span>
                    <span className="text-slate-500">{post.publishedAt}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-lime-600 dark:group-hover:text-lime-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 text-center space-y-6 relative overflow-hidden">
          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
              Get Tax Updates Directly in Your Inbox
            </h2>
            <p className="text-sm text-slate-400">
              Join 15,000+ Chartered Accountants, CFOs, and business founders who receive our weekly compliance digest.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Input
                placeholder="Enter your work email..."
                className="bg-slate-800 border-slate-700 text-white rounded-xl placeholder:text-slate-500"
              />
              <Button className="bg-lime-600 hover:bg-lime-500 text-white font-bold rounded-xl px-6">
                Subscribe Free
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
