'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UsePermitProps {
  action: string;
  resource: string;
}

export function usePermit({ action, resource }: UsePermitProps) {
  const { data: session } = useSession();
  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkPermission = async () => {
      if (!session?.user) {
        setIsAllowed(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch('/api/permit/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action,
            resource,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to check permission');
        }

        const data = await response.json();
        setIsAllowed(data.permitted);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsAllowed(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, [session, action, resource]);

  return { isAllowed, isLoading, error };
} 