'use client';

import React, { useEffect, useState } from 'react';
import { documentService } from '@/lib/services';
import { Document } from '@lib/types/complete.types';
import {
  Card,
  Button,
  Badge,
  LoadingSpinner,
  DataTable,
  ProgressBar,
} from '@/components/ui/core-components';
import { colors } from '@/theme/design-system';

// ============================================================================
// DOCUMENT MANAGEMENT COMPONENT
// Secure and organized document storage and management
// ============================================================================

interface DocumentManagementProps {
  clientId: string;
  caId: string;
}

const DOCUMENT_CATEGORIES = [
  'gst_docs',
  'itr_docs',
  'bank_statements',
  'invoices',
  'receipts',
  'compliance_docs',
  'identity_proof',
  'business_proof',
  'other',
];

export const DocumentManagement: React.FC<DocumentManagementProps> = ({ clientId, caId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, number>>(new Map());
  const [storageUsed, setStorageUsed] = useState(0);
  const [totalStorage] = useState(5 * 1024 * 1024 * 1024); // 5GB

  useEffect(() => {
    loadDocuments();
  }, [clientId]);

  useEffect(() => {
    filterDocuments();
  }, [documents, selectedCategory]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentService.getDocuments(clientId);
      setDocuments(response.data);

      // Calculate storage used
      const totalSize = (response.data || []).reduce((sum: number, doc: any) => sum + (doc.file_size || 0), 0);
      setStorageUsed(totalSize);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    if (selectedCategory === 'all') {
      setFilteredDocs(documents);
    } else {
      setFilteredDocs(documents.filter((doc) => doc.category === selectedCategory));
    }
  };

  const handleFileUpload = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const category = selectedCategory === 'all' ? 'other' : selectedCategory;

      try {
        const fileIdForProgress = file.name;
        setUploadingFiles(
          new Map(uploadingFiles).set(fileIdForProgress, 0)
        );

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadingFiles((prev) => {
            const newMap = new Map(prev);
            const current = newMap.get(fileIdForProgress) || 0;
            if (current < 90) {
              newMap.set(fileIdForProgress, current + Math.random() * 20);
              return newMap;
            }
            return prev;
          });
        }, 200);

        await documentService.uploadDocument(clientId, caId, file, category);

        clearInterval(progressInterval);
        setUploadingFiles((prev) => {
          const newMap = new Map(prev);
          newMap.set(fileIdForProgress, 100);
          setTimeout(() => {
            newMap.delete(fileIdForProgress);
            setUploadingFiles(newMap);
          }, 1000);
          return newMap;
        });

        loadDocuments();
      } catch (error) {
        console.error('Failed to upload file:', error);
        setUploadingFiles((prev) => {
          const newMap = new Map(prev);
          newMap.delete(file.name);
          return newMap;
        });
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      gst_docs: '📋',
      itr_docs: '1️⃣',
      bank_statements: '🏦',
      invoices: '🧾',
      receipts: '🧺',
      compliance_docs: '✅',
      identity_proof: '🪪',
      business_proof: '🏢',
      other: '📁',
    };
    return iconMap[category] || '📄';
  };

  const getValidityStatus = (doc: Document) => {
    if (!doc.expiry_date) return 'active';
    const expiryDate = new Date(doc.expiry_date);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry < 30) return 'expiring_soon';
    return 'valid';
  };

  const validityColors = {
    expiring_soon: 'warning',
    expired: 'danger',
    valid: 'success',
  } as const;

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <Card>
        <h3 className="text-lg font-bold mb-4">Storage Usage</h3>
        <ProgressBar
          value={storageUsed}
          max={totalStorage}
          label={`${(storageUsed / (1024 * 1024)).toFixed(2)} MB / ${(totalStorage / (1024 * 1024 * 1024)).toFixed(1)} GB`}
          color={storageUsed > totalStorage * 0.8 ? 'danger' : 'primary'}
        />
      </Card>

      {/* Upload Area */}
      <Card
        glass
        interactive
        onDrop={(e) => {
          e.preventDefault();
          const files = e.dataTransfer.files;
          handleFileUpload(files);
        }}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: `2px dashed ${colors.primary[300]}`,
          backgroundColor: colors.primary[50],
          textAlign: 'center',
          padding: '40px',
          cursor: 'pointer',
        }}
      >
        <div className="py-8">
          <p className="text-3xl mb-2">📤</p>
          <h3 className="font-semibold mb-2">Drag & Drop Files Here</h3>
          <p style={{ color: colors.neutral[600] }} className="text-sm mb-4">
            or
          </p>
          <input
            type="file"
            id="file-upload"
            multiple
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            style={{ display: 'none' }}
          />
          <Button
            as="label"
            htmlFor="file-upload"
            variant="primary"
            size="sm"
            style={{ cursor: 'pointer' }}
          >
            Select Files
          </Button>
          <p style={{ color: colors.neutral[500] }} className="text-xs mt-3">
            Maximum file size: 100MB per file
          </p>
        </div>
      </Card>

      {/* Upload Progress */}
      {uploadingFiles.size > 0 && (
        <Card>
          <h3 className="font-semibold mb-4">Uploading Files</h3>
          <div className="space-y-3">
            {Array.from(uploadingFiles.entries()).map(([fileName, progress]) => (
              <div key={fileName}>
                <p className="text-sm font-medium mb-1">{fileName}</p>
                <ProgressBar value={progress} max={100} color="primary" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className="px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap"
          style={{
            backgroundColor: selectedCategory === 'all' ? colors.primary[600] : colors.neutral[200],
            color: selectedCategory === 'all' ? 'white' : colors.neutral[700],
          }}
        >
          All Documents
        </button>
        {DOCUMENT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className="px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap"
            style={{
              backgroundColor: selectedCategory === cat ? colors.primary[600] : colors.neutral[200],
              color: selectedCategory === cat ? 'white' : colors.neutral[700],
            }}
          >
            {getCategoryIcon(cat)} {cat.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Documents Table */}
      <Card>
        {filteredDocs.length > 0 ? (
          <>
            <h3 className="text-lg font-bold mb-4">
              Documents ({filteredDocs.length})
            </h3>
            <DataTable<Document>
              columns={[
                {
                  key: 'file_name',
                  label: 'File Name',
                  render: (value) => (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📄</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ),
                },
                {
                  key: 'category',
                  label: 'Category',
                  render: (value) => (
                    <Badge variant="info" size="sm">
                      {String(value).replace('_', ' ').toUpperCase()}
                    </Badge>
                  ),
                },
                {
                  key: 'file_size',
                  label: 'Size',
                  render: (value) => {
                    const bytes = Number(value) || 0;
                    if (bytes === 0) return '-';
                    const mb = (bytes / (1024 * 1024)).toFixed(2);
                    return `${mb} MB`;
                  },
                },
                {
                  key: 'expiry_date',
                  label: 'Expiry',
                  render: (value, row) => {
                    if (!value) return '-';
                    const status = getValidityStatus(row);
                    return (
                      <div>
                        <Badge variant={validityColors[status as keyof typeof validityColors]} size="sm">
                          {status.replace('_', ' ')}
                        </Badge>
                        <p className="text-xs" style={{ color: colors.neutral[500] }}>
                          {new Date(value).toLocaleDateString()}
                        </p>
                      </div>
                    );
                  },
                },
                {
                  key: 'created_at',
                  label: 'Uploaded',
                  render: (value) => new Date(value).toLocaleDateString(),
                },
                {
                  key: 'id',
                  label: 'Action',
                  render: (_, row) => (
                    <div className="flex gap-2">
                      <Button
                        as="a"
                        href={row.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="sm"
                        variant="outline"
                      >
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => documentService.deleteDocument(row.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ),
                },
              ]}
              data={filteredDocs}
            />
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-lg" style={{ color: colors.neutral[500] }}>
              No documents in this category yet
            </p>
            <p className="text-sm" style={{ color: colors.neutral[400] }}>
              Upload documents using the drag & drop area above
            </p>
          </div>
        )}
      </Card>

      {/* Alerts for Expiring Documents */}
      {filteredDocs.some((doc) => getValidityStatus(doc) === 'expiring_soon') && (
        <Card
          style={{
            backgroundColor: colors.warning[50],
            borderLeft: `4px solid ${colors.warning[500]}`,
          }}
        >
          <h3 className="font-bold mb-2" style={{ color: colors.warning[700] }}>
            ⚠️ Documents Expiring Soon
          </h3>
          <div className="space-y-2">
            {filteredDocs
              .filter((doc) => getValidityStatus(doc) === 'expiring_soon')
              .map((doc) => (
                <p key={doc.id} className="text-sm" style={{ color: colors.warning[700] }}>
                  {doc.file_name} expires on {new Date(doc.expiry_date || '').toLocaleDateString()}
                </p>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default DocumentManagement;
