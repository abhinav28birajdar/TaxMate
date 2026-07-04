'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, FileIcon, Download, Share2, Trash2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';

interface DocumentCardProps {
  id: string;
  fileName: string;
  category: string;
  client?: string;
  uploadedBy?: string;
  uploadedAt: Date | string;
  fileSize?: number;
  expiryDate?: Date | string;
  isShared?: boolean;
  version?: number;
  onDownload?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  className?: string;
  compact?: boolean;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  pan: { bg: 'bg-blue-100', text: 'text-blue-700' },
  aadhar: { bg: 'bg-purple-100', text: 'text-purple-700' },
  gst_certificate: { bg: 'bg-green-100', text: 'text-green-700' },
  itr: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  balance_sheet: { bg: 'bg-amber-100', text: 'text-amber-700' },
  bank_statement: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  invoice: { bg: 'bg-lime-100', text: 'text-lime-700' },
  contract: { bg: 'bg-pink-100', text: 'text-pink-700' },
  other: { bg: 'bg-slate-100', text: 'text-slate-700' },
};

export default function DocumentCard({
  id,
  fileName,
  category,
  client,
  uploadedBy,
  uploadedAt,
  fileSize,
  expiryDate,
  isShared = false,
  version = 1,
  onDownload,
  onShare,
  onDelete,
  className,
  compact = false,
}: DocumentCardProps) {
  const uploadedAtObj = typeof uploadedAt === 'string' ? new Date(uploadedAt) : uploadedAt;
  const expiryDateObj = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const isExpiringSoon = expiryDateObj && new Date() > new Date(expiryDateObj.getTime() - 30 * 24 * 60 * 60 * 1000);
  const isExpired = expiryDateObj && new Date() > expiryDateObj;

  const categoryColor = categoryColors[category] || categoryColors.other;
  const fileSizeDisplay = fileSize ? `${(fileSize / 1024).toFixed(1)} KB` : 'Unknown size';

  if (compact) {
    return (
      <div
        className={cn(
          'rounded-lg border border-slate-200 bg-white p-3 hover:shadow-md transition-shadow',
          isExpired && 'border-red-200 bg-red-50',
          isExpiringSoon && !isExpired && 'border-amber-200 bg-amber-50',
          className
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <FileIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="font-medium text-slate-900 text-sm truncate">{fileName}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={cn('capitalize text-xs', categoryColor.bg, categoryColor.text)}>
                {category.replace('_', ' ')}
              </Badge>
              {isShared && (
                <Badge variant="outline" className="text-xs">
                  Shared
                </Badge>
              )}
            </div>
          </div>
          {onDownload && (
            <Button variant="ghost" size="sm" onClick={onDownload} className="flex-shrink-0">
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow',
        isExpired && 'border-red-200 bg-red-50',
        isExpiringSoon && !isExpired && 'border-amber-200 bg-amber-50',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FileIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <h3 className="font-semibold text-slate-900 truncate">{fileName}</h3>
          </div>
          <p className="text-xs text-slate-500 truncate">{fileSizeDisplay}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onDownload && (
              <DropdownMenuItem onClick={onDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </DropdownMenuItem>
            )}
            {onShare && (
              <DropdownMenuItem onClick={onShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share with Client
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Category & Status Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge className={cn('capitalize text-xs', categoryColor.bg, categoryColor.text)}>
          {category.replace('_', ' ')}
        </Badge>
        {isShared && (
          <Badge variant="outline" className="text-xs">
            <Share2 className="w-3 h-3 mr-1" />
            Shared
          </Badge>
        )}
        {version > 1 && (
          <Badge variant="secondary" className="text-xs">
            v{version}
          </Badge>
        )}
        {isExpired && (
          <Badge className="bg-red-600 text-white text-xs">Expired</Badge>
        )}
        {isExpiringSoon && !isExpired && (
          <Badge className="bg-amber-600 text-white text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Expiring Soon
          </Badge>
        )}
      </div>

      {/* Metadata */}
      <div className="space-y-2 mb-3 p-3 bg-slate-50 rounded-lg text-xs">
        {client && (
          <p>
            <span className="text-slate-600">Client:</span>
            <span className="ml-2 font-medium text-slate-900">{client}</span>
          </p>
        )}
        {uploadedBy && (
          <p>
            <span className="text-slate-600">Uploaded by:</span>
            <span className="ml-2 font-medium text-slate-900">{uploadedBy}</span>
          </p>
        )}
        <p>
          <span className="text-slate-600">Date:</span>
          <span className="ml-2 font-medium text-slate-900">
            {format(uploadedAtObj, 'dd MMM, yyyy')}
          </span>
        </p>
        {expiryDateObj && (
          <p>
            <span className="text-slate-600">Expires:</span>
            <span className={cn('ml-2 font-medium', isExpired ? 'text-red-600' : 'text-slate-900')}>
              {format(expiryDateObj, 'dd MMM, yyyy')}
            </span>
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onDownload && (
          <Button variant="outline" size="sm" onClick={onDownload} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        )}
        {onShare && (
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className={isShared ? 'flex-1 text-lime-600 border-lime-600' : 'flex-1'}
          >
            <Share2 className="w-4 h-4 mr-2" />
            {isShared ? 'Shared' : 'Share'}
          </Button>
        )}
      </div>
    </div>
  );
}
