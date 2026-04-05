'use client';

import React from 'react';
import CACard from './ca-card';
import { CAProfileWithServices } from '@/types/ca.types';
import { AlertCircle } from 'lucide-react';

interface CAListProps {
    cas: CAProfileWithServices[];
    isLoading?: boolean;
}

export default function CAList({ cas, isLoading }: CAListProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-[300px] w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (cas.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed">
                <AlertCircle className="w-12 h-12 text-slate-400" />
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold">No experts found</h3>
                    <p className="text-slate-500 max-w-sm">
                        Try adjusting your filters or search for a different specialization.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cas.map((ca) => (
                <CACard key={ca.id} ca={ca} />
            ))}
        </div>
    );
}
