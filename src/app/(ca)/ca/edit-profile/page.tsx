'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function EditCAProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    membershipNo: '',
    designation: 'FCA',
    email: '',
    phone: '',
    city: '',
    state: '',
    experienceYears: '0',
    firmName: '',
    bio: '',
    hourlyRate: '2500',
    consultationFee: '1500',
    specializations: '',
    languages: '',
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/ca/profile', { credentials: 'include' });
        const json = await res.json();
        if (res.ok && json.profile) {
          const p = json.profile;
          setFormData({
            name: p.name || '',
            membershipNo: p.membershipNo || '',
            designation: p.designation || 'FCA',
            email: p.email || '',
            phone: p.phone || '',
            city: p.city || '',
            state: p.state || '',
            experienceYears: String(p.experienceYears ?? 0),
            firmName: p.firmName || '',
            bio: p.bio || '',
            hourlyRate: String(p.hourlyRate ?? 2500),
            consultationFee: String(p.consultationFee ?? 1500),
            specializations: Array.isArray(p.specializations) ? p.specializations.join(', ') : '',
            languages: Array.isArray(p.languages) ? p.languages.join(', ') : '',
          });
        }
      } catch (err: any) {
        toast.error(err.message || 'Unable to load current profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/ca/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          firmName: formData.firmName,
          membershipNo: formData.membershipNo,
          designation: formData.designation,
          phone: formData.phone,
          city: formData.city,
          state: formData.state,
          experienceYears: Number(formData.experienceYears || 0),
          consultationFee: Number(formData.consultationFee || 0),
          hourlyRate: Number(formData.hourlyRate || 0),
          specializations: formData.specializations,
          languages: formData.languages,
          bio: formData.bio,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Could not save changes');
      }

      toast.success('CA Profile updated successfully!');
      router.push('/ca/profile');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-lime-500" /> Loading CA profile editor...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="border-slate-800 bg-slate-900 text-slate-300"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Edit CA Profile</h1>
          <p className="text-sm text-slate-400">
            Update your credentials, firm information, location, and consultation fees
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-100 border-b border-slate-800 pb-2">
            Basic & Firm Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Full Name</Label>
              <Input
                required
                className="bg-slate-950 border-slate-800 text-slate-100"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Firm Name</Label>
              <Input
                className="bg-slate-950 border-slate-800 text-slate-100"
                value={formData.firmName}
                onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">ICAI Membership Number</Label>
              <Input
                className="bg-slate-950 border-slate-800 text-slate-100"
                value={formData.membershipNo}
                onChange={(e) => setFormData({ ...formData, membershipNo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Designation</Label>
              <Input
                className="bg-slate-950 border-slate-800 text-slate-100"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Email Address</Label>
              <Input
                disabled
                className="bg-slate-950 border-slate-800 text-slate-400"
                type="email"
                value={formData.email}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Phone Number</Label>
              <Input
                className="bg-slate-950 border-slate-800 text-slate-100"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">City</Label>
              <Input
                className="bg-slate-950 border-slate-800 text-slate-100"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">State</Label>
              <Input
                className="bg-slate-950 border-slate-800 text-slate-100"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-100 border-b border-slate-800 pb-2">
            Professional Experience & Fees
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Years of Experience</Label>
              <Input
                className="bg-slate-950 border-slate-800 text-slate-100"
                type="number"
                min="0"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Consultation Fee (₹)</Label>
              <Input
                className="bg-slate-950 border-slate-800 text-slate-100"
                type="number"
                min="0"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Hourly Rate (₹)</Label>
              <Input
                className="bg-slate-950 border-slate-800 text-slate-100"
                type="number"
                min="0"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Specializations (comma separated)</Label>
            <Input
              className="bg-slate-950 border-slate-800 text-slate-100"
              value={formData.specializations}
              onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Languages Spoken (comma separated)</Label>
            <Input
              className="bg-slate-950 border-slate-800 text-slate-100"
              value={formData.languages}
              onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Bio & Practice Overview</Label>
            <Textarea
              className="bg-slate-950 border-slate-800 text-slate-100 min-h-[100px]"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="border-slate-800 text-slate-300"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
