'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Star,
  MapPin,
  Building2,
  CheckCircle2,
  ArrowLeft,
  Send,
  Bookmark,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface CAProfileDetail {
  id: string;
  name: string;
  membershipNo: string;
  firm: string;
  location: string;
  experience: string;
  rating: number;
  reviewsCount: number;
  bio: string;
  specializations: string[];
  fee: string;
  languages: string[];
  services: Array<{ name: string; price: string; tat: string }>;
  reviews: Array<{ author: string; rating: number; date: string; comment: string }>;
}

export default function ClientCADetailPage() {
  const params = useParams<{ id: string }>();
  const caId = params?.id || '';
  const router = useRouter();

  const [ca, setCa] = useState<CAProfileDetail | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!caId) return;
    try {
      setLoading(true);
      setError(null);
      const [caRes, bmRes] = await Promise.all([
        fetch(`/api/cas?id=${encodeURIComponent(caId)}`, { credentials: 'include' }),
        fetch('/api/bookmarks', { credentials: 'include' }).catch(() => null),
      ]);

      const caJson = await caRes.json();
      if (!caRes.ok || !caJson.ca) {
        throw new Error(caJson.error || 'Chartered Accountant profile not found');
      }
      setCa(caJson.ca);

      if (bmRes && bmRes.ok) {
        const bmJson = await bmRes.json();
        const ids: string[] = bmJson.bookmarkedIds || [];
        setBookmarked(ids.includes(caJson.ca.id));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load CA profile');
    } finally {
      setLoading(false);
    }
  }, [caId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const toggleBookmark = async () => {
    if (!ca) return;
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ caId: ca.id, action: 'toggle' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to toggle bookmark');
      setBookmarked(Boolean(json.bookmarked));
      toast.success(json.bookmarked ? 'CA bookmarked' : 'Removed from bookmarks');
    } catch (err: any) {
      toast.error(err.message || 'Bookmark update failed');
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2 text-lime-500" /> Loading practitioner profile...
      </div>
    );
  }

  if (error || !ca) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="border-slate-800 text-slate-300">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Card className="bg-slate-900 border-rose-500/30 p-8 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-slate-200 font-semibold">{error || 'CA Profile not found'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="border-slate-800 bg-slate-900 text-slate-300"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              {ca.name} <ShieldCheck className="w-5 h-5 text-lime-400" />
            </h1>
            <p className="text-sm text-slate-400 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" /> {ca.firm} | {ca.membershipNo}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={toggleBookmark}
          className="border-slate-800 text-slate-200 hover:bg-slate-800 self-start sm:self-auto"
        >
          <Bookmark className={`w-4 h-4 mr-2 ${bookmarked ? 'fill-lime-400 text-lime-400' : ''}`} />
          {bookmarked ? 'Bookmarked' : 'Save Bookmark'}
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm border-b border-slate-800 pb-6">
          <div>
            <span className="text-slate-400 text-xs block">Experience</span>
            <span className="font-semibold text-slate-100">{ca.experience}</span>
          </div>
          <div>
            <span className="text-slate-400 text-xs block">Location</span>
            <span className="font-semibold text-slate-100 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-lime-500" /> {ca.location}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-xs block">Rating</span>
            <span className="font-bold text-lime-400 flex items-center gap-1">
              <Star className="w-4 h-4 fill-lime-400" /> {ca.rating} ({ca.reviewsCount} reviews)
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-xs block">Consultation Rate</span>
            <span className="font-bold text-slate-100">{ca.fee}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-semibold text-slate-100">About Practitioner</h3>
          <p className="text-slate-300 text-sm leading-relaxed">{ca.bio}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-semibold text-slate-100">Specializations</h3>
          <div className="flex flex-wrap gap-2">
            {ca.specializations.map((s, idx) => (
              <Badge key={idx} className="bg-slate-800 text-lime-400 border-slate-700 py-1 px-3">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {s}
              </Badge>
            ))}
          </div>
        </div>

        {ca.services?.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-slate-100">Services Offered</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ca.services.map((srv, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-100">{srv.name}</p>
                    <p className="text-xs text-slate-500">Turnaround: {srv.tat}</p>
                  </div>
                  <span className="text-sm font-bold text-lime-400">{srv.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {ca.reviews?.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-slate-100">Client Reviews</h3>
            <div className="space-y-2">
              {ca.reviews.slice(0, 5).map((rev, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{rev.author}</span>
                    <span className="text-xs text-lime-400 font-bold">{rev.rating} ★ • {rev.date}</span>
                  </div>
                  <p className="text-xs text-slate-400 italic">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Link href={`/client/hire/${ca.id}`}>
            <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2 py-5 px-6">
              <Send className="w-4 h-4" /> Send Engagement Hire Request
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
