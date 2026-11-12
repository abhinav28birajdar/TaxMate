"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublicCA {
  id: string;
  slug: string;
  name: string;
  designation: string;
  firm: string;
  location: string;
  city: string;
  state: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  consultationFee: number;
  avatarUrl: string | null;
  specializations: string[];
  verified: boolean;
}

function getInitials(name: string) {
  return name
    .replace(/^CA\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

export default function FindCAPage() {
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedSpec, setSelectedSpec] = useState("all");
  const [cas, setCas] = useState<PublicCA[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCAs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cas?limit=50");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Unable to load Chartered Accountants directory.");
      }
      setCas(Array.isArray(json.cas) ? json.cas : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load CA directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCAs();
  }, []);

  const cities = useMemo(() => {
    const unique = new Set<string>();
    for (const ca of cas) {
      const city = ca.city || ca.location;
      if (city && city !== "India") unique.add(city);
    }
    return Array.from(unique).sort();
  }, [cas]);

  const specs = useMemo(() => {
    const unique = new Set<string>();
    for (const ca of cas) {
      for (const s of ca.specializations || []) {
        if (s) unique.add(s);
      }
    }
    return Array.from(unique).sort();
  }, [cas]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cas.filter((c) => {
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.firm.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        (c.specializations || []).some((s) => s.toLowerCase().includes(q));
      const matchesCity =
        selectedCity === "all" ||
        (c.city || "").toLowerCase() === selectedCity.toLowerCase() ||
        c.location.toLowerCase().includes(selectedCity.toLowerCase());
      const matchesSpec =
        selectedSpec === "all" ||
        (c.specializations || []).some((s) => s.toLowerCase().includes(selectedSpec.toLowerCase()));
      return matchesSearch && matchesCity && matchesSpec;
    });
  }, [cas, search, selectedCity, selectedSpec]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
      <div className="absolute top-0 left-1/3 w-[500px] h-[350px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> ICAI Verified Practitioners
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Find &amp; Hire a Chartered Accountant.
          </h1>
          <p className="text-base text-gray-400 font-light">
            Search verified tax practitioners across India by city, specialization, and live client ratings.
          </p>
        </div>

        <div className="bg-[#111111] p-4 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by CA name, firm, city, or specialization (e.g. GST, Income Tax)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#181818] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              aria-label="Filter by city"
              className="bg-[#181818] border border-white/10 text-gray-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              value={selectedSpec}
              onChange={(e) => setSelectedSpec(e.target.value)}
              aria-label="Filter by practice area"
              className="bg-[#181818] border border-white/10 text-gray-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Practice Areas</option>
              {specs.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
            <p className="text-xs">Loading verified Chartered Accountants...</p>
          </div>
        ) : error ? (
          <div className="bg-[#111111] border border-red-500/30 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto">
            <p className="text-sm text-red-300">{error}</p>
            <Button onClick={loadCAs} variant="outline" size="sm" className="border-white/10 text-white rounded-xl">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-10 text-center space-y-4">
            <Users className="w-10 h-10 text-emerald-400 mx-auto opacity-80" />
            <h2 className="text-lg font-bold text-white">No matching Chartered Accountants found</h2>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Try clearing your filters or sign up as a practicing CA to appear in the verified TaxMate directory.
            </p>
            {(search || selectedCity !== "all" || selectedSpec !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setSelectedCity("all");
                  setSelectedSpec("all");
                }}
                className="border-white/10 text-gray-200 rounded-xl"
              >
                Reset Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((ca) => (
              <div
                key={ca.id}
                className="bg-[#111111] border border-white/10 hover:border-emerald-500/40 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-2xl transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      {ca.avatarUrl ? (
                        <img
                          src={ca.avatarUrl}
                          alt={ca.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-lg">
                          {getInitials(ca.name)}
                        </div>
                      )}
                      {ca.verified && (
                        <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-base text-white group-hover:text-emerald-400 transition-colors">
                        {ca.name}
                      </h3>
                      <p className="text-xs text-gray-400">{ca.designation}</p>
                      <p className="text-xs text-gray-400">{ca.firm}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 pt-0.5">
                        <span className="flex items-center gap-1 text-gray-300">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {ca.location}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-emerald-500" />{" "}
                          {ca.rating > 0 ? ca.rating.toFixed(1) : "New"} ({ca.reviewsCount})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(ca.specializations || []).slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] text-gray-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Consultation Fee</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      ₹{Number(ca.consultationFee || 0).toLocaleString("en-IN")}{" "}
                      <span className="text-[10px] text-gray-400 font-normal">/ session</span>
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/ca/${ca.slug || ca.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl"
                      >
                        View Profile
                      </Button>
                    </Link>
                    <Link href={`/client/hire/${ca.id}`}>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_15px_rgba(5,150,105,0.3)]"
                      >
                        Hire / Book
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
