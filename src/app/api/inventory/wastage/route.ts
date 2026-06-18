import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifyStockChange } from '@/lib/socket-server';
import { getAuthenticatedUser } from '@/lib/auth-util';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request, ['ADMIN', 'MANAGER', 'KITCHEN', 'BAR', 'FOH']);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wastageLogs = await db.wastageLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        ingredient: { select: { id: true, name: true, unit: true, costPerUnit: true } },
        menuItem: { select: { id: true, name: true } },
        reporter: { select: { id: true, name: true } },
      },
      take: 100,
    });

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
    const authUser = await getAuthenticatedUser(request, ['ADMIN', 'MANAGER', 'KITCHEN', 'BAR']);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ingredientId, quantity, reason, notes, reportedBy } = body;

    if (!ingredientId || !quantity || !reason || !reportedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: ingredientId, quantity, reason, reportedBy' },
        { status: 400 }
      );
    }

    const ingredient = await db.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!ingredient) {
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
    }

    const value = parseFloat((quantity * ingredient.costPerUnit).toFixed(2));

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

    const newStock = Math.max(0, ingredient.currentStock - parseFloat(quantity));
    const updatedIngredient = await db.ingredient.update({
      where: { id: ingredientId },
      data: { currentStock: newStock },
    });

    await db.stockLedger.create({
      data: {
        ingredientId,
        change: -parseFloat(quantity),
        reason: 'WASTAGE',
        referenceId: wastageLog.id,
        notes: `Wastage: ${reason}${notes ? ` - ${notes}` : ''}`,
      },
    });

    notifyStockChange({
      name: updatedIngredient.name,
      currentStock: updatedIngredient.currentStock,
      minStock: updatedIngredient.minStock,
      unit: updatedIngredient.unit,
    });

    return NextResponse.json(wastageLog, { status: 201 });
  } catch (error) {
    console.error('Error creating wastage log:', error);
    return NextResponse.json({ error: 'Failed to create wastage log' }, { status: 500 });
  }
}
