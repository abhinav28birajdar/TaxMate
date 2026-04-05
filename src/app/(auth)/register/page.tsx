'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Briefcase, User, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const roles = [
  {
    id: 'client',
    title: 'Client',
    description: 'I want to hire a CA for tax filing or financial advice.',
    icon: User,
    href: '/register/client'
  },
  {
    id: 'ca',
    title: 'Chartered Accountant',
    description: 'I am a practicing CA looking to manage clients and cases.',
    icon: Briefcase,
    href: '/register/ca'
  },
  {
    id: 'firm',
    title: 'CA Firm',
    description: 'We are a firm managing multiple CAs and large successions.',
    icon: Users,
    href: '/register/firm'
  }
];

export default function RegisterPage() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
        <p className="text-muted-foreground">
          Choose how you want to use TaxMate.
        </p>
      </div>

      <div className="grid gap-4">
        {roles.map((role) => (
          <Link key={role.id} href={role.href}>
            <Card className="p-4 flex items-center gap-4 hover:border-primary cursor-pointer transition-all hover:bg-muted/50">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <role.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{role.title}</h3>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
