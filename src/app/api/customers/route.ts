import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const customers = await db.customer.findMany({
      orderBy: { lifetimeSpend: 'desc' },
      include: {
        favorites: { include: { menuItem: true } },
        visits: { orderBy: { visitDate: 'desc' }, take: 5 },
      },
    });
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customer = await db.customer.create({ data: body });
    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, loyaltyPoints, ...otherFields } = body;

    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    // If loyaltyPoints is provided, add to existing points (increment)
    if (loyaltyPoints && loyaltyPoints > 0) {
      const customer = await db.customer.update({
        where: { id },
        data: {
          loyaltyPoints: { increment: loyaltyPoints },
        },
        include: {
          favorites: { include: { menuItem: true } },
          visits: { orderBy: { visitDate: 'desc' }, take: 5 },
        },
      });

      // Auto-upgrade tier if points cross threshold
      const newPoints = customer.loyaltyPoints;
      let newTier = customer.loyaltyTier;
      if (newPoints >= 5000) newTier = 'PLATINUM';
      else if (newPoints >= 2500) newTier = 'GOLD';
      else if (newPoints >= 1000) newTier = 'SILVER';
      else newTier = 'BRONZE';

      if (newTier !== customer.loyaltyTier) {
        await db.customer.update({
          where: { id },
          data: { loyaltyTier: newTier },
        });
        customer.loyaltyTier = newTier;
      }

      return NextResponse.json(customer);
    }

    // General update
    const customer = await db.customer.update({
      where: { id },
      data: otherFields,
      include: {
        favorites: { include: { menuItem: true } },
        visits: { orderBy: { visitDate: 'desc' }, take: 5 },
      },
    });
    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}
