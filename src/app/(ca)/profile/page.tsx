'use client';

import React from 'react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileSections } from '@/components/profile/ProfileSections';
import { Card, CardContent } from '@/components/ui/card';

export default function CAProfilePage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-display font-bold text-primary">Your Profile</h1>
      <Card>
        <CardContent className="p-6">
          <ProfileHeader />
          <div className="mt-8">
            <ProfileSections />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
