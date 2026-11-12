'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Star,
  Filter,
  ShieldCheck,
  Award,
  Building2,
  Bookmark,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface CAEntry {
  id: string;
  name: string;
  firm: string;
  location: string;
  city: string;
  experience: string;
  rating: number;
  reviewsCount: number;
  specializations: string[];
  fee: string;
  verified: boolean;
  isAssigned?: boolean;
}

export default function FindCASearchPage() {
  const [query, setQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [specFilter, setSpecFilter] = useState('all');
  const [cas, setCas] = useState<CAEntry[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadDirectory = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (query.trim()) params.set('search', query.trim());
      if (cityFilter !== 'all') params.set('city', cityFilter);
      if (specFilter !== 'all') params.set('spec', specFilter);

      const [caRes, bmRes] = await Promise.all([
        fetch(`/api/cas?${params.toString()}`, { credentials: 'include' }),
        fetch('/api/bookmarks', { credentials: 'include' }).catch(() => null),
      ]);

      if (caRes.ok) {
        const caJson = await caRes.json();
        setCas(caJson.cas || []);
      }

      if (bmRes && bmRes.ok) {
        const bmJson = await bmRes.json();
        setBookmarkedIds(bmJson.bookmarkedIds || []);
      }
    } catch (err: any) {
      toast.error(err.message || 'Unable to load CA directory');
    } finally {
      setLoading(false);
    }
  }, [query, cityFilter, specFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDirectory();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadDirectory]);

  const handleToggleBookmark = async (caId: string) => {
    try {
      setTogglingId(caId);
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ caId, action: 'toggle' }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Could not update bookmark');
      }
      setBookmarkedIds(json.bookmarkedIds || []);
      toast.success(json.bookmarked ? 'CA added to bookmarks' : 'CA removed from bookmarks');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save bookmark');
    } finally {
      setTogglingId(null);
    }
  };

  const cities = Array.from(new Set(cas.map((c) => c.city).filter(Boolean))).sort();
  const specs = Array.from(new Set(cas.flatMap((c) => c.specializations).filter(Boolean))).sort();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Search className="w-6 h-6 text-lime-500" /> Search Verified Chartered Accountants
          </h1>
          <p className="text-sm text-slate-400">
            Filter by specialization, location, ratings, and consultation fee
          </p>
        </div>
        <Link href="/client/bookmarks">
          <Button variant="outline" size="sm" className="border-slate-800 text-slate-300 hover:bg-slate-800">
            <Bookmark className="w-4 h-4 mr-2 text-lime-500" /> Saved Bookmarks ({bookmarkedIds.length})
          </Button>
        </Link>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <Input
              placeholder="Search by CA Name, Firm, Specialization (e.g. GST, Audit)..."
              className="pl-9 bg-slate-950 border-slate-800 text-slate-100"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-md px-3 h-10 text-xs text-slate-200 outline-none"
          >
            <option value="all">All Locations</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <select
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-3 h-10 text-xs text-slate-200 outline-none"
            >
              <option value="all">All Specializations</option>
              {specs.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
            <Button
              type="button"
              onClick={loadDirectory}
              className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-1.5"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="py-16 flex items-center justify-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mr-2 text-lime-500" /> Loading CA directory...
        </div>
      ) : cas.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 p-12 text-center space-y-2">
          <Search className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-200">No Chartered Accountants matched</h3>
          <p className="text-xs text-slate-400">
            Try clearing filters or broadening your search term.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cas.map((ca) => {
            const isBookmarked = bookmarkedIds.includes(ca.id);
            return (
              <Card
                key={ca.id}
                className="bg-slate-900 border-slate-800 p-6 space-y-4 hover:border-lime-500/40 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-100 text-lg">{ca.name}</h3>
                        {ca.verified && <ShieldCheck className="w-4 h-4 text-lime-400 shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {ca.firm}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge className="bg-lime-600/20 text-lime-400 border-lime-500/30 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-lime-400" /> {ca.rating}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={togglingId === ca.id}
                        onClick={() => handleToggleBookmark(ca.id)}
                        className="h-7 w-7 text-slate-400 hover:text-lime-400"
                        title={isBookmarked ? 'Remove bookmark' : 'Save bookmark'}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${isBookmarked ? 'fill-lime-400 text-lime-400' : ''}`}
                        />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 border-y border-slate-800 py-3">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0" /> {ca.location}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <Award className="w-3.5 h-3.5 shrink-0" /> {ca.experience}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {ca.specializations.slice(0, 4).map((s, idx) => (
                      <Badge key={idx} className="bg-slate-800 text-slate-300 text-xs border-slate-700">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span className="font-bold text-lime-400 text-sm">{ca.fee}</span>
                  <Link href={`/client/find-ca/${ca.id}`}>
                    <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold text-xs">
                      View Profile & Hire
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
