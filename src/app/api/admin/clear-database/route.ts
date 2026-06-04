import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(request: Request) {
  try {
    // Start wiping from the leaves up to avoid FK constraint errors

    // 1. Order-related data
    await db.orderItemExtra.deleteMany();
    await db.orderItem.deleteMany();
    await db.payment.deleteMany();
    await db.order.deleteMany();

    // 2. Customer-related activity
    await db.customerVisit.deleteMany();
    await db.customerFavorite.deleteMany();
    await db.reservation.deleteMany();

    // 3. Customers
    await db.customer.deleteMany();

    // 4. Reset Restaurant Tables
    await db.restaurantTable.updateMany({
      data: {
        status: 'FREE',
        serverId: null,
        customerId: null,
      },
    });

    return NextResponse.json({ success: true, message: 'Database successfully cleared' });
  } catch (error) {
    console.error('Error clearing database:', error);
    return NextResponse.json({ error: 'Failed to clear database' }, { status: 500 });
  }
}
