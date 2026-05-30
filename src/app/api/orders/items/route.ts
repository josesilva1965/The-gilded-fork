import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, itemId, status } = body;

    if (itemId && status) {
      const updateData: any = { status };
      if (status === 'FIRED') updateData.firedAt = new Date();
      if (status === 'READY') updateData.readyAt = new Date();
      if (status === 'SERVED') updateData.servedAt = new Date();

      const item = await db.orderItem.update({
        where: { id: itemId },
        data: updateData,
        include: { menuItem: true, order: true },
      });

      if (status === 'SERVED') {
        const orderItems = await db.orderItem.findMany({
          where: { orderId: item.orderId },
        });
        const allServed = orderItems.every(oi => oi.status === 'SERVED' || oi.status === 'CANCELLED');
        if (allServed) {
          await db.order.update({
            where: { id: item.orderId },
            data: { status: 'SERVED' },
          });
        }
      }

      return NextResponse.json(item);
    }

    if (orderId && status) {
      const order = await db.order.update({
        where: { id: orderId },
        data: { status, ...(status === 'SERVED' && { closedAt: new Date() }) },
        include: { items: { include: { menuItem: true } }, table: true },
      });
      return NextResponse.json(order);
    }

    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  } catch (error) {
    console.error('Error updating order item:', error);
    return NextResponse.json({ error: 'Failed to update order item' }, { status: 500 });
  }
}
