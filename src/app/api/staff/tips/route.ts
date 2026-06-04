import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get all active staff with their clock logs for today
    const staff = await db.user.findMany({
      where: { active: true },
      include: {
        clockLogs: {
          where: {
            timestamp: {
              gte: startOfDay,
              lt: endOfDay,
            },
          },
          orderBy: { timestamp: 'asc' },
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

      // Calculate total hours worked today
      let totalMinutes = 0;
      let inTime: Date | null = null;

      for (const log of user.clockLogs) {
        if (log.action === 'IN') {
          inTime = new Date(log.timestamp);
        } else if (log.action === 'OUT' && inTime) {
          const outTime = new Date(log.timestamp);
          totalMinutes += (outTime.getTime() - inTime.getTime()) / 60000;
          inTime = null;
        }
      }

      // Still clocked in — count up to now
      if (inTime) {
        totalMinutes += (Date.now() - inTime.getTime()) / 60000;
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
