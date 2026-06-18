import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth-util';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request, ['ADMIN', 'MANAGER', 'KITCHEN', 'BAR', 'FOH']);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const purchaseOrders = await db.purchaseOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        vendor: { select: { id: true, name: true, category: true } },
        items: {
          include: {
            ingredient: { select: { id: true, name: true, unit: true } },
          },
        },
      },
    });

    return NextResponse.json({ purchaseOrders });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json({ error: 'Failed to fetch purchase orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request, ['ADMIN', 'MANAGER']);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { vendorId, items, notes } = body;

    if (!vendorId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: vendorId, items' },
        { status: 400 }
      );
    }

    const totalAmount = items.reduce(
      (sum: number, item: { totalPrice: number }) => sum + item.totalPrice,
      0
    );

    const purchaseOrder = await db.purchaseOrder.create({
      data: {
        vendorId,
        status: 'DRAFT',
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        notes: notes || null,
        items: {
          create: items.map(
            (item: { ingredientId: string; quantity: number; unitPrice: number; totalPrice: number; notes?: string }) => ({
              ingredientId: item.ingredientId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              notes: item.notes || null,
            })
          ),
        },
      },
      include: {
        vendor: { select: { id: true, name: true, category: true } },
        items: {
          include: {
            ingredient: { select: { id: true, name: true, unit: true } },
          },
        },
      },
    });

    return NextResponse.json(purchaseOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return NextResponse.json({ error: 'Failed to create purchase order' }, { status: 500 });
  }
}
