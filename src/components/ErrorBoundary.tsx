/**
 * Error Boundary Component
 * Catches errors in child components and displays fallback UI
 */

'use client';

import React, { ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    __SENTRY__?: {
      captureException: (error: unknown, context?: Record<string, unknown>) => void;
    };
  }
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: string) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('Error Boundary caught:', error);
    console.error('Component Stack:', errorInfo.componentStack);

    // Send to error tracking
    if (this.props.onError) {
      this.props.onError(error, errorInfo.componentStack);
    }

    // Send to Sentry if available
    if (typeof window !== 'undefined' && window.__SENTRY__) {
      window.__SENTRY__.captureException(error, {
        tags: { componentStack: errorInfo.componentStack },
      });
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.retry);
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="w-full max-w-md p-8 bg-card rounded-lg border border-destructive/20 shadow-lg">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/10">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>

            <h1 className="text-2xl font-bold text-center mb-2">
              Oops! Something Went Wrong
            </h1>

            <p className="text-center text-muted-foreground mb-6">
              We encountered an unexpected error. Please try again or contact support if the problem persists.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-muted rounded-lg border border-border overflow-auto max-h-40">
                <p className="text-xs font-mono text-destructive break-words">
                  {this.state.error?.message}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={this.retry}
                className="flex-1"
                variant="default"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                className="flex-1"
                variant="outline"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for use in modern React
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return error;
}
