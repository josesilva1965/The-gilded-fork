import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const week = new Date(today);
    week.setDate(week.getDate() - 7);

    const month = new Date(today);
    month.setDate(month.getDate() - 30);

    // 1. Parallel aggregates for stats badges
    const getProduction = async (station: 'KITCHEN' | 'BAR', startDate: Date) => {
      const result = await db.orderItem.aggregate({
        _sum: {
          quantity: true,
        },
        where: {
          station,
          status: { not: 'CANCELLED' },
          OR: [
            { readyAt: { gte: startDate } },
            { servedAt: { gte: startDate } }
          ]
        },
      });

      return result._sum.quantity || 0;
    };

    const [
      kitchenDay, barDay,
      kitchenWeek, barWeek,
      kitchenMonth, barMonth
    ] = await Promise.all([
      getProduction('KITCHEN', today),
      getProduction('BAR', today),
      getProduction('KITCHEN', week),
      getProduction('BAR', week),
      getProduction('KITCHEN', month),
      getProduction('BAR', month)
    ]);

    // 2. Fetch detailed list of prepared items in the last 30 days
    const items = await db.orderItem.findMany({
      where: {
        status: { not: 'CANCELLED' },
        OR: [
          { readyAt: { gte: month } },
          { servedAt: { gte: month } }
        ]
      },
      include: {
        menuItem: { select: { name: true } },
        order: { 
          include: { 
            table: { select: { name: true } } 
          } 
        }
      },
      orderBy: {
        readyAt: 'desc'
      }
    });

    const detailedItems = items.map(item => ({
      id: item.id,
      name: item.menuItem.name,
      quantity: item.quantity,
      station: item.station,
      preparedAt: item.readyAt || item.servedAt || item.updatedAt,
      tableName: item.order.table.name
    }));

    return NextResponse.json({
      day: { kitchen: kitchenDay, bar: barDay },
      week: { kitchen: kitchenWeek, bar: barWeek },
      month: { kitchen: kitchenMonth, bar: barMonth },
      items: detailedItems
    });
  } catch (error) {
    console.error('Error fetching KDS production stats:', error);
    return NextResponse.json({ error: 'Failed to fetch production stats' }, { status: 500 });
  }
}
