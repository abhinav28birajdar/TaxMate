'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Clock,
  ArrowRight,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: string;
  author: {
    name: string;
    role: string;
    avatar: string | null;
  };
}

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadPosts() {
      setLoading(true);
      try {
        const res = await fetch('/api/blogs');
        const json = await res.json();
        if (active && res.ok && json.success) {
          setPosts(Array.isArray(json.posts) ? json.posts : []);
        }
      } catch {
        // Handled cleanly via empty state
      } finally {
        if (active) setLoading(false);
      }
    }
    loadPosts();
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    for (const p of posts) {
      if (p.category) set.add(p.category);
    }
    return Array.from(set);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  const featuredPost = posts[0] || null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      toast.error('Please enter your work email.');
      return;
    }
    setSubscribing(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiryType: 'contact',
          name: 'TaxMate Digest Subscriber',
          email: newsletterEmail.trim(),
          subject: 'Weekly Compliance Digest Subscription',
          message: `Subscribed ${newsletterEmail.trim()} to TaxMate knowledge hub updates.`,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Subscription failed.');
      }
      setNewsletterEmail('');
      toast.success('Subscribed to TaxMate Compliance Digest!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Subscription failed.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 text-xs font-semibold">
            TaxMate Knowledge Hub
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Insights, Updates &amp; Tax Strategies
          </h1>
          <p className="text-base sm:text-lg text-gray-400">
            Curated analysis on Indian taxation, GST notifications, and accounting automation published by verified experts.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#111111] p-4 rounded-2xl border border-white/10">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search articles, sections, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#181818] border-white/10 text-white rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`text-xs rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold'
                    : 'border-white/10 text-gray-300 hover:text-white bg-transparent'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
            <p className="text-xs">Loading knowledge base articles...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-emerald-400 mx-auto opacity-80" />
            <h2 className="text-lg font-bold text-white">No Published Articles Yet</h2>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Editorial posts created in the Admin CMS or published by Chartered Accountants will appear here automatically.
            </p>
          </div>
        ) : (
          <>
            {selectedCategory === 'All' && !searchQuery && featuredPost && (
              <Link href={`/blog/${featuredPost.slug}`} className="block group">
                <div className="relative overflow-hidden rounded-3xl bg-[#111111] border border-white/10 p-6 sm:p-8 lg:p-10 hover:border-emerald-500/40 transition-all">
                  <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
                    <div className="space-y-4 max-w-2xl">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-emerald-600 text-white text-xs font-bold px-3 py-0.5">
                          Featured Analysis
                        </Badge>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {featuredPost.readTime}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-400 line-clamp-3">
                        {featuredPost.excerpt}
                      </p>

                      {featuredPost.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {featuredPost.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-white/5 text-gray-300 px-2.5 py-1 rounded-lg border border-white/5"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-300">
                          {featuredPost.author.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{featuredPost.author.name}</div>
                          <div className="text-xs text-gray-400">
                            {featuredPost.author.role} •{' '}
                            {featuredPost.publishedAt
                              ? new Date(featuredPost.publishedAt).toLocaleDateString('en-IN')
                              : 'Recent'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="self-end lg:self-center">
                      <span className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                        Read Complete Article <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-[#111111] border border-white/10 rounded-2xl p-6 hover:border-emerald-500/40 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">
                      {post.category}
                    </Badge>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 mb-2">
                    {post.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-400 line-clamp-3 mb-6 flex-1">{post.excerpt}</p>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
                    <div className="text-xs">
                      <span className="font-semibold text-gray-200 block">{post.author.name}</span>
                      <span className="text-gray-500">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-IN') : ''}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        <form
          onSubmit={handleSubscribe}
          className="rounded-3xl bg-[#111111] text-white p-8 sm:p-12 border border-white/10 text-center space-y-6"
        >
          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold">Get Tax Updates Directly in Your Inbox</h2>
            <p className="text-sm text-gray-400">
              Receive regulatory digests, GST deadline alerts, and tax optimization checklists directly in your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your work email..."
                className="bg-[#181818] border-white/10 text-white rounded-xl placeholder:text-gray-500"
              />
              <Button
                type="submit"
                disabled={subscribing}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-6"
              >
                {subscribing ? 'Subscribing...' : 'Subscribe Free'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
