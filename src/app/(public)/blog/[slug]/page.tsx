'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  UserCheck,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface BlogPostDetail {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
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

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ? decodeURIComponent(String(params.slug)) : '';

  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadPost() {
      if (!slug) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/blogs?slug=${encodeURIComponent(slug)}`);
        const json = await res.json();
        if (active && res.ok && json.success && json.post) {
          setPost(json.post);
        }
      } catch {
        // Not found UI renders
      } finally {
        if (active) setLoading(false);
      }
    }
    loadPost();
    return () => {
      active = false;
    };
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      toast.success('Article link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <p className="text-xs text-gray-400">Loading article...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#111111] border border-white/10 rounded-3xl p-8 text-center space-y-4">
          <BookOpen className="w-10 h-10 text-emerald-400 mx-auto opacity-80" />
          <h1 className="text-xl font-bold text-white">Article Not Found</h1>
          <p className="text-xs text-gray-400">
            This article may have been unpublished or moved.
          </p>
          <Link href="/blog">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Knowledge Hub
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const paragraphs = post.content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href="/blog"
          className="inline-flex items-center text-xs font-semibold text-gray-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to all articles
        </Link>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs font-bold px-3 py-1">
              {post.category}
            </Badge>
            {post.publishedAt && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {new Date(post.publishedAt).toLocaleDateString('en-IN')}
              </span>
            )}
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between py-4 border-y border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-sm font-bold text-emerald-300">
                {post.author.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  {post.author.name} <UserCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xs text-gray-400">{post.author.role}</div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="rounded-xl text-xs gap-1.5 border-white/10 text-gray-200 hover:bg-white/5"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </Button>
          </div>
        </div>

        <article className="space-y-6 text-gray-300 text-base leading-relaxed bg-[#111111] p-8 sm:p-12 rounded-3xl border border-white/10 shadow-sm">
          {post.excerpt && (
            <p className="text-lg font-medium text-white leading-relaxed border-l-4 border-emerald-500 pl-4">
              {post.excerpt}
            </p>
          )}

          {paragraphs.map((block, index) => {
            if (block.startsWith('## ')) {
              return (
                <h2 key={index} className="text-2xl font-bold text-white pt-4">
                  {block.replace(/^##\s+/, '')}
                </h2>
              );
            }
            if (block.startsWith('### ')) {
              return (
                <h3 key={index} className="text-xl font-semibold text-white pt-2">
                  {block.replace(/^###\s+/, '')}
                </h3>
              );
            }
            return <p key={index}>{block}</p>;
          })}

          <div className="mt-10 p-6 rounded-2xl bg-[#161616] text-white border border-white/10 text-center space-y-4">
            <h3 className="text-xl font-bold">Need Custom Tax Advisory for Your Business?</h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto">
              Connect with verified Chartered Accountants on TaxMate to optimize your tax planning and compliance.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/find-ca">
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl">
                  Find Verified CAs
                </Button>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
