'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building, FileText, MapPin, Globe, User,
    Lock, Users, ShieldCheck, Upload, Trash2,
    Plus, CheckCircle2, ChevronRight, ChevronLeft,
    Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

const steps = ["Firm Details", "Admin CA", "Specializations", "Team setup", "Verification"];

const firmSpecializations = [
    "Income Tax", "GST", "Company Law & ROC", "Audit",
    "Bookkeeping", "TDS & TCS", "FEMA", "Insolvency",
    "Transfer Pricing", "Financial Planning"
];

const clientTypes = ["Individuals", "MSMEs", "Corporates", "HNI", "Startups"];

export default function FirmRegistrationPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Firm Details
        firmName: '',
        regNumber: '',
        gstin: '',
        pan: '',
        estYear: '',
        firmType: 'Partnership',
        numPartners: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        website: '',
        // Step 2: Primary Admin CA
        adminName: '',
        adminEmail: '',
        adminPhone: '',
        adminIcai: '',
        designation: 'Managing Partner',
        password: '',
        // Step 3: Specializations
        specializations: [] as string[],
        clientsServed: [] as string[],
        teamSize: '1-5',
        // Step 4: Team
        teamMembers: [] as { name: string, email: string, role: string }[]
    });

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const toggleSelection = (list: string[], item: string, key: string) => {
        const updated = list.includes(item)
            ? list.filter(i => i !== item)
            : [...list, item];
        setFormData({ ...formData, [key]: updated });
    };

    const addTeamMember = () => {
        setFormData({
            ...formData,
            teamMembers: [...formData.teamMembers, { name: '', email: '', role: 'Junior CA' }]
        });
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Firm Registration</h2>
                        <p className="text-slate-500 text-sm">Step {currentStep} of {steps.length}: {steps[currentStep - 1]}</p>
                    </div>
                </div>
                <Progress value={(currentStep / steps.length) * 100} className="h-2" />
            </div>

            <Card className="p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl relative overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Firm Name</label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input placeholder="Acme & Co." className="pl-10" value={formData.firmName} onChange={(e) => setFormData({ ...formData, firmName: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Registration Number</label>
                                        <Input placeholder="Reg No." value={formData.regNumber} onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">GSTIN</label>
                                        <Input placeholder="27AAAAA0000A1Z5" maxLength={15} value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Firm PAN</label>
                                        <Input placeholder="ABCDE1234F" maxLength={10} value={formData.pan} onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Firm Type</label>
                                        <select className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm" value={formData.firmType} onChange={(e) => setFormData({ ...formData, firmType: e.target.value })}>
                                            <option>Partnership</option>
                                            <option>LLP</option>
                                            <option>Company</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Website (Optional)</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input placeholder="www.acmepractice.com" className="pl-10" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Office Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                        <textarea
                                            className="w-full min-h-[80px] p-3 pl-10 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm"
                                            placeholder="123, Business Tower, MG Road..."
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="text-left mb-4">
                                    <h3 className="font-bold">Primary Admin CA</h3>
                                    <p className="text-xs text-slate-500">This person will have full control over the firm's account.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Admin Full Name</label>
                                        <Input value={formData.adminName} onChange={(e) => setFormData({ ...formData, adminName: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Admin Email</label>
                                        <Input type="email" value={formData.adminEmail} onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Phone Number</label>
                                        <Input value={formData.adminPhone} onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">ICAI Number</label>
                                        <Input value={formData.adminIcai} onChange={(e) => setFormData({ ...formData, adminIcai: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Designation</label>
                                        <select className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })}>
                                            <option>Managing Partner</option>
                                            <option>Partner</option>
                                            <option>Principal CA</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Set Admin Password</label>
                                        <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-sm font-bold block">Firm Specializations</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {firmSpecializations.map(spec => (
                                            <div
                                                key={spec}
                                                onClick={() => toggleSelection(formData.specializations, spec, 'specializations')}
                                                className={`p-2 rounded-lg border text-[11px] font-semibold cursor-pointer transition-all ${formData.specializations.includes(spec)
                                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                                                        : 'border-slate-100 dark:border-slate-800 hover:border-blue-300'
                                                    }`}
                                            >
                                                {spec}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-bold block">Client Types Served</label>
                                    <div className="flex flex-wrap gap-2">
                                        {clientTypes.map(type => (
                                            <Badge
                                                key={type}
                                                onClick={() => toggleSelection(formData.clientsServed, type, 'clientsServed')}
                                                variant={formData.clientsServed.includes(type) ? 'default' : 'outline'}
                                                className="cursor-pointer"
                                            >
                                                {type}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2 w-full md:w-1/2">
                                    <label className="text-sm font-bold">Total Team Size</label>
                                    <select
                                        className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm"
                                        value={formData.teamSize}
                                        onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                                    >
                                        <option>1-5 Members</option>
                                        <option>5-10 Members</option>
                                        <option>10-25 Members</option>
                                        <option>25-50 Members</option>
                                        <option>50+ Members</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div className="text-left">
                                        <h3 className="font-bold">Add Team Members</h3>
                                        <p className="text-xs text-slate-500">You can invite your partners and staff now or later.</p>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={addTeamMember} className="gap-2">
                                        <Plus className="w-4 h-4" /> Add
                                    </Button>
                                </div>

                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                    {formData.teamMembers.length === 0 && (
                                        <div className="text-center py-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                                            <p className="text-sm text-slate-400">No team members added yet.</p>
                                        </div>
                                    )}
                                    {formData.teamMembers.map((member, idx) => (
                                        <div key={idx} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 grid grid-cols-1 md:grid-cols-3 gap-3 relative">
                                            <Input placeholder="Name" className="text-xs h-9" />
                                            <Input placeholder="Email" className="text-xs h-9" />
                                            <div className="flex gap-2">
                                                <select className="flex-1 h-9 px-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-[10px]">
                                                    <option>Senior CA</option>
                                                    <option>Junior CA</option>
                                                    <option>Article Assistant</option>
                                                </select>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {currentStep === 5 && (
                            <div className="space-y-8 text-center py-4">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShieldCheck className="w-8 h-8 text-blue-600" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold">Final Verification</h3>
                                    <p className="text-sm text-slate-500">Upload your firm's registration documents for approval.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                    <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-4 hover:bg-slate-50 cursor-pointer transition-all">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                            <ImageIcon className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold">Firm Logo</p>
                                            <p className="text-[10px] text-slate-500">Recommended: Square PNG</p>
                                        </div>
                                    </div>
                                    <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-4 hover:bg-slate-50 cursor-pointer transition-all">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold">Reg. Certificate</p>
                                            <p className="text-[10px] text-slate-500">PDF or Image</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/50 text-left flex gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                    <p className="text-xs text-amber-800 dark:text-amber-400">
                                        By submitting, you agree that you are an authorized representative of the firm. Verification may take up to 2 working days.
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="flex justify-between mt-12 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" /> Previous
                    </Button>

                    {currentStep < steps.length ? (
                        <Button
                            onClick={nextStep}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                        >
                            Continue <ChevronRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Link href="/dashboard/firm" className="w-full md:w-auto">
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8">
                                Confirm & Submit
                            </Button>
                        </Link>
                    )}
                </div>
            </Card>
        </div>
    );
}
