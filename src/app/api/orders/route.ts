import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const orders = await db.order.findMany({
      where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
      include: {
        items: { include: { menuItem: true }, orderBy: { createdAt: 'asc' } },
        table: true,
        creator: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableId, createdBy, items, type, guestCount, notes } = body;

    let subtotal = 0;
    for (const item of items) {
      const menuItem = await db.menuItem.findUnique({ where: { id: item.menuItemId } });
      if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);
      subtotal += menuItem.price * item.quantity;
    }

    const taxAmount = Math.round(subtotal * 0.1 * 100) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

    const order = await db.order.create({
      data: {
        tableId,
        createdBy,
        type: type || 'DINE_IN',
        guestCount: guestCount || 1,
        subtotal,
        taxAmount,
        totalAmount,
        notes,
        status: 'IN_PROGRESS',
        items: {
          create: items.map((item: any) => {
            const mi = {} as any;
            return {
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice || 0,
              totalPrice: (item.unitPrice || 0) * item.quantity,
              seatNumber: item.seatNumber || null,
              station: item.station || 'KITCHEN',
              notes: item.notes || null,
              status: 'PENDING',
            };
          }),
        },
      },
      include: {
        items: { include: { menuItem: true } },
        table: true,
        creator: { select: { id: true, name: true } },
      },
    });

    // Update table status
    await db.restaurantTable.update({
      where: { id: tableId },
      data: { status: 'ORDER_PLACED' },
    });

    // Deduct inventory
    for (const item of items) {
      const recipeItems = await db.recipeItem.findMany({
        where: { menuItemId: item.menuItemId },
        include: { ingredient: true },
      });
      for (const ri of recipeItems) {
        const deductQty = ri.quantity * item.quantity;
        await db.ingredient.update({
          where: { id: ri.ingredientId },
          data: { currentStock: { decrement: deductQty } },
        });
        await db.stockLedger.create({
          data: {
            ingredientId: ri.ingredientId,
            change: -deductQty,
            reason: 'ORDER',
            referenceId: order.id,
          },
        });
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
