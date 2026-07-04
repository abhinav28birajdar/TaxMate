'use client';

import React, { useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Appointment {
  id: string;
  title: string;
  startTime: string;
  type: 'video_call' | 'phone_call' | 'in_person' | 'email_follow_up';
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onDateSelect?: (date: Date) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  className?: string;
}

const appointmentTypeColors: Record<string, string> = {
  video_call: 'bg-blue-500',
  phone_call: 'bg-green-500',
  in_person: 'bg-amber-500',
  email_follow_up: 'bg-purple-500',
};

export default function AppointmentCalendar({
  appointments,
  onDateSelect,
  onAppointmentClick,
  className,
}: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    appointments.forEach((apt) => {
      const dateKey = format(new Date(apt.startTime), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(apt);
    });
    return grouped;
  }, [appointments]);

  const weeks = useMemo(() => {
    const weeksArray = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeksArray.push(calendarDays.slice(i, i + 7));
    }
    return weeksArray;
  }, [calendarDays]);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = new Date();

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{format(currentDate, 'MMMM yyyy')}</h2>
          <p className="text-sm text-slate-600 mt-1">Appointments Schedule</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={previousMonth} className="hover:bg-slate-100">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="hover:bg-slate-100"
          >
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth} className="hover:bg-slate-100">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 p-3 bg-slate-50 rounded border border-slate-200">
        <p className="text-xs font-semibold text-slate-600 mb-2">Appointment Types:</p>
        <div className="flex flex-wrap gap-3">
          {Object.entries({
            video_call: 'Video Call',
            phone_call: 'Phone Call',
            in_person: 'In-Person',
            email_follow_up: 'Email Follow-up',
          }).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={cn('w-3 h-3 rounded', appointmentTypeColors[key])} />
              <span className="text-xs text-slate-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="space-y-1">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="h-10 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-600">{day}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayAppointments = appointmentsByDate[dateKey] || [];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, today);

                return (
                  <div
                    key={dateKey}
                    onClick={() => onDateSelect?.(day)}
                    className={cn(
                      'min-h-24 p-2 rounded border border-slate-200 bg-white cursor-pointer transition-colors',
                      isCurrentMonth ? 'hover:bg-slate-50' : 'bg-slate-50 opacity-50',
                      isToday && 'border-lime-600 bg-lime-50'
                    )}
                  >
                    {/* Date Number */}
                    <div className={cn('text-xs font-bold mb-1', isToday ? 'text-lime-600' : 'text-slate-900')}>
                      {format(day, 'd')}
                      {isToday && <span className="ml-1">◆</span>}
                    </div>

                    {/* Appointments */}
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 2).map((apt) => (
                        <div
                          key={apt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick?.(apt);
                          }}
                          className={cn(
                            'text-xs px-1.5 py-0.5 rounded text-white truncate cursor-pointer hover:opacity-80 font-medium',
                            appointmentTypeColors[apt.type]
                          )}
                          title={apt.title}
                        >
                          {format(new Date(apt.startTime), 'HH:mm')} {apt.title}
                        </div>
                      ))}

                      {/* More indicator */}
                      {dayAppointments.length > 2 && (
                        <div className="text-xs text-slate-500 px-1 font-medium">
                          +{dayAppointments.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Appointments Summary */}
      {appointments.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Upcoming Appointments</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {appointments
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
              .slice(0, 5)
              .map((apt) => {
                const startDate = new Date(apt.startTime);
                const isPast = new Date() > startDate;

                return (
                  <div
                    key={apt.id}
                    onClick={() => onAppointmentClick?.(apt)}
                    className={cn(
                      'flex items-center justify-between p-2 rounded border text-xs cursor-pointer hover:bg-slate-50',
                      isPast && 'opacity-50'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn('w-2 h-2 rounded-full flex-shrink-0', appointmentTypeColors[apt.type])} />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{apt.title}</p>
                        <div className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3" />
                          {format(startDate, 'HH:mm')}
                        </div>
                      </div>
                    </div>
                    <p className="text-right flex-shrink-0">
                      {format(startDate, 'd MMM')}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </Card>
  );
}
