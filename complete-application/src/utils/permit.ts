import { Permit } from 'permitio';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../app/api/auth/[...nextauth]/route';

// Type definitions
interface PermitUser {
  id?: string;
  email?: string;
  name?: string;
  image?: string;
}

// Initialize Permit.io client
let permitClient: Permit | null = null;

/**
 * Get or initialize the Permit.io client
 */
export const getPermitClient = (): Permit | null => {
  if (!permitClient) {
    const apiKey = process.env.PERMIT_API_KEY;
    const pdpUrl = process.env.PERMIT_PDP_URL || 'http://localhost:7766';
    
    if (!apiKey) {
      console.error('PERMIT_API_KEY is not defined in environment variables');
      return null;
    }
    
    permitClient = new Permit({
      pdp: pdpUrl,
      token: apiKey,
      proxyFactsViaPdp: true,
    });
  }
  
  return permitClient;
};

/**
 * Extract user identifier from user object
 */
const getUserId = (user: PermitUser): string | null => {
  const userId = user.id || user.email;
  if (!userId) {
    console.error('User ID or email not found');
    return null;
  }
  return userId;
};

/**
 * Sync user with Permit.io and assign roles from FusionAuth JWT
 */
export const syncUser = async (user: PermitUser, country?: string, accessToken?: string): Promise<boolean> => {
  const permit = getPermitClient();
  if (!permit) return false;
  
  try {
    // Extract user information
    const userId = getUserId(user);
    if (!userId) return false;
    
    const email = user.email || userId;
    const [firstName = '', lastName = ''] = user.name 
      ? [user.name.split(' ')[0], user.name.split(' ').slice(1).join(' ')] 
      : ['', ''];
    
    // Prepare payload for Permit.io with country as a user attribute if provided
    const userPayload = {
      key: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      attributes: {
        location: country || null
      }
    };
    
    console.log('[PERMIT SYNC] Syncing user payload:', JSON.stringify(userPayload, null, 2));
    
    // Sync user with Permit.io
    await permit.api.syncUser(userPayload);
    
    // Extract roles from JWT if available
    let roles: string[] = []; // No default role
    let jwtData: any = null;
    
    if (accessToken) {
      try {
        console.log('[PERMIT SYNC] Access token available, attempting to extract roles');
        // Parse the JWT to extract roles
        // JWT is in format header.payload.signature, so split and get the payload
        const parts = accessToken.split('.');
        if (parts.length !== 3) {
          console.log('[PERMIT SYNC] Invalid JWT format, does not have 3 parts');
        }
        
        const payload = parts[1];
        // Decode the base64 payload
        const decodedPayload = Buffer.from(payload, 'base64').toString();
        jwtData = JSON.parse(decodedPayload);
        
        console.log('[PERMIT SYNC] Full JWT payload:', JSON.stringify(jwtData, null, 2));
        
        // If roles exist in the JWT, use them
        if (jwtData.roles && Array.isArray(jwtData.roles) && jwtData.roles.length > 0) {
          roles = jwtData.roles;
          console.log('[PERMIT SYNC] Extracted roles from JWT:', roles);
        } else {
          console.log('[PERMIT SYNC] No roles found in JWT payload, not assigning any roles');
        }
      } catch (error) {
        console.error('[PERMIT SYNC] Error parsing JWT for roles:', error);
      }
    } else {
      console.log('[PERMIT SYNC] No access token provided, not assigning any roles');
    }
    
    // Only assign roles if we found any in the JWT
    if (roles.length > 0) {
      for (const role of roles) {
        const rolePayload = {
          user: userId,
          role: role,
          tenant: 'default'
        };
        
        console.log('[PERMIT SYNC] Assigning role with payload:', JSON.stringify(rolePayload, null, 2));
        
        try {
          await permit.api.assignRole(rolePayload);
          console.log(`[PERMIT SYNC] Successfully assigned role "${role}" to user ${userId}`);
        } catch (error) {
          console.error(`[PERMIT SYNC] Error assigning role "${role}" to user:`, error);
        }
      }
    } else {
      console.log('[PERMIT SYNC] No roles to assign to user');
    }
    
    return true;
  } catch (error) {
    console.error('[PERMIT SYNC] Error syncing user with Permit.io:', error);
    return false;
  }
};

/**
 * Check if a specific user is allowed to perform an action on a resource
 */
export async function checkPermission(
  user: PermitUser,
  action: string,
  resource: string,
  attributes?: Record<string, any>
): Promise<boolean> {
  const permit = getPermitClient();
  if (!permit) return false;
  
  try {
    // Extract user ID
    const userId = getUserId(user);
    if (!userId) return false;
    
    if (!attributes) {
      // Basic permission check without attributes
      return await permit.check(userId, action, resource);
    }
    
    // Extract attributes
    const { country, amount, currency, ...otherAttributes } = attributes;
    
    // Get currency-related country code based on the currency
    let currencyCountry = '';
    if (currency === 'USD') currencyCountry = 'US';
    else if (currency === 'CAD') currencyCountry = 'CA';
    else if (currency === 'GBP') currencyCountry = 'GB';
    else if (currency === 'ILS') currencyCountry = 'IL';
    else if (currency === 'JPY') currencyCountry = 'JP';
    else if (currency === 'AUD') currencyCountry = 'AU';
    
    // Create user object with attributes
    const userObj = {
      key: userId,
      attributes: {
        location: country || null
      }
    };
    
    // Create resource object with attributes
    const resourceObj = {
      type: resource,
      tenant: 'default',
      attributes: {
        amount,
        currency,
        currency_country: currencyCountry
      }
    };
    
    // Use the documented API format for ABAC
    return await permit.check(userObj, action, resourceObj);
  } catch (error) {
    console.error('[PERMIT CHECK] Error checking permission:', error);
    return false;
  }
}

/**
 * Role with its permissions
 */
interface RoleWithPermissions {
  name: string;
  permissions: string[];
}

/**
 * Get roles assigned to a user from Permit.io with their permissions
 */
export async function getUserRoles(user: PermitUser): Promise<RoleWithPermissions[]> {
  const permit = getPermitClient();
  if (!permit) return [];
  
  try {
    // Extract user ID
    const userId = getUserId(user);
    if (!userId) return [];
    
    // Get roles assigned to the user
    const roles = await permit.api.getAssignedRoles(userId);
    
    if (!roles || !Array.isArray(roles)) {
      console.error('[PERMIT ROLES] Invalid response from Permit.io:', roles);
      return [];
    }
    
    // For each role, get its details including permissions
    const rolesWithPermissions: RoleWithPermissions[] = [];
    
    for (const roleAssignment of roles) {
      const roleName = roleAssignment.role;
      try {
        // Get the full role information including permissions
        const roleDetails = await permit.api.getRole(roleName);
        if (roleDetails && roleDetails.permissions) {
          rolesWithPermissions.push({
            name: roleName,
            permissions: roleDetails.permissions
          });
        }
      } catch (error) {
        console.error(`[PERMIT ROLES] Error getting details for role ${roleName}:`, error);
      }
    }
    
    return rolesWithPermissions;
  } catch (error) {
    console.error('[PERMIT ROLES] Error getting user roles from Permit.io:', error);
    return [];
  }
}

/**
 * Get the current session user and check if they are allowed to perform an action
 */
export async function checkCurrentUserPermission(
  action: string,
  resource: string,
  attributes?: Record<string, any>
): Promise<boolean> {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return false;
    }

    // Check permission using the lower-level function which now handles user attributes
    return await checkPermission(session.user, action, resource, attributes);
  } catch (error) {
    console.error('[PERMIT CHECK] Error checking current user permission:', error);
    return false;
  }
} 