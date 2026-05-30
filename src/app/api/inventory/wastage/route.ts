import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const wastageLogs = await db.wastageLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        ingredient: { select: { id: true, name: true, unit: true, costPerUnit: true } },
        menuItem: { select: { id: true, name: true } },
        reporter: { select: { id: true, name: true } },
      },
      take: 100,
    });

    // Calculate this week's wastage value
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weekWastage = await db.wastageLog.aggregate({
      _sum: { value: true },
      where: { createdAt: { gte: oneWeekAgo } },
    });

    return NextResponse.json({
      wastageLogs,
      weekWastageValue: weekWastage._sum.value || 0,
    });
  } catch (error) {
    console.error('Error fetching wastage logs:', error);
    return NextResponse.json({ error: 'Failed to fetch wastage logs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ingredientId, quantity, reason, notes, reportedBy } = body;

    if (!ingredientId || !quantity || !reason || !reportedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: ingredientId, quantity, reason, reportedBy' },
        { status: 400 }
      );
    }

    // Get ingredient for cost calculation
    const ingredient = await db.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!ingredient) {
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
    }

    const value = parseFloat((quantity * ingredient.costPerUnit).toFixed(2));

    // Create wastage log
    const wastageLog = await db.wastageLog.create({
      data: {
        ingredientId,
        quantity: parseFloat(quantity),
        reason,
        notes: notes || null,
        reportedBy,
        value,
      },
      include: {
        ingredient: { select: { id: true, name: true, unit: true, costPerUnit: true } },
        reporter: { select: { id: true, name: true } },
      },
    });

    // Deduct from ingredient stock
    const newStock = Math.max(0, ingredient.currentStock - parseFloat(quantity));
    await db.ingredient.update({
      where: { id: ingredientId },
      data: { currentStock: newStock },
    });

    // Create stock ledger entry
    await db.stockLedger.create({
      data: {
        ingredientId,
        change: -parseFloat(quantity),
        reason: 'WASTAGE',
        referenceId: wastageLog.id,
        notes: `Wastage: ${reason}${notes ? ` - ${notes}` : ''}`,
      },
    });

    return NextResponse.json(wastageLog, { status: 201 });
  } catch (error) {
    console.error('Error creating wastage log:', error);
    return NextResponse.json({ error: 'Failed to create wastage log' }, { status: 500 });
  }
}
