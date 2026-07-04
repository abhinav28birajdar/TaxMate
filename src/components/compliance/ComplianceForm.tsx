'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar } from 'lucide-react';
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

type ComplianceType =
  | 'gst_r1'
  | 'gst_r3b'
  | 'gst_r2'
  | 'itr'
  | 'tds_24q'
  | 'tds_26q'
  | 'annual_return'
  | 'audit_report'
  | 'board_meeting'
  | 'proxy_filing'
  | 'llp_filing'
  | 'fema_compliance'
  | 'other';

const complianceFormSchema = z.object({
  complianceType: z.enum([
    'gst_r1',
    'gst_r3b',
    'gst_r2',
    'itr',
    'tds_24q',
    'tds_26q',
    'annual_return',
    'audit_report',
    'board_meeting',
    'proxy_filing',
    'llp_filing',
    'fema_compliance',
    'other',
  ] as const),
  client: z.string().min(2, 'Client name must be at least 2 characters'),
  dueDate: z.string().min(1, 'Due date is required'),
  filingDate: z.string().optional(),
  acknowledgementNumber: z.string().optional(),
  notes: z.string().optional(),
});

type ComplianceFormData = z.infer<typeof complianceFormSchema>;

interface ComplianceFormProps {
  onSubmit: (data: ComplianceFormData) => Promise<void>;
  initialData?: Partial<ComplianceFormData>;
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

const complianceTypeOptions = [
  { value: 'gst_r1', label: 'GST R-1 (Monthly GST Return)' },
  { value: 'gst_r3b', label: 'GST R-3B (Simplified Return)' },
  { value: 'gst_r2', label: 'GST R-2 (Inward Supply)' },
  { value: 'itr', label: 'ITR (Income Tax Return)' },
  { value: 'tds_24q', label: 'TDS 24Q (Quarterly TDS)' },
  { value: 'tds_26q', label: 'TDS 26Q (FDI TDS)' },
  { value: 'annual_return', label: 'Annual Return' },
  { value: 'audit_report', label: 'Audit Report' },
  { value: 'board_meeting', label: 'Board Meeting Minutes' },
  { value: 'proxy_filing', label: 'GST Proxy Filing' },
  { value: 'llp_filing', label: 'LLP Filing' },
  { value: 'fema_compliance', label: 'FEMA Compliance' },
  { value: 'other', label: 'Other Compliance' },
];

export default function ComplianceForm({
  onSubmit,
  initialData,
  isLoading = false,
  title = 'Create Compliance Item',
  subtitle = 'Add a new compliance filing requirement',
  className,
}: ComplianceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ComplianceFormData>({
    resolver: zodResolver(complianceFormSchema),
    defaultValues: {
      complianceType: initialData?.complianceType || 'gst_r1',
      client: initialData?.client || '',
      dueDate: initialData?.dueDate || '',
      filingDate: initialData?.filingDate || '',
      acknowledgementNumber: initialData?.acknowledgementNumber || '',
      notes: initialData?.notes || '',
    },
  });

  const complianceType = watch('complianceType');

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Compliance Type Section */}
        <div>
          <Label className="text-sm font-semibold text-slate-900 mb-2 block">
            Compliance Type *
          </Label>
          <Select
            value={complianceType}
            onValueChange={(value) => setValue('complianceType', value as ComplianceType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {complianceTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.complianceType && (
            <p className="text-sm text-red-600 mt-1">{errors.complianceType.message}</p>
          )}
        </div>

        {/* Client Section */}
        <div>
          <Label className="text-sm font-semibold text-slate-900 mb-2 block">
            Client Name *
          </Label>
          <Input
            {...register('client')}
            placeholder="Enter client name"
            className={cn(errors.client && 'border-red-500')}
          />
          {errors.client && (
            <p className="text-sm text-red-600 mt-1">{errors.client.message}</p>
          )}
        </div>

        {/* Dates Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Due Date *
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                {...register('dueDate')}
                type="date"
                className={cn('pl-10', errors.dueDate && 'border-red-500')}
              />
            </div>
            {errors.dueDate && (
              <p className="text-sm text-red-600 mt-1">{errors.dueDate.message}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Filing Date (Optional)
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                {...register('filingDate')}
                type="date"
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Acknowledgement Number */}
        <div>
          <Label className="text-sm font-semibold text-slate-900 mb-2 block">
            Acknowledgement Number (Optional)
          </Label>
          <Input
            {...register('acknowledgementNumber')}
            placeholder="e.g., GST-2024-001-12345"
            className="font-mono"
          />
          <p className="text-xs text-slate-500 mt-1">
            Enter the acknowledgement number if the filing has been submitted
          </p>
        </div>

        {/* Notes */}
        <div>
          <Label className="text-sm font-semibold text-slate-900 mb-2 block">
            Notes (Optional)
          </Label>
          <Textarea
            {...register('notes')}
            placeholder="Add any notes about this compliance item..."
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-slate-500 mt-1">
            Include any important details or reminders
          </p>
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
            {isLoading ? 'Saving...' : initialData ? 'Update Item' : 'Create Item'}
          </Button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-slate-50 rounded border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-900 mb-2">Compliance Types Guide</h4>
        <ul className="text-xs text-slate-600 space-y-1">
          <li><strong>GST:</strong> GST R-1, R-3B, R-2 are monthly returns</li>
          <li><strong>ITR:</strong> Income Tax Return - usually annual</li>
          <li><strong>TDS:</strong> 24Q and 26Q are quarterly returns</li>
          <li><strong>Annual:</strong> Company annual filing and board meetings</li>
        </ul>
      </div>
    </Card>
  );
}
