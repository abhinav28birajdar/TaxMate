import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { z } from 'zod';

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const parsed = z.object({
                    email: z.string().email(),
                    password: z.string().min(1),
                }).safeParse(credentials);
                if (!parsed.success) return null;

                const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
                if (!user || !user.passwordHash) return null;
                if (user.status === 'BANNED') throw new Error('Account banned');
                if (user.status === 'PENDING_VERIFICATION') throw new Error('Please verify your email');

                const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
                if (!valid) return null;

                await prisma.user.update({
                    where: { id: user.id },
                    data: { lastLoginAt: new Date(), loginCount: { increment: 1 } },
                });

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.avatarUrl,
                    onboardingCompleted: user.onboardingCompleted,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.onboardingCompleted = user.onboardingCompleted;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.onboardingCompleted = token.onboardingCompleted as boolean;
            }
            return session;
        },
    },
    pages: { signIn: '/login', error: '/login', newUser: '/onboarding' },
});
