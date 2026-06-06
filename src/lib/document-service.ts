/**
 * Document Service - Supabase Implementation
 * Handles all document management operations
 * Replaces Prisma with Supabase client
 */

import { createClient as createServerClient } from '@/utils/supabase/server';

export const documentService = {
  /**
   * Upload document
   */
  async uploadDocument(data: {
    clientId: string;
    caId: string;
    uploadedById: string;
    name: string;
    originalName: string;
    type: string;
    fileSize: number;
    fileUrl: string;
    fileKey: string;
    mimeType?: string;
    description?: string;
  }) {
    const supabase = await createServerClient();

    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        user_id: data.uploadedById,
        ca_id: data.caId,
        client_id: data.clientId,
        file_name: data.name,
        file_type: data.type,
        file_size: data.fileSize,
        file_url: data.fileUrl,
        document_type: data.type,
        status: 'active',
        metadata: {
          original_name: data.originalName,
          mime_type: data.mimeType,
          description: data.description,
          file_key: data.fileKey,
        },
      })
      .select()
      .single();

    if (error) throw error;
    return document;
  },

  /**
   * Get documents by client
   */
  async getDocumentsByClient(
    clientId: string,
    filters?: {
      type?: string;
      skip?: number;
      take?: number;
    }
  ) {
    const supabase = await createServerClient();

    let query = supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('client_id', clientId)
      .eq('status', 'active');

    if (filters?.type) {
      query = query.eq('document_type', filters.type);
    }

    const skip = filters?.skip || 0;
    const take = filters?.take || 20;

    query = query
      .order('created_at', { ascending: false })
      .range(skip, skip + take - 1);

    const { data: documents, error, count } = await query;

    if (error) throw error;

    return { documents: documents || [], total: count || 0 };
  },

  /**
   * Get document by ID
   */
  async getDocumentById(documentId: string) {
    const supabase = await createServerClient();

    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) throw error;
    return document;
  },

  /**
   * Update document
   */
  async updateDocument(documentId: string, data: any) {
    const supabase = await createServerClient();

    const { data: document, error } = await supabase
      .from('documents')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .select()
      .single();

    if (error) throw error;
    return document;
  },

  /**
   * Delete document
   */
  async deleteDocument(documentId: string) {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('documents')
      .update({ status: 'deleted' })
      .eq('id', documentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get recently updated documents
   */
  async getRecentDocuments(caId: string, limit: number = 30) {
    const supabase = await createServerClient();

    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('ca_id', caId)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return documents || [];
  },

  /**
   * Get documents by type
   */
  async getDocumentsByType(clientId: string, type: string) {
    const supabase = await createServerClient();

    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('client_id', clientId)
      .eq('document_type', type)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return documents || [];
  },

  /**
   * Create document version (new document with same name)
   */
  async createDocumentVersion(
    originalDocId: string,
    data: {
      fileUrl: string;
      fileKey: string;
      fileSize: number;
      description?: string;
      uploadedById: string;
    }
  ) {
    const supabase = await createServerClient();

    // Get original document
    const original = await this.getDocumentById(originalDocId);
    if (!original) throw new Error('Document not found');

    // Create new version
    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        user_id: data.uploadedById,
        ca_id: original.ca_id,
        client_id: original.client_id,
        file_name: original.file_name,
        file_type: original.file_type,
        file_size: data.fileSize,
        file_url: data.fileUrl,
        document_type: original.document_type,
        status: 'active',
        metadata: {
          ...original.metadata,
          file_key: data.fileKey,
          description: data.description,
          version: ((original.metadata?.version || 0) as number) + 1,
          previous_version_id: originalDocId,
        },
      })
      .select()
      .single();

    if (error) throw error;
    return document;
  },

  /**
   * Get document storage stats
   */
  async getDocumentStats(caId: string) {
    const supabase = await createServerClient();

    const { data: documents, error } = await supabase
      .from('documents')
      .select('file_size, document_type')
      .eq('ca_id', caId)
      .eq('status', 'active');

    if (error) throw error;

    const totalSize = (documents || []).reduce((sum, doc) => sum + (doc.file_size || 0), 0);
    const byType = (documents || []).reduce((acc: any, doc) => {
      acc[doc.document_type] = (acc[doc.document_type] || 0) + 1;
      return acc;
    }, {});

    return {
      totalDocuments: (documents || []).length,
      totalSizeBytes: totalSize,
      totalSizeMB: Math.round(totalSize / 1024 / 1024),
      byType,
    };
  },

  /**
   * Share document with client
   */
  async shareDocument(documentId: string, sharedWithClient: boolean = true) {
    const supabase = await createServerClient();

    const { data: document, error } = await supabase
      .from('documents')
      .update({
        metadata: {
          is_shared_with_client: sharedWithClient,
          shared_at: sharedWithClient ? new Date().toISOString() : null,
        },
      })
      .eq('id', documentId)
      .select()
      .single();

    if (error) throw error;
    return document;
  },

  /**
   * List all documents shared with a user
   */
  async getSharedDocuments(userId: string) {
    const supabase = await createServerClient();

    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('client_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return documents || [];
  },

  /**
   * Search documents by name or metadata
   */
  async searchDocuments(caId: string, searchTerm: string) {
    const supabase = await createServerClient();

    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('ca_id', caId)
      .eq('status', 'active')
      .or(`file_name.ilike.%${searchTerm}%,document_type.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return documents || [];
  },
};
