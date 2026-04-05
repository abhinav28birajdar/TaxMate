'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import CAFilters from '@/components/ca/ca-filters';
import CAList from '@/components/ca/ca-list';
import { CAProfileWithServices } from '@/types/ca.types';
import { createClient } from '@/utils/supabase/client';

// Mock data for initial render
const MOCK_CAS: CAProfileWithServices[] = [
    {
        id: '1',
        user_id: 'u1',
        first_name: 'Rajesh',
        last_name: 'Kumar',
        display_name: 'CA Rajesh Kumar',
        tagline: 'Expert in GST & Corporate Audit',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
        icai_membership_number: 'MRN-102030',
        years_of_experience: 12,
        service_locations: ['Mumbai', 'Pune'],
        average_rating: 4.8,
        total_reviews: 120,
        is_premium: true,
        is_available: true,
        consultation_modes: ['online', 'offline'],
        slug: 'ca-rajesh-kumar',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        badges: ['Verified', 'Top Rated'],
        services: [
            { id: 's1', description: 'Consultation', base_price: 1500, currency: 'INR', pricing_type: 'hourly', service_type: 'CONSULTATION' }
        ]
    },
    {
        id: '2',
        user_id: 'u2',
        first_name: 'Priya',
        last_name: 'Sharma',
        display_name: 'CA Priya Sharma',
        tagline: 'Tax Planning & Wealth Management',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
        icai_membership_number: 'MRN-405060',
        years_of_experience: 8,
        service_locations: ['Delhi', 'Noida'],
        average_rating: 4.9,
        total_reviews: 85,
        is_premium: false,
        is_available: true,
        consultation_modes: ['online'],
        slug: 'ca-priya-sharma',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        badges: ['Fast Responder'],
        services: [
            { id: 's2', description: 'Consultation', base_price: 1200, currency: 'INR', pricing_type: 'hourly', service_type: 'CONSULTATION' }
        ]
    },
    {
        id: '3',
        user_id: 'u3',
        first_name: 'Amit',
        last_name: 'Verma',
        display_name: 'CA Amit Verma',
        tagline: 'Startup Legal & Compliance Specialist',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit',
        icai_membership_number: 'MRN-708090',
        years_of_experience: 5,
        service_locations: ['Bangalore'],
        average_rating: 4.7,
        total_reviews: 42,
        is_premium: true,
        is_available: true,
        consultation_modes: ['online', 'offline'],
        slug: 'ca-amit-verma',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        badges: ['Startup Expert'],
        services: [
            { id: 's3', description: 'Consultation', base_price: 2000, currency: 'INR', pricing_type: 'hourly', service_type: 'CONSULTATION' }
        ]
    }
];

export default function FindCAPage() {
    const [cas, setCas] = useState<CAProfileWithServices[]>(MOCK_CAS);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const supabase = createClient();

    useEffect(() => {
        const fetchCAs = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('ca_profiles')
                    .select('*, services:ca_services(*)')
                    .eq('verification_status', 'verified'); // Only show verified CAs in search

                if (error) throw error;

                if (data && data.length > 0) {
                    setCas(data as unknown as CAProfileWithServices[]);
                } else {
                    // Fallback to mock if empty for demo
                    setCas(MOCK_CAS);
                }
            } catch (error) {
                console.error("Error fetching CAs:", error);
                setCas(MOCK_CAS);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCAs();
    }, [supabase]);

    // Handle Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!searchQuery) {
                // If search query is empty, re-fetch all verified CAs
                setIsLoading(true);
                try {
                    const { data, error } = await supabase
                        .from('ca_profiles')
                        .select('*, services:ca_services(*)')
                        .eq('verification_status', 'verified');
                    if (error) throw error;
                    setCas(data as unknown as CAProfileWithServices[]);
                } catch (error) {
                    console.error("Error fetching all CAs:", error);
                    setCas(MOCK_CAS);
                } finally {
                    setIsLoading(false);
                }
                return;
            }

            setIsLoading(true);
            const { data } = await supabase
                .from('ca_profiles')
                .select('*, services:ca_services(*)')
                .or(`display_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%,tagline.ilike.%${searchQuery}%`);

            if (data) setCas(data as unknown as CAProfileWithServices[]);
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, supabase]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Hero / Search Header */}
            <div className="bg-white dark:bg-slate-900 border-b sticky top-0 z-30 shadow-sm">
                <div className="container mx-auto px-4 py-4 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-primary">
                                Find a Chartered Accountant
                            </h1>
                            <p className="text-sm text-slate-500 hidden md:block">
                                Connect with 10,000+ verified experts for your financial growth
                            </p>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-[400px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <Input
                                    className="pl-10"
                                    placeholder="Search by name, service, or city..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Mobile Filter Trigger */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="md:hidden">
                                        <Filter className="w-4 h-4 mr-2" /> Filters
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[300px] p-0">
                                    <CAFilters />
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Filters (Desktop) */}
                    <div className="hidden md:block w-[300px] shrink-0">
                        <CAFilters />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">
                                Showing <span className="text-foreground font-bold">{cas.length}</span> verified experts
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500">Sort by:</span>
                                <select className="text-sm bg-transparent border-none font-medium outline-none cursor-pointer">
                                    <option>Recommended</option>
                                    <option>Rating: High to Low</option>
                                    <option>Experience: High to Low</option>
                                    <option>Price: Low to High</option>
                                </select>
                            </div>
                        </div>

                        <CAList cas={cas} isLoading={isLoading} />
                    </div>
                </div>
            </div>
        </div>
    );
}
