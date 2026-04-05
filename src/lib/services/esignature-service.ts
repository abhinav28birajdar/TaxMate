/**
 * E-Signature Service
 * Handles digital signature requests and verification
 */

import { createClient } from '@/lib/supabase/client';

export interface ESignatureRequest {
  id: string;
  documentId: string;
  requesterId: string;
  signerId: string;
  title: string;
  message?: string;
  status: 'pending' | 'signed' | 'rejected';
  signatureUrl?: string;
  signedAt?: string;
  expiresAt: string;
}

export class ESignatureService {
  private static instance: ESignatureService;
  private supabase = createClient();

  private constructor() {}

  static getInstance(): ESignatureService {
    if (!ESignatureService.instance) {
      ESignatureService.instance = new ESignatureService();
    }
    return ESignatureService.instance;
  }

  /**
   * Create an e-signature request
   */
  async createSignatureRequest(
    documentId: string,
    requesterId: string,
    signerId: string,
    title: string,
    message?: string
  ): Promise<ESignatureRequest> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days validity

    const { data, error } = await this.supabase
      .from('esignature_requests')
      .insert([
        {
          document_id: documentId,
          requester_id: requesterId,
          signer_id: signerId,
          title,
          message,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get pending signature requests for a user
   */
  async getPendingSignatures(userId: string): Promise<ESignatureRequest[]> {
    const { data, error } = await this.supabase
      .from('esignature_requests')
      .select('*')
      .eq('signer_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get all signature requests for a user (sent and received)
   */
  async getUserSignatureRequests(userId: string): Promise<{
    sent: ESignatureRequest[];
    received: ESignatureRequest[];
  }> {
    const { data: sent, error: sentError } = await this.supabase
      .from('esignature_requests')
      .select('*')
      .eq('requester_id', userId);

    const { data: received, error: receivedError } = await this.supabase
      .from('esignature_requests')
      .select('*')
      .eq('signer_id', userId);

    if (sentError || receivedError) throw sentError || receivedError;

    return {
      sent: sent || [],
      received: received || [],
    };
  }

  /**
   * Verify PAN for signature
   */
  async verifyPAN(userId: string, panNumber: string): Promise<boolean> {
    const { data: clientProfile } = await this.supabase
      .from('client_profiles')
      .select('pan_number')
      .eq('user_id', userId)
      .single();

    if (!clientProfile) return false;

    return clientProfile.pan_number === panNumber;
  }

  /**
   * Verify OTP for signature
   */
  async verifyOTP(signatureRequestId: string, otp: string): Promise<boolean> {
    // In production, integrate with actual OTP provider
    // For now, we'll simulate verification
    const { error } = await this.supabase
      .from('esignature_requests')
      .update({ otp_verified: true })
      .eq('id', signatureRequestId);

    return !error;
  }

  /**
   * Sign a document
   */
  async signDocument(
    signatureRequestId: string,
    signatureUrl: string,
    signerId: string
  ): Promise<ESignatureRequest> {
    const { data, error } = await this.supabase
      .from('esignature_requests')
      .update({
        status: 'signed',
        signature_url: signatureUrl,
        signed_at: new Date().toISOString(),
      })
      .eq('id', signatureRequestId)
      .select()
      .single();

    if (error) throw error;

    // Update document status
    if (data) {
      await this.supabase
        .from('documents')
        .update({ status: 'signed' })
        .eq('id', data.document_id);
    }

    return data;
  }

  /**
   * Reject a signature request
   */
  async rejectSignatureRequest(signatureRequestId: string, reason?: string): Promise<void> {
    const { error } = await this.supabase
      .from('esignature_requests')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', signatureRequestId);

    if (error) throw error;
  }

  /**
   * Get signature request details
   */
  async getSignatureRequest(signatureRequestId: string): Promise<ESignatureRequest> {
    const { data, error } = await this.supabase
      .from('esignature_requests')
      .select('*')
      .eq('id', signatureRequestId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Check if signature request is expired
   */
  async isSignatureRequestExpired(signatureRequestId: string): Promise<boolean> {
    const request = await this.getSignatureRequest(signatureRequestId);
    const now = new Date();
    const expiresAt = new Date(request.expiresAt);
    return now > expiresAt;
  }

  /**
   * Get signed documents for a user
   */
  async getSignedDocuments(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('uploaded_by', userId)
      .eq('status', 'signed')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Download signed document
   */
  async downloadSignedDocument(documentId: string): Promise<string> {
    const { data: document } = await this.supabase
      .from('documents')
      .select('file_path')
      .eq('id', documentId)
      .single();

    if (!document) throw new Error('Document not found');

    const { data } = this.supabase.storage
      .from('case-documents')
      .getPublicUrl(document.file_path);

    return data.publicUrl;
  }

  /**
   * Batch send signature requests
   */
  async batchSendSignatureRequests(
    requests: Array<{
      documentId: string;
      signerId: string;
      title: string;
    }>,
    requesterId: string
  ): Promise<ESignatureRequest[]> {
    const signatureRequests = requests.map((req) => ({
      document_id: req.documentId,
      requester_id: requesterId,
      signer_id: req.signerId,
      title: req.title,
      status: 'pending',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    const { data, error } = await this.supabase
      .from('esignature_requests')
      .insert(signatureRequests)
      .select();

    if (error) throw error;
    return data || [];
  }

  /**
   * Get signature request history for a document
   */
  async getDocumentSignatureHistory(documentId: string): Promise<ESignatureRequest[]> {
    const { data, error } = await this.supabase
      .from('esignature_requests')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

export default ESignatureService.getInstance();
