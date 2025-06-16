This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Authorization with Permit.io

This application demonstrates fine-grained authorization using [Permit.io](https://permit.io):

### Configuration
- The application requires a valid Permit.io API key in your `.env.local` file
- The key should be set as `PERMIT_API_KEY=your_api_key_here`
- The Policy Decision Point (PDP) service runs on `http://localhost:7766`

### Implementation Details
- User synchronization: After authentication, users are automatically synced with Permit.io
- Client-side permissions: Implemented via `usePermit` hook and client-side Permit SDK
- Server-side permissions: Handled via server actions in `src/actions/permit.ts`
- UI adaptation: Components conditionally render based on permission checks

### Key Files
- `src/utils/permit.ts` - Server-side Permit.io integration
- `src/utils/client-permit.ts` - Client-side Permit.io integration
- `src/hooks/usePermit.ts` - React hook for permission checks
- `src/hooks/useSyncUser.ts` - Hook for user synchronization
- `src/components/PermitSessionProvider.tsx` - Context provider for permissions

### Testing
- Login as `richard@example.com` (password: `password`) for regular user permissions
- Login as `admin@example.com` (password: `password`) for administrative permissions
- Modify permission rules through the [Permit.io dashboard](https://app.permit.io)

For more information on Permit.io integration, see the [Permit.io documentation](https://docs.permit.io/).
