/**
 * LOADING STATES & SKELETON COMPONENTS
 * Provides consistent loading UI across the application
 * 
 * Created: 2026-04-08
 */

'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ============================================================================
// LOADING SPINNERS
// ============================================================================

/**
 * Centered page loader
 */
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="space-y-4 text-center">
        <div className="inline-block">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin"></div>
          </div>
        </div>
        <p className="text-sm text-slate-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Small inline loader
 */
export function Loader({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-4 h-4">
        <div className="absolute inset-0 rounded-full border-2 border-slate-200"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary animate-spin"></div>
      </div>
      {text && <span className="text-sm text-slate-600">{text}</span>}
    </div>
  );
}

/**
 * Button loader state
 */
export function ButtonLoader() {
  return (
    <div className="flex items-center gap-2 h-4">
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
}

// ============================================================================
// SKELETON LOADERS
// ============================================================================

/**
 * Card skeleton
 */
export function CardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

/**
 * Table skeleton
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Dashboard skeleton
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-3 h-80">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-full" />
          </div>
        ))}
      </div>

      {/* List */}
      <div className="p-4 border rounded-lg space-y-3">
        <Skeleton className="h-4 w-1/3 mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * Profile skeleton
 */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Avatar & Name */}
      <div className="flex gap-4 items-center">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

/**
 * List skeleton
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 p-3 border rounded-lg">
          <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="w-16 h-8" />
        </div>
      ))}
    </div>
  );
}

/**
 * Chat skeleton
 */
export function ChatSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={cn('flex gap-2', i % 2 === 0 ? 'justify-end' : 'justify-start')}>
          {i % 2 === 0 ? null : <Skeleton className="w-8 h-8 rounded-full" />}
          <Skeleton className={cn('h-12 rounded-lg', i % 2 === 0 ? 'w-1/2' : 'w-2/3')} />
        </div>
      ))}
    </div>
  );
}

/**
 * Form skeleton
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-full mt-6" />
    </div>
  );
}

// ============================================================================
// SHIMMER LOADING EFFECT
// ============================================================================

/**
 * Shimmer effect component
 */
export function ShimmerLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-12 bg-slate-200 rounded mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>
    </div>
  );
}

// ============================================================================
// PROGRESS & STATUS
// ============================================================================

/**
 * Upload progress bar
 */
export function UploadProgress({
  progress = 0,
  fileName,
}: {
  progress?: number;
  fileName?: string;
}) {
  return (
    <div className="space-y-2 w-full">
      {fileName && <p className="text-sm text-slate-600 truncate">{fileName}</p>}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
      </div>
      <p className="text-xs text-slate-500 text-right">{Math.round(progress)}%</p>
    </div>
  );
}

/**
 * Status badge with activity indicator
 */
export function ActivityIndicator({
  active = true,
  size = 'md',
}: {
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div className={cn('rounded-full', sizeClasses[size], active ? 'bg-green-500 animate-pulse' : 'bg-slate-300')}></div>
      <span className="text-xs text-slate-600">{active ? 'Active' : 'Inactive'}</span>
    </div>
  );
}

// ============================================================================
// LAZY LOADING WRAPPER
// ============================================================================

/**
 * Generic lazy load component
 */
export function LazyLoad({
  isLoading,
  children,
  skeleton = <CardSkeleton />,
  error,
}: {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  error?: string;
}) {
  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-red-700">
        <p className="font-medium">Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return <>{skeleton}</>;
  }

  return <>{children}</>;
}

/**
 * Skeleton with success state
 */
export function LoadingState({
  loading,
  success,
  error,
  children,
  skeleton,
  errorMessage,
}: {
  loading: boolean;
  success: boolean;
  error: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  errorMessage?: string;
}) {
  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-red-700 text-center">
        <p className="font-medium">Something went wrong</p>
        {errorMessage && <p className="text-sm mt-1">{errorMessage}</p>}
      </div>
    );
  }

  if (loading && !success) {
    return skeleton || <CardSkeleton />;
  }

  if (success) {
    return <div className="animate-in fade-in">{children}</div>;
  }

  return null;
}
