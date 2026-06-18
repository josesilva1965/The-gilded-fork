import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth-util';

function parseDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
      const date = new Date(obj);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(parseDates);
  }
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = parseDates(obj[key]);
    }
    return newObj;
  }
  return obj;
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request, ['ADMIN']);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const text = await file.text();
    const rawData = JSON.parse(text);
    const data = parseDates(rawData);

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ success: true, message: 'Running in demo mode. Restore simulated.' });
    }

    await db.$transaction(async (tx) => {
      // 1. Delete in dependency order
      await tx.orderItemExtra.deleteMany();
      await tx.orderItem.deleteMany();
      await tx.payment.deleteMany();
      await tx.order.deleteMany();
      await tx.reservation.deleteMany();
      await tx.customerFavorite.deleteMany();
      await tx.customerVisit.deleteMany();
      await tx.customer.deleteMany();
      await tx.restaurantTable.deleteMany();
      await tx.recipeItem.deleteMany();
      await tx.menuItemExtra.deleteMany();
      await tx.menuItem.deleteMany();
      await tx.menuCategory.deleteMany();
      await tx.stockLedger.deleteMany();
      await tx.wastageLog.deleteMany();
      await tx.purchaseOrderItem.deleteMany();
      await tx.purchaseOrder.deleteMany();
      await tx.vendor.deleteMany();
      await tx.ingredient.deleteMany();
      await tx.shiftAssignment.deleteMany();
      await tx.shiftTemplate.deleteMany();
      await tx.clockLog.deleteMany();
      await tx.topSellingItem.deleteMany();
      await tx.dailySnapshot.deleteMany();
      await tx.user.deleteMany();

      // 2. Insert in dependency order
      if (data.users?.length) await tx.user.createMany({ data: data.users });
      if (data.dailySnapshots?.length) await tx.dailySnapshot.createMany({ data: data.dailySnapshots });
      if (data.topSellingItems?.length) await tx.topSellingItem.createMany({ data: data.topSellingItems });
      if (data.clockLogs?.length) await tx.clockLog.createMany({ data: data.clockLogs });
      if (data.shiftTemplates?.length) await tx.shiftTemplate.createMany({ data: data.shiftTemplates });
      if (data.shiftAssignments?.length) await tx.shiftAssignment.createMany({ data: data.shiftAssignments });
      if (data.ingredients?.length) await tx.ingredient.createMany({ data: data.ingredients });
      if (data.vendors?.length) await tx.vendor.createMany({ data: data.vendors });
      if (data.purchaseOrders?.length) await tx.purchaseOrder.createMany({ data: data.purchaseOrders });
      if (data.purchaseOrderItems?.length) await tx.purchaseOrderItem.createMany({ data: data.purchaseOrderItems });
      if (data.wastageLogs?.length) await tx.wastageLog.createMany({ data: data.wastageLogs });
      if (data.stockLedgers?.length) await tx.stockLedger.createMany({ data: data.stockLedgers });
      if (data.menuCategories?.length) await tx.menuCategory.createMany({ data: data.menuCategories });
      if (data.menuItems?.length) await tx.menuItem.createMany({ data: data.menuItems });
      if (data.menuItemExtras?.length) await tx.menuItemExtra.createMany({ data: data.menuItemExtras });
      if (data.recipeItems?.length) await tx.recipeItem.createMany({ data: data.recipeItems });
      if (data.customers?.length) await tx.customer.createMany({ data: data.customers });
      if (data.restaurantTables?.length) await tx.restaurantTable.createMany({ data: data.restaurantTables });
      if (data.customerVisits?.length) await tx.customerVisit.createMany({ data: data.customerVisits });
      if (data.customerFavorites?.length) await tx.customerFavorite.createMany({ data: data.customerFavorites });
      if (data.reservations?.length) await tx.reservation.createMany({ data: data.reservations });
      if (data.orders?.length) await tx.order.createMany({ data: data.orders });
      if (data.payments?.length) await tx.payment.createMany({ data: data.payments });
      if (data.orderItems?.length) await tx.orderItem.createMany({ data: data.orderItems });
      if (data.orderItemExtras?.length) await tx.orderItemExtra.createMany({ data: data.orderItemExtras });
    }, {
      timeout: 20000
    });

    return NextResponse.json({ success: true, message: 'Database restored successfully' });
  } catch (error) {
    console.error('Error restoring database:', error);
    return NextResponse.json({ error: 'Failed to restore database' }, { status: 500 });
  }
}
