'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Component to handle user synchronization with Permit.io
function UserSyncHandler() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only sync if the user is authenticated and hasn't been synced yet
    if (status === 'authenticated' && session && session.userSyncedWithPermit === false) {
      // Call the sync API endpoint
      fetch('/api/permit/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(error => {
        console.error('Error syncing user with Permit.io:', error);
      });
    }
  }, [session, status]);

  return null; // This component doesn't render anything
}

// Custom SessionProvider that includes user synchronization with Permit.io
export default function PermitSessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <UserSyncHandler />
      {children}
    </SessionProvider>
  );
} 