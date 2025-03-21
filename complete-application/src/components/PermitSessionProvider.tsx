'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { syncUserAction } from '../actions/permit';

// Component to handle user synchronization with Permit.io
function UserSyncHandler() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only sync if the user is authenticated and hasn't been synced yet
    if (status === 'authenticated' && session && session.userSyncedWithPermit === false) {
      // Try to get country from localStorage if available
      let country;
      if (typeof window !== 'undefined') {
        country = localStorage.getItem('selectedCountry');
      }
      
      // Use the server action instead of API endpoint
      syncUserAction(country || undefined).catch(error => {
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