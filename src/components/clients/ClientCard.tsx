'use client';

import React from 'react';
import Link from 'next/link';
import { MoreVertical, Mail, Phone, MapPin, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StatusBadge from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

interface ClientCardProps {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  clientType: 'individual' | 'company' | 'partnership' | 'llp' | 'trust';
  status: 'active' | 'inactive' | 'prospect';
  panNumber?: string;
  gstNumber?: string;
  assignedCA?: string;
  activeTasks?: number;
  totalBilled?: number;
  onViewDetails?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

const clientTypeLabel = {
  individual: 'Individual',
  company: 'Company',
  partnership: 'Partnership',
  llp: 'LLP',
  trust: 'Trust',
};

export default function ClientCard({
  id,
  name,
  email,
  phone,
  address,
  clientType,
  status,
  panNumber,
  gstNumber,
  assignedCA,
  activeTasks = 0,
  totalBilled = 0,
  onViewDetails,
  onEdit,
  onDelete,
  className,
}: ClientCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow',
        className
      )}
    >
      {/* Header with Name and Menu */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 truncate">{name}</h3>
          <p className="text-sm text-slate-500 truncate">{clientTypeLabel[clientType]}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onViewDetails && (
              <DropdownMenuItem onClick={onViewDetails}>
                View Details
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={onEdit}>
                Edit
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <StatusBadge status={status} size="sm" />
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Mail className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{email}</span>
        </div>
        {phone && (
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span>{phone}</span>
          </div>
        )}
        {address && (
          <div className="flex items-start gap-2 text-slate-600">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="truncate">{address}</span>
          </div>
        )}
      </div>

      {/* Tax Info */}
      {(panNumber || gstNumber) && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg text-xs space-y-1">
          {panNumber && (
            <p>
              <span className="text-slate-600">PAN:</span>
              <span className="ml-2 font-mono text-slate-900">{panNumber}</span>
            </p>
          )}
          {gstNumber && (
            <p>
              <span className="text-slate-600">GST:</span>
              <span className="ml-2 font-mono text-slate-900">{gstNumber}</span>
            </p>
          )}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-slate-200">
        <div>
          <p className="text-xs text-slate-500">Active Tasks</p>
          <p className="text-lg font-bold text-slate-900">{activeTasks}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Total Billed</p>
          <p className="text-lg font-bold text-lime-600">
            ₹{typeof totalBilled === 'number' ? totalBilled.toLocaleString('en-IN') : totalBilled}
          </p>
        </div>
      </div>

      {/* Assigned CA */}
      {assignedCA && (
        <div className="text-xs text-slate-600">
          Assigned to: <span className="font-medium text-slate-900">{assignedCA}</span>
        </div>
      )}

      {/* Action Button */}
      {onViewDetails && (
        <Button
          variant="outline"
          className="w-full mt-4"
          size="sm"
          onClick={onViewDetails}
        >
          View Profile
        </Button>
      )}
    </div>
  );
}
