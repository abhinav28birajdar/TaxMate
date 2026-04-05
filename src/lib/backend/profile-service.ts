import { getServiceClient } from './supabase';
import { notFound, internalError } from './errors';

export async function getProfile(userId: string) {
  const client = getServiceClient();

  const { data: profile, error } = await client
    .from('profiles')
    .select('*, users!inner(email)')
    .eq('user_id', userId)
    .single();

  if (error || !profile) {
    throw notFound('Profile');
  }

  return profile;
}

export async function updateProfile(
  userId: string,
  data: {
    fullName?: string;
    bio?: string;
    website?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
    github?: string | null;
    isPublic?: boolean;
  }
) {
  const client = getServiceClient();

  const { data: profile, error } = await client
    .from('profiles')
    .update(data)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw internalError('Failed to update profile');
  }

  return profile;
}

export async function getPublicProfile(userId: string) {
  const client = getServiceClient();

  const { data: profile, error } = await client
    .from('profiles')
    .select('id, full_name, avatar_url, bio, website, twitter, linkedin, github')
    .eq('user_id', userId)
    .eq('is_public', true)
    .single();

  if (error || !profile) {
    throw notFound('Public profile');
  }

  return profile;
}
