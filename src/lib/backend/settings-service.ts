import { getServiceClient } from './supabase';
import { internalError } from './errors';

export async function getSettings(userId: string) {
  const client = getServiceClient();

  const { data: settings, error } = await client
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    throw internalError('Failed to fetch settings');
  }

  return {
    ...settings,
    emailNotifications: settings.email_notifications,
    pushNotifications: settings.push_notifications,
    marketingEmails: settings.metadata?.marketing_emails ?? true,
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
    marketingEmails?: boolean;
  }
) {
  const client = getServiceClient();

  const updateData: any = {};
  if (data.theme !== undefined) updateData.theme = data.theme;
  if (data.language !== undefined) updateData.language = data.language;
  if (data.timezone !== undefined) updateData.timezone = data.timezone;
  if (data.emailNotifications !== undefined) updateData.email_notifications = data.emailNotifications;
  if (data.pushNotifications !== undefined) updateData.push_notifications = data.pushNotifications;
  if (data.marketingEmails !== undefined) {
    updateData.metadata = { marketing_emails: data.marketingEmails };
  }

  const { data: settings, error } = await client
    .from('settings')
    .update(updateData)
    .eq('user_id', userId)
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
    marketingEmails: settings.metadata?.marketing_emails ?? true,
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
