'use client';

import { useParams } from 'next/navigation';
import { UnifiedChatWorkspace } from '@/components/chat/UnifiedChatWorkspace';

export default function CAChatRoomPage() {
  const params = useParams<{ roomId: string }>();
  return <UnifiedChatWorkspace portal="ca" initialRoomId={params?.roomId} />;
}
