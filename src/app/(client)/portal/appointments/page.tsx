'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Video, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface AppointmentItem {
  id: string;
  caId: string;
  caName: string;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  status: string;
  meetingLink?: string | null;
  notes?: string | null;
}

interface CaOption {
  id: string;
  name: string;
  firmName?: string;
  isAssigned?: boolean;
}

export default function ClientAppointments() {
  const { user } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [cas, setCas] = useState<CaOption[]>([]);
  const [selectedCaId, setSelectedCaId] = useState('');
  const [loading, setLoading] = useState(true);

  // Booking form state
  const [booking, setBooking] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'VIDEO_CALL' | 'IN_PERSON' | 'PHONE_CALL'>('VIDEO_CALL');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [apptRes, caRes] = await Promise.all([
        fetch('/api/appointments?limit=50', { credentials: 'include' }),
        fetch('/api/cas?limit=25', { credentials: 'include' }),
      ]);

      if (apptRes.ok) {
        const apptJson = await apptRes.json();
        setAppointments(apptJson.data?.appointments || []);
      }

      if (caRes.ok) {
        const caJson = await caRes.json();
        const caList: CaOption[] = (caJson.cas || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          firmName: c.firmName,
          isAssigned: Boolean(c.isAssigned),
        }));
        setCas(caList);
        const assigned = caList.find((c) => c.isAssigned) || caList[0];
        if (assigned && !selectedCaId) {
          setSelectedCaId(assigned.id);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not load consultations schedule.');
    } finally {
      setLoading(false);
    }
  }, [selectedCaId]);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user, loadData]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !time) {
      toast.error('Please enter session topic, date, and time slot.');
      return;
    }

    const startTime = new Date(`${date}T${time}:00`);
    if (Number.isNaN(startTime.getTime())) {
      toast.error('Invalid date or time provided.');
      return;
    }
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    setBooking(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...(selectedCaId ? { caId: selectedCaId } : {}),
          title: title.trim(),
          type,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          notes: notes.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || json.error || 'Booking submission failed');
      }

      toast.success('Consultation booked successfully.');
      setTitle('');
      setDate('');
      setTime('');
      setNotes('');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Booking submission failed.');
    } finally {
      setBooking(false);
    }
  };

  const handleJoinMeeting = (appt: AppointmentItem) => {
    if (appt.meetingLink) {
      if (appt.meetingLink.startsWith('http')) {
        window.open(appt.meetingLink, '_blank', 'noopener,noreferrer');
        return;
      }
      router.push(appt.meetingLink);
      return;
    }
    router.push(`/client/calls/${appt.id}`);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-lime-500 border-lime-600/10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-500">
          Advisory Scheduling
        </span>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic mt-1 text-white">
          Book Consultations
        </h1>
        <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wide">
          SCHEDULE VIDEO CALLS OR IN-PERSON SESSIONS WITH CA OPERATORS
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900 border-slate-800 rounded-none">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-white">
                Consultations Schedule
              </CardTitle>
              <CardDescription className="text-[9px] uppercase tracking-wider text-slate-500">
                Upcoming and past calendar meetings
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {appointments.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">
                  No consultations booked yet. Use the booking form to request a slot.
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appt) => {
                    const isVideo = String(appt.type || '').toUpperCase().includes('VIDEO');
                    const isCancel = ['CANCELLED', 'COMPLETED'].includes(
                      String(appt.status || '').toUpperCase()
                    );

                    return (
                      <div
                        key={appt.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-black border border-slate-800 hover:border-slate-700 transition-colors gap-4 rounded-none"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-black uppercase text-white tracking-wider">
                              {appt.title}
                            </span>
                            <span className="bg-lime-950 text-lime-500 border border-lime-600/30 text-[8px] font-black uppercase tracking-widest px-2 py-0.5">
                              {appt.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-lime-500" />
                              {appt.caName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-lime-500" />
                              {new Date(appt.startTime).toLocaleDateString('en-IN')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-lime-500" />
                              {new Date(appt.startTime).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Video className="w-3.5 h-3.5 text-lime-500" />
                              {String(appt.type || 'VIDEO_CALL').replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </div>

                          {appt.notes && (
                            <p className="text-[10px] text-slate-400 italic font-medium">{appt.notes}</p>
                          )}
                        </div>

                        {isVideo && !isCancel && (
                          <Button
                            onClick={() => handleJoinMeeting(appt)}
                            className="bg-lime-600 hover:bg-lime-500 text-black font-black uppercase tracking-widest text-[9px] px-4 h-9 rounded-none flex items-center gap-2 self-end sm:self-center transition-all"
                          >
                            <Video className="w-4 h-4" />
                            Launch Meeting
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 rounded-none">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-white">
                Request Consultation
              </CardTitle>
              <CardDescription className="text-[9px] uppercase tracking-wider text-slate-500">
                Arrange appointment slots with your CA advisor
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCreateBooking} className="space-y-4">
                {cas.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                      Chartered Accountant
                    </Label>
                    <select
                      value={selectedCaId}
                      onChange={(e) => setSelectedCaId(e.target.value)}
                      className="w-full bg-black border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-300 px-3 h-10 rounded-none focus:border-lime-600/50 outline-none"
                    >
                      {cas.map((ca) => (
                        <option key={ca.id} value={ca.id}>
                          {ca.name}
                          {ca.isAssigned ? ' (Assigned)' : ca.firmName ? ` — ${ca.firmName}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                    Session Topic / Title
                  </Label>
                  <Input
                    type="text"
                    placeholder="E.g. Return Review Call"
                    required
                    minLength={3}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-black border-slate-800 focus:border-lime-600/50 h-10 rounded-none text-xs text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                    Appointment Medium
                  </Label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-black border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 h-10 rounded-none focus:border-lime-600/50 outline-none"
                  >
                    <option value="VIDEO_CALL">LIVE VIDEO CONFERENCE</option>
                    <option value="IN_PERSON">OFFICE VISIT (IN-PERSON)</option>
                    <option value="PHONE_CALL">TELEPHONIC REVIEW</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                      Date
                    </Label>
                    <Input
                      type="date"
                      required
                      value={date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDate(e.target.value)}
                      className="bg-black border-slate-800 focus:border-lime-600/50 h-10 rounded-none text-xs text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                      Time Slot
                    </Label>
                    <Input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="bg-black border-slate-800 focus:border-lime-600/50 h-10 rounded-none text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                    Agenda / Context
                  </Label>
                  <textarea
                    placeholder="Describe the issues or return details you want to align on..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-black border border-slate-800 text-xs text-white px-3 py-2 rounded-none focus:border-lime-600/50 outline-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={booking}
                  className="w-full bg-lime-600 hover:bg-lime-500 text-black font-black uppercase tracking-widest italic rounded-none h-11 transition-all"
                >
                  {booking ? 'SUBMITTING REQUEST...' : 'SUBMIT REQUEST'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
