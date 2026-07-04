'use client';

import React, { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ComplianceItem {
  id: string;
  complianceType: string;
  client: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'filed' | 'rejected' | 'overdue';
}

interface ComplianceCalendarProps {
  items: ComplianceItem[];
  onDateSelect?: (date: Date) => void;
  onItemClick?: (item: ComplianceItem) => void;
  className?: string;
}

const complianceTypeConfig: Record<string, { color: string; abbreviation: string }> = {
  gst_r1: { color: 'bg-blue-500', abbreviation: 'GST R1' },
  gst_r3b: { color: 'bg-blue-400', abbreviation: 'GST R3B' },
  gst_r2: { color: 'bg-blue-300', abbreviation: 'GST R2' },
  itr: { color: 'bg-indigo-500', abbreviation: 'ITR' },
  tds_24q: { color: 'bg-purple-500', abbreviation: 'TDS 24Q' },
  tds_26q: { color: 'bg-purple-400', abbreviation: 'TDS 26Q' },
  annual_return: { color: 'bg-green-500', abbreviation: 'AR' },
  audit_report: { color: 'bg-amber-500', abbreviation: 'AU' },
  board_meeting: { color: 'bg-cyan-500', abbreviation: 'BM' },
  proxy_filing: { color: 'bg-rose-500', abbreviation: 'PF' },
  llp_filing: { color: 'bg-orange-500', abbreviation: 'LLP' },
  fema_compliance: { color: 'bg-pink-500', abbreviation: 'FEMA' },
  other: { color: 'bg-slate-500', abbreviation: 'OTH' },
};

const statusColors: Record<string, string> = {
  pending: 'bg-slate-200',
  in_progress: 'bg-blue-200',
  filed: 'bg-lime-200',
  rejected: 'bg-red-200',
  overdue: 'bg-red-500',
};

export default function ComplianceCalendar({
  items,
  onDateSelect,
  onItemClick,
  className,
}: ComplianceCalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group items by date
  const itemsByDate = useMemo(() => {
    const grouped: Record<string, ComplianceItem[]> = {};
    items.forEach((item) => {
      const dateKey = format(new Date(item.dueDate), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });
    return grouped;
  }, [items]);

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
          <h2 className="text-2xl font-bold text-slate-900">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <p className="text-sm text-slate-600 mt-1">Compliance Filing Schedule</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={previousMonth}
            className="hover:bg-slate-100"
          >
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
          <Button
            variant="outline"
            size="sm"
            onClick={nextMonth}
            className="hover:bg-slate-100"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 p-3 bg-slate-50 rounded border border-slate-200">
        <p className="text-xs font-semibold text-slate-600 mb-2">Compliance Types:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {Object.entries(complianceTypeConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1">
              <div className={cn('w-3 h-3 rounded', config.color)} />
              <span className="text-xs text-slate-600">{config.abbreviation}</span>
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
                const dayItems = itemsByDate[dateKey] || [];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, today);
                const hasOverdue = dayItems.some((item) => item.status === 'overdue');

                return (
                  <div
                    key={dateKey}
                    onClick={() => onDateSelect?.(day)}
                    className={cn(
                      'min-h-24 p-2 rounded border border-slate-200 bg-white cursor-pointer transition-colors',
                      isCurrentMonth ? 'hover:bg-slate-50' : 'bg-slate-50 opacity-50',
                      isToday && 'border-lime-600 bg-lime-50',
                      hasOverdue && 'border-red-300 bg-red-50'
                    )}
                  >
                    {/* Date Number */}
                    <div className={cn('text-xs font-bold mb-1', isToday ? 'text-lime-600' : 'text-slate-900')}>
                      {format(day, 'd')}
                      {isToday && <span className="ml-1">◆</span>}
                    </div>

                    {/* Items */}
                    <div className="space-y-1">
                      {dayItems.slice(0, 2).map((item) => {
                        const config = complianceTypeConfig[item.complianceType] || complianceTypeConfig.other;
                        return (
                          <div
                            key={item.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onItemClick?.(item);
                            }}
                            className={cn(
                              'text-xs px-1.5 py-0.5 rounded text-white truncate cursor-pointer hover:opacity-80 font-medium',
                              config.color,
                              item.status === 'overdue' && 'ring-2 ring-red-400'
                            )}
                            title={`${config.abbreviation} - ${item.client}`}
                          >
                            {config.abbreviation}
                          </div>
                        );
                      })}

                      {/* More indicator */}
                      {dayItems.length > 2 && (
                        <div className="text-xs text-slate-500 px-1 font-medium">
                          +{dayItems.length - 2} more
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

      {/* Upcoming Deadlines Summary */}
      {items.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Upcoming & Overdue</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {items
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .slice(0, 5)
              .map((item) => {
                const dueDate = new Date(item.dueDate);
                const isOverdue = new Date() > dueDate;
                const config = complianceTypeConfig[item.complianceType] || complianceTypeConfig.other;

                return (
                  <div
                    key={item.id}
                    onClick={() => onItemClick?.(item)}
                    className={cn(
                      'flex items-center justify-between p-2 rounded border text-xs cursor-pointer hover:bg-slate-50',
                      isOverdue && 'border-red-200 bg-red-50'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isOverdue && <AlertCircle className="w-3 h-3 text-red-600 flex-shrink-0" />}
                      <div className={cn('w-2 h-2 rounded-full flex-shrink-0', config.color)} />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{item.client}</p>
                        <p className="text-slate-500">{config.abbreviation}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={cn('font-medium', isOverdue && 'text-red-600')}>
                        {format(dueDate, 'd MMM')}
                      </p>
                      {isOverdue && <p className="text-red-600 text-xs">OVERDUE</p>}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </Card>
  );
}
