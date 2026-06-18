import { NextResponse } from 'next/server';
import { verifyUserPin } from '@/lib/auth-util';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, pin } = body;

    if (!userId || !pin) {
      return NextResponse.json({ error: 'User ID and PIN are required' }, { status: 400 });
    }

    const authenticatedUser = await verifyUserPin(userId, pin);
    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }

    return NextResponse.json({ user: authenticatedUser });
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
