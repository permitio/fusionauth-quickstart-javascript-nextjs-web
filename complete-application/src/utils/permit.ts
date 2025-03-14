import { Permit } from 'permitio';

// Initialize Permit.io client
let permitClient: Permit | null = null;

export const getPermitClient = () => {
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
    });
  }
  
  return permitClient;
};

// Sync user with Permit.io and assign the "member" role
export const syncUser = async (user: any): Promise<boolean> => {
  try {
    const permit = getPermitClient();
    if (!permit) return false;
    
    // Extract user information from the session
    const userId = user.id || user.email;
    const email = user.email;
    const firstName = user.name?.split(' ')[0] || '';
    const lastName = user.name?.split(' ').slice(1).join(' ') || '';
    
    if (!userId || !email) {
      console.error('User ID or email not found in session');
      return false;
    }
    
    // Sync user with Permit.io
    await permit.api.syncUser({
      key: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      attributes: {
        // Add any additional user attributes here
      }
    });
    
    // Assign the "member" role to the user
    await permit.api.assignRole({
      user: userId,
      role: 'member',
      tenant: 'default' // Use your tenant key if different
    });
    
    console.log(`User ${userId} synced with Permit.io and assigned 'member' role`);
    return true;
  } catch (error) {
    console.error('Error syncing user with Permit.io:', error);
    return false;
  }
};

// Check if a user is allowed to perform an action on a resource
export const checkPermission = async (
  user: any,
  action: string,
  resource: string
): Promise<boolean> => {
  try {
    const permit = getPermitClient();
    if (!permit) return false;
    
    // Extract user information from the session
    const userId = user.id || user.email;
    
    if (!userId) {
      console.error('User ID or email not found in session');
      return false;
    }
    
    // Check permission using Permit.io
    const permitted = await permit.check(userId, action, resource);
    return permitted;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}; 