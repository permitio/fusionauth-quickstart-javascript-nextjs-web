'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { syncUserAction } from '../actions/permit';

export function useSyncUser(country?: string) {
  const { data: session, status } = useSession();
  const [isSynced, setIsSynced] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const syncUserWithPermit = async () => {
      // Only sync if the user is authenticated
      if (status !== 'authenticated' || !session?.user) {
        return;
      }

      // Skip if already synced
      if (isSynced) {
        return;
      }

      try {
        setIsLoading(true);
        const result = await syncUserAction(country);

        if (result.error) {
          throw new Error(result.error);
        }

        setIsSynced(result.success);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('Error syncing user with Permit.io:', err);
      } finally {
        setIsLoading(false);
      }
    };

    syncUserWithPermit();
  }, [session, status, isSynced, country]);

  return { isSynced, isLoading, error };
} 