"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Save, ArrowLeft, Building, Mail, Phone, MapPin, Award, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function EditCAProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: 'CA Rajesh Sharma',
    membershipNo: 'FCA-402918',
    icaiReg: 'ICAI/2012/98124',
    email: 'rajesh.sharma@taxmate.in',
    phone: '+91 98765 43210',
    location: 'Mumbai, Maharashtra',
    experience: '12',
    firmName: 'Sharma & Associates Chartered Accountants',
    bio: 'Senior Chartered Accountant specializing in Corporate Taxation, GST Advisory, Transfer Pricing, and Statutory Audits.',
    hourlyRate: '2500',
    consultationFee: '1500',
    specializations: 'Corporate Tax, GST Compliance, Audit & Assurance, International Tax',
    languages: 'English, Hindi, Gujarati'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated successfully');
    router.push('/ca/profile');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="border-slate-800 bg-slate-900 text-slate-300" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Edit CA Profile</h1>
            <p className="text-sm text-slate-400">Update your credentials, firm information and fees</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-100 border-b border-slate-800 pb-2">Basic & Firm Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Full Name</Label>
              <Input className="bg-slate-950 border-slate-800 text-slate-100" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Firm Name</Label>
              <Input className="bg-slate-950 border-slate-800 text-slate-100" value={formData.firmName} onChange={e => setFormData({...formData, firmName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Membership Number</Label>
              <Input className="bg-slate-950 border-slate-800 text-slate-100" value={formData.membershipNo} onChange={e => setFormData({...formData, membershipNo: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">ICAI Registration Number</Label>
              <Input className="bg-slate-950 border-slate-800 text-slate-100" value={formData.icaiReg} onChange={e => setFormData({...formData, icaiReg: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Email Address</Label>
              <Input className="bg-slate-950 border-slate-800 text-slate-100" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Phone Number</Label>
              <Input className="bg-slate-950 border-slate-800 text-slate-100" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-100 border-b border-slate-800 pb-2">Professional Experience & Fees</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Years of Experience</Label>
              <Input className="bg-slate-950 border-slate-800 text-slate-100" type="number" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Consultation Fee (₹)</Label>
              <Input className="bg-slate-950 border-slate-800 text-slate-100" type="number" value={formData.consultationFee} onChange={e => setFormData({...formData, consultationFee: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Hourly Rate (₹)</Label>
              <Input className="bg-slate-950 border-slate-800 text-slate-100" type="number" value={formData.hourlyRate} onChange={e => setFormData({...formData, hourlyRate: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Specializations (comma separated)</Label>
            <Input className="bg-slate-950 border-slate-800 text-slate-100" value={formData.specializations} onChange={e => setFormData({...formData, specializations: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Bio & Practice Overview</Label>
            <Textarea className="bg-slate-950 border-slate-800 text-slate-100 min-h-[100px]" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" className="border-slate-800 text-slate-300" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
