"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  Star,
  MapPin,
  Briefcase,
  Award,
  CheckCircle2,
  Calendar,
  Share2,
  FileText,
  Clock,
  Building,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CAServiceItem {
  title: string;
  description: string;
  price: number;
  duration: string;
}

interface CAReviewItem {
  clientName: string;
  company?: string;
  rating: number;
  date: string;
  comment: string;
}

interface PublicCAProfile {
  id: string;
  slug: string;
  name: string;
  designation: string;
  firm: string;
  membershipNo: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  clientsCount?: number;
  consultationFee: number;
  location: string;
  languages: string[];
  qualifications: string[];
  bio: string;
  avatarUrl: string | null;
  verified: boolean;
  specializations: string[];
  services: CAServiceItem[];
  reviews: CAReviewItem[];
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

export default function PublicCAProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params?.username ? decodeURIComponent(String(params.username)) : "";

  const [caData, setCaData] = useState<PublicCAProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      if (!username) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/cas?username=${encodeURIComponent(username)}`);
        const json = await res.json();
        if (!active) return;
        if (!res.ok || !json.success || !json.ca) {
          throw new Error(json.error || "Chartered Accountant profile not found.");
        }
        setCaData(json.ca);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load profile.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadProfile();
    return () => {
      active = false;
    };
  }, [username]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      toast.success("CA Profile link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <p className="text-xs text-gray-400">Loading Chartered Accountant profile...</p>
      </div>
    );
  }

  if (error || !caData) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#111111] border border-white/10 rounded-3xl p-8 text-center space-y-4">
          <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto opacity-80" />
          <h1 className="text-xl font-bold text-white">Practitioner Not Found</h1>
          <p className="text-xs text-gray-400">
            {error || "This Chartered Accountant profile could not be found or is no longer listed."}
          </p>
          <Link href="/find-ca" className="inline-block">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Browse CA Directory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const hireUrl = `/client/hire/${caData.id}`;
  const bookingUrl = `/portal/appointments?ca=${encodeURIComponent(caData.id)}`;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <Link
          href="/find-ca"
          className="inline-flex items-center text-xs font-semibold text-gray-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to CA Directory
        </Link>

        {/* Profile Banner Card */}
        <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
                {caData.avatarUrl ? (
                  <img
                    src={caData.avatarUrl}
                    alt={caData.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500 flex items-center justify-center text-3xl font-bold text-emerald-300">
                    {getInitials(caData.name)}
                  </div>
                )}
                {caData.verified && (
                  <span
                    className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1 rounded-full border-2 border-[#111111] shadow-sm"
                    title="ICAI Verified"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{caData.name}</h1>
                  {caData.verified && (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      ICAI Verified CA
                    </span>
                  )}
                </div>

                <p className="text-sm font-medium text-gray-400">
                  {caData.designation} • <span className="text-gray-200">{caData.firm}</span>
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-1">
                  {caData.membershipNo && (
                    <span className="flex items-center gap-1 font-semibold text-gray-300">
                      <Award className="w-3.5 h-3.5 text-emerald-400" /> ICAI #{caData.membershipNo}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" /> {caData.location}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />{" "}
                    {caData.rating > 0 ? caData.rating.toFixed(1) : "New"} ({caData.reviewsCount} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto">
              <Link href={hireUrl} className="w-full">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)]">
                  Hire for Tax / GST Service
                </Button>
              </Link>
              <div className="flex gap-2">
                <Link href={bookingUrl} className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs rounded-xl border-white/10 text-gray-300 hover:bg-white/5"
                  >
                    <Calendar className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Book Call (₹
                    {Number(caData.consultationFee || 0).toLocaleString("en-IN")})
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  aria-label="Share CA profile"
                  className="rounded-xl border-white/10 px-3 text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="text-center sm:text-left">
              <div className="text-xs text-gray-400">Experience</div>
              <div className="text-lg font-extrabold text-white">{caData.experienceYears}+ Years</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-xs text-gray-400">Qualifications</div>
              <div className="text-sm font-semibold text-white">
                {(caData.qualifications || ["CA"]).join(", ")}
              </div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-xs text-gray-400">Consultation Fee</div>
              <div className="text-lg font-extrabold text-emerald-400">
                ₹{Number(caData.consultationFee || 0).toLocaleString("en-IN")}{" "}
                <span className="text-xs font-normal text-gray-500">/ session</span>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-xs text-gray-400">Languages</div>
              <div className="text-sm font-semibold text-white">
                {(caData.languages || ["English", "Hindi"]).join(", ")}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" /> About Practice &amp; Experience
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                {caData.bio || "Verified Chartered Accountant offering direct tax, GST, and statutory compliance advisory on TaxMate."}
              </p>

              {(caData.specializations || []).length > 0 && (
                <div className="pt-4 space-y-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Practice Specializations</h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {caData.specializations.map((spec) => (
                      <span
                        key={spec}
                        className="bg-white/5 border border-white/10 text-gray-300 text-xs px-3 py-1 rounded-xl flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" /> Standard Services &amp; Transparent Pricing
              </h2>

              {caData.services && caData.services.length > 0 ? (
                <div className="space-y-4">
                  {caData.services.map((svc, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-white/10 bg-[#161616] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-emerald-500/30 transition-all"
                    >
                      <div className="space-y-1 flex-1">
                        <h3 className="text-sm font-bold text-white">{svc.title}</h3>
                        <p className="text-xs text-gray-400">{svc.description}</p>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1 pt-1">
                          <Clock className="w-3 h-3 text-emerald-400" /> Delivery: {svc.duration}
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                        <div className="text-base font-extrabold text-emerald-400">
                          ₹{Number(svc.price || 0).toLocaleString("en-IN")}
                        </div>
                        <Link href={`${hireUrl}?service=${encodeURIComponent(svc.title)}`}>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
                          >
                            Select Service
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">
                  Custom engagement quotes are shared after your initial consultation or hire request.
                </p>
              )}
            </div>

            <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-400" /> Verified Client Reviews ({caData.reviewsCount})
              </h2>

              {caData.reviews && caData.reviews.length > 0 ? (
                <div className="space-y-4">
                  {caData.reviews.map((rev, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-white/5 bg-[#161616] space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">{rev.clientName}</div>
                          {rev.company && <div className="text-[10px] text-gray-400">{rev.company}</div>}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                          <Star className="w-3.5 h-3.5 fill-emerald-500" /> {Number(rev.rating).toFixed(1)}
                        </div>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed italic">&ldquo;{rev.comment}&rdquo;</p>
                      <div className="text-[10px] text-gray-500">{rev.date}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No client reviews published yet for this practitioner.</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#111111] shadow-2xl overflow-hidden">
              <div className="bg-[#161616] border-b border-white/10 p-6">
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" /> Book Direct Consultation
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Schedule an encrypted video consultation inside your TaxMate client portal.
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-3 bg-[#161616] rounded-xl text-xs space-y-1.5 border border-white/5">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Format:</span>
                    <span className="font-semibold text-white">Live Video Consultation</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fee:</span>
                    <span className="font-bold text-emerald-400">
                      ₹{Number(caData.consultationFee || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <Link href={bookingUrl} className="block">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]">
                    Schedule Slot Now
                  </Button>
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#111111] border border-white/10 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-400" /> Practice Location &amp; Coverage
              </h3>

              <div className="space-y-2.5 text-xs text-gray-300">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{caData.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Digital Vault &amp; Remote Advisory Pan-India</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-medium">
                Protected by TaxMate Encrypted Client Vault &amp; Engagement Audit Trail.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
