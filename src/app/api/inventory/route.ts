import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const ingredients = await db.ingredient.findMany({
      orderBy: { name: 'asc' },
      include: { vendor: true },
    });
    const lowStock = ingredients.filter(i => i.currentStock <= i.minStock);
    const totalValue = ingredients.reduce((sum, i) => sum + i.currentStock * i.costPerUnit, 0);
    return NextResponse.json({ ingredients, lowStock, totalValue });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, currentStock, reason } = body;
    const oldIngredient = await db.ingredient.findUnique({ where: { id } });
    if (!oldIngredient) throw new Error('Ingredient not found');
    const change = currentStock - oldIngredient.currentStock;
    const ingredient = await db.ingredient.update({
      where: { id },
      data: { currentStock },
    });
    await db.stockLedger.create({
      data: {
        ingredientId: id,
        change,
        reason: reason || 'ADJUSTMENT',
      },
    });
    return NextResponse.json(ingredient);
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return NextResponse.json({ error: 'Failed to update ingredient' }, { status: 500 });
  }
}
