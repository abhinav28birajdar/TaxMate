'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// Add TypeScript definitions for Google Analytics
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'set', 
      targetId: string, 
      config?: { [key: string]: any }
    ) => void;
  }
}

export default function AnalyticsWrapper() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    if (pathname) {
      // Page view tracking logic
      const url = searchParams.size > 0 
        ? `${pathname}?${searchParams.toString()}` 
        : pathname;
      
      // You can implement your preferred analytics solution here
      // Example for Google Analytics:
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', 'G-YOUR_MEASUREMENT_ID', {
          page_path: url,
        });
      }
    }
  }, [pathname, searchParams]);

  return null;
}
