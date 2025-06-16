'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../app/api/auth/[...nextauth]/route';
import { syncUser, checkPermission, getUserRoles } from '../utils/permit';

export async function syncUserAction(country?: string) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Sync user with country if provided and pass the accessToken
    const success = await syncUser(session.user, country, session.accessToken);

    if (success) {
      return { success: true };
    } else {
      return { success: false, error: 'Failed to sync user with Permit.io' };
    }
  } catch (error) {
    console.error('Error syncing user with Permit.io:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function checkPermissionAction(action: string, resource: string, attributes?: Record<string, any>) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return { permitted: false, error: 'Unauthorized' };
    }

    if (!action || !resource) {
      return { permitted: false, error: 'Missing required parameters' };
    }

    // Check permission using Permit.io
    const permitted = await checkPermission(session.user, action, resource, attributes);

    return { permitted };
  } catch (error) {
    console.error('Error checking permission:', error);
    return { permitted: false, error: 'Internal server error' };
  }
}

export async function getUserRolesAction() {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return { success: false, error: 'Unauthorized', roles: [] };
    }

    // Get user roles from Permit.io with permissions
    const rolesWithPermissions = await getUserRoles(session.user);

    return { success: true, roles: rolesWithPermissions };
  } catch (error) {
    console.error('Error getting user roles from Permit.io:', error);
    return { success: false, error: 'Internal server error', roles: [] };
  }
} 