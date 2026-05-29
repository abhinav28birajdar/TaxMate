'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-12 w-1/2 bg-slate-800 rounded-none" />
          <Skeleton className="h-4 w-3/4 bg-slate-800 rounded-none" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-900 border border-primary/10 p-6 rounded-none space-y-3">
              <Skeleton className="h-4 w-32 bg-slate-800" />
              <Skeleton className="h-8 w-20 bg-slate-800" />
              <Skeleton className="h-3 w-24 bg-slate-800" />
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="bg-slate-900 border border-primary/10 p-6 rounded-none space-y-4">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-6 w-40 bg-slate-800" />
            <Skeleton className="h-10 w-32 bg-slate-800 rounded-none" />
          </div>

          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-none"
            >
              <Skeleton className="h-12 w-12 rounded-none bg-slate-700" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-slate-700" />
                <Skeleton className="h-3 w-1/2 bg-slate-700" />
              </div>
              <Skeleton className="h-6 w-20 bg-slate-700" />
            </div>
          ))}
        </div>
      </div>

      {/* Animated loader indicator */}
      <div className="fixed bottom-8 right-8 flex items-center gap-3">
        <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
        <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">
          Loading...
        </p>
      </div>
    </div>
  );
}
