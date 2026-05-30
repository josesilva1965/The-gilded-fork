import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, action } = body;
    const log = await db.clockLog.create({
      data: { userId, action, timestamp: new Date() },
      include: { user: { select: { id: true, name: true, role: true } } },
    });
    return NextResponse.json(log);
  } catch (error) {
    console.error('Error clocking:', error);
    return NextResponse.json({ error: 'Failed to clock' }, { status: 500 });
  }
}
