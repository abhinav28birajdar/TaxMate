import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { prisma } from '../src/lib/prisma';

const onlineUsers = new Map<string, string>(); // userId → socketId

export async function initSocketServer(httpServer: any) {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);

    const io = new Server(httpServer, {
        cors: { origin: process.env.NEXT_PUBLIC_APP_URL, credentials: true },
        adapter: createAdapter(pubClient, subClient),
    });

    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Unauthorized'));
        // Verify JWT token here (logic remains as placeholder as per spec)
        next();
    });

    io.on('connection', (socket) => {
        const userId = socket.handshake.auth.userId;
        if (!userId) return socket.disconnect();

        // User online
        onlineUsers.set(userId, socket.id);
        io.emit('user:status', { userId, isOnline: true });

        // Join conversation rooms
        socket.on('chat:join', ({ conversationId }: { conversationId: string }) => {
            socket.join(`conversation:${conversationId}`);
        });

        // Typing indicator
        socket.on('chat:typing', ({ conversationId, isTyping }: any) => {
            socket.to(`conversation:${conversationId}`).emit('chat:typing', { userId, isTyping });
        });

        // Mark messages as read
        socket.on('chat:read', async ({ conversationId, messageId }: any) => {
            await prisma.message.updateMany({
                where: { conversationId, id: messageId },
                data: {},
            });
            socket.to(`conversation:${conversationId}`).emit('message:read', { messageId, userId });
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            onlineUsers.delete(userId);
            io.emit('user:status', { userId, isOnline: false });
        });
    });

    return io;
}

export async function sendRealtimeNotification(userId: string, notification: any) {
    // Global io instance would be referenced here
}
