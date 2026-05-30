import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const users = await db.user.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      include: {
        clockLogs: { orderBy: { timestamp: 'desc' }, take: 5 },
        shifts: { include: { shiftTemplate: true }, orderBy: { date: 'asc' } },
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}
