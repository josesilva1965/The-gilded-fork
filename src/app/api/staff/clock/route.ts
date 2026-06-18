import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { MOCK_USERS } from '@/lib/mock-data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pin, action: requestedAction } = body;

    if (!pin) {
      return NextResponse.json({ error: 'PIN is required' }, { status: 400 });
    }

    let user: any = null;

    if (process.env.DATABASE_URL) {
      user = await db.user.findFirst({
        where: { pin, active: true },
        include: {
          clockLogs: { orderBy: { timestamp: 'desc' }, take: 1 }
        }
      });
    }

    // Fallback to mock data if DB is offline or user not found in DB
    if (!user) {
      const mockUser = MOCK_USERS.find((u) => u.pin === pin && u.active);
      if (!mockUser) {
        return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
      }
      user = {
        id: mockUser.id,
        name: mockUser.name,
        role: mockUser.role,
        clockLogs: []
      };
    }

    // Determine action: either the requested one, or toggle based on latest log
    let action = requestedAction;
    if (!action) {
      const latestLog = user.clockLogs?.[0];
      action = latestLog?.action === 'IN' ? 'OUT' : 'IN';
    }

    let log: any = null;
    let workedText = '';

    if (process.env.DATABASE_URL && user.id) {
      log = await db.clockLog.create({
        data: {
          userId: user.id,
          action,
          timestamp: new Date(),
        },
      });

      // If they clocked out, calculate shift time
      if (action === 'OUT') {
        const lastInLog = await db.clockLog.findFirst({
          where: { userId: user.id, action: 'IN' },
          orderBy: { timestamp: 'desc' }
        });
        if (lastInLog) {
          const diffMs = Date.now() - new Date(lastInLog.timestamp).getTime();
          const hours = Math.floor(diffMs / 3600000);
          const minutes = Math.floor((diffMs % 3600000) / 60000);
          workedText = ` Worked: ${hours}h ${minutes}m`;
        }
      }
    } else {
      // Mock log creation
      log = {
        id: 'mock-log-' + Date.now(),
        userId: user.id,
        action,
        timestamp: new Date()
      };
      if (action === 'OUT') {
        workedText = ' Worked: 8h 0m';
      }
    }

    return NextResponse.json({
      success: true,
      action,
      userName: user.name,
      userId: user.id,
      workedText,
      log
    });
  } catch (error) {
    console.error('Error clocking:', error);
    return NextResponse.json({ error: 'Failed to clock' }, { status: 500 });
  }
}
