import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { checkPermission } from '../../../../utils/permit';

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', permitted: false },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { action, resource } = body;

    if (!action || !resource) {
      return NextResponse.json(
        { error: 'Missing required parameters', permitted: false },
        { status: 400 }
      );
    }

    // Check permission using Permit.io
    const permitted = await checkPermission(session.user, action, resource);

    return NextResponse.json({ permitted });
  } catch (error) {
    console.error('Error checking permission:', error);
    return NextResponse.json(
      { error: 'Internal server error', permitted: false },
      { status: 500 }
    );
  }
} 