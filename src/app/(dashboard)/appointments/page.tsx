'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Plus,
  Search,
  Clock,
  MapPin,
  User,
  Phone,
  Video,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ListSkeleton, DashboardSkeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/UnifiedAuthContext';

interface Appointment {
  id: string;
  clientId: string;
  caId: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'VIDEO' | 'PHONE' | 'IN_PERSON';
  notes?: string;
  createdAt: string;
  clientName?: string;
}

export default function AppointmentsPage() {
  const { user, isLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    try {
      setPageLoading(true);
      const response = await fetch('/api/appointments?page=1&limit=100', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch appointments');

      const data = await response.json();
      setAppointments(data.data?.appointments || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load appointments';
      toast.error(message);
      console.error('Error fetching appointments:', error);
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, fetchAppointments]);

  // Filter appointments
  useEffect(() => {
    let filtered = appointments.filter((apt) => {
      const matchesSearch =
        apt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.clientName?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    // Sort by date
    filtered.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    setFilteredAppointments(filtered);
  }, [searchTerm, appointments]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const minutes = Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60)
    );
    return `${minutes} min`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'PHONE':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'IN_PERSON':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="w-4 h-4" />;
      case 'PHONE':
        return <Phone className="w-4 h-4" />;
      case 'IN_PERSON':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Group appointments by date
  const appointmentsByDate = filteredAppointments.reduce(
    (acc, apt) => {
      const date = formatDate(apt.startTime);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(apt);
      return acc;
    },
    {} as Record<string, Appointment[]>
  );

  const upcomingAppointments = filteredAppointments.filter(
    (apt) => new Date(apt.startTime) > new Date()
  );

  const yesterdayAppointments = filteredAppointments.filter((apt) => {
    const aptDate = new Date(apt.startTime);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return aptDate.toDateString() === yesterday.toDateString();
  });

  if (isLoading || pageLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-8 h-8 text-primary" />
            Appointments
          </h1>
          <p className="text-muted-foreground mt-1">
            Schedule and manage your meetings
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Meeting
        </Button>
      </div>

      {/* Upcoming Appointments Summary */}
      {upcomingAppointments.length > 0 && (
        <motion.div
          className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">
                You have {upcomingAppointments.length} upcoming appointment
                {upcomingAppointments.length !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-muted-foreground">
                Next: {upcomingAppointments[0].title} at{' '}
                {formatTime(upcomingAppointments[0].startTime)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search appointments..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            Calendar View
          </Button>
        </div>
      </motion.div>

      {/* List View */}
      {viewMode === 'list' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {Object.keys(appointmentsByDate).length > 0 ? (
            Object.entries(appointmentsByDate).map(([date, apts], dateIndex) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dateIndex * 0.1 }}
              >
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {date}
                </h3>
                <div className="space-y-3">
                  <AnimatePresence>
                    {apts.map((apt, index) => (
                      <motion.div
                        key={apt.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-primary">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                <div className="mt-1">
                                  {getTypeIcon(apt.type)}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-foreground">
                                    {apt.title}
                                  </h4>
                                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {formatTime(apt.startTime)} -{' '}
                                      {formatTime(apt.endTime)} ({getDuration(apt.startTime, apt.endTime)})
                                    </div>
                                    {apt.clientName && (
                                      <div className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        {apt.clientName}
                                      </div>
                                    )}
                                  </div>
                                  {apt.notes && (
                                    <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                                      {apt.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(
                                  apt.type
                                )}`}
                              >
                                {getTypeIcon(apt.type)}
                                {apt.type}
                              </span>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    toast.info('Edit not yet implemented')
                                  }
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() =>
                                    toast.info('Delete not yet implemented')
                                  }
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No appointments found</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <motion.div
          className="bg-card border border-border rounded-lg p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">
              {currentDate.toLocaleDateString('en-IN', {
                month: 'long',
                year: 'numeric',
              })}
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))
                }
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))
                }
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-semibold text-sm text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => {
              const firstDay = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                1
              ).getDay();
              const daysInMonth = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1,
                0
              ).getDate();

              let date;
              if (i < firstDay) {
                date = null;
              } else if (i - firstDay < daysInMonth) {
                date = i - firstDay + 1;
              } else {
                date = null;
              }

              const hasAppointment =
                date &&
                filteredAppointments.some((apt) => {
                  const aptDate = new Date(apt.startTime);
                  return (
                    aptDate.getDate() === date &&
                    aptDate.getMonth() === currentDate.getMonth() &&
                    aptDate.getFullYear() === currentDate.getFullYear()
                  );
                });

              return (
                <div
                  key={i}
                  className={`p-2 rounded-lg border text-center text-sm h-16 flex items-center justify-center transition-all ${
                    date
                      ? hasAppointment
                        ? 'bg-primary/10 border-primary text-primary font-semibold cursor-pointer hover:bg-primary/20'
                        : 'border-border hover:bg-muted'
                      : 'border-transparent'
                  }`}
                >
                  {date}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
