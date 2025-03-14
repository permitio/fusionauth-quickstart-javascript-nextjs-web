import { getServerSession } from 'next-auth/next';
import { authOptions } from '../app/api/auth/[...nextauth]/route';
import { checkPermission, syncUser } from './permit';

// Check if the current user is allowed to perform an action on a resource
export async function checkUserPermission(
  action: string,
  resource: string
): Promise<boolean> {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return false;
    }

    // If the user hasn't been synced with Permit.io, try to sync them now
    if (session.userSyncedWithPermit === false) {
      await syncUser(session.user);
    }

    // Check permission using Permit.io
    return await checkPermission(session.user, action, resource);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
} 