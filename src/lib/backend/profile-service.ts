import { getServiceClient } from './supabase';
import { notFound, internalError } from './errors';

export async function getProfile(userId: string) {
  const client = getServiceClient();

  const { data: profile, error } = await client
    .from('user_profiles')
    .select('*, users!inner(email)')
    .eq('user_id', userId)
    .single();

  if (error || !profile) {
    throw notFound('Profile');
  }

  // Map display_name and social_links to client fields for compatibility
  return {
    ...profile,
    fullName: profile.display_name,
    website: profile.social_links?.website || null,
    twitter: profile.social_links?.twitter || null,
    linkedin: profile.social_links?.linkedin || null,
    github: profile.social_links?.github || null,
  };
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

  const updateData: any = {};
  if (data.fullName !== undefined) updateData.display_name = data.fullName;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.isPublic !== undefined) updateData.is_public = data.isPublic;

  // Retrieve existing social links first to merge them
  const { data: existing } = await client
    .from('user_profiles')
    .select('social_links')
    .eq('user_id', userId)
    .maybeSingle();

  const existingSocial = existing?.social_links || {};
  const socialLinks: any = { ...existingSocial };
  if (data.website !== undefined) socialLinks.website = data.website;
  if (data.twitter !== undefined) socialLinks.twitter = data.twitter;
  if (data.linkedin !== undefined) socialLinks.linkedin = data.linkedin;
  if (data.github !== undefined) socialLinks.github = data.github;

  updateData.social_links = socialLinks;

  const { data: profile, error } = await client
    .from('user_profiles')
    .update(updateData)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Failed to update profile:', error);
    throw internalError('Failed to update profile');
  }

  return {
    ...profile,
    fullName: profile.display_name,
    website: profile.social_links?.website || null,
    twitter: profile.social_links?.twitter || null,
    linkedin: profile.social_links?.linkedin || null,
    github: profile.social_links?.github || null,
  };
}

export async function getPublicProfile(userId: string) {
  const client = getServiceClient();

  const { data: profile, error } = await client
    .from('user_profiles')
    .select('id, display_name, bio, social_links, is_public')
    .eq('user_id', userId)
    .eq('is_public', true)
    .single();

  if (error || !profile) {
    throw notFound('Public profile');
  }

  return {
    id: profile.id,
    fullName: profile.display_name,
    display_name: profile.display_name,
    bio: profile.bio,
    website: profile.social_links?.website || null,
    twitter: profile.social_links?.twitter || null,
    linkedin: profile.social_links?.linkedin || null,
    github: profile.social_links?.github || null,
    social_links: profile.social_links,
    is_public: profile.is_public,
  };
}
