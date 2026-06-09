import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get all active staff with their recent clock logs to calculate sessions
    const staff = await db.user.findMany({
      where: { active: true },
      include: {
        clockLogs: {
          orderBy: { timestamp: 'desc' },
          take: 20,
        },
      },
      orderBy: { name: 'asc' },
    });

    interface TipDistribution {
      userId: string;
      name: string;
      role: string;
      hoursWorked: number;
      tipPointValue: number;
      tipPoints: number;
      share: number;
    }
    const distributions: TipDistribution[] = [];

    for (const user of staff) {
      if (user.clockLogs.length === 0) continue;

      // Chronological order
      const logs = [...user.clockLogs].reverse();

      // Group logs into sessions [IN, OUT]
      const sessions: { inTime: Date; outTime: Date }[] = [];
      let currentInLog: (typeof user.clockLogs)[0] | null = null;

      for (const log of logs) {
        if (log.action === 'IN') {
          currentInLog = log;
        } else if (log.action === 'OUT') {
          if (currentInLog) {
            sessions.push({
              inTime: new Date(currentInLog.timestamp),
              outTime: new Date(log.timestamp),
            });
            currentInLog = null;
          }
        }
      }

      // If still clocked in
      if (currentInLog) {
        sessions.push({
          inTime: new Date(currentInLog.timestamp),
          outTime: new Date(),
        });
      }

      // Calculate overlap with today [startOfDay, endOfDay]
      let totalMinutes = 0;
      for (const session of sessions) {
        const sessionStart = session.inTime;
        const sessionEnd = session.outTime;

        const overlapStart = sessionStart > startOfDay ? sessionStart : startOfDay;
        const overlapEnd = sessionEnd < endOfDay ? sessionEnd : endOfDay;

        if (overlapStart < overlapEnd) {
          totalMinutes += (overlapEnd.getTime() - overlapStart.getTime()) / 60000;
        }
      }

      const hoursWorked = totalMinutes / 60;

      if (hoursWorked <= 0) continue;

      const tipPoints = hoursWorked * user.tipPointValue;

      distributions.push({
        userId: user.id,
        name: user.name,
        role: user.role,
        hoursWorked: Math.round(hoursWorked * 100) / 100,
        tipPointValue: user.tipPointValue,
        tipPoints: Math.round(tipPoints * 100) / 100,
        share: 0, // Will be calculated on the frontend
      });
    }

    // Calculate total tips collected today
    const paymentsToday = await db.payment.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
        status: 'COMPLETED',
      },
      select: {
        tipAmount: true,
      },
    });

    const totalTips = paymentsToday.reduce((sum, p) => sum + (p.tipAmount || 0), 0);

    return NextResponse.json({ distributions, totalTips });
  } catch (error) {
    console.error('Error calculating tip distribution:', error);
    return NextResponse.json({ error: 'Failed to calculate tip distribution' }, { status: 500 });
  }
}
