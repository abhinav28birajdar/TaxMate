'use client';

import React from 'react';

export function ProfileHeader() {
  return (
    <div className="flex items-center space-x-6 pb-6 border-b border-border">
      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-3xl font-bold text-primary">
        CA
      </div>
      <div>
        <h2 className="text-2xl font-bold">Chartered Accountant</h2>
        <p className="text-muted-foreground">CA Firm Name</p>
        <div className="mt-2 flex space-x-2">
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Tax Expert</span>
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">GST Specialist</span>
        </div>
      </div>
    </div>
  );
}
