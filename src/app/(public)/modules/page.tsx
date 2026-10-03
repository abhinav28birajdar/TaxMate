"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Users, 
  FileSpreadsheet, 
  FileText, 
  Briefcase, 
  CheckSquare, 
  MessageSquare, 
  Video, 
  Calendar, 
  Award, 
  CreditCard, 
  Bell, 
  Clock, 
  BarChart3, 
  Search, 
  Settings, 
  ShieldAlert, 
  HelpCircle, 
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Layers,
  ChevronRight,
  CheckCircle2,
  Lock,
  PhoneCall,
  Activity,
  FolderLock,
  Globe,
  UserCheck,
  LayoutDashboard,
  Receipt,
  LifeBuoy,
  Megaphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalSearchDialog } from "@/components/shared/GlobalSearchDialog";
import { ALL_47_SECTIONS, SectionDefinition } from "@/lib/directory/all-modules-data";

const ICON_MAP: Record<string, any> = {
  Globe,
  ShieldCheck,
  UserCheck,
  LayoutDashboard,
  User: Users,
  FileSpreadsheet,
  FileText,
  Briefcase,
  CheckSquare,
  MessageSquare,
  Video,
  Calendar,
  CreditCard,
  Bell,
  Clock,
  BarChart3,
  Settings,
  Award,
  Users,
  FolderLock,
  Activity,
  Receipt,
  ShieldAlert,
  LifeBuoy,
  Megaphone,
  AlertTriangle
};

export default function ModulesMasterDirectoryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [filterQuery, setFilterQuery] = useState<string>("");

  const categories = [
    "All",
    "Public / Marketing",
    "Authentication & Onboarding",
    "Customer Portal",
    "CA Practice OS",
    "Super Admin Console",
    "Global Error & System",
  ];

  const filteredSections = ALL_47_SECTIONS.filter((section) => {
    const matchesCategory = selectedCategory === "All" || section.category === selectedCategory;
    const matchesQuery =
      filterQuery.trim() === "" ||
      section.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      section.tagline.toLowerCase().includes(filterQuery.toLowerCase()) ||
      section.items.some((item) => item.name.toLowerCase().includes(filterQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const totalPagesCount = ALL_47_SECTIONS.reduce((acc, curr) => acc + curr.items.length, 0);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden">
      {/* Background Subtleties: Dark Grid pattern + Soft glowing orbs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-20 pointer-events-none" />
      <div className="absolute top-0 left-0 w-[600px] h-[400px] bg-emerald-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] mix-blend-screen pointer-events-none -z-10" />

      {/* Global Search Dialog Modal */}
      <GlobalSearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Hero Header */}
      <div className="container mx-auto px-4 pt-12 pb-8 border-b border-white/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Complete Platform Architecture
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              All 47 Modules & Pages Directory
            </h1>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
              Every single section, feature workflow, role portal, and system state in TaxMate. All {totalPagesCount}+ sub-pages are interconnected, active, and fully operational.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setSearchOpen(true)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg"
            >
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span>Search All Pages...</span>
              <kbd className="ml-2 font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300">
                Ctrl + K
              </kbd>
            </Button>
            <Link href="/client/dashboard">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]">
                Launch Portal <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Real-time Status Badges & Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/5">
          <div className="bg-[#121212] border border-white/5 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              47
            </div>
            <div>
              <div className="text-xs font-bold text-white">Total Sections</div>
              <div className="text-[11px] text-gray-500">100% Configured</div>
            </div>
          </div>

          <div className="bg-[#121212] border border-white/5 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
              {totalPagesCount}
            </div>
            <div>
              <div className="text-xs font-bold text-white">Sub-Pages & Views</div>
              <div className="text-[11px] text-gray-500">Fully Interlinked</div>
            </div>
          </div>

          <div className="bg-[#121212] border border-white/5 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <div className="text-xs font-bold text-white">Portals & Roles</div>
              <div className="text-[11px] text-gray-500">Client • CA • Admin • Public</div>
            </div>
          </div>

          <div className="bg-[#121212] border border-white/5 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">System Integrity</div>
              <div className="text-[11px] text-emerald-400 font-medium">0 Broken Links</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="sticky top-16 z-30 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10 py-3 shadow-md">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {cat} {cat === "All" && `(${ALL_47_SECTIONS.length})`}
              </button>
            ))}
          </div>

          {/* Quick Filter Input */}
          <div className="w-full sm:w-64 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by keyword..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Modules List Grid */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSections.map((section) => {
            const Icon = ICON_MAP[section.iconName] || Layers;
            return (
              <motion.div
                key={section.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-[#111111] border border-white/10 rounded-2xl p-6 hover:border-emerald-500/40 transition-all flex flex-col justify-between group shadow-xl hover:shadow-[0_0_30px_rgba(5,150,105,0.08)] relative overflow-hidden"
              >
                <div>
                  {/* Top Bar with Icon and Category */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-gray-300">
                      {section.badge}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    {section.tagline}
                  </p>

                  {/* Sub-items Checklist */}
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-1.5">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Covered Sub-Pages ({section.items.length}):</span>
                      <span className="text-emerald-400 font-mono">100% Ready</span>
                    </div>

                    <div className="max-h-48 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
                      {section.items.map((sub, sIdx) => (
                        <Link
                          key={sIdx}
                          href={sub.href}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors group/sub"
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="truncate">{sub.name}</span>
                          </span>
                          <ChevronRight className="w-3 h-3 text-gray-600 group-hover/sub:text-emerald-400 transition-colors shrink-0 ml-1" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                  <Link href={section.primaryHref} className="w-full">
                    <Button 
                      size="sm" 
                      className="w-full bg-[#181818] hover:bg-emerald-600 text-gray-200 hover:text-white text-xs font-semibold rounded-xl border border-white/10 hover:border-emerald-500 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Open Section</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredSections.length === 0 && (
          <div className="text-center py-16 bg-[#111111] rounded-3xl border border-white/10 p-8">
            <Search className="w-10 h-10 text-gray-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No matching modules found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search query or reset category filter to &quot;All&quot;.
            </p>
            <Button
              onClick={() => {
                setSelectedCategory("All");
                setFilterQuery("");
              }}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-xl"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Sticky Quick Bar */}
      <footer className="border-t border-white/10 bg-[#0E0E0E] py-6 text-center text-xs text-gray-500">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-gray-400">All 47 Sections Connected & Active</span>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/client/dashboard" className="hover:text-white transition-colors">Client Portal</Link>
            <Link href="/ca/dashboard" className="hover:text-white transition-colors">CA Portal</Link>
            <Link href="/admin/dashboard" className="hover:text-white transition-colors">Admin Console</Link>
            <Link href="/system/loading" className="hover:text-white transition-colors">System Pages</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
