'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
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
import LineItemRow, { LineItem, calculateLineItemTotals } from './LineItemRow';
import { cn } from '@/lib/utils';

const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(3, 'Invoice number is required'),
  client: z.string().min(2, 'Client name is required'),
  clientEmail: z.string().email('Invalid client email'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  description: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  currency: z.string().default('INR'),
  taxEnabled: z.boolean().default(true),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

interface InvoiceFormProps {
  onSubmit: (data: InvoiceFormData, lineItems: LineItem[]) => Promise<void>;
  initialData?: Partial<InvoiceFormData>;
  initialLineItems?: LineItem[];
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `INV-${year}${month}-${random}`;
}

export default function InvoiceForm({
  onSubmit,
  initialData,
  initialLineItems = [],
  isLoading = false,
  title = 'Create Invoice',
  subtitle = 'Create a new invoice for a client',
  className,
}: InvoiceFormProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialLineItems.length > 0
      ? initialLineItems
      : [
          {
            id: '1',
            description: '',
            quantity: 1,
            rate: 0,
            taxRate: 18,
          },
        ]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: initialData?.invoiceNumber || generateInvoiceNumber(),
      client: initialData?.client || '',
      clientEmail: initialData?.clientEmail || '',
      issueDate: initialData?.issueDate || new Date().toISOString().split('T')[0],
      dueDate: initialData?.dueDate || '',
      description: initialData?.description || '',
      notes: initialData?.notes || '',
      terms: initialData?.terms || '',
      currency: initialData?.currency || 'INR',
      taxEnabled: initialData?.taxEnabled ?? true,
    },
  });

  const taxEnabled = watch('taxEnabled');
  const totals = calculateLineItemTotals(lineItems);

  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      taxRate: 18,
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleUpdateLineItem = (index: number, updatedItem: LineItem) => {
    const updated = [...lineItems];
    updated[index] = updatedItem;
    setLineItems(updated);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: InvoiceFormData) => {
    if (lineItems.length === 0) {
      alert('Please add at least one line item');
      return;
    }
    await onSubmit(data, lineItems);
  };

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Invoice Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded border border-slate-200">
          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Invoice Number *
            </Label>
            <Input
              {...register('invoiceNumber')}
              disabled={isLoading}
              className={cn(errors.invoiceNumber && 'border-red-500')}
            />
            {errors.invoiceNumber && (
              <p className="text-sm text-red-600 mt-1">{errors.invoiceNumber.message}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Currency
            </Label>
            <Select
              defaultValue="INR"
              onValueChange={(value) => setValue('currency', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">₹ INR</SelectItem>
                <SelectItem value="USD">$ USD</SelectItem>
                <SelectItem value="EUR">€ EUR</SelectItem>
                <SelectItem value="GBP">£ GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Issue Date *
            </Label>
            <Input
              {...register('issueDate')}
              type="date"
              disabled={isLoading}
              className={cn(errors.issueDate && 'border-red-500')}
            />
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Due Date *
            </Label>
            <Input
              {...register('dueDate')}
              type="date"
              disabled={isLoading}
              className={cn(errors.dueDate && 'border-red-500')}
            />
          </div>
        </div>

        {/* Client Information */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-slate-900 mb-4">Bill To</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-900 mb-2 block">
                Client Name *
              </Label>
              <Input
                {...register('client')}
                placeholder="Company or Individual Name"
                disabled={isLoading}
                className={cn(errors.client && 'border-red-500')}
              />
              {errors.client && (
                <p className="text-sm text-red-600 mt-1">{errors.client.message}</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-semibold text-slate-900 mb-2 block">
                Client Email *
              </Label>
              <Input
                {...register('clientEmail')}
                type="email"
                placeholder="client@example.com"
                disabled={isLoading}
                className={cn(errors.clientEmail && 'border-red-500')}
              />
              {errors.clientEmail && (
                <p className="text-sm text-red-600 mt-1">{errors.clientEmail.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Description (Optional)
            </Label>
            <Textarea
              {...register('description')}
              placeholder="Brief description of services rendered"
              rows={2}
              disabled={isLoading}
              className="resize-none"
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Invoice Items</h3>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={taxEnabled}
                  onChange={(e) => setValue('taxEnabled', e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4"
                />
                <span>Enable Tax</span>
              </label>
            </div>
          </div>

          {/* Line Items Header */}
          <div className="grid grid-cols-12 gap-2 mb-3 p-3 bg-slate-100 rounded font-semibold text-xs text-slate-600">
            <div className="col-span-4">Description</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-2">Rate</div>
            {taxEnabled && <div className="col-span-2">Tax</div>}
            <div className="col-span-1">Amount</div>
            <div className="col-span-1"></div>
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            {lineItems.map((item, index) => (
              <LineItemRow
                key={item.id}
                item={item}
                index={index}
                onUpdate={(updatedItem) => handleUpdateLineItem(index, updatedItem)}
                onRemove={() => handleRemoveLineItem(index)}
                taxes={taxEnabled}
                disabled={isLoading}
                className="p-3 bg-white rounded border border-slate-200 hover:bg-slate-50"
              />
            ))}
          </div>

          {/* Add Line Item Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddLineItem}
            disabled={isLoading}
            className="mt-3 gap-2"
          >
            <Plus className="w-4 h-4" /> Add Line Item
          </Button>
        </div>

        {/* Totals */}
        <div className="border-t pt-6">
          <div className="ml-auto max-w-xs space-y-2">
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold">₹{totals.subtotal.toFixed(2)}</span>
            </div>
            {taxEnabled && totals.taxes > 0 && (
              <div className="flex justify-between p-2 bg-slate-50 rounded">
                <span className="text-slate-600">Tax</span>
                <span className="font-semibold">₹{totals.taxes.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between p-3 bg-lime-50 rounded border-2 border-lime-600">
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-bold text-lg text-lime-700">₹{totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes and Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Notes (Optional)
            </Label>
            <Textarea
              {...register('notes')}
              placeholder="Add any special notes..."
              rows={3}
              disabled={isLoading}
              className="resize-none"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Payment Terms (Optional)
            </Label>
            <Textarea
              {...register('terms')}
              placeholder="e.g., Due upon receipt, Net 30"
              rows={3}
              disabled={isLoading}
              className="resize-none"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t">
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
            disabled={isLoading || lineItems.length === 0}
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
