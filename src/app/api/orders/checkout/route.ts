import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifyOrderUpdate, notifyTableStatusUpdate, notifyStaffCall } from '@/lib/socket-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, tableId, amount, paymentMethod, tipAmount, reference, action, message } = body;

    // 1. Call Staff action
    if (action === 'CALL_STAFF') {
      const table = await db.restaurantTable.findUnique({
        where: { id: tableId },
      });
      const tableLabel = table ? table.name : `Table ${tableId}`;
      const callText = message || 'assistance';
      
      notifyStaffCall(`${tableLabel} requests ${callText}`, 'FOH');
      
      return NextResponse.json({ success: true, message: 'Staff notified' });
    }

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { payments: true, table: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 2. Pay Split action
    if (action === 'PAY_SPLIT') {
      const splitAmount = parseFloat(amount);
      const tip = tipAmount ? parseFloat(tipAmount) : 0;

      // Create new payment record
      const payment = await db.payment.create({
        data: {
          orderId,
          amount: splitAmount,
          method: paymentMethod || 'CARD',
          status: 'COMPLETED',
          reference: reference || 'Guest Split',
          tipAmount: tip,
        },
      });

      // Fetch all completed payments
      const allPayments = await db.payment.findMany({
        where: { orderId, status: 'COMPLETED' },
      });

      const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
      const isFullyPaid = totalPaid >= (order.totalAmount - 0.05);

      const updatedOrder = await db.order.update({
        where: { id: orderId },
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
          payments: true,
        },
      });

      if (isFullyPaid) {
        await db.restaurantTable.update({
          where: { id: order.tableId },
          data: { status: 'FREE', serverId: null, customerId: null },
        });
        notifyTableStatusUpdate(order.tableId, 'FREE', 'Self-Service Checkout');
      } else {
        // Update table to BILL_REQUESTED if they started paying
        await db.restaurantTable.update({
          where: { id: order.tableId },
          data: { status: 'BILL_REQUESTED' },
        });
        notifyTableStatusUpdate(order.tableId, 'BILL_REQUESTED', 'Self-Service Checkout');
      }

      notifyOrderUpdate();

      return NextResponse.json(updatedOrder);
    }

    // 3. Full Pay action
    if (action === 'PAY') {
      const tip = tipAmount ? parseFloat(tipAmount) : 0;

      await db.payment.create({
        data: {
          orderId,
          amount: order.totalAmount,
          method: paymentMethod || 'CARD',
          status: 'COMPLETED',
          reference: reference || 'Guest Self-Checkout',
          tipAmount: tip,
        },
      });

      const updatedOrder = await db.order.update({
        where: { id: orderId },
        data: {
          status: 'SERVED',
          paymentStatus: 'COMPLETED',
          paymentMethod: paymentMethod || 'CARD',
          closedAt: new Date(),
        },
        include: {
          items: { include: { menuItem: true } },
          table: true,
          payments: true,
        },
      });

      await db.restaurantTable.update({
        where: { id: order.tableId },
        data: { status: 'FREE', serverId: null, customerId: null },
      });

      notifyTableStatusUpdate(order.tableId, 'FREE', 'Self-Service Checkout');
      notifyOrderUpdate();

      return NextResponse.json(updatedOrder);
    }

    return NextResponse.json({ error: 'Invalid checkout action' }, { status: 400 });
  } catch (error) {
    console.error('[API Checkout Error]:', error);
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 });
  }
}
