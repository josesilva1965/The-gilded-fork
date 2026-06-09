import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifyStockChange } from '@/lib/socket-server';

export async function GET() {
  try {
    const ingredients = await db.ingredient.findMany({
      orderBy: { name: 'asc' },
      include: { vendor: true },
    });
    const lowStock = ingredients.filter(i => i.currentStock <= i.minStock);
    const totalValue = ingredients.reduce((sum, i) => sum + i.currentStock * i.costPerUnit, 0);
    const vendors = await db.vendor.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ ingredients, lowStock, totalValue, vendors });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, unit, currentStock, minStock, maxStock, costPerUnit, storageLocation, category, vendorId } = body;
    if (!name || !unit) {
      return NextResponse.json({ error: 'Name and unit are required' }, { status: 400 });
    }
    const ingredient = await db.ingredient.create({
      data: {
        name,
        unit,
        currentStock: currentStock !== undefined ? parseFloat(currentStock) : 0,
        minStock: minStock !== undefined ? parseFloat(minStock) : 0,
        maxStock: maxStock !== undefined ? parseFloat(maxStock) : 0,
        costPerUnit: costPerUnit !== undefined ? parseFloat(costPerUnit) : 0,
        storageLocation: storageLocation || null,
        category: category || null,
        vendorId: vendorId && vendorId !== 'none' ? vendorId : null,
      },
    });
    if (ingredient.currentStock > 0) {
      await db.stockLedger.create({
        data: {
          ingredientId: ingredient.id,
          change: ingredient.currentStock,
          reason: 'RESTOCK',
          notes: 'Initial stock intake',
        },
      });
    }
    notifyStockChange({
      name: ingredient.name,
      currentStock: ingredient.currentStock,
      minStock: ingredient.minStock,
      unit: ingredient.unit,
    });
    return NextResponse.json(ingredient);
  } catch (error) {
    console.error('Error creating ingredient:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, currentStock, minStock, maxStock, costPerUnit, name, unit, storageLocation, category, vendorId, reason } = body;
    const oldIngredient = await db.ingredient.findUnique({ where: { id } });
    if (!oldIngredient) {
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
    }

    const updatedData: any = {};
    if (name !== undefined) updatedData.name = name;
    if (unit !== undefined) updatedData.unit = unit;
    if (minStock !== undefined) updatedData.minStock = parseFloat(minStock);
    if (maxStock !== undefined) updatedData.maxStock = parseFloat(maxStock);
    if (costPerUnit !== undefined) updatedData.costPerUnit = parseFloat(costPerUnit);
    if (storageLocation !== undefined) updatedData.storageLocation = storageLocation || null;
    if (category !== undefined) updatedData.category = category || null;
    if (vendorId !== undefined) updatedData.vendorId = vendorId && vendorId !== 'none' ? vendorId : null;

    let change = 0;
    if (currentStock !== undefined) {
      const parsedStock = parseFloat(currentStock);
      updatedData.currentStock = parsedStock;
      change = parsedStock - oldIngredient.currentStock;
    }

    const ingredient = await db.ingredient.update({
      where: { id },
      data: updatedData,
    });

    if (currentStock !== undefined && change !== 0) {
      await db.stockLedger.create({
        data: {
          ingredientId: id,
          change,
          reason: reason || 'ADJUSTMENT',
        },
      });
    }
    notifyStockChange({
      name: ingredient.name,
      currentStock: ingredient.currentStock,
      minStock: ingredient.minStock,
      unit: ingredient.unit,
    });
    return NextResponse.json(ingredient);
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return NextResponse.json({ error: 'Failed to update ingredient' }, { status: 500 });
  }
}
