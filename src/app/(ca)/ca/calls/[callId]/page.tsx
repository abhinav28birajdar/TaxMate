'use client';

import { useParams } from 'next/navigation';
import { UnifiedConsultationRoom } from '@/components/calls/UnifiedConsultationRoom';

export default function CACallRoomPage() {
  const params = useParams<{ callId: string }>();
  return <UnifiedConsultationRoom portal="ca" initialAppointmentId={params?.callId} />;
}
