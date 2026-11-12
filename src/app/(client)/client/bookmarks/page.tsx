'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Star, ShieldCheck, ArrowRight, Trash2, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BookmarkedCA {
  caId: string;
  name: string;
  firm: string;
  exp: string;
  rating: number;
  spec: string;
  location?: string;
  fee?: string;
}

export default function ClientBookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedCA[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/bookmarks', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to load bookmarks');
      }
      setBookmarks(json.bookmarks || []);
    } catch (err: any) {
      toast.error(err.message || 'Could not load saved bookmarks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const handleRemove = async (caId: string) => {
    try {
      setRemovingId(caId);
      const res = await fetch(`/api/bookmarks?caId=${encodeURIComponent(caId)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Failed to remove bookmark');
      }
      setBookmarks((prev) => prev.filter((b) => b.caId !== caId));
      toast.success('Removed CA from bookmarks');
    } catch (err: any) {
      toast.error(err.message || 'Could not remove bookmark');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-lime-600" /> Bookmarked Chartered Accountants
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Saved CA profiles for quick consultation booking and tax advisory requests.
          </p>
        </div>
        <Link href="/client/find-ca/search">
          <Button variant="outline" size="sm" className="text-xs">
            <Search className="w-3.5 h-3.5 mr-1.5" /> Browse CA Directory
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="py-16 flex items-center justify-center text-slate-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-lime-500" /> Loading saved bookmarks...
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No bookmarked CAs yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Browse our verified Chartered Accountants directory and click the bookmark icon to shortlist practitioners here.
          </p>
          <Link href="/client/find-ca/search" className="inline-block pt-2">
            <Button className="bg-lime-600 hover:bg-lime-500 text-white text-xs font-semibold">
              Find Chartered Accountants
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookmarks.map((b) => (
            <div
              key={b.caId}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-1.5">
                    {b.name} <ShieldCheck className="w-4 h-4 text-lime-600" />
                  </h3>
                  <p className="text-xs text-slate-400">
                    {b.firm} • {b.exp}
                  </p>
                </div>
                <div className="flex items-center text-xs font-bold text-slate-900 dark:text-white">
                  <Star className="w-4 h-4 fill-lime-500 text-lime-500 mr-1" /> {b.rating}
                </div>
              </div>

              <div className="text-xs font-semibold text-lime-600 dark:text-lime-400">
                Specialization: {b.spec}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={removingId === b.caId}
                  onClick={() => handleRemove(b.caId)}
                  className="text-xs text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                </Button>
                <div className="flex items-center gap-2">
                  <Link href={`/client/find-ca/${b.caId}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      Profile
                    </Button>
                  </Link>
                  <Link href={`/client/hire/${b.caId}`}>
                    <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-white font-semibold text-xs">
                      Hire / Proposal <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
