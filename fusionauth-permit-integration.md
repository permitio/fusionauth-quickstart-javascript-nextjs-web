## TL;DR

To add authentication and authorization to your Next.js app:

1. Set up FusionAuth for authentication (SSO)
2. Integrate Permit.io for fine-grained authorization
3. Configure your Next.js application to use both services
4. Test with different user roles and permissions

## Introduction

This tutorial shows how to build a Next.js application with complete user management using:
- **FusionAuth** for authentication and identity management
- **Permit.io** for fine-grained access control and authorization

The example is a simple "Changebank" application that demonstrates key authentication and authorization concepts.

## Prerequisites

- Basic knowledge of Next.js and React
- Node.js 16 or later
- Docker installed locally
- Git to clone the starter repository

## Step 1: Project Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/fusionauth-permit-nextjs-demo
cd fusionauth-permit-nextjs-demo
```

2. Start the FusionAuth and Permit.io services:
```bash
docker compose up -d
```

3. Install dependencies and prepare the Next.js app:
```bash
cd complete-application
cp .env.example .env.local
npm install
```

## Step 2: Configure FusionAuth

FusionAuth is automatically configured through Docker and Kickstart with these settings:
- Client ID: `e9fdb985-9173-4e01-9d73-ac2d60d1dc8e` 
- Client Secret: `super-secret-secret-that-should-be-regenerated-for-production`
- Admin User: `admin@example.com` / `password`
- Test User: `richard@example.com` / `password`

The Next.js application is already set up to use these credentials in the NextAuth provider.

## Step 3: Configure Permit.io

1. Set up your Permit.io account and create a new project
2. Add your Permit.io API key to `.env.local`:
```
PERMIT_API_KEY=your_permit_api_key_here
```
3. Define your authorization model in Permit.io dashboard:

   - Create roles (Admin, User)
   - Define resources (Account, Transaction)
   - Set up permissions (read, write, manage)

## Step 4: Integration Overview

The application demonstrates:

1. **User Authentication Flow**:
   - NextAuth.js with FusionAuth provider
   - Protected routes with middleware
   - Session management

2. **Authorization Flow**:
   - User synchronization with Permit.io
   - Permission-based UI rendering
   - Server-side permission checks

## Step 5: Key Implementation Details

### Authentication Implementation

The FusionAuth integration uses NextAuth.js:

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import FusionAuth from "next-auth/providers/fusionauth";

const handler = NextAuth({
  providers: [
    FusionAuth({
      id: "fusionauth",
      name: "FusionAuth",
      clientId: process.env.FUSIONAUTH_CLIENT_ID!,
      clientSecret: process.env.FUSIONAUTH_CLIENT_SECRET!,
      issuer: process.env.FUSIONAUTH_ISSUER,
    }),
  ],
  // Additional configuration...
});

export { handler as GET, handler as POST };
```

### Authorization Implementation

Client-side permissions using the Permit.io hook:

```typescript
// Example component with permission checks
import { usePermit } from "@/hooks/usePermit";

export default function AccountActions() {
  const { check } = usePermit();
  const canManageUsers = check("manage", "User");
  
  return (
    <div>
      {canManageUsers && (
        <button>Manage Users</button>
      )}
      {/* Other UI elements */}
    </div>
  );
}
```

Server-side permission checks:

```typescript
// src/actions/permit.ts
import { permit } from "@/utils/permit";
import { getServerSession } from "next-auth/next";

export async function checkPermission(resource: string, action: string) {
  const session = await getServerSession();
  if (!session?.user) return false;
  
  const user = session.user;
  return permit.check(user.email, action, resource);
}
```

## Step 6: Testing the Integration

1. Start the application:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Test different user scenarios:
   - Login as `richard@example.com` (regular user)
   - Login as `admin@example.com` (admin user)
   - Notice how UI elements change based on permissions

## Conclusion

You now have a Next.js application with:
- Secure authentication via FusionAuth
- Fine-grained authorization via Permit.io
- Seamless user experience with conditional UI rendering

This architecture provides a robust foundation for building secure applications with complex permission requirements.

## Additional Resources

- [FusionAuth Documentation](https://fusionauth.io/docs/)
- [Permit.io Documentation](https://docs.permit.io/)
- [Next.js Authentication Guide](https://nextjs.org/docs/authentication)
- [Source Code Repository](https://github.com/your-repo) 