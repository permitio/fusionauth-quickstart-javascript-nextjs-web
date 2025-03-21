import NextAuth from "next-auth"
import FusionAuthProvider from "next-auth/providers/fusionauth"
import { JWT } from "next-auth/jwt"
import { Session } from "next-auth"
import { headers } from 'next/headers'

const fusionAuthIssuer = process.env.FUSIONAUTH_ISSUER;
const fusionAuthClientId = process.env.FUSIONAUTH_CLIENT_ID;
const fusionAuthClientSecret = process.env.FUSIONAUTH_CLIENT_SECRET;
const fusionAuthUrl = process.env.FUSIONAUTH_URL;
const fusionAuthTenantId = process.env.FUSIONAUTH_TENANT_ID;

const missingError = 'missing in environment variables.';
if (!fusionAuthIssuer) {
    throw Error('FUSIONAUTH_ISSUER' + missingError)
}
if (!fusionAuthClientId) {
    throw Error('FUSIONAUTH_CLIENT_ID' + missingError)
}
if (!fusionAuthClientSecret) {
    throw Error('FUSIONAUTH_CLIENT_SECRET' + missingError)
}
if (!fusionAuthUrl) {
    throw Error('FUSIONAUTH_URL' + missingError)
}
if (!fusionAuthTenantId) {
    throw Error('FUSIONAUTH_TENANT_ID' + missingError)
}

// Extend the built-in session types
declare module "next-auth" {
    interface Session {
        accessToken?: string;
        error?: string;
        userSyncedWithPermit?: boolean;
        user: {
            id?: string;
            name?: string;
            email?: string;
            image?: string;
            roles?: string[];
        }
    }
}

// Extend the built-in JWT types
declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpires?: number;
        error?: string;
        userSyncedWithPermit?: boolean;
        roles?: string[];
    }
}

export const authOptions =
{
    providers: [
        FusionAuthProvider({
            issuer: fusionAuthIssuer,
            clientId: fusionAuthClientId,
            clientSecret: fusionAuthClientSecret,
            wellKnown: `${fusionAuthUrl}/.well-known/openid-configuration/${fusionAuthTenantId}`,
            tenantId: fusionAuthTenantId, // Only required if you're using multi-tenancy
            authorization:{
                params:{
                    scope: 'openid offline_access email profile'
                }
            }
        }),
    ],
    callbacks: {
        async jwt({ token, user, account, req }: { token: JWT, user: any, account: any, req?: any }) {
            // Initial sign in
            if (account && user) {
                // Set userSyncedWithPermit to false
                // This will let us handle syncing with the proper country attribute
                // on each permission check
                token.userSyncedWithPermit = false;
                
                try {
                    // Try to extract roles from the token
                    if (account.id_token) {
                        // For OIDC providers like FusionAuth, decode the ID token to get roles
                        const payload = account.id_token.split('.')[1];
                        const decodedPayload = Buffer.from(payload, 'base64').toString();
                        const jwtData = JSON.parse(decodedPayload);
                        
                        // Log the full JWT data for debugging
                        console.log('[AUTH DEBUG] Full ID token payload:', JSON.stringify(jwtData, null, 2));
                        
                        if (jwtData.roles && Array.isArray(jwtData.roles)) {
                            token.roles = jwtData.roles;
                            console.log('[AUTH] Extracted roles from JWT:', token.roles);
                        } else {
                            console.log('[AUTH] No roles found in JWT payload');
                        }
                    } else if (account.access_token) {
                        // Try access token if id_token is not available
                        console.log('[AUTH DEBUG] No ID token available, trying access token');
                        const payload = account.access_token.split('.')[1];
                        const decodedPayload = Buffer.from(payload, 'base64').toString();
                        const jwtData = JSON.parse(decodedPayload);
                        
                        // Log the full JWT data for debugging
                        console.log('[AUTH DEBUG] Full access token payload:', JSON.stringify(jwtData, null, 2));
                        
                        if (jwtData.roles && Array.isArray(jwtData.roles)) {
                            token.roles = jwtData.roles;
                            console.log('[AUTH] Extracted roles from access token:', token.roles);
                        } else {
                            console.log('[AUTH] No roles found in access token payload');
                        }
                    } else {
                        console.log('[AUTH DEBUG] No tokens available to extract roles from');
                    }
                } catch (error) {
                    console.error('[AUTH] Error extracting roles from JWT:', error);
                }
                
                return {
                    ...token,
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    accessTokenExpires: account.expires_at * 1000,
                };
            }

            // Return previous token if the access token has not expired yet
            if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
                return token;
            }

            // Access token has expired, try to update it
            return token;
        },
        async session({ session, token }: { session: Session, token: JWT }) {
            if (token) {
                session.user.id = token.sub;
                session.accessToken = token.accessToken;
                session.error = token.error;
                session.userSyncedWithPermit = token.userSyncedWithPermit;
                session.user.roles = token.roles;  // Add roles to session
            }
            return session;
        },
    },
    events: {
        // Use the signIn event to get the user's IP and sync with more information
        async signIn({ user }: { user: any }) {
            console.log("[AUTH] User signed in, attempting to sync with IP data");
            try {
                // We'll sync the user in the API routes that handle location better
            } catch (error) {
                console.error("[AUTH] Error during sign-in event:", error);
            }
        }
    }
}

// Export the handler directly
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };