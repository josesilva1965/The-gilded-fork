import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth-util';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser(request, ['ADMIN', 'MANAGER', 'FOH']);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, tableId, seatedAt, completedAt, waitListPosition, estimatedWait, notifiedAt } = body;

    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (tableId !== undefined) data.tableId = tableId;
    if (seatedAt !== undefined) data.seatedAt = seatedAt;
    if (completedAt !== undefined) data.completedAt = completedAt;
    if (waitListPosition !== undefined) data.waitListPosition = waitListPosition;
    if (estimatedWait !== undefined) data.estimatedWait = estimatedWait;
    if (notifiedAt !== undefined) data.notifiedAt = notifiedAt;

    // If seating a guest, also update the table status
    if (status === 'SEATED' && tableId) {
      data.seatedAt = new Date();
      await db.restaurantTable.update({
        where: { id: tableId },
        data: { status: 'RESERVED' },
      });
    }

    if (status === 'COMPLETED') {
      data.completedAt = new Date();
    }

    if (status === 'CANCELLED' || status === 'NO_SHOW') {
      // Free up the table if one was assigned
      const existing = await db.reservation.findUnique({ where: { id } });
      if (existing?.tableId) {
        await db.restaurantTable.update({
          where: { id: existing.tableId },
          data: { status: 'FREE' },
        });
      }
    }

    const reservation = await db.reservation.update({
      where: { id },
      data,
      include: {
        table: true,
        customer: true,
      },
    });

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.reservation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json({ error: 'Failed to delete reservation' }, { status: 500 });
  }
}
