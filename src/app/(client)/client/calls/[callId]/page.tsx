'use client';

import { useParams } from 'next/navigation';
import { UnifiedConsultationRoom } from '@/components/calls/UnifiedConsultationRoom';

export default function ClientCallRoomPage() {
  const params = useParams<{ callId: string }>();
  return <UnifiedConsultationRoom portal="client" initialAppointmentId={params?.callId} />;
}
