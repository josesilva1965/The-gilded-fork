import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { safeDbCall } from '@/lib/db-fallback';
import { MOCK_DASHBOARD } from '@/lib/mock-data';

export async function GET() {
  const data = await safeDbCall(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Run all independent queries in parallel
    const [
      todaySnapshot,
      weekSnapshots,
      activeOrders,
      todayRevenueAgg,
      yesterdayRevenueAgg,
      totalTables,
      occupiedTables,
      topItems,
      lowStockCount,
      lowStockItems,
      todayShifts,
      clockedInUsers,
      recentOrders,
      recentReservations,
      recentClockIns,
      dailyOrders,
    ] = await Promise.all([
      db.dailySnapshot.findFirst({
        orderBy: { date: 'desc' },
      }),
      db.dailySnapshot.findMany({
        orderBy: { date: 'desc' },
        take: 7,
      }),
      db.order.count({
        where: {
          status: { not: 'CANCELLED' },
          paymentStatus: { in: ['PENDING', 'PARTIAL'] },
        },
      }),
      db.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          createdAt: { gte: today },
          status: { in: ['IN_PROGRESS', 'READY', 'SERVED'] },
        },
      }),
      db.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          createdAt: { gte: yesterday, lt: today },
          status: { in: ['IN_PROGRESS', 'READY', 'SERVED'] },
        },
      }),
      db.restaurantTable.count({ where: { active: true } }),
      db.restaurantTable.count({
        where: { status: { in: ['SEATED', 'ORDER_PLACED', 'APPETIZER', 'MAIN', 'DESSERT', 'BILL_REQUESTED'] } },
      }),
      db.orderItem.groupBy({
        by: ['menuItemId'],
        _sum: { quantity: true, totalPrice: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      db.ingredient.count({
        where: { currentStock: { lte: db.ingredient.fields.minStock } },
      }),
      db.ingredient.findMany({
        where: { currentStock: { lte: db.ingredient.fields.minStock } },
        select: { id: true, name: true, currentStock: true, minStock: true, unit: true },
        orderBy: { currentStock: 'asc' },
        take: 5,
      }),
      db.shiftAssignment.count({
        where: { date: { gte: today } },
      }),
      db.user.findMany({
        where: { active: true },
        include: {
          clockLogs: { orderBy: { timestamp: 'desc' }, take: 1 },
        },
      }),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          table: { select: { name: true } },
          creator: { select: { name: true } },
        },
      }),
      db.reservation.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
      }),
      db.clockLog.findMany({
        take: 3,
        orderBy: { timestamp: 'desc' },
        where: { action: 'IN' },
        include: { user: { select: { name: true } } },
      }),
      db.order.findMany({
        where: {
          createdAt: { gte: today },
        },
        include: {
          items: {
            include: { menuItem: true },
            orderBy: { createdAt: 'asc' },
          },
          table: true,
          creator: {
            select: { id: true, name: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ]);

    const todayRevenue = todayRevenueAgg._sum.totalAmount || 0;
    const yesterdayRevenue = yesterdayRevenueAgg._sum.totalAmount || 0;

    // Revenue change %
    const revenueChange = yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      : 0;

    // Get menu item names for top items
    const menuItemIds = topItems.map(t => t.menuItemId).filter(Boolean) as string[];
    const menuItems = await db.menuItem.findMany({
      where: { id: { in: menuItemIds } },
      select: { id: true, name: true },
    });
    const topItemsWithNames = topItems.map(item => ({
      ...item,
      name: menuItems.find(m => m.id === item.menuItemId)?.name || 'Unknown',
    }));

    // Recent Activity Feed
    const recentActivity: Array<{
      id: string;
      type: 'order' | 'reservation' | 'clock_in';
      description: string;
      time: string;
      createdAt: string;
      metadata: {
        tableName?: string;
        creatorName?: string;
        totalAmount?: number;
        guestName?: string;
        partySize?: number;
        reservationTime?: string;
        userName?: string;
      };
    }> = [];

    // Map recent orders to activity list
    for (const order of recentOrders) {
      const timeAgo = getTimeAgo(order.createdAt);
      recentActivity.push({
        id: `order-${order.id}`,
        type: 'order',
        description: `Order placed at ${order.table.name} by ${order.creator.name} — $${order.totalAmount.toFixed(2)}`,
        time: timeAgo,
        createdAt: order.createdAt.toISOString(),
        metadata: {
          tableName: order.table.name,
          creatorName: order.creator.name,
          totalAmount: order.totalAmount,
        },
      });
    }

    // Map recent reservations to activity list
    for (const res of recentReservations) {
      const timeAgo = getTimeAgo(res.createdAt);
      recentActivity.push({
        id: `res-${res.id}`,
        type: 'reservation',
        description: `Reservation for ${res.guestName} — ${res.partySize} guests at ${res.reservationTime}`,
        time: timeAgo,
        createdAt: res.createdAt.toISOString(),
        metadata: {
          guestName: res.guestName,
          partySize: res.partySize,
          reservationTime: res.reservationTime,
        },
      });
    }

    // Map recent clock-ins to activity list
    for (const log of recentClockIns) {
      const timeAgo = getTimeAgo(log.timestamp);
      recentActivity.push({
        id: `clock-${log.id}`,
        type: 'clock_in',
        description: `${log.user.name} clocked in`,
        time: timeAgo,
        createdAt: log.timestamp.toISOString(),
        metadata: {
          userName: log.user.name,
        },
      });
    }

    // Sort activity by actual date (newest first)
    recentActivity.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      todaySnapshot,
      weekSnapshots,
      activeOrders,
      todayRevenue,
      yesterdayRevenue,
      revenueChange: Math.round(revenueChange * 10) / 10,
      totalTables,
      occupiedTables,
      occupancyRate: totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0,
      topItems: topItemsWithNames,
      lowStockCount,
      lowStockItems,
      todayShifts,
      clockedIn: clockedInUsers.filter((u) => u.clockLogs[0]?.action === 'IN').length,
      recentActivity,
      dailyOrders,
    };
  }, MOCK_DASHBOARD);

  return NextResponse.json(data);
}

function getTimeAgo(date: Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '0 min ago';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
