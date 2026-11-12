import { getServiceClient } from './supabase';
import { internalError } from './errors';

export async function getSettings(userId: string) {
  const client = getServiceClient();

  const { data: settings, error } = await client
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw internalError('Failed to fetch settings');
  }

  if (!settings) {
    return {
      user_id: userId,
      theme: 'dark',
      language: 'English (India)',
      timezone: 'Asia/Kolkata',
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      marketingEmails: true,
      onlineStatusVisible: true,
      readReceipts: true,
      chatAudioAlerts: true,
      autoDownloadAttachments: true,
      biometricsEnabled: false,
    };
  }

  return {
    ...settings,
    emailNotifications: settings.email_notifications,
    pushNotifications: settings.push_notifications,
    smsNotifications: settings.sms_notifications ?? false,
    marketingEmails: settings.metadata?.marketing_emails ?? true,
    onlineStatusVisible: settings.metadata?.online_status_visible ?? true,
    readReceipts: settings.metadata?.read_receipts ?? true,
    chatAudioAlerts: settings.metadata?.chat_audio_alerts ?? true,
    autoDownloadAttachments: settings.metadata?.auto_download_attachments ?? true,
    biometricsEnabled: settings.metadata?.biometrics_enabled ?? false,
  };
}

export async function updateSettings(
  userId: string,
  data: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    timezone?: string;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    smsNotifications?: boolean;
    marketingEmails?: boolean;
    onlineStatusVisible?: boolean;
    readReceipts?: boolean;
    chatAudioAlerts?: boolean;
    autoDownloadAttachments?: boolean;
    biometricsEnabled?: boolean;
  }
) {
  const client = getServiceClient();

  const { data: existing } = await client
    .from('settings')
    .select('metadata')
    .eq('user_id', userId)
    .maybeSingle();

  const updateData: any = { user_id: userId };
  if (data.theme !== undefined) updateData.theme = data.theme;
  if (data.language !== undefined) updateData.language = data.language;
  if (data.timezone !== undefined) {
    updateData.timezone = data.timezone;
    await client.from('profiles').update({ timezone: data.timezone }).eq('id', userId);
  }
  if (data.emailNotifications !== undefined) updateData.email_notifications = data.emailNotifications;
  if (data.pushNotifications !== undefined) updateData.push_notifications = data.pushNotifications;
  if (data.smsNotifications !== undefined) updateData.sms_notifications = data.smsNotifications;

  const nextMeta = { ...(existing?.metadata || {}) };
  let metaDirty = false;
  if (data.marketingEmails !== undefined) {
    nextMeta.marketing_emails = data.marketingEmails;
    metaDirty = true;
  }
  if (data.onlineStatusVisible !== undefined) {
    nextMeta.online_status_visible = data.onlineStatusVisible;
    metaDirty = true;
  }
  if (data.readReceipts !== undefined) {
    nextMeta.read_receipts = data.readReceipts;
    metaDirty = true;
  }
  if (data.chatAudioAlerts !== undefined) {
    nextMeta.chat_audio_alerts = data.chatAudioAlerts;
    metaDirty = true;
  }
  if (data.autoDownloadAttachments !== undefined) {
    nextMeta.auto_download_attachments = data.autoDownloadAttachments;
    metaDirty = true;
  }
  if (data.biometricsEnabled !== undefined) {
    nextMeta.biometrics_enabled = data.biometricsEnabled;
    metaDirty = true;
  }
  if (metaDirty) {
    updateData.metadata = nextMeta;
  }

  const { data: settings, error } = await client
    .from('settings')
    .upsert(updateData, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('Failed to update settings:', error);
    throw internalError('Failed to update settings');
  }

  return {
    ...settings,
    emailNotifications: settings.email_notifications,
    pushNotifications: settings.push_notifications,
    smsNotifications: settings.sms_notifications ?? false,
    marketingEmails: settings.metadata?.marketing_emails ?? true,
    onlineStatusVisible: settings.metadata?.online_status_visible ?? true,
    readReceipts: settings.metadata?.read_receipts ?? true,
    chatAudioAlerts: settings.metadata?.chat_audio_alerts ?? true,
    autoDownloadAttachments: settings.metadata?.auto_download_attachments ?? true,
    biometricsEnabled: settings.metadata?.biometrics_enabled ?? false,
  };
}

export async function getTheme(userId: string): Promise<string> {
  const client = getServiceClient();

  const { data, error } = await client
    .from('settings')
    .select('theme')
    .eq('user_id', userId)
    .single();

  if (error) {
    return 'light'; // Default theme in master schema is light
  }

  return data?.theme || 'light';
}
