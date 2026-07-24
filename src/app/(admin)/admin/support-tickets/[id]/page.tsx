"use client";

import React from 'react';
import CASupportTicketDetailPage from '@/app/(ca)/ca/support/tickets/[id]/page';

export default function AdminSupportTicketDetailPage({ params }: { params: { id: string } }) {
  return <CASupportTicketDetailPage params={params} />;
}
