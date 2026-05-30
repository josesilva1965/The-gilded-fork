import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const reservations = await db.reservation.findMany({
      orderBy: [{ reservationDate: 'asc' }, { reservationTime: 'asc' }],
      include: {
        table: true,
        customer: true,
      },
    });
    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const reservation = await db.reservation.create({ data: body });
    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}
