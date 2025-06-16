'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { checkPermissionAction } from '../actions/permit';

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
        const result = await checkPermissionAction(action, resource);

        if (result.error) {
          throw new Error(result.error);
        }

        setIsAllowed(result.permitted);
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