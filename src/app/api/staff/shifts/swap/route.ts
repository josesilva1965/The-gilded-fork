import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth-util';
import { io } from 'socket.io-client';

export async function POST(req: Request) {
  try {
    const authUser = await getAuthenticatedUser(req, ['ADMIN', 'MANAGER']);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { assignmentId1, assignmentId2 } = body;

    if (!assignmentId1 || !assignmentId2) {
      return NextResponse.json({ error: 'Both shift assignment IDs are required' }, { status: 400 });
    }

    const shift1 = await db.shiftAssignment.findUnique({ where: { id: assignmentId1 } });
    const shift2 = await db.shiftAssignment.findUnique({ where: { id: assignmentId2 } });

    if (!shift1 || !shift2) {
      return NextResponse.json({ error: 'One or both shift assignments were not found' }, { status: 404 });
    }

    // Swap user IDs in a transaction
    const [updated1, updated2] = await db.$transaction([
      db.shiftAssignment.update({
        where: { id: assignmentId1 },
        data: { userId: shift2.userId },
        include: { shiftTemplate: true, user: { select: { id: true, name: true, role: true } } },
      }),
      db.shiftAssignment.update({
        where: { id: assignmentId2 },
        data: { userId: shift1.userId },
        include: { shiftTemplate: true, user: { select: { id: true, name: true, role: true } } },
      }),
    ]);

    // Emit socket notification to update rota for staff active sessions
    try {
      const socket = io('http://localhost:3003', {
        transports: ['websocket'],
        autoConnect: true,
      });
      socket.on('connect', () => {
        socket.emit('staff:clock-update');
        setTimeout(() => socket.disconnect(), 100);
      });
    } catch (e) {
      console.warn('Failed to emit rota swap socket update');
    }

    return NextResponse.json({ success: true, shift1: updated1, shift2: updated2 });
  } catch (error) {
    console.error('Error swapping shifts:', error);
    return NextResponse.json({ error: 'Failed to swap shift assignments' }, { status: 500 });
  }
}
