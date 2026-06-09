import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const TABLE_INCLUDE = {
  orders: {
    where: {
      status: { not: 'CANCELLED' },
      paymentStatus: { in: ['PENDING', 'PARTIAL'] as unknown as string[] },
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
} as const;

export async function GET() {
  try {
    const tables = await db.restaurantTable.findMany({
      orderBy: { number: 'asc' },
      include: TABLE_INCLUDE,
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
      include: TABLE_INCLUDE,
    });
    return NextResponse.json(table);
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { section = 'MAIN', shape = 'ROUND', capacity = 4 } = body;

    // Find the highest table number to auto-generate a unique next number
    const maxTable = await db.restaurantTable.findFirst({
      orderBy: { number: 'desc' },
    });
    const nextNumber = maxTable ? maxTable.number + 1 : 1;

    const table = await db.restaurantTable.create({
      data: {
        number: nextNumber,
        name: `Table ${nextNumber}`,
        capacity,
        status: 'FREE',
        x: 100,
        y: 100,
        width: shape === 'RECTANGLE' ? 140 : 110,
        height: shape === 'RECTANGLE' ? 70 : 110,
        section,
        shape,
      },
      include: TABLE_INCLUDE,
    });

    return NextResponse.json(table);
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing table ID' }, { status: 400 });
    }

    await db.restaurantTable.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 });
  }
}
