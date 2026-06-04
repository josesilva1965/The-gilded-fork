import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Today's snapshot
    const todaySnapshot = await db.dailySnapshot.findFirst({
      orderBy: { date: 'desc' },
    });

    // Last 7 days snapshots
    const weekSnapshots = await db.dailySnapshot.findMany({
      orderBy: { date: 'desc' },
      take: 7,
    });

    // Active orders count
    const activeOrders = await db.order.count({
      where: {
        status: { not: 'CANCELLED' },
        paymentStatus: { in: ['PENDING', 'PARTIAL'] },
      },
    });

    // Today's revenue (from active/completed orders)
    const todayOrders = await db.order.findMany({
      where: {
        createdAt: { gte: today },
        status: { in: ['IN_PROGRESS', 'READY', 'SERVED'] },
      },
    });
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Yesterday's revenue
    const yesterdayOrders = await db.order.findMany({
      where: {
        createdAt: { gte: yesterday, lt: today },
        status: { in: ['IN_PROGRESS', 'READY', 'SERVED'] },
      },
    });
    const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Revenue change %
    const revenueChange = yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      : 0;

    // Table occupancy
    const totalTables = await db.restaurantTable.count({ where: { active: true } });
    const occupiedTables = await db.restaurantTable.count({
      where: { status: { in: ['SEATED', 'ORDER_PLACED', 'APPETIZER', 'MAIN', 'DESSERT', 'BILL_REQUESTED'] } },
    });

    // Top selling items (from order items)
    const topItems = await db.orderItem.groupBy({
      by: ['menuItemId'],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

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

    // Low stock count
    const lowStockCount = await db.ingredient.count({
      where: { currentStock: { lte: db.ingredient.fields.minStock } },
    });

    // Low stock items (top 5 most critical)
    const lowStockItems = await db.ingredient.findMany({
      where: { currentStock: { lte: db.ingredient.fields.minStock } },
      select: { id: true, name: true, currentStock: true, minStock: true, unit: true },
      orderBy: { currentStock: 'asc' },
      take: 5,
    });

    // Staff on shift today
    const todayShifts = await db.shiftAssignment.count({
      where: { date: { gte: today } },
    });

    // Clocked-in staff
    const clockedInUsers = await db.user.findMany({
      where: {
        clockLogs: {
          some: {
            action: 'IN',
            timestamp: { gte: today },
          },
        },
      },
      include: {
        clockLogs: { orderBy: { timestamp: 'desc' }, take: 1 },
      },
    });

    // Recent Activity Feed
    const recentActivity: Array<{
      id: string;
      type: 'order' | 'reservation' | 'clock_in';
      description: string;
      time: string;
    }> = [];

    // Recent orders
    const recentOrders = await db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        table: { select: { name: true } },
        creator: { select: { name: true } },
      },
    });
    for (const order of recentOrders) {
      const timeAgo = getTimeAgo(order.createdAt);
      recentActivity.push({
        id: `order-${order.id}`,
        type: 'order',
        description: `Order placed at ${order.table.name} by ${order.creator.name} — $${order.totalAmount.toFixed(2)}`,
        time: timeAgo,
      });
    }

    // Recent reservations
    const recentReservations = await db.reservation.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
    });
    for (const res of recentReservations) {
      const timeAgo = getTimeAgo(res.createdAt);
      recentActivity.push({
        id: `res-${res.id}`,
        type: 'reservation',
        description: `Reservation for ${res.guestName} — ${res.partySize} guests at ${res.reservationTime}`,
        time: timeAgo,
      });
    }

    // Recent clock-ins
    const recentClockIns = await db.clockLog.findMany({
      take: 3,
      orderBy: { timestamp: 'desc' },
      where: { action: 'IN' },
      include: { user: { select: { name: true } } },
    });
    for (const log of recentClockIns) {
      const timeAgo = getTimeAgo(log.timestamp);
      recentActivity.push({
        id: `clock-${log.id}`,
        type: 'clock_in',
        description: `${log.user.name} clocked in`,
        time: timeAgo,
      });
    }

    // Sort activity by most recent (approximate using string)
    recentActivity.sort((a, b) => a.time.localeCompare(b.time));

    // Fetch all orders created today (for Live Order Monitor)
    const dailyOrders = await db.order.findMany({
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
    });

    return NextResponse.json({
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
      clockedIn: clockedInUsers.length,
      recentActivity,
      dailyOrders,
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
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
