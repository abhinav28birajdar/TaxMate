'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Eye, Trash2, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminContentPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/blogs?includeUnpublished=true', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load content');
      setPosts(Array.isArray(json.posts) ? json.posts : []);
    } catch (err: any) {
      toast.error(err?.message || 'Unable to load content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const togglePublish = async (id: string, published: boolean) => {
    try {
      const res = await fetch('/api/blogs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, published: !published }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
      toast.success(!published ? 'Article published' : 'Article moved to drafts');
      await loadContent();
    } catch (err: any) {
      toast.error(err?.message || 'Update failed');
    }
  };

  const deletePost = async (id: string) => {
    try {
      const res = await fetch(`/api/blogs?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Delete failed');
      toast.success('Article deleted');
      await loadContent();
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-lime-500" /> Content &amp; Editorial Management
          </h1>
          <p className="text-sm text-slate-400">Manage live knowledge hub articles, publishing states, and editorial drafts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadContent} className="border-slate-800 bg-slate-900 text-slate-300">
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Link href="/admin/content/faqs">
            <Button variant="outline" size="sm" className="border-slate-800 bg-slate-900 text-slate-200">
              Manage FAQs
            </Button>
          </Link>
          <Link href="/admin/content/blogs">
            <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-1.5">
              <Plus className="w-4 h-4" /> New Blog Post
            </Button>
          </Link>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        {loading ? (
          <div className="py-12 flex justify-center text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-lime-500" /> Loading CMS articles...
          </div>
        ) : posts.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm text-slate-400">No articles found in `blog_posts`.</p>
            <Link href="/admin/content/blogs">
              <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold">
                Create First Article
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-100 text-sm">{post.title}</h3>
                    <Badge className={post.published ? 'bg-lime-600/20 text-lime-400 text-[10px]' : 'bg-slate-800 text-slate-400 text-[10px]'}>
                      {post.published ? 'PUBLISHED' : 'DRAFT'}
                    </Badge>
                    <Badge variant="outline" className="border-slate-700 text-slate-300 text-[10px]">
                      {post.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{post.excerpt}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/blog/${post.slug}`}>
                    <Button size="sm" variant="outline" className="border-slate-800 text-slate-300 h-8 text-xs">
                      <Eye className="w-3.5 h-3.5 mr-1" /> Preview
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => togglePublish(post.id, post.published)} className="border-slate-800 text-lime-400 h-8 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {post.published ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deletePost(post.id)} className="text-red-400 hover:bg-red-500/10 h-8">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
