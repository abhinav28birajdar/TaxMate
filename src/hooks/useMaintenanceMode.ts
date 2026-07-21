'use client';

import { useState, useEffect } from 'react';

export interface MaintenanceStatus {
  isMaintenance: boolean;
  message: string;
  bypassKey?: string;
  estimatedEnd?: string | null;
  loading: boolean;
}

export function useMaintenanceMode() {
  const [status, setStatus] = useState<MaintenanceStatus>({
    isMaintenance: false,
    message: '',
    bypassKey: '',
    estimatedEnd: null,
    loading: true,
  });

  useEffect(() => {
    async function checkMaintenance() {
      try {
        const res = await fetch('/api/maintenance-check');
        if (res.ok) {
          const data = await res.json();
          setStatus({
            isMaintenance: data.isMaintenance ?? false,
            message: data.message || 'System maintenance in progress.',
            bypassKey: data.bypassKey || '',
            estimatedEnd: data.estimatedEnd || null,
            loading: false,
          });
        } else {
          setStatus((prev) => ({ ...prev, loading: false }));
        }
      } catch (err) {
        setStatus((prev) => ({ ...prev, loading: false }));
      }
    }

    checkMaintenance();
  }, []);

  return status;
}
