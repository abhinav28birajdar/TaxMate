'use client';

import React from 'react';
import Link from 'next/link';
import { Star, MapPin, Briefcase, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CAProfileWithServices } from '@/types/ca.types';

interface CACardProps {
    ca: CAProfileWithServices;
}

export default function CACard({ ca }: CACardProps) {
    const minPrice = ca.services?.reduce((min, s) => s.base_price < min ? s.base_price : min, Infinity) || 0;

    return (
        <Card className="hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full border-slate-200 dark:border-slate-800">
            <CardHeader className="p-0">
                <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                    {ca.is_premium && (
                        <Badge className="absolute top-2 right-2 bg-amber-500 hover:bg-amber-600 text-white border-none">
                            Premium
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-0 pb-4 px-6 flex-1">
                <div className="flex justify-between items-start -mt-10 mb-4">
                    <Avatar className="w-20 h-20 border-4 border-white dark:border-slate-950 shadow-md">
                        <AvatarImage src={ca.avatar_url} alt={ca.first_name} />
                        <AvatarFallback>{ca.first_name[0]}{ca.last_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm mt-12">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-sm">{ca.average_rating || 'New'}</span>
                        <span className="text-xs text-slate-500">({ca.total_reviews})</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <div>
                        <Link href={`/find-ca/${ca.id}`} className="hover:underline">
                            <h3 className="font-bold text-lg flex items-center gap-1">
                                {ca.display_name || `${ca.first_name} ${ca.last_name}`}
                                <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500/20" />
                            </h3>
                        </Link>
                        <p className="text-sm text-slate-500 line-clamp-1">{ca.tagline || 'Chartered Accountant'}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            <span>{ca.years_of_experience}+ Years</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{ca.service_locations?.[0] || 'India'}</span>
                        </div>
                    </div>

                    {ca.badges && ca.badges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {ca.badges.slice(0, 2).map((badge, i) => (
                                <Badge key={i} variant="secondary" className="text-[10px] px-1.5 h-5">
                                    {badge}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t flex justify-between items-center">
                <div>
                    <p className="text-xs text-slate-500">Starts from</p>
                    <p className="font-bold text-lg text-blue-600">
                        ₹{minPrice === Infinity ? '500' : minPrice}
                        <span className="text-xs font-normal text-slate-500">/consult</span>
                    </p>
                </div>
                <Button size="sm" asChild>
                    <Link href={`/find-ca/${ca.id}`}>View Profile</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
