'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, ChevronRight, ChevronLeft, Upload,
    Briefcase, Award, MapPin, Clock, FileText, User, ShieldCheck, CreditCard,
    Loader2, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { createClient } from '@/utils/supabase/client';
import { uploadFile, uploadVerificationDocument } from '@/lib/storage/upload';
import Image from 'next/image';

// Step definition
const STEPS = [
    { id: 'credentials', title: 'Credentials', icon: Award },
    { id: 'specializations', title: 'Specializations', icon: Briefcase },
    { id: 'services', title: 'Service Details', icon: Clock },
    { id: 'verification', title: 'Verification', icon: ShieldCheck },
];

// Specialization Options
const SPECIALIZATIONS = [
    "Income Tax Returns (ITR)", "GST Registration & Filing", "Company Law & ROC",
    "Statutory Audit", "Tax Audit (Sec 44AB)", "Internal Audit",
    "Accounting & Bookkeeping", "TDS/TCS Compliance", "FEMA Compliance",
    "IBC & Insolvency", "Transfer Pricing", "Financial Planning"
];

const LANGUAGES = [
    "English", "Hindi", "Tamil", "Telugu", "Kannada",
    "Malayalam", "Bengali", "Marathi", "Gujarati", "Punjabi"
];

const EXPERIENCE_YEARS = [
    "0-5 years", "5-10 years", "10-15 years", "15-20 years", "20+ years"
];

export default function CAOnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);
    const supabase = createClient();

    // Refs for file inputs
    const profileInputRef = useRef<HTMLInputElement>(null);
    const certificateInputRef = useRef<HTMLInputElement>(null);
    const panInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState({
        // Step 2: Credentials
        icaiNumber: '',
        panNumber: '',
        registrationYear: '',
        bio: '',
        certificateUrl: '',
        profilePhotoUrl: '',
        panCardUrl: '',

        // Step 3: Specializations
        specializations: [] as string[],
        experienceLevel: '',
        languages: [] as string[],

        // Step 4: Service Details
        serviceAreas: '',
        consultationFee: '',
        remoteAvailable: true,
        availableDays: [] as string[],
        startTime: '09:00',
        endTime: '18:00',
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'certificate' | 'pan') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Size validation (e.g., 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "File too large", description: "Max file size is 5MB", variant: "destructive" });
            return;
        }

        setUploading(type);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            let result;
            if (type === 'profile') {
                result = await uploadFile(file, 'avatars', user.id);
                setFormData(prev => ({ ...prev, profilePhotoUrl: result?.url || '' }));
            } else if (type === 'certificate') {
                result = await uploadVerificationDocument(file, user.id, 'certificate');
                setFormData(prev => ({ ...prev, certificateUrl: result?.url || '' }));
            } else if (type === 'pan') {
                result = await uploadVerificationDocument(file, user.id, 'id_proof'); // Mapping PAN to id_proof logically
                setFormData(prev => ({ ...prev, panCardUrl: result?.url || '' }));
            }

            toast({ title: "Upload Successful", description: `${type} uploaded successfully.` });
        } catch (error: unknown) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "Upload failed";
            toast({
                title: "Upload Failed",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setUploading(null);
        }
    };

    const handleNext = () => {
        // Simple Validation per step
        if (step === 0) {
            if (!formData.icaiNumber || !formData.registrationYear || !formData.bio || !formData.panNumber) {
                toast({ title: "Meaningful data required", description: "Please fill all mandatory fields including PAN.", variant: "destructive" });
                return;
            }
            if (!formData.certificateUrl || !formData.panCardUrl) {
                toast({ title: "Documents Required", description: "Please upload your Certificate of Practice and PAN Card.", variant: "destructive" });
                return;
            }
        }
        if (step === 1) {
            if (formData.specializations.length === 0 || !formData.experienceLevel) {
                toast({ title: "Select Specializations", description: "Please select at least one specialization and your experience level.", variant: "destructive" });
                return;
            }
        }
        if (step === 2) {
            if (!formData.consultationFee || !formData.serviceAreas || formData.availableDays.length === 0) {
                toast({ title: "Service Details", description: "Please enter your fee, service areas, and available days.", variant: "destructive" });
                return;
            }
        }

        if (step < STEPS.length - 1) {
            setStep(s => s + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(s => s - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            // 1. Update/Fetch CA profile
            // Note: handle_new_user trigger creates the profile, we just update it.
            const { data: profile, error: profileError } = await supabase
                .from('ca_profiles')
                .update({
                    icai_membership_number: formData.icaiNumber,
                    years_of_experience: parseInt(formData.experienceLevel.split('-')[0]) || 5,
                    bio: formData.bio,
                    verification_documents: {
                        certificate_url: formData.certificateUrl,
                        pan_url: formData.panCardUrl,
                        pan_number: formData.panNumber
                    },
                    service_locations: formData.serviceAreas.split(',').map(s => s.trim()),
                    is_available: true,
                    consultation_modes: formData.remoteAvailable ? ['online', 'offline'] : ['offline'],
                    verification_status: 'under_review'
                })
                .eq('user_id', user.id)
                .select()
                .single();

            if (profileError) throw profileError;
            if (!profile) throw new Error("Could not find or update CA profile.");

            const caProfileId = profile.id;

            // 2. Insert Specializations
            if (formData.specializations.length > 0) {
                const specData = formData.specializations.map(spec => ({
                    ca_id: caProfileId,
                    specialization: spec
                }));
                const { error: specError } = await supabase.from('ca_specializations').insert(specData);
                if (specError) throw specError;
            }

            // 3. Insert industry/languages (simplification for now)
            // Assuming languages can go into ca_profiles if we had a field, otherwise ca_specializations is okay.

            // 4. Create default consultation service in ca_services
            const { error: serviceError } = await supabase.from('ca_services').insert({
                ca_id: caProfileId,
                service_type: 'FINANCIAL_ADVISORY',
                description: 'Initial Consultation',
                pricing_type: 'fixed',
                base_price: parseFloat(formData.consultationFee) || 0,
                currency: 'INR',
                is_active: true
            });

            if (serviceError) throw serviceError;

            // 5. Update Auth metadata/status
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    onboarding_step: 5,
                    status: 'pending_approval'
                }
            });

            if (authError) throw authError;

            toast({
                title: "Profile Submitted!",
                description: "Your application is currently under review (24-48h).",
            });

            router.push('/dashboard/ca?status=pending');

        } catch (error: unknown) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            toast({
                title: "Submission Error",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };


    // Helper for multi-select toggle
    const toggleSelection = (list: string[], item: string, key: keyof typeof formData) => {
        const newList = list.includes(item)
            ? list.filter(i => i !== item)
            : [...list, item];
        setFormData({ ...formData, [key]: newList });
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
            <input
                type="file"
                ref={profileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'profile')}
            />
            <input
                type="file"
                ref={certificateInputRef}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e, 'certificate')}
            />
            <input
                type="file"
                ref={panInputRef}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e, 'pan')}
            />

            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    Complete Your Professional Profile
                </h2>
                <p className="text-slate-500">Step {step + 1} of {STEPS.length}: {STEPS[step].title}</p>
            </div>

            {/* Progress Bar */}
            <div className="flex justify-between max-w-2xl mx-auto relative mb-12">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 rounded-full" />
                <div
                    className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-300"
                    style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
                />

                {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    const isActive = i <= step;
                    const isCurrent = i === step;

                    return (
                        <div key={s.id} className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${isActive
                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110'
                                : 'bg-white border-slate-300 text-slate-400'
                                }`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className={`text-xs font-semibold ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`}>
                                {s.title}
                            </span>
                        </div>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="p-8 shadow-xl border-slate-200 dark:border-slate-800">

                        {/* STEP 1: CREDENTIALS */}
                        {step === 0 && (
                            <div className="space-y-6">
                                {/* Profile Photo */}
                                <div className="flex justify-center mb-6">
                                    <div
                                        className="relative group cursor-pointer"
                                        onClick={() => profileInputRef.current?.click()}
                                    >
                                        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-500 overflow-hidden">
                                            {uploading === 'profile' ? (
                                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                            ) : formData.profilePhotoUrl ? (
                                                <div className="relative w-full h-full">
                                                    <Image
                                                        src={formData.profilePhotoUrl}
                                                        alt="Profile"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <button
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFormData({ ...formData, profilePhotoUrl: '' });
                                                        }}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <User className="w-8 h-8 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full shadow-md">
                                            <Upload className="w-3 h-3" />
                                        </div>
                                        <p className="text-xs text-center mt-2 text-slate-500">Profile Photo</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>ICAI Membership Number</Label>
                                        <Input
                                            placeholder="MRN-XXXXXX"
                                            value={formData.icaiNumber}
                                            onChange={(e) => setFormData({ ...formData, icaiNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Year of Registration</Label>
                                        <Select
                                            value={formData.registrationYear}
                                            onValueChange={(val) => setFormData({ ...formData, registrationYear: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Upload Certificate of Practice</Label>
                                        <div
                                            className={`border-2 border-dashed rounded-lg p-3 flex items-center justify-between cursor-pointer transition-colors ${formData.certificateUrl ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'}`}
                                            onClick={() => certificateInputRef.current?.click()}
                                        >
                                            <span className="text-sm text-slate-500 flex items-center gap-2">
                                                <FileText className="w-4 h-4" />
                                                {uploading === 'certificate' ? 'Uploading...' : formData.certificateUrl ? 'Certificate Uploaded' : 'COP (PDF/JPG)'}
                                            </span>
                                            {uploading === 'certificate' ? <Loader2 className="w-4 h-4 animate-spin" /> : formData.certificateUrl ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Upload className="w-4 h-4 text-slate-400" />}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Upload PAN Card</Label>
                                        <div
                                            className={`border-2 border-dashed rounded-lg p-3 flex items-center justify-between cursor-pointer transition-colors ${formData.panCardUrl ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'}`}
                                            onClick={() => panInputRef.current?.click()}
                                        >
                                            <span className="text-sm text-slate-500 flex items-center gap-2">
                                                <CreditCard className="w-4 h-4" />
                                                {uploading === 'pan' ? 'Uploading...' : formData.panCardUrl ? 'PAN Uploaded' : 'PAN Card'}
                                            </span>
                                            {uploading === 'pan' ? <Loader2 className="w-4 h-4 animate-spin" /> : formData.panCardUrl ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Upload className="w-4 h-4 text-slate-400" />}
                                        </div>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label>PAN Number</Label>
                                        <Input
                                            placeholder="XXXXX1234X"
                                            value={formData.panNumber}
                                            onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Professional Bio</Label>
                                    <Textarea
                                        placeholder="Tell clients about your experience and expertise..."
                                        className="h-24"
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    />
                                    <p className="text-xs text-slate-500 text-right">{formData.bio.length}/500</p>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: SPECIALIZATIONS */}
                        {step === 1 && (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <Label className="text-base">Experience Level</Label>
                                    <Select
                                        value={formData.experienceLevel}
                                        onValueChange={(val) => setFormData({ ...formData, experienceLevel: val })}
                                    >
                                        <SelectTrigger className="w-full md:w-[280px]">
                                            <SelectValue placeholder="Select Experience" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {EXPERIENCE_YEARS.map(exp => (
                                                <SelectItem key={exp} value={exp}>{exp}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-base">Your Areas of Expertise</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {SPECIALIZATIONS.map(spec => (
                                            <div key={spec} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                                <Checkbox
                                                    id={spec}
                                                    checked={formData.specializations.includes(spec)}
                                                    onCheckedChange={() => toggleSelection(formData.specializations, spec, 'specializations')}
                                                />
                                                <label htmlFor={spec} className="text-sm font-medium leading-none cursor-pointer flex-1">
                                                    {spec}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-base">Languages Spoken</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {LANGUAGES.map(lang => (
                                            <div
                                                key={lang}
                                                onClick={() => toggleSelection(formData.languages, lang, 'languages')}
                                                className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all border ${formData.languages.includes(lang)
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
                                                    }`}
                                            >
                                                {lang}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: SERVICE DETAILS */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Service Areas (Cities)</Label>
                                        <Input
                                            placeholder="Mumbai, Pune, Delhi..."
                                            value={formData.serviceAreas}
                                            onChange={(e) => setFormData({ ...formData, serviceAreas: e.target.value })}
                                        />
                                        <p className="text-xs text-slate-500">Comma separated</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Consultation Fee (₹/hour)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">₹</span>
                                            <Input
                                                type="number"
                                                className="pl-8"
                                                placeholder="1000"
                                                value={formData.consultationFee}
                                                onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-base">Availability</Label>
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                                <div
                                                    key={day}
                                                    onClick={() => toggleSelection(formData.availableDays, day, 'availableDays')}
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transition-all border ${formData.availableDays.includes(day)
                                                        ? 'bg-green-600 text-white border-green-600'
                                                        : 'bg-white text-slate-400 border-slate-200 hover:border-green-400'
                                                        }`}
                                                >
                                                    {day.charAt(0)}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="grid gap-1">
                                                <Label className="text-xs text-slate-500">From</Label>
                                                <Input
                                                    type="time"
                                                    className="w-32"
                                                    value={formData.startTime}
                                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                                />
                                            </div>
                                            <span className="pt-5 text-slate-400">-</span>
                                            <div className="grid gap-1">
                                                <Label className="text-xs text-slate-500">To</Label>
                                                <Input
                                                    type="time"
                                                    className="w-32"
                                                    value={formData.endTime}
                                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-lg border">
                                    <Checkbox
                                        id="remote"
                                        checked={formData.remoteAvailable}
                                        onCheckedChange={(c) => setFormData({ ...formData, remoteAvailable: c as boolean })}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <label htmlFor="remote" className="text-sm font-medium leading-none">
                                            Accept Remote Clients?
                                        </label>
                                        <p className="text-[0.8rem] text-slate-500">
                                            Allow clients from outside your city to book video consultations.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: REVIEW */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="bg-slate-50 p-6 rounded-xl space-y-4">
                                    <h3 className="font-semibold text-lg border-b pb-2">Profile Summary</h3>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-slate-500 block">ICAI Number</span>
                                            <span className="font-medium">{formData.icaiNumber}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block">Experience</span>
                                            <span className="font-medium">{formData.experienceLevel}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block">Fee</span>
                                            <span className="font-medium">₹{formData.consultationFee}/hr</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block">Location</span>
                                            <span className="font-medium">{formData.serviceAreas}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-slate-500 block text-sm mb-1">Specializations</span>
                                        <div className="flex flex-wrap gap-1">
                                            {formData.specializations.map(s => (
                                                <span key={s} className="px-2 py-0.5 bg-white border rounded text-xs text-slate-600">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                                    <CheckCircle className="w-5 h-5 shrink-0" />
                                    <p>
                                        By submitting, you confirm that all provided details are accurate.
                                        False information may lead to permanent ban and reporting to ICAI.
                                        Your profile will be visible to clients after admin approval (24-48 hours).
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between mt-8 pt-4 border-t">
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                disabled={step === 0 || loading}
                                className={step === 0 ? 'invisible' : ''}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                            <Button
                                onClick={handleNext}
                                className="bg-blue-600"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {loading ? 'Submitting...' : step === STEPS.length - 1 ? 'Submit for Approval' : 'Continue'}
                                {!loading && step !== STEPS.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
                            </Button>
                        </div>

                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
