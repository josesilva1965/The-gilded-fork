import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const tables = await db.restaurantTable.findMany({
      orderBy: { number: 'asc' },
      include: {
        orders: {
          where: {
            status: { not: 'CANCELLED' },
            paymentStatus: { in: ['PENDING', 'PARTIAL'] },
          },
          include: { items: { include: { menuItem: true } }, creator: true, customer: true },
          orderBy: { createdAt: 'desc' },
        },
        reservations: {
          where: { status: 'CONFIRMED' },
          orderBy: { reservationDate: 'asc' },
          take: 1,
        },
        server: {
          select: { id: true, name: true, role: true },
        },
        customer: true,
      },
    });
    return NextResponse.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, x, y, width, height, capacity, serverId, section, shape, name, customerId } = body;

    const table = await db.restaurantTable.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(x !== undefined && { x }),
        ...(y !== undefined && { y }),
        ...(width !== undefined && { width }),
        ...(height !== undefined && { height }),
        ...(capacity !== undefined && { capacity }),
        ...(serverId !== undefined && { serverId: serverId || null }),
        ...(section !== undefined && { section }),
        ...(shape !== undefined && { shape }),
        ...(name !== undefined && { name }),
        ...(customerId !== undefined && { customerId: customerId || null }),
      },
      include: {
        server: {
          select: { id: true, name: true, role: true },
        },
        customer: true,
      },
    });
    return NextResponse.json(table);
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 });
  }
}
