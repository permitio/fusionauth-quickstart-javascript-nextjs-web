'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useSyncUser() {
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
        const response = await fetch('/api/permit/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to sync user with Permit.io');
        }

        const data = await response.json();
        setIsSynced(data.success);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('Error syncing user with Permit.io:', err);
      } finally {
        setIsLoading(false);
      }
    };

    syncUserWithPermit();
  }, [session, status, isSynced]);

  return { isSynced, isLoading, error };
} 