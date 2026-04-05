import { supabaseAdmin } from './supabase';

export async function writeAuditLog(input: {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}) {
  await supabaseAdmin.from('audit_logs').insert({
    user_id: input.userId ?? null,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    metadata: input.metadata ?? {},
    ip_address: input.ipAddress ?? null,
  });
}

export async function writeActivityLog(input: {
  userId: string;
  action: string;
  category: string;
  metadata?: Record<string, unknown>;
}) {
  await supabaseAdmin.from('activity_logs').insert({
    user_id: input.userId,
    action: input.action,
    category: input.category,
    metadata: input.metadata ?? {},
  });
}
