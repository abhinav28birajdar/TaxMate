'use client';

import React, { useState } from 'react';
import { Upload, X, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void | Promise<void>;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export default function FileUpload({
  onFileSelect,
  accept = '*',
  multiple = true,
  maxSize,
  disabled = false,
  isLoading = false,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    await handleFiles(droppedFiles);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    await handleFiles(selectedFiles);
  };

  const handleFiles = async (selectedFiles: File[]) => {
    setError(null);

    if (!multiple && selectedFiles.length > 1) {
      setError('Only one file is allowed');
      return;
    }

    if (maxSize) {
      const oversized = selectedFiles.filter((f) => f.size > maxSize);
      if (oversized.length > 0) {
        setError(`Files must be smaller than ${maxSize / 1024 / 1024}MB`);
        return;
      }
    }

    setFiles(selectedFiles);
    await onFileSelect(selectedFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <label
        className={cn(
          'relative block rounded-lg border-2 border-dashed transition-colors cursor-pointer',
          isDragging
            ? 'border-lime-600 bg-lime-50'
            : 'border-slate-200 bg-slate-50 hover:border-slate-300',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Upload className="h-8 w-8 text-slate-400 mb-2" />
          <p className="font-medium text-slate-900">
            Drop files here or click to upload
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {multiple ? 'Multiple files allowed' : 'Single file only'}
            {maxSize && ` • Max ${maxSize / 1024 / 1024}MB`}
          </p>
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileSelect}
            disabled={disabled || isLoading}
            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>
      </label>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-900">
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </p>
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3"
            >
              <div className="flex items-center gap-2 min-w-0">
                <File className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              {!isLoading && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFile(i)}
                  className="h-6 w-6 p-0 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
