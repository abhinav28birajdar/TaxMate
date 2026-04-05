'use client';

import Link from 'next/link';
import { Mail, ArrowRight, Home, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 flex-col gap-8">
      <Card className="w-full max-w-md border-border amber-glow">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary animate-pulse">
            <Mail className="h-8 w-8 text-primary font-bold" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Check Your Email</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            We've sent a verification link to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="rounded-lg bg-muted/50 p-6 border border-border">
            <p className="text-sm font-medium text-foreground mb-3">Next Steps:</p>
            <ul className="text-sm text-left text-muted-foreground space-y-3 mx-auto max-w-xs">
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</div>
                <span>Open your email client and find our message.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</div>
                <span>Click the <strong>Verification Link</strong> in the email.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</div>
                <span>You'll be redirected to your dashboard automatically.</span>
              </li>
            </ul>
          </div>
          
          <div className="text-xs text-muted-foreground bg-amber-500/5 p-3 rounded border border-primary/10">
            <p><strong>Didn't see it?</strong> Check your spam or promotions folder, or wait a few minutes for delivery.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            <Link href="https://gmail.com" target="_blank">
              Open Gmail
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <div className="flex w-full gap-2">
            <Button asChild variant="outline" className="flex-1 border-border">
              <Link href="/login">
                Return to Login
              </Link>
            </Button>
            <Button asChild variant="ghost" className="flex-1">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <p className="text-sm text-muted-foreground animate-bounce flex items-center gap-2">
        Verification complete? <ArrowRight className="h-4 w-4" /> <Link href="/login" className="text-primary font-medium hover:underline">Click Here to Proceed</Link>
      </p>
    </div>
  );
}
