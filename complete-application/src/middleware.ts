import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define routes that require specific permissions
const protectedRoutes = [
  {
    path: '/makechange',
    action: 'make',
    resource: 'change',
  },
  // Add more protected routes as needed
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the current path is a protected route
  const protectedRoute = protectedRoutes.find((route) => 
    pathname.startsWith(route.path)
  );
  
  if (protectedRoute) {
    // Get the session token
    const token = await getToken({ req: request });
    
    if (!token) {
      // Redirect to login if not authenticated
      const url = new URL('/api/auth/signin', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
    
    // For permission checks, we'll handle them in the component level
    // This is because middleware can't directly use the Permit.io client
    // due to Edge runtime limitations
  }
  
  // Simply pass the request through to the application
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Add paths that should be checked by the middleware
    '/makechange',
    // Add more paths as needed
    // Apply to all API routes that need authorization
    '/api/permit/:path*',
    '/api/makechange/:path*',
    '/api/auth/:path*',
  ],
}; 