import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { syncUser } from '../../../../utils/permit';

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    // Sync user with Permit.io and assign the "member" role
    const success = await syncUser(session.user);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to sync user with Permit.io', success: false },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error syncing user with Permit.io:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
} 