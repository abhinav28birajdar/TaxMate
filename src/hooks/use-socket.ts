import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

export function useSocket() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { data: session } = useSession();

    useEffect(() => {
        if (!session?.user?.id) return;

        const socketInstance = io(process.env.NEXT_PUBLIC_APP_URL || '', {
            auth: {
                token: 'placeholder_token', // In a real app, use a valid JWT or session token
                userId: session.user.id,
            },
            transports: ['websocket'],
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [session?.user?.id]);

    return { socket };
}
