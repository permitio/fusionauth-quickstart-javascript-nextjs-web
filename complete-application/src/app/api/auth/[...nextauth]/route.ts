import NextAuth from "next-auth"
import FusionAuthProvider from "next-auth/providers/fusionauth"
import { syncUser } from "../../../../utils/permit"
import { JWT } from "next-auth/jwt"
import { Session } from "next-auth"

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
        async jwt({ token, user, account }: { token: JWT, user: any, account: any }) {
            // Initial sign in
            if (account && user) {
                // Sync user with Permit.io after successful authentication
                try {
                    await syncUser(user);
                    token.userSyncedWithPermit = true;
                } catch (error) {
                    console.error("Failed to sync user with Permit.io:", error);
                    token.userSyncedWithPermit = false;
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
            }
            return session;
        },
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }