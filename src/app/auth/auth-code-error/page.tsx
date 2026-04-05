'use client';

import Link from 'next/link';
import { AlertCircle, RefreshCw, Home, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string; error_description?: string; error_code?: string };
}) {
  const errorCode = searchParams.error_code || 'unknown_error';
  const errorMessage = searchParams.error_description || searchParams.error || 'An unexpected error occurred during authentication.';

  const isExpired = errorCode === 'otp_expired' || errorMessage.toLowerCase().includes('expired');

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border amber-glow">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Authentication Error</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            {isExpired ? 'The verification link has expired or is invalid.' : 'We encountered a problem signing you in.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4 text-sm text-foreground border border-border">
            <p className="font-medium mb-1">Error Details:</p>
            <p className="text-muted-foreground break-words">{errorMessage}</p>
          </div>
          
          {isExpired && (
            <p className="text-sm text-center text-muted-foreground">
              Security links expire for your protection. Please request a new one by signing in again.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/login">
              <RefreshCw className="mr-2 h-4 w-4" />
              Return to Login
            </Link>
          </Button>
          <div className="flex w-full gap-2">
            <Button asChild variant="outline" className="flex-1 border-border">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 border-border">
              <Link href="mailto:support@taxmate.com">
                <Mail className="mr-2 h-4 w-4" />
                Support
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
