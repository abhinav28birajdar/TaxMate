'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Star, Plus, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ReviewItem {
  id: string;
  caId: string;
  caName: string;
  firmName?: string;
  rating: number;
  title?: string | null;
  comment: string;
  date: string;
  isVerified: boolean;
}

interface CaOption {
  id: string;
  name: string;
  firm: string;
}

export default function ClientReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [cas, setCas] = useState<CaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedCaId, setSelectedCaId] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [revRes, caRes] = await Promise.all([
        fetch('/api/reviews', { credentials: 'include' }),
        fetch('/api/cas', { credentials: 'include' }),
      ]);

      if (revRes.ok) {
        const revJson = await revRes.json();
        setReviews(revJson.reviews || []);
      }

      if (caRes.ok) {
        const caJson = await caRes.json();
        const list: CaOption[] = (caJson.cas || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          firm: c.firm,
        }));
        setCas(list);
        if (list.length > 0 && !selectedCaId) {
          setSelectedCaId(list[0].id);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Unable to load reviews');
    } finally {
      setLoading(false);
    }
  }, [selectedCaId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaId || !comment.trim()) {
      toast.error('Please choose a CA and write your review.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          caId: selectedCaId,
          rating,
          title: title.trim() || undefined,
          comment: comment.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Could not save review');
      }

      toast.success('Thank you! Your review has been published.');
      setDrawerOpen(false);
      setTitle('');
      setComment('');
      setRating(5);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Review submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="w-6 h-6 text-lime-600 fill-lime-600" /> My Feedback & CA Reviews
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review ratings and feedback submitted for your Chartered Accountants.
          </p>
        </div>
        <Button
          onClick={() => setDrawerOpen(true)}
          className="bg-lime-600 hover:bg-lime-500 text-white font-semibold text-xs shadow-md shadow-lime-600/20"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Rate a CA
        </Button>
      </div>

      {loading ? (
        <div className="py-12 flex items-center justify-center text-slate-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-lime-500" /> Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2">
          <Star className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No reviews submitted yet</h3>
          <p className="text-xs text-slate-500">
            Share feedback on your Chartered Accountant&apos;s tax filing, responsiveness, and advisory quality.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  {r.caName}
                  {r.isVerified && <ShieldCheck className="w-4 h-4 text-lime-600" />}
                </h4>
                <div className="flex text-lime-500">
                  {[...Array(Math.min(5, Math.max(1, r.rating)))].map((_, idx) => (
                    <Star key={idx} className="w-3.5 h-3.5 fill-lime-500" />
                  ))}
                </div>
              </div>
              {r.title && (
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{r.title}</p>
              )}
              <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                &ldquo;{r.comment}&rdquo;
              </p>
              <span className="text-[10px] text-slate-400 font-semibold block">{r.date}</span>
            </div>
          ))}
        </div>
      )}

      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Your Chartered Accountant</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Your review helps clients choose trusted Chartered Accountants on TaxMate.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitReview} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Select CA</label>
              <select
                value={selectedCaId}
                onChange={(e) => setSelectedCaId(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-md bg-slate-950 border border-slate-800 text-xs text-white"
              >
                {cas.length === 0 ? (
                  <option value="">No CAs found</option>
                ) : (
                  cas.map((ca) => (
                    <option key={ca.id} value={ca.id}>
                      {ca.name} — {ca.firm}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Star Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= rating ? 'fill-lime-400 text-lime-400' : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Summary Headline</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g. Smooth ITR-2 filing experience"
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Detailed Review *</label>
              <textarea
                required
                rows={4}
                minLength={5}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share what worked well regarding timeliness, clarity, and tax savings..."
                className="w-full p-3 rounded-md bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-lime-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || !selectedCaId}
                className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
