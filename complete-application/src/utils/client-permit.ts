'use client';

import { checkPermissionAction } from '../actions/permit';

// Client-side permission checking
export const checkPermission = async (
  user: any,
  action: string,
  resource: string,
  attributes?: Record<string, any>
): Promise<boolean> => {
  try {
    // Use the server action instead of API endpoint
    const result = await checkPermissionAction(action, resource, attributes);
    return result.permitted;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}; 