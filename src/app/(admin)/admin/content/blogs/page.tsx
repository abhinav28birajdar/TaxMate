'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Plus, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminBlogsEditorPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('GST & Indirect Tax');
  const [tags, setTags] = useState('GST, Income Tax, Compliance');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/blogs?includeUnpublished=true', { credentials: 'include' });
      const json = await res.json();
      if (res.ok && json.success) {
        setPosts(Array.isArray(json.posts) ? json.posts : []);
      }
    } catch {
      toast.error('Unable to load blog posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || content.trim().length < 20) {
      toast.error('Please enter a title and at least 20 characters of article content.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          category,
          tags,
          excerpt: excerpt.trim(),
          content: content.trim(),
          published,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to save article');
      setTitle('');
      setExcerpt('');
      setContent('');
      toast.success(published ? 'Article published to Knowledge Hub!' : 'Draft saved!');
      await loadPosts();
    } catch (err: any) {
      toast.error(err?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentPublished: boolean) => {
    try {
      const res = await fetch('/api/blogs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, published: !currentPublished }),
      });
      if (!res.ok) throw new Error('Update failed');
      await loadPosts();
      toast.success('Publication status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/blogs?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Delete failed');
      await loadPosts();
      toast.success('Article deleted');
    } catch {
      toast.error('Failed to delete article');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/content">
          <Button variant="outline" size="icon" className="border-slate-800 bg-slate-900 text-slate-300">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-lime-500" /> TaxMate Knowledge Hub CMS
          </h1>
          <p className="text-sm text-slate-400">Compose and publish tax regulatory articles directly to `/blog`</p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6">
        <form onSubmit={handleCreate} className="space-y-4">
          <h2 className="font-semibold text-slate-100 text-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-lime-400" /> Author New Article
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              required
              placeholder="Article Headline *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="md:col-span-2 bg-slate-950 border-slate-800 text-slate-100"
            />
            <Input
              placeholder="Category (e.g. GST & Indirect Tax)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-950 border-slate-800 text-slate-100"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Short summary / excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="bg-slate-950 border-slate-800 text-slate-100"
            />
            <Input
              placeholder="Comma-separated tags (e.g. GST, Section 115BAC)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="bg-slate-950 border-slate-800 text-slate-100"
            />
          </div>
          <textarea
            rows={6}
            required
            placeholder="Write article body (use blank lines for paragraphs and ## for headings)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-100"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
              Publish immediately on `/blog`
            </label>
            <Button type="submit" disabled={submitting} className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold">
              {submitting ? 'Saving...' : published ? 'Publish Article' : 'Save Draft'}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-3">
        <h2 className="font-semibold text-slate-100 text-sm">All Articles ({posts.length})</h2>
        {loading ? (
          <div className="py-10 flex justify-center text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-lime-500" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-xs text-slate-400">No articles created yet.</p>
        ) : (
          posts.map((p) => (
            <div key={p.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-100 text-sm">{p.title}</span>
                  <Badge className={p.published ? 'bg-lime-600/20 text-lime-400 text-[10px]' : 'bg-slate-800 text-slate-400 text-[10px]'}>
                    {p.published ? 'LIVE' : 'DRAFT'}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Slug: /blog/{p.slug} • {p.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => handleToggle(p.id, p.published)} className="border-slate-700 text-lime-400 text-xs h-7">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {p.published ? 'Draft' : 'Publish'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)} className="text-red-400 h-7">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
