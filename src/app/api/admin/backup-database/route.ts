import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth-util';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request, ['ADMIN']);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: Record<string, any> = {};

    if (process.env.DATABASE_URL) {
      const models = [
        { key: 'users', model: db.user },
        { key: 'restaurantTables', model: db.restaurantTable },
        { key: 'reservations', model: db.reservation },
        { key: 'menuCategories', model: db.menuCategory },
        { key: 'menuItems', model: db.menuItem },
        { key: 'menuItemExtras', model: db.menuItemExtra },
        { key: 'ingredients', model: db.ingredient },
        { key: 'recipeItems', model: db.recipeItem },
        { key: 'stockLedgers', model: db.stockLedger },
        { key: 'wastageLogs', model: db.wastageLog },
        { key: 'vendors', model: db.vendor },
        { key: 'purchaseOrders', model: db.purchaseOrder },
        { key: 'purchaseOrderItems', model: db.purchaseOrderItem },
        { key: 'orders', model: db.order },
        { key: 'orderItems', model: db.orderItem },
        { key: 'orderItemExtras', model: db.orderItemExtra },
        { key: 'payments', model: db.payment },
        { key: 'shiftTemplates', model: db.shiftTemplate },
        { key: 'shiftAssignments', model: db.shiftAssignment },
        { key: 'clockLogs', model: db.clockLog },
        { key: 'customers', model: db.customer },
        { key: 'customerFavorites', model: db.customerFavorite },
        { key: 'customerVisits', model: db.customerVisit },
        { key: 'dailySnapshots', model: db.dailySnapshot },
        { key: 'topSellingItems', model: db.topSellingItem },
      ];

      for (const { key, model } of models) {
        data[key] = await (model as any).findMany();
      }
    } else {
      data.message = 'Running in demo mode. Database is not active.';
    }

    const fileBuffer = Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `backup-${dateStr}.json`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/json',
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error backing up database:', error);
    return NextResponse.json({ error: 'Failed to backup database' }, { status: 500 });
  }
}
