import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LOCALE_CONFIGS, type Locale } from '@/lib/i18n/locales';
import { getAuthenticatedUser } from '@/lib/auth-util';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request, ['ADMIN', 'MANAGER', 'KITCHEN', 'BAR', 'FOH']);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await db.order.findMany({
      where: { 
        status: { not: 'CANCELLED' },
        paymentStatus: { in: ['PENDING', 'PARTIAL'] }
      },
      include: {
        items: { include: { menuItem: true, extras: true }, orderBy: { createdAt: 'asc' } },
        table: true,
        creator: { select: { id: true, name: true, role: true } },
        customer: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

async function getOrCreateQuickBarTable() {
  let table = await db.restaurantTable.findFirst({
    where: { OR: [{ number: 99 }, { name: 'Quick Bar' }] }
  });
  if (!table) {
    table = await db.restaurantTable.create({
      data: {
        number: 99,
        name: 'Quick Bar',
        capacity: 1,
        status: 'FREE',
        section: 'BAR',
        shape: 'ROUND',
        x: 0,
        y: 0,
        width: 1,
        height: 1
      }
    });
  }
  return table;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { tableId, createdBy, items, type, guestCount, notes, customerId, locale } = body;

    // Verify staff credentials if a specific staff user ID is provided in createdBy
    if (createdBy && createdBy !== 'self-service') {
      const authUser = await getAuthenticatedUser(request, ['ADMIN', 'MANAGER', 'KITCHEN', 'BAR', 'FOH']);
      if (!authUser || authUser.id !== createdBy) {
        return NextResponse.json({ error: 'Unauthorized staff operation' }, { status: 401 });
      }
    }

    console.log('[POST /api/orders] body:', JSON.stringify({ tableId, createdBy, itemCount: items?.length, type, guestCount, customerId, locale }));

    // Auto-resolve quick bar table
    if (tableId === 'quick-bar' || !tableId) {
      const quickBarTable = await getOrCreateQuickBarTable();
      tableId = quickBarTable.id;
    }

    let creatorId = createdBy;
    if (!creatorId || creatorId === 'self-service') {
      let selfServiceUser = await db.user.findFirst({
        where: { email: 'self-service@thebar.com' }
      });
      if (!selfServiceUser) {
        selfServiceUser = await db.user.create({
          data: {
            email: 'self-service@thebar.com',
            name: 'Table Self-Service',
            role: 'FOH',
            pin: '0000',
            active: true,
          }
        });
      }
      creatorId = selfServiceUser.id;
    }

    // Early validation for required fields
    if (!tableId || !creatorId || !items || !Array.isArray(items) || items.length === 0) {
      console.error('[POST /api/orders] Missing required fields:', { tableId, creatorId, itemsLength: items?.length });
      return NextResponse.json({ error: 'Missing required fields: tableId, createdBy, and items are required' }, { status: 400 });
    }

    // Validate required foreign keys exist
    const tableExists = await db.restaurantTable.findUnique({ where: { id: tableId } });
    if (!tableExists) {
      console.error('[POST /api/orders] Table not found:', tableId);
      return NextResponse.json({ error: `Table ${tableId} not found` }, { status: 400 });
    }
    const userExists = await db.user.findUnique({ where: { id: creatorId } });
    if (!userExists) {
      console.error('[POST /api/orders] User not found:', creatorId);
      return NextResponse.json({ error: `User ${creatorId} not found` }, { status: 400 });
    }

    // Resolve customerId: must be null or a valid Customer.id
    let resolvedCustomerId: string | null = null;
    if (customerId && customerId !== 'none') {
      const customerExists = await db.customer.findUnique({ where: { id: customerId } });
      if (customerExists) {
        resolvedCustomerId = customerId;
      }
    }

    const menuItemIds = items.map((i: any) => i.menuItemId);
    const menuItems = await db.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });
    const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

    let subtotal = 0;
    for (const item of items) {
      const menuItem = menuItemMap.get(item.menuItemId);
      if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);
      const itemExtrasCost = item.extras?.reduce((sum: number, ext: any) => sum + ext.price, 0) || 0;
      subtotal += (menuItem.price + itemExtrasCost) * item.quantity;
    }

    const taxRate = locale && LOCALE_CONFIGS[locale as Locale]
      ? LOCALE_CONFIGS[locale as Locale].taxRate
      : 0.20; // Default to 20%
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

    const order = await db.order.create({
      data: {
        tableId,
        createdBy: creatorId,
        type: type || 'DINE_IN',
        guestCount: guestCount || 1,
        subtotal,
        taxAmount,
        totalAmount,
        notes,
        status: 'IN_PROGRESS',
        customerId: resolvedCustomerId,
        items: {
          create: items.map((item: any) => {
            const validExtras = (item.extras || []).filter((ext: any) => ext.id && ext.name && typeof ext.price === 'number');
            const itemExtrasCost = validExtras.reduce((sum: number, ext: any) => sum + ext.price, 0);
            return {
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice || 0,
              totalPrice: ((item.unitPrice || 0) + itemExtrasCost) * item.quantity,
              seatNumber: item.seatNumber || null,
              station: item.station || 'KITCHEN',
              notes: item.notes || null,
              status: 'PENDING',
              extras: validExtras.length > 0 ? {
                create: validExtras.map((ext: any) => ({
                  menuItemExtraId: ext.id || null,
                  name: ext.name,
                  price: ext.price
                }))
              } : undefined
            };
          }),
        },
      },
      include: {
        items: { include: { menuItem: true, extras: true } },
        table: true,
        creator: { select: { id: true, name: true } },
        customer: true,
      },
    });

    // Update table status
    await db.restaurantTable.update({
      where: { id: tableId },
      data: { 
        status: 'ORDER_PLACED',
        customerId: resolvedCustomerId,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request, ['ADMIN', 'MANAGER', 'KITCHEN', 'BAR', 'FOH']);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    let { id, tableId, items, type, guestCount, notes, action, paymentMethod, customerId, locale } = body;

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Auto-resolve quick bar table
    if (tableId === 'quick-bar' || (tableId === undefined && action !== 'PAY' && action !== 'PAY_SPLIT')) {
      const quickBarTable = await getOrCreateQuickBarTable();
      tableId = quickBarTable.id;
    }

    if (action === 'PAY_SPLIT') {
      const order = await db.order.findUnique({
        where: { id },
        include: { payments: true },
      });
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const splitAmount = parseFloat(body.amount);
      const splitReference = body.reference; // e.g. "Seat 1", "Guest 2"
      const tipAmount = body.tipAmount ? parseFloat(body.tipAmount) : 0;
      
      // Create new payment record
      await db.payment.create({
        data: {
          orderId: id,
          amount: splitAmount,
          method: paymentMethod || 'CASH',
          status: 'COMPLETED',
          reference: splitReference,
          tipAmount: tipAmount,
        },
      });

      // Fetch all completed payments to compute total paid so far
      const allPayments = await db.payment.findMany({
        where: { orderId: id, status: 'COMPLETED' },
      });
      
      const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

      // Check if order is fully paid (rounding threshold of 0.05)
      const isFullyPaid = totalPaid >= (order.totalAmount - 0.05);

      const updatedOrder = await db.order.update({
        where: { id },
        data: {
          ...(isFullyPaid && { 
            status: 'SERVED',
            closedAt: new Date(),
          }),
          paymentStatus: isFullyPaid ? 'COMPLETED' : 'PARTIAL',
          paymentMethod: isFullyPaid ? 'SPLIT' : order.paymentMethod,
        },
        include: {
          items: { include: { menuItem: true } },
          table: true,
          creator: { select: { id: true, name: true } },
          customer: true,
          payments: true,
        },
      });

      if (isFullyPaid) {
        // Update table to FREE
        await db.restaurantTable.update({
          where: { id: updatedOrder.tableId },
          data: { status: 'FREE', serverId: null, customerId: null },
        });
      }

      return NextResponse.json(updatedOrder);
    }

    if (action === 'PAY') {
      const order = await db.order.findUnique({
        where: { id },
      });
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const updatedOrder = await db.order.update({
        where: { id },
        data: {
          status: 'SERVED',
          paymentStatus: 'COMPLETED',
          paymentMethod: paymentMethod || 'CASH',
          closedAt: new Date(),
        },
        include: {
          items: { include: { menuItem: true } },
          table: true,
          creator: { select: { id: true, name: true } },
          customer: true,
        },
      });

      // Update table to FREE
      await db.restaurantTable.update({
        where: { id: updatedOrder.tableId },
        data: { status: 'FREE', serverId: null, customerId: null },
      });

      return NextResponse.json(updatedOrder);
    }

    // Resolve customerId safely
    let resolvedCustomerId: string | null = null;
    if (customerId && customerId !== 'none') {
      const customerExists = await db.customer.findUnique({ where: { id: customerId } });
      if (customerExists) {
        resolvedCustomerId = customerId;
      }
    }

    // Calculate new subtotal
    const menuItemIds = items.map((i: any) => i.menuItemId);
    const menuItems = await db.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });
    const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

    let subtotal = 0;
    for (const item of items) {
      const menuItem = menuItemMap.get(item.menuItemId);
      if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);
      const itemExtrasCost = item.extras?.reduce((sum: number, ext: any) => sum + ext.price, 0) || 0;
      subtotal += (menuItem.price + itemExtrasCost) * item.quantity;
    }

    const taxRate = locale && LOCALE_CONFIGS[locale as Locale]
      ? LOCALE_CONFIGS[locale as Locale].taxRate
      : 0.20; // Default to 20%
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

    // Get current order items in DB to find which ones to delete
    const existingOrderItems = await db.orderItem.findMany({
      where: { orderId: id },
    });

    const incomingIds = items.map((i: any) => i.id).filter(Boolean);
    const idsToDelete = existingOrderItems
      .map((oi) => oi.id)
      .filter((dbId) => !incomingIds.includes(dbId));

    const operations: any[] = [];

    // Delete removed items
    if (idsToDelete.length > 0) {
      operations.push(
        db.orderItem.deleteMany({
          where: { id: { in: idsToDelete } },
        })
      );
    }

    // Upsert remaining / new items
    for (const item of items) {
      const validExtras = (item.extras || []).filter((ext: any) => ext.id && ext.name && typeof ext.price === 'number');
      const itemExtrasCost = validExtras.reduce((sum: number, ext: any) => sum + ext.price, 0);
      if (item.id) {
        // Update existing item
        operations.push(
          db.orderItem.update({
            where: { id: item.id },
            data: {
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: (item.unitPrice + itemExtrasCost) * item.quantity,
              seatNumber: item.seatNumber || null,
              station: item.station || 'KITCHEN',
              notes: item.notes || null,
              extras: {
                deleteMany: {},
                create: validExtras.map((ext: any) => ({
                  menuItemExtraId: ext.id || null,
                  name: ext.name,
                  price: ext.price
                }))
              }
            },
          })
        );
      } else {
        // Create new item
        operations.push(
          db.orderItem.create({
            data: {
              orderId: id,
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: (item.unitPrice + itemExtrasCost) * item.quantity,
              seatNumber: item.seatNumber || null,
              station: item.station || 'KITCHEN',
              notes: item.notes || null,
              status: 'PENDING',
              extras: validExtras.length > 0 ? {
                create: validExtras.map((ext: any) => ({
                  menuItemExtraId: ext.id || null,
                  name: ext.name,
                  price: ext.price
                }))
              } : undefined
            },
          })
        );
      }
    }

    // Run all write operations in a single database transaction
    const txResults = await db.$transaction([
      ...operations,
      db.order.update({
        where: { id },
        data: {
          tableId,
          type: type || 'DINE_IN',
          guestCount: guestCount || 1,
          subtotal,
          taxAmount,
          totalAmount,
          notes,
          customerId: resolvedCustomerId,
        },
        include: {
          items: { include: { menuItem: true, extras: true } },
          table: true,
          creator: { select: { id: true, name: true } },
          customer: true,
        },
      }),
      db.restaurantTable.update({
        where: { id: tableId },
        data: { 
          status: 'ORDER_PLACED',
          customerId: resolvedCustomerId,
        },
      }),
    ]);

    // The updatedOrder is the second-to-last transaction result (order update)
    const updatedOrder = txResults[txResults.length - 2];

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request, ['ADMIN', 'MANAGER']);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Delete all order items to satisfy foreign keys
    await db.orderItem.deleteMany();
    // Delete all orders
    await db.order.deleteMany();
    // Reset all tables to FREE
    await db.restaurantTable.updateMany({
      data: {
        status: 'FREE',
        serverId: null,
        customerId: null,
      },
    });

    return NextResponse.json({ success: true, message: 'All shift orders successfully cleared' });
  } catch (error) {
    console.error('Error clearing orders:', error);
    return NextResponse.json({ error: 'Failed to clear orders' }, { status: 500 });
  }
}

