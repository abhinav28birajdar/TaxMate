'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Star, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CAReviewRow {
  id: string;
  clientName: string;
  rating: number;
  title?: string | null;
  comment: string;
  date: string;
  isVerified: boolean;
}

export default function CAReviewsPage() {
  const [reviews, setReviews] = useState<CAReviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reviews', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load reviews');
      setReviews(json.reviews || []);
    } catch (err: any) {
      toast.error(err.message || 'Unable to load reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const avgRating =
    reviews.length > 0
      ? Number(
          (reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / reviews.length).toFixed(1)
        )
      : 0;
  const verifiedCount = reviews.filter((r) => r.isVerified).length;
  const fiveStarCount = reviews.filter((r) => r.rating >= 5).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="w-6 h-6 text-lime-600 fill-lime-600" /> Client Reviews & Reputation
            Ratings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Verified client feedback and marketplace practice ratings.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadReviews} className="text-xs">
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-lime-600/10 border border-lime-600/20 rounded-2xl flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-lime-600 text-white font-black flex items-center justify-center text-xl shadow-md shadow-lime-600/30">
            {avgRating > 0 ? avgRating : '—'}
          </div>
          <div>
            <div className="flex text-lime-600 dark:text-lime-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.round(avgRating) ? 'fill-lime-500 text-lime-500' : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {reviews.length} Total Review(s)
            </span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Verified Client Reviews</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {verifiedCount}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">5-Star Ratings</span>
          <div className="text-2xl font-extrabold text-lime-600 dark:text-lime-400 mt-1">
            {fiveStarCount}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Verification Status</span>
          <div className="text-sm font-extrabold text-lime-600 dark:text-lime-400 flex items-center gap-1.5 mt-2">
            <ShieldCheck className="w-4 h-4" /> ICAI Directory Enabled
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center">
          <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading feedback...
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center text-xs text-slate-400 italic">
          No client reviews received yet. When your clients rate their experience, feedback will appear here.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-lime-600/20 text-lime-600 font-bold flex items-center justify-center text-sm border border-lime-500/30">
                    {r.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                      {r.clientName}
                      {r.isVerified && <ShieldCheck className="w-4 h-4 text-lime-600" />}
                    </h4>
                    {r.title && <p className="text-xs text-slate-400">{r.title}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(Math.min(5, Math.max(1, r.rating)))].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-lime-500 text-lime-500" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{r.date}</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                &ldquo;{r.comment}&rdquo;
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
