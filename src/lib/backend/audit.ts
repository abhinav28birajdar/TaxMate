import { getServiceClient } from './supabase';

export async function logActivity(
  userId?: string,
  action?: string,
  resource?: string,
  resourceId?: string,
  metadata?: unknown,
  ipAddress?: string
): Promise<void> {
  try {
    const client = getServiceClient();
    // Fire and forget - don't await or catch
    void client
      .from('activity_logs')
      .insert({
        user_id: userId,
        action,
        resource,
        resource_id: resourceId,
        metadata,
        ip_address: ipAddress,
      })
      .then(() => undefined)
      .catch((err: unknown) => {
        console.error('Activity log error:', err);
      });
  } catch (error) {
    console.error('Activity logging failed:', error);
  }
}

export async function logAudit(
  tableName: string,
  recordId?: string,
  operation?: string,
  oldData?: unknown,
  newData?: unknown,
  changedBy?: string,
  ipAddress?: string
): Promise<void> {
  try {
    const client = getServiceClient();
    // Fire and forget - don't await or catch
    void client
      .from('audit_logs')
      .insert({
        table_name: tableName,
        record_id: recordId,
        operation,
        old_data: oldData,
        new_data: newData,
        changed_by: changedBy,
        ip_address: ipAddress,
      })
      .then(() => undefined)
      .catch((err: unknown) => {
        console.error('Audit log error:', err);
      });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
}

export async function logSystem(
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal',
  message: string,
  context?: unknown,
  service?: string
): Promise<void> {
  try {
    const client = getServiceClient();
    // Fire and forget - don't await or catch
    void client
      .from('system_logs')
      .insert({
        level,
        message,
        context,
        service,
      })
      .then(() => undefined)
      .catch((err: unknown) => {
        console.error('System log error:', err);
      });
  } catch (error) {
    console.error('System logging failed:', error);
  }
}

export const writeAuditLog = logAudit;
export const writeActivityLog = logActivity;
