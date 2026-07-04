'use client';

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const appointmentFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  type: z.enum(['video_call', 'phone_call', 'in_person', 'email_follow_up']),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  location: z.string().optional(),
  meetingLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  client: z.string().optional(),
  notes: z.string().optional(),
  attendees: z.array(
    z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      email: z.string().email('Invalid email address'),
      role: z.enum(['organizer', 'attendee', 'optional']),
    })
  ),
});

type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  initialData?: Partial<AppointmentFormData>;
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function AppointmentForm({
  onSubmit,
  initialData,
  isLoading = false,
  title = 'Schedule Appointment',
  subtitle = 'Create a new meeting or call',
  className,
}: AppointmentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      type: initialData?.type || 'video_call',
      status: initialData?.status || 'scheduled',
      startTime: initialData?.startTime || '',
      endTime: initialData?.endTime || '',
      location: initialData?.location || '',
      meetingLink: initialData?.meetingLink || '',
      client: initialData?.client || '',
      notes: initialData?.notes || '',
      attendees: initialData?.attendees || [{ name: '', email: '', role: 'attendee' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'attendees',
  });

  const appointmentType = watch('type');

  const addAttendee = () => {
    append({ name: '', email: '', role: 'attendee' });
  };

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title and Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Title *
            </Label>
            <Input
              {...register('title')}
              placeholder="e.g., Client Tax Planning Discussion"
              className={cn(errors.title && 'border-red-500')}
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Client (Optional)
            </Label>
            <Input
              {...register('client')}
              placeholder="Client name"
              className={cn(errors.client && 'border-red-500')}
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-slate-900 mb-2 block">
            Description (Optional)
          </Label>
          <Textarea
            {...register('description')}
            placeholder="Add meeting details or agenda..."
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Type and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Appointment Type *
            </Label>
            <Select
              value={appointmentType}
              onValueChange={(value) => setValue('type', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video_call">Video Call</SelectItem>
                <SelectItem value="phone_call">Phone Call</SelectItem>
                <SelectItem value="in_person">In-Person</SelectItem>
                <SelectItem value="email_follow_up">Email Follow-up</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Status
            </Label>
            <Select
              defaultValue="scheduled"
              onValueChange={(value) => setValue('status', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Start Time *
            </Label>
            <Input
              {...register('startTime')}
              type="datetime-local"
              className={cn(errors.startTime && 'border-red-500')}
            />
            {errors.startTime && (
              <p className="text-sm text-red-600 mt-1">{errors.startTime.message}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              End Time *
            </Label>
            <Input
              {...register('endTime')}
              type="datetime-local"
              className={cn(errors.endTime && 'border-red-500')}
            />
            {errors.endTime && (
              <p className="text-sm text-red-600 mt-1">{errors.endTime.message}</p>
            )}
          </div>
        </div>

        {/* Location and Meeting Link */}
        {appointmentType === 'in_person' && (
          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Location *
            </Label>
            <Input
              {...register('location')}
              placeholder="Enter meeting location"
              className={cn(errors.location && 'border-red-500')}
            />
            {errors.location && (
              <p className="text-sm text-red-600 mt-1">{errors.location.message}</p>
            )}
          </div>
        )}

        {appointmentType === 'video_call' && (
          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Meeting Link (Optional)
            </Label>
            <Input
              {...register('meetingLink')}
              placeholder="https://meet.google.com/..."
              className={cn(errors.meetingLink && 'border-red-500')}
            />
            {errors.meetingLink && (
              <p className="text-sm text-red-600 mt-1">{errors.meetingLink.message}</p>
            )}
          </div>
        )}

        {/* Attendees */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-semibold text-slate-900">Attendees</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAttendee}
              className="gap-1"
            >
              <Plus className="w-4 h-4" /> Add Attendee
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <div>
                    <Input
                      {...register(`attendees.${index}.name`)}
                      placeholder="Name"
                      className={cn(errors.attendees?.[index]?.name && 'border-red-500')}
                    />
                  </div>
                  <div>
                    <Input
                      {...register(`attendees.${index}.email`)}
                      type="email"
                      placeholder="Email"
                      className={cn(errors.attendees?.[index]?.email && 'border-red-500')}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select
                      defaultValue="attendee"
                      onValueChange={(value) =>
                        setValue(`attendees.${index}.role`, value as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="organizer">Organizer</SelectItem>
                        <SelectItem value="attendee">Attendee</SelectItem>
                        <SelectItem value="optional">Optional</SelectItem>
                      </SelectContent>
                    </Select>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {(errors.attendees?.[index]?.name ||
                  errors.attendees?.[index]?.email ||
                  errors.attendees?.[index]?.role) && (
                  <p className="text-xs text-red-600">Please fill in all attendee details</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label className="text-sm font-semibold text-slate-900 mb-2 block">
            Notes (Optional)
          </Label>
          <Textarea
            {...register('notes')}
            placeholder="Add any additional notes..."
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
            className="flex-1"
            disabled={isLoading}
          >
            Clear
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-lime-600 hover:bg-lime-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Appointment' : 'Schedule Appointment'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
