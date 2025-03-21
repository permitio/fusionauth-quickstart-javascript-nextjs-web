import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // If we have a JWT, try to decode it directly for debugging purposes
    let jwtRoles: string[] | null = null;
    
    if (session.accessToken) {
      try {
        const parts = session.accessToken.split('.');
        if (parts.length === 3) {
          const payload = Buffer.from(parts[1], 'base64').toString();
          const decoded = JSON.parse(payload);
          
          if (decoded.roles && Array.isArray(decoded.roles)) {
            jwtRoles = decoded.roles;
          }
        }
      } catch (error) {
        console.error('Error decoding JWT:', error);
      }
    }

    // Return roles information
    return NextResponse.json({
      success: true,
      sessionRoles: session.user.roles || [],
      jwtRoles: jwtRoles || [],
      hasAccessToken: !!session.accessToken
    });
  } catch (error) {
    console.error('Error retrieving roles:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 