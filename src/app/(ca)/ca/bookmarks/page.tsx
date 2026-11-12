"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Trash2, Loader2, ExternalLink, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BookmarkedCA {
  id: string;
  slug?: string;
  name: string;
  firm?: string;
  location?: string;
  specializations?: string[];
}

export default function CABookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedCA[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/bookmarks', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load bookmarks');
      setBookmarks(Array.isArray(json.bookmarks) ? json.bookmarks : []);
    } catch (err: any) {
      toast.error(err?.message || 'Unable to load bookmarks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const handleRemove = async (caId: string) => {
    try {
      const res = await fetch(`/api/bookmarks?caId=${encodeURIComponent(caId)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to remove bookmark');
      setBookmarks((prev) => prev.filter((b) => b.id !== caId));
      toast.success('Removed bookmark');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove bookmark');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-lime-500" /> Bookmarked &amp; Saved Items
          </h1>
          <p className="text-sm text-slate-400">Quick access to saved specialist CAs and practice resources</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadBookmarks} className="border-slate-800 bg-slate-900 text-slate-300">
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Link href="/find-ca">
            <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold">
              Browse Directory
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-lime-500" /> Loading bookmarks...
        </div>
      ) : bookmarks.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 p-10 text-center space-y-3">
          <Bookmark className="w-8 h-8 text-lime-500 mx-auto opacity-80" />
          <h2 className="text-base font-semibold text-slate-100">No Saved Bookmarks Yet</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Save specialist Chartered Accountants or collaborators from the TaxMate directory for quick reference.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bookmarks.map((b) => (
            <Card key={b.id} className="bg-slate-900 border-slate-800 p-5 space-y-3 hover:border-lime-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-lime-400 bg-lime-600/10 border border-lime-500/20 px-2.5 py-1 rounded-full">
                  Specialist CA
                </span>
                <Button variant="ghost" size="icon" onClick={() => handleRemove(b.id)} aria-label="Remove bookmark" className="h-7 w-7 text-slate-400 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">{b.name}</h3>
                {b.firm && <p className="text-xs text-slate-400">{b.firm}</p>}
                {b.location && <p className="text-xs text-slate-500 mt-1">{b.location}</p>}
              </div>
              <Link href={`/ca/${b.slug || b.id}`} className="inline-flex items-center text-xs text-lime-400 hover:underline gap-1 pt-1">
                Open Profile <ExternalLink className="w-3 h-3" />
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
