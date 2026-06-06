/**
 * Supabase Database Operations
 * 
 * Centralized database operations with proper error handling,
 * type safety, and realtime triggers.
 * 
 * Note: Using explicit typing to work around outdated generated types.
 * Run `npx supabase gen types typescript` to regenerate database.types.ts
 * 
 * @fileoverview Database operations module for TaxMate
 */

import { getPrimaryClient } from './dual-clients';
import { analytics } from './dual-clients';

// Type definitions matching our schema_final.sql
export type UserRole = 'ca' | 'client' | 'firm' | 'admin';
export type CaseStatus = 'pending' | 'in_progress' | 'waiting_client' | 'under_review' | 'filed' | 'completed' | 'on_hold' | 'cancelled';
export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';
export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';
export type MessageType = 'text' | 'file' | 'image' | 'system';
export type NotificationType = 'message' | 'case_update' | 'appointment' | 'payment' | 'document' | 'review' | 'system' | 'reminder';

interface OperationResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

// Type helper to bypass outdated database types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any;

/**
 * Create a user profile after registration
 */
export async function createUserProfile(
  userId: string,
  email: string,
  role: UserRole,
  profileData: {
    firstName: string;
    lastName: string;
    phone?: string;
  }
): Promise<OperationResult> {
  const supabase = getPrimaryClient();

  try {
    // The trigger will automatically create the user and profile
    // but we can update with additional data
    
    if (role === 'ca') {
      const { error } = await supabase
        .from('ca_profiles')
        .upsert({
          user_id: userId,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          display_name: `${profileData.firstName} ${profileData.lastName}`,
          slug: `ca-${profileData.firstName.toLowerCase()}-${userId.substring(0, 8)}`,
        });
      
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('client_profiles')
        .upsert({
          user_id: userId,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
        });
      
      if (error) throw error;
    }

    // Log activity
    await analytics.logActivity(userId, 'profile_created', 'profile', userId, { role });

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create profile';
    console.error('Create profile error:', error);
    return { success: false, error: message };
  }
}

// User profile type
interface UserData {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/**
 * Get user profile based on role
 */
export async function getUserProfile(userId: string): Promise<{
  user: UserData | null;
  profile: Record<string, unknown> | null;
  role: UserRole | null;
  error?: string;
}> {
  const supabase = getPrimaryClient();

  try {
    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw userError;
    if (!userData) return { user: null, profile: null, role: null };

    const typedUserData = userData as unknown as UserData;
    const role = typedUserData.role;

    // Get profile based on role
    let profile = null;
    
    if (role === 'ca') {
      const { data } = await supabase
        .from('ca_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      profile = data;
    } else if (role === 'client') {
      const { data } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      profile = data;
    } else if (role === 'firm') {
      const { data } = await supabase
        .from('firm_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      profile = data;
    }

    return { user: typedUserData, profile, role };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get profile';
    console.error('Get profile error:', error);
    return { user: null, profile: null, role: null, error: message };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  role: UserRole,
  updates: Record<string, unknown>
): Promise<OperationResult> {
  const supabase = getPrimaryClient();

  try {
    const table = role === 'ca' ? 'ca_profiles' : 
                  role === 'client' ? 'client_profiles' : 
                  role === 'firm' ? 'firm_profiles' : null;
    
    if (!table) {
      throw new Error('Invalid role for profile update');
    }

    const { error } = await supabase
      .from(table)
      .update(updates as Record<string, unknown>)
      .eq('user_id', userId);

    if (error) throw error;

    // Log activity
    await analytics.logActivity(userId, 'profile_updated', 'profile', userId, { updates });

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    console.error('Update profile error:', error);
    return { success: false, error: message };
  }
}

/**
 * Create a new case
 */
export async function createCase(
  caId: string,
  clientId: string,
  caseData: {
    title: string;
    description?: string;
    caseType: string;
    priority?: CasePriority;
    deadline?: string;
    estimatedFee?: number;
  }
): Promise<OperationResult<{ caseId: string }>> {
  const supabase = getPrimaryClient();

  try {
    const { data, error } = await supabase
      .from('cases')
      .insert({
        ca_id: caId,
        client_id: clientId,
        title: caseData.title,
        description: caseData.description,
        case_type: caseData.caseType,
        priority: caseData.priority || 'medium',
        deadline: caseData.deadline,
        estimated_fee: caseData.estimatedFee,
        status: 'pending',
      } as Record<string, unknown>)
      .select('id')
      .single();

    if (error) throw error;

    // Log activity
    const caProfile = await supabase
      .from('ca_profiles')
      .select('user_id')
      .eq('id', caId)
      .single();

    const caseRecord = data as { id: string } | null;
    if (caProfile.data && caseRecord) {
      const caProfileData = caProfile.data as { user_id: string };
      await analytics.logActivity(
        caProfileData.user_id, 
        'case_created', 
        'case', 
        caseRecord.id, 
        { title: caseData.title, type: caseData.caseType }
      );
    }

    return { success: true, data: { caseId: caseRecord?.id || '' } };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create case';
    console.error('Create case error:', error);
    return { success: false, error: message };
  }
}

/**
 * Update case status
 */
export async function updateCase(
  caseId: string,
  updates: {
    status?: CaseStatus;
    priority?: CasePriority;
    title?: string;
    description?: string;
    deadline?: string;
    assignedTo?: string;
  }
): Promise<OperationResult> {
  const supabase = getPrimaryClient();

  try {
    const updatePayload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    const { error } = await supabase
      .from('cases')
      .update(updatePayload as Record<string, unknown>)
      .eq('id', caseId);

    if (error) throw error;

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update case';
    console.error('Update case error:', error);
    return { success: false, error: message };
  }
}

/**
 * Create a notification
 */
export async function createNotification(
  userId: string,
  notificationData: {
    type: NotificationType;
    title: string;
    message: string;
    actionUrl?: string;
    relatedUserId?: string;
    caseId?: string;
    conversationId?: string;
  }
): Promise<OperationResult<{ notificationId: string }>> {
  const supabase = getPrimaryClient();

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        action_url: notificationData.actionUrl,
        related_user_id: notificationData.relatedUserId,
        case_id: notificationData.caseId,
        conversation_id: notificationData.conversationId,
      } as Record<string, unknown>)
      .select('id')
      .single();

    if (error) throw error;

    const record = data as { id: string } | null;
    return { success: true, data: { notificationId: record?.id || '' } };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create notification';
    console.error('Create notification error:', error);
    return { success: false, error: message };
  }
}

/**
 * Log an activity
 */
export async function logActivity(
  userId: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await analytics.logActivity(userId, action, resourceType, resourceId, metadata);
}

/**
 * Create or get conversation between two users
 */
export async function getOrCreateConversation(
  participantIds: string[],
  caseId?: string
): Promise<OperationResult<{ conversationId: string }>> {
  const supabase = getPrimaryClient();

  try {
    // First try to find existing conversation
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .contains('participant_ids', participantIds)
      .eq('is_archived', false)
      .single();

    if (existing) {
      const existingRecord = existing as { id: string };
      return { success: true, data: { conversationId: existingRecord.id } };
    }

    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant_ids: participantIds,
        case_id: caseId,
      } as Record<string, unknown>)
      .select('id')
      .single();

    if (error) throw error;

    const record = data as { id: string } | null;
    return { success: true, data: { conversationId: record?.id || '' } };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get/create conversation';
    console.error('Conversation error:', error);
    return { success: false, error: message };
  }
}

/**
 * Send a message
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  messageType: MessageType = 'text',
  fileData?: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  }
): Promise<OperationResult<{ messageId: string }>> {
  const supabase = getPrimaryClient();

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        message_type: messageType,
        file_url: fileData?.fileUrl,
        file_name: fileData?.fileName,
        file_size: fileData?.fileSize,
      } as Record<string, unknown>)
      .select('id')
      .single();

    if (error) throw error;

    const record = data as { id: string } | null;
    return { success: true, data: { messageId: record?.id || '' } };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send message';
    console.error('Send message error:', error);
    return { success: false, error: message };
  }
}

/**
 * Update user presence
 */
export async function updatePresence(
  userId: string,
  status: PresenceStatus,
  currentPage?: string
): Promise<OperationResult> {
  const supabase = getPrimaryClient();

  try {
    const { error } = await supabase
      .from('user_presence')
      .upsert({
        user_id: userId,
        status,
        current_page: currentPage,
        last_seen_at: new Date().toISOString(),
      } as Record<string, unknown>);

    if (error) throw error;

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update presence';
    console.error('Update presence error:', error);
    return { success: false, error: message };
  }
}

/**
 * Create CA-Client relationship
 */
export async function createRelationship(
  caId: string,
  clientId: string,
  requestedBy: string
): Promise<OperationResult<{ relationshipId: string }>> {
  const supabase = getPrimaryClient();

  try {
    const { data, error } = await supabase
      .from('ca_client_relationships')
      .insert({
        ca_id: caId,
        client_id: clientId,
        requested_by: requestedBy,
        status: 'pending',
      } as Record<string, unknown>)
      .select('id')
      .single();

    if (error) throw error;

    // Create notification for the other party
    const caProfileResult = await supabase
      .from('ca_profiles')
      .select('user_id')
      .eq('id', caId)
      .single();
    
    const caProfileData = caProfileResult.data as { user_id: string } | null;
    const isCARequesting = requestedBy === caProfileData?.user_id;

    const recipientProfile = isCARequesting 
      ? await supabase.from('client_profiles').select('user_id').eq('id', clientId).single()
      : await supabase.from('ca_profiles').select('user_id').eq('id', caId).single();

    const recipientData = recipientProfile.data as { user_id: string } | null;
    if (recipientData) {
      await createNotification(recipientData.user_id, {
        type: 'system',
        title: 'New Connection Request',
        message: 'You have received a new connection request.',
        actionUrl: '/clients',
      });
    }

    const record = data as { id: string } | null;
    return { success: true, data: { relationshipId: record?.id || '' } };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create relationship';
    console.error('Create relationship error:', error);
    return { success: false, error: message };
  }
}

/**
 * Accept or reject relationship
 */
export async function updateRelationshipStatus(
  relationshipId: string,
  status: 'accepted' | 'rejected',
  rejectionReason?: string
): Promise<OperationResult> {
  const supabase = getPrimaryClient();

  try {
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'accepted') {
      updateData.accepted_at = new Date().toISOString();
    } else if (status === 'rejected') {
      updateData.rejected_at = new Date().toISOString();
      updateData.rejection_reason = rejectionReason;
    }

    const { error } = await supabase
      .from('ca_client_relationships')
      .update(updateData)
      .eq('id', relationshipId);

    if (error) throw error;

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update relationship';
    console.error('Update relationship error:', error);
    return { success: false, error: message };
  }
}

export default {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  createCase,
  updateCase,
  createNotification,
  logActivity,
  getOrCreateConversation,
  sendMessage,
  updatePresence,
  createRelationship,
  updateRelationshipStatus,
};
