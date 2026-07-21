'use client';

import React from 'react';

export function ProfileSections() {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-xl font-semibold mb-4">About Me</h3>
        <p className="text-muted-foreground">
          Experienced Chartered Accountant providing end-to-end financial, tax, and GST compliance services for businesses and individuals.
        </p>
      </section>
      
      <section>
        <h3 className="text-xl font-semibold mb-4">Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold">ITR Filing</h4>
            <p className="text-sm text-muted-foreground">Personal & Business Income Tax Returns</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold">GST Registration</h4>
            <p className="text-sm text-muted-foreground">Complete GST setup and monthly filings</p>
          </div>
        </div>
      </section>
    </div>
  );
}
