import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const templates = await db.shiftTemplate.findMany({
      orderBy: { startTime: 'asc' },
    });
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching shift templates:', error);
    return NextResponse.json({ error: 'Failed to fetch shift templates' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, shiftTemplateId, date, startTime, endTime, position, notes } = body;

    if (!userId || !shiftTemplateId || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const assignment = await db.shiftAssignment.create({
      data: {
        userId,
        shiftTemplateId,
        date: new Date(date),
        startTime: startTime || null,
        endTime: endTime || null,
        position: position || null,
        notes: notes || null,
      },
      include: {
        shiftTemplate: true,
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('Error creating shift assignment:', error);
    return NextResponse.json({ error: 'Failed to create shift assignment' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, shiftTemplateId, date, startTime, endTime, position, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing shift assignment ID' }, { status: 400 });
    }

    const updateData: any = {};
    if (shiftTemplateId) updateData.shiftTemplateId = shiftTemplateId;
    if (date) updateData.date = new Date(date);
    updateData.startTime = startTime || null;
    updateData.endTime = endTime || null;
    updateData.position = position || null;
    updateData.notes = notes || null;

    const assignment = await db.shiftAssignment.update({
      where: { id },
      data: updateData,
      include: {
        shiftTemplate: true,
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error updating shift assignment:', error);
    return NextResponse.json({ error: 'Failed to update shift assignment' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing shift assignment ID' }, { status: 400 });
    }

    await db.shiftAssignment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shift assignment:', error);
    return NextResponse.json({ error: 'Failed to delete shift assignment' }, { status: 500 });
  }
}
