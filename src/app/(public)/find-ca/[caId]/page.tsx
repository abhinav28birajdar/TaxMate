'use client';

import React from 'react';
import { notFound, useParams } from 'next/navigation';
import {
    Star, ShieldCheck, Clock,
    Share2, Heart, Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ConnectButton from '@/components/client/connect-button';
import { CAProfileWithServices } from '@/types/ca.types';

import { createClient } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';

export default function CAProfilePage() {
    const params = useParams();
    const caId = params.caId as string;
    const [ca, setCa] = React.useState<CAProfileWithServices | null>(null);
    const [loading, setLoading] = React.useState(true);
    const supabase = createClient();

    React.useEffect(() => {
        const fetchCA = async () => {
            setLoading(true);
            try {
                // Fetch profile with services and specializations
                const { data: profile, error } = await supabase
                    .from('ca_profiles')
                    .select('*, services:ca_services(*), specializations:ca_specializations(*)')
                    .eq('id', caId)
                    .maybeSingle();

                if (error) throw error;
                if (!profile) {
                    setCa(null);
                } else {
                    setCa(profile);
                }
            } catch (err) {
                console.error("Error fetching CA:", err);
            } finally {
                setLoading(false);
            }
        };

        if (caId) fetchCA();
    }, [caId, supabase]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!ca) return notFound();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Header / Banner */}
            <div className="h-48 bg-primary relative">
                <div className="absolute top-4 right-4 flex gap-2">
                    <Button variant="ghost" className="text-white hover:bg-white/10" size="icon"><Share2 className="w-5 h-5" /></Button>
                    <Button variant="ghost" className="text-white hover:bg-white/10" size="icon"><Heart className="w-5 h-5" /></Button>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Sidebar: Profile Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="p-6 text-center space-y-4 shadow-xl border-t-4 border-t-amber-400">
                            <div className="relative inline-block">
                                <Avatar className="w-32 h-32 border-4 border-white shadow-lg mx-auto">
                                    <AvatarImage src={ca.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ca.first_name}`} />
                                    <AvatarFallback>{ca.first_name?.[0]}{ca.last_name?.[0]}</AvatarFallback>
                                </Avatar>
                                {ca.is_available && (
                                    <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-white" title="Online" />
                                )}
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                                    {ca.display_name}
                                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                                </h1>
                                <p className="text-slate-500 mt-1">{ca.tagline || 'Chartered Accountant'}</p>
                            </div>

                            <div className="flex justify-center gap-2">
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">ICAI Certified</Badge>
                                {ca.is_premium && <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">Premium</Badge>}
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-4 text-sm text-left">
                                <div>
                                    <p className="text-slate-400 text-xs">Experience</p>
                                    <p className="font-semibold">{ca.years_of_experience || 0}+ Years</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs">Location</p>
                                    <p className="font-semibold">{ca.office_address?.city || 'India'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs">Membership</p>
                                    <p className="font-semibold">{ca.icai_membership_number}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs">Languages</p>
                                    <p className="font-semibold">English, Hindi</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <ConnectButton caId={ca.id} className="w-full bg-blue-600 hover:bg-blue-700" />
                                <Button variant="outline" className="w-full">Message</Button>
                            </div>
                        </Card>

                        <Card className="p-6 space-y-4">
                            <h3 className="font-semibold border-b pb-2">Availability</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><Clock className="w-4 h-4" /> Next Slot</span>
                                    <span className="text-green-600 font-medium">Tomorrow, 10:00 AM</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><Smartphone className="w-4 h-4" /> Response</span>
                                    <span className="font-medium">Usually within 4h</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Main Content: Tabs */}
                    <div className="lg:col-span-2 space-y-6 pt-10 lg:pt-20">
                        {/* Stats Banner */}
                        <div className="grid grid-cols-3 gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm text-center">
                            <div>
                                <p className="text-2xl font-bold flex items-center justify-center gap-1">
                                    {ca.average_rating || '5.0'} <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                                </p>
                                <p className="text-xs text-slate-500">Average Rating</p>
                            </div>
                            <div className="border-l border-r">
                                <p className="text-2xl font-bold">{ca.total_clients || 0}+</p>
                                <p className="text-xs text-slate-500">Happy Clients</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{ca.completed_cases || 0}+</p>
                                <p className="text-xs text-slate-500">Cases Solved</p>
                            </div>
                        </div>

                        <Tabs defaultValue="services" className="w-full">
                            <TabsList className="w-full justify-start h-12 bg-white dark:bg-slate-900 border p-1 rounded-xl">
                                <TabsTrigger value="services" className="flex-1 rounded-lg">Services</TabsTrigger>
                                <TabsTrigger value="about" className="flex-1 rounded-lg">About</TabsTrigger>
                                <TabsTrigger value="reviews" className="flex-1 rounded-lg">Reviews ({ca.total_reviews || 0})</TabsTrigger>
                            </TabsList>

                            <TabsContent value="services" className="mt-6 space-y-4">
                                {ca.services && ca.services.length > 0 ? ca.services.map((service, i) => (
                                    <Card key={i} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-lg">{service.service_type.replace('_', ' ')}</h4>
                                            <div className="flex gap-3 text-sm text-slate-500">
                                                <p className="text-sm">{service.description || 'Professional financial service'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-blue-600">₹{service.base_price}</p>
                                                <p className="text-xs text-slate-500">incl. taxes</p>
                                            </div>
                                            <Button>Select</Button>
                                        </div>
                                    </Card>
                                )) : (
                                    <div className="p-8 text-center text-slate-500 border rounded-xl bg-white">
                                        No specific services listed yet. Connect to inquire.
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="about" className="mt-6">
                                <Card className="p-6 space-y-4">
                                    <h3 className="font-bold text-xl">About Me</h3>
                                    <p className="leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
                                        {ca.bio || 'Professional Chartered Accountant dedicated to providing expert financial services.'}
                                    </p>

                                    <div className="pt-4 border-t">
                                        <h4 className="font-semibold mb-3">Specializations</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {ca.specializations && ca.specializations.length > 0 ? ca.specializations.map((s) => (
                                                <Badge key={s.id} variant="outline" className="px-3 py-1">{s.specialization}</Badge>
                                            )) : (
                                                ['General Practice'].map(s => <Badge key={s} variant="outline" className="px-3 py-1">{s}</Badge>)
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent value="reviews" className="mt-6 space-y-4">
                                <div className="p-8 text-center text-slate-500 border rounded-xl bg-white">
                                    No reviews yet. Be the first to review!
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}
