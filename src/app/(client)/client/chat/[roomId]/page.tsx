'use client';

import { useParams } from 'next/navigation';
import { UnifiedChatWorkspace } from '@/components/chat/UnifiedChatWorkspace';

export default function ClientChatRoomPage() {
  const params = useParams<{ roomId: string }>();
  return <UnifiedChatWorkspace portal="client" initialRoomId={params?.roomId} />;
}
