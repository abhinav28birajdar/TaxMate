import { getServiceClient } from './supabase';

export async function logActivity(params: {
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: unknown;
  ipAddress?: string;
}): Promise<void> {
  try {
    const client = getServiceClient();
    // Fire and forget - don't await
    client
      .from('activity_logs')
      .insert({
        user_id: params.userId,
        action: params.action,
        resource_type: params.resourceType,
        resource_id: params.resourceId,
        metadata: params.metadata || {},
        ip_address: params.ipAddress,
      });
  } catch (error) {
    console.error('Activity logging failed:', error);
  }
}

export async function logAudit(params: {
  tableName: string;
  operation: string;
  rowId?: string;
  changedBy?: string;
  oldData?: unknown;
  newData?: unknown;
}): Promise<void> {
  try {
    const client = getServiceClient();
    // Fire and forget - don't await
    client
      .from('audit_logs')
      .insert({
        table_name: params.tableName,
        operation: params.operation,
        row_id: params.rowId,
        changed_by: params.changedBy,
        old_data: params.oldData,
        new_data: params.newData,
      });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
}

export async function logSystem(
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal',
  message: string,
  context?: unknown
): Promise<void> {
  try {
    const client = getServiceClient();
    // Fire and forget - don't await
    client
      .from('system_logs')
      .insert({
        level,
        message,
        context: context || {},
      });
  } catch (error) {
    console.error('System logging failed:', error);
  }
}

export const writeAuditLog = logAudit;
export const writeActivityLog = logActivity;
