'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  taxRate: number;
}

interface LineItemRowProps {
  item: LineItem;
  index: number;
  onUpdate: (updatedItem: LineItem) => void;
  onRemove: () => void;
  taxes?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function LineItemRow({
  item,
  index,
  onUpdate,
  onRemove,
  taxes = true,
  disabled = false,
  className,
}: LineItemRowProps) {
  const handleDescriptionChange = (description: string) => {
    onUpdate({ ...item, description });
  };

  const handleQuantityChange = (quantity: string) => {
    const q = parseFloat(quantity) || 0;
    onUpdate({ ...item, quantity: q });
  };

  const handleRateChange = (rate: string) => {
    const r = parseFloat(rate) || 0;
    onUpdate({ ...item, rate: r });
  };

  const handleTaxChange = (taxRate: string) => {
    const t = parseFloat(taxRate) || 0;
    onUpdate({ ...item, taxRate: t });
  };

  const subtotal = item.quantity * item.rate;
  const tax = (subtotal * item.taxRate) / 100;
  const total = subtotal + tax;

  return (
    <div className={cn('grid grid-cols-12 gap-2 items-start', className)}>
      {/* Description */}
      <div className="col-span-4">
        <Input
          value={item.description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="Service description"
          disabled={disabled}
          className="text-sm"
        />
      </div>

      {/* Quantity */}
      <div className="col-span-2">
        <Input
          type="number"
          value={item.quantity}
          onChange={(e) => handleQuantityChange(e.target.value)}
          placeholder="Qty"
          disabled={disabled}
          className="text-sm"
          min="0"
          step="0.01"
        />
      </div>

      {/* Rate */}
      <div className="col-span-2">
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-sm text-slate-500">₹</span>
          <Input
            type="number"
            value={item.rate}
            onChange={(e) => handleRateChange(e.target.value)}
            placeholder="0.00"
            disabled={disabled}
            className="text-sm pl-7"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Tax Rate (if enabled) */}
      {taxes && (
        <div className="col-span-2">
          <Select
            value={item.taxRate.toString()}
            onValueChange={handleTaxChange}
            disabled={disabled}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0%</SelectItem>
              <SelectItem value="5">5%</SelectItem>
              <SelectItem value="12">12%</SelectItem>
              <SelectItem value="18">18%</SelectItem>
              <SelectItem value="28">28%</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Amount */}
      <div className="col-span-1 text-right">
        <div className="text-sm font-semibold text-slate-900">
          ₹{total.toFixed(2)}
        </div>
        <div className="text-xs text-slate-500">
          {taxes && item.taxRate > 0 ? `+${item.taxRate}%` : 'no tax'}
        </div>
      </div>

      {/* Remove Button */}
      <div className="col-span-1 flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={disabled}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Calculate line item totals
 * @param items Array of line items
 * @returns Object with subtotal, tax, and total amounts
 */
export function calculateLineItemTotals(items: LineItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const taxes = items.reduce(
    (sum, item) => sum + (item.quantity * item.rate * item.taxRate) / 100,
    0
  );
  const total = subtotal + taxes;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    taxes: parseFloat(taxes.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
}
