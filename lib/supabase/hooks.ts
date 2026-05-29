'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './client';

type SupabaseQueryOptions = {
  initialData?: any;
  refetchInterval?: number | false;
  refetchOnWindowFocus?: boolean;
  enabled?: boolean;
};

/**
 * A custom hook for fetching data from Supabase with caching and refetching
 * @param queryFn - A function that returns a Supabase query
 * @param options - Options for the query
 * @returns Object containing data, error, isLoading, and refetch function
 */
export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: SupabaseQueryOptions = {}
) {
  const {
    initialData = null,
    refetchInterval = false,
    refetchOnWindowFocus = true,
    enabled = true,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);

  const execute = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await queryFn();
      
      if (error) {
        setError(error);
        return;
      }
      
      setData(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [queryFn, enabled]);

  useEffect(() => {
    if (!enabled) return;
    execute();
    
    // Set up refetch interval if specified
    let intervalId: NodeJS.Timeout | null = null;
    
    if (refetchInterval && typeof refetchInterval === 'number') {
      intervalId = setInterval(execute, refetchInterval);
    }
    
    // Set up refetch on window focus
    const onFocus = () => {
      if (refetchOnWindowFocus) {
        execute();
      }
    };
    
    window.addEventListener('focus', onFocus);
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      window.removeEventListener('focus', onFocus);
    };
  }, [execute, refetchInterval, refetchOnWindowFocus, enabled]);

  return {
    data,
    error,
    isLoading,
    refetch: execute,
  };
}

/**
 * A custom hook for executing mutations against Supabase
 * @returns Object containing mutate function, data, error, and isLoading
 */
export function useSupabaseMutation<T, V = any>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const mutate = async (
    mutationFn: (variables: V) => Promise<{ data: T | null; error: any }>,
    variables: V
  ) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await mutationFn(variables);
      
      if (error) {
        setError(error);
        return { data: null, error };
      }
      
      setData(data);
      setError(null);
      return { data, error: null };
    } catch (err) {
      setError(err);
      return { data: null, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate,
    data,
    error,
    isLoading,
  };
}

/**
 * A custom hook for real-time subscriptions to Supabase tables
 * @param table - Name of the table to subscribe to
 * @param event - Event to listen for ('INSERT', 'UPDATE', 'DELETE', '*')
 * @param filter - Optional filter function for the subscription
 * @returns Object containing the latest payload and error
 */
export function useSupabaseSubscription(
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
  filter?: (payload: any) => boolean
) {
  const [payload, setPayload] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!supabase) return;
    
    const subscription = supabase
      .channel(`table-changes-${table}`)
      .on(
        'postgres_changes',
        { event, schema: 'public', table },
        (payload: any) => {
          if (filter && !filter(payload)) return;
          setPayload(payload);
        }
      )
      .subscribe((status: any, err: any) => {
        if (err) {
          setError(err);
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [table, event, filter]);

  return { payload, error };
}