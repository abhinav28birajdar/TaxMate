'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SPECIALIZATIONS = [
    "Income Tax (ITR)", "GST Filing", "Company Audit", "Startup Compliance",
    "Virtual CFO", "International Tax", "Trademark"
];

const LOCATIONS = ["Mumbai", "Delhi", "Bangalore", "Pune", "Chennai", "Hyderabad"];

export default function CAFilters() {
    return (
        <Card className="p-6 space-y-8 sticky top-24 h-fit border-none shadow-none bg-transparent lg:bg-card lg:border lg:shadow-sm">
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Filters</h3>

                <div className="space-y-4">
                    <div>
                        <Label className="mb-2 block text-sm font-medium">Location</Label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Select City" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Anywhere (Remote)</SelectItem>
                                {LOCATIONS.map(loc => (
                                    <SelectItem key={loc} value={loc.toLowerCase()}>{loc}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="mb-2 block text-sm font-medium">Services</Label>
                        <div className="space-y-2">
                            {SPECIALIZATIONS.slice(0, 5).map(spec => (
                                <div key={spec} className="flex items-center space-x-2">
                                    <Checkbox id={spec} />
                                    <label htmlFor={spec} className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {spec}
                                    </label>
                                </div>
                            ))}
                        </div>
                        <Button variant="link" className="px-0 h-auto text-xs text-blue-600">View All</Button>
                    </div>

                    <div>
                        <Label className="mb-2 block text-sm font-medium">Price Range (₹)</Label>
                        <div className="flex items-center gap-2">
                            <Input type="number" placeholder="Min" className="h-8 text-sm" />
                            <span className="text-slate-400">-</span>
                            <Input type="number" placeholder="Max" className="h-8 text-sm" />
                        </div>
                    </div>

                    <div>
                        <Label className="mb-2 block text-sm font-medium">Experience</Label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Any Experience" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1+ Years</SelectItem>
                                <SelectItem value="5">5+ Years</SelectItem>
                                <SelectItem value="10">10+ Years</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700">Apply Filters</Button>
            <Button variant="outline" className="w-full">Reset</Button>
        </Card>
    );
}
