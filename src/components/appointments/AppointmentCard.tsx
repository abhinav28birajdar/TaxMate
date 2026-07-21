'use client';

import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Clock, Users, MapPin, Video, Phone, FileText, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type AppointmentType = 'video_call' | 'phone_call' | 'in_person' | 'email_follow_up';
type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

interface Attendee {
  id: string;
  name: string;
  email: string;
  role: 'organizer' | 'attendee' | 'optional';
}

interface AppointmentCardProps {
  id: string;
  title: string;
  description?: string;
  type: AppointmentType;
  status: AppointmentStatus;
  startTime: string;
  endTime: string;
  attendees: Attendee[];
  location?: string;
  meetingLink?: string;
  notes?: string;
  client?: string;
  compact?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onJoin?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  className?: string;
}

const appointmentTypeConfig: Record<AppointmentType, { icon: React.ReactNode; label: string; color: string }> = {
  video_call: { icon: <Video className="w-4 h-4" />, label: 'Video Call', color: 'bg-blue-100 text-blue-700' },
  phone_call: { icon: <Phone className="w-4 h-4" />, label: 'Phone Call', color: 'bg-green-100 text-green-700' },
  in_person: { icon: <MapPin className="w-4 h-4" />, label: 'In-Person', color: 'bg-amber-100 text-amber-700' },
  email_follow_up: {
    icon: <FileText className="w-4 h-4" />,
    label: 'Email Follow-up',
    color: 'bg-purple-100 text-purple-700',
  },
};

const statusConfig: Record<AppointmentStatus, { label: string; color: string; icon?: string }> = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700', icon: '📅' },
  confirmed: { label: 'Confirmed', color: 'bg-lime-100 text-lime-700', icon: '✓' },
  completed: { label: 'Completed', color: 'bg-slate-100 text-slate-700', icon: '✓' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: '✕' },
  no_show: { label: 'No Show', color: 'bg-orange-100 text-orange-700', icon: '!' },
};

export default function AppointmentCard({
  id,
  title,
  description,
  type,
  status,
  startTime,
  endTime,
  attendees,
  location,
  meetingLink,
  notes,
  client,
  compact = false,
  onEdit,
  onDelete,
  onJoin,
  onConfirm,
  onCancel,
  className,
}: AppointmentCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const typeConfig = appointmentTypeConfig[type];
  const statusConfig_ = statusConfig[status];

  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  const isPast = new Date() > endDate;
  const isUpcoming = new Date() < startDate;
  const isHappening = new Date() >= startDate && new Date() <= endDate;

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete();
      setDeleteDialogOpen(false);
    }
  };

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 hover:shadow-sm',
          isPast && 'opacity-60',
          isHappening && 'border-lime-600 bg-lime-50',
          className
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={cn('p-1.5 rounded', typeConfig.color)}>{typeConfig.icon}</div>
            <p className="font-medium text-slate-900 truncate">{title}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Clock className="w-3 h-3" /> {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
            {client && <Badge variant="secondary" className="text-xs">{client}</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Badge className={statusConfig_.color}>{statusConfig_.label}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                ⋯
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>}
              {onJoin && meetingLink && <DropdownMenuItem onClick={onJoin}>Join</DropdownMenuItem>}
              {onDelete && (
                <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-red-600">
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <ConfirmDialog
          open={deleteDialogOpen}
          title="Delete Appointment?"
          description={`This will permanently delete the appointment "${title}".`}
          onConfirm={handleDelete}
          isDangerous
        />
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all',
        isPast && 'opacity-75',
        isHappening && 'border-lime-600 bg-lime-50 ring-2 ring-lime-200',
        className
      )}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn('p-2 rounded', typeConfig.color)}>{typeConfig.icon}</div>
              <div>
                <p className="text-lg font-semibold text-slate-900">{title}</p>
                {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="hover:bg-slate-100">
                ⋯
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>}
              {onDelete && (
                <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-red-600">
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-4">
          <Badge className={statusConfig_.color}>{statusConfig_.label}</Badge>
          {client && <Badge variant="outline">{client}</Badge>}
          {isHappening && <Badge className="bg-lime-600 text-white">🔴 LIVE NOW</Badge>}
        </div>

        {/* Date/Time Section */}
        <div className="mb-4 p-3 bg-slate-50 rounded border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <p className="font-semibold text-slate-900">{format(startDate, 'EEE, d MMM yyyy')}</p>
          </div>
          <p className="text-sm text-slate-700">
            {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {formatDistanceToNow(startDate, { addSuffix: true })}
          </p>
        </div>

        {/* Location/Meeting Link */}
        {(location || meetingLink) && (
          <div className="mb-4 space-y-2">
            {location && (
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                <MapPin className="w-4 h-4 text-slate-600" />
                <p className="text-sm text-slate-700">{location}</p>
              </div>
            )}
            {meetingLink && (
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-700">Meeting Link Available</p>
                </div>
                {onJoin && (
                  <Button size="sm" className="bg-lime-600 hover:bg-lime-700 text-white" onClick={onJoin}>
                    Join Now
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Attendees */}
        {attendees.length > 0 && (
          <div className="mb-4 p-3 bg-slate-50 rounded border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-slate-600" />
              <p className="font-semibold text-slate-900">Attendees ({attendees.length})</p>
            </div>
            <div className="space-y-1">
              {attendees.map((attendee) => (
                <div key={attendee.id} className="flex items-center justify-between text-sm">
                  <p className="text-slate-700">{attendee.name}</p>
                  <span className="text-xs text-slate-500">
                    {attendee.role === 'organizer' ? '👤 Organizer' : attendee.role === 'optional' ? '❓ Optional' : 'Attendee'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="mb-4 p-3 bg-slate-50 rounded border border-slate-200">
            <p className="text-xs font-medium text-slate-600 mb-1">Notes</p>
            <p className="text-sm text-slate-700 line-clamp-3">{notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {status === 'scheduled' && onConfirm && (
            <Button variant="outline" className="flex-1 hover:bg-slate-100" onClick={onConfirm}>
              Confirm
            </Button>
          )}
          {status !== 'completed' && onCancel && (
            <Button variant="outline" className="flex-1 hover:bg-slate-100" onClick={onCancel}>
              Cancel
            </Button>
          )}
          {meetingLink && onJoin && (
            <Button className="flex-1 bg-lime-600 hover:bg-lime-700 text-white" onClick={onJoin}>
              {isHappening ? '🔴 Join Meeting' : 'Join'}
            </Button>
          )}
          {onEdit && (
            <Button className="flex-1 bg-lime-600 hover:bg-lime-700 text-white" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Appointment?"
        description={`This will permanently delete "${title}". This action cannot be undone.`}
        onConfirm={handleDelete}
        isDangerous
      />
    </Card>
  );
}
