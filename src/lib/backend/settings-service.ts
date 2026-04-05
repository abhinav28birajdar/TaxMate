import { getServiceClient } from './supabase';
import { internalError } from './errors';

export async function getSettings(userId: string) {
  const client = getServiceClient();

  const { data: settings, error } = await client
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    throw internalError('Failed to fetch settings');
  }

  return settings;
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

  const { data: settings, error } = await client
    .from('user_settings')
    .update(data)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw internalError('Failed to update settings');
  }

  return settings;
}

export async function getTheme(userId: string): Promise<string> {
  const client = getServiceClient();

  const { data, error } = await client
    .from('user_settings')
    .select('theme')
    .eq('user_id', userId)
    .single();

  if (error) {
    return 'system'; // Default theme
  }

  return data?.theme || 'system';
}
