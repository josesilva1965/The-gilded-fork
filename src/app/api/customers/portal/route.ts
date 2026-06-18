import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, phone, firstName, lastName, allergies, birthday, customerId, menuItemId } = body;

    // 1. LOGIN
    if (action === 'LOGIN') {
      if (!email && !phone) {
        return NextResponse.json({ error: 'Email or phone number is required' }, { status: 400 });
      }

      const customer = await db.customer.findFirst({
        where: {
          OR: [
            ...(email ? [{ email }] : []),
            ...(phone ? [{ phone }] : []),
          ],
        },
        include: {
          favorites: { select: { menuItemId: true } },
          visits: { orderBy: { visitDate: 'desc' }, take: 10 },
          orders: { orderBy: { createdAt: 'desc' }, take: 5, include: { items: { include: { menuItem: true } } } },
        },
      });

      if (!customer) {
        return NextResponse.json({ error: 'NOT_FOUND' });
      }

      return NextResponse.json(customer);
    }

    // 2. REGISTER
    if (action === 'REGISTER') {
      if (!firstName || !lastName || (!email && !phone)) {
        return NextResponse.json({ error: 'First name, last name, and contact details are required' }, { status: 400 });
      }

      // Check if email or phone is already taken
      const existing = await db.customer.findFirst({
        where: {
          OR: [
            ...(email ? [{ email }] : []),
            ...(phone ? [{ phone }] : []),
          ],
        },
      });

      if (existing) {
        return NextResponse.json({ error: 'A customer profile with this contact detail already exists' }, { status: 400 });
      }

      const newCustomer = await db.customer.create({
        data: {
          firstName,
          lastName,
          email: email || null,
          phone: phone || null,
          allergies: allergies || null,
          birthday: birthday ? new Date(birthday) : null,
          loyaltyPoints: 150, // 150 welcome points!
          loyaltyTier: 'BRONZE',
        },
        include: {
          favorites: true,
          visits: true,
          orders: true,
        },
      });

      return NextResponse.json(newCustomer);
    }

    // 3. TOGGLE FAVORITE
    if (action === 'FAVORITE') {
      if (!customerId || !menuItemId) {
        return NextResponse.json({ error: 'Customer ID and MenuItem ID are required' }, { status: 400 });
      }

      const existingFav = await db.customerFavorite.findFirst({
        where: { customerId, menuItemId },
      });

      if (existingFav) {
        // Delete favorite
        await db.customerFavorite.delete({
          where: { id: existingFav.id },
        });
      } else {
        // Create favorite
        await db.customerFavorite.create({
          data: { customerId, menuItemId },
        });
      }

      const updatedFavorites = await db.customerFavorite.findMany({
        where: { customerId },
        select: { menuItemId: true },
      });

      return NextResponse.json({ favorites: updatedFavorites.map(f => f.menuItemId) });
    }

    // 4. UPDATE PROFILE (allergies, name)
    if (action === 'UPDATE') {
      const { id, allergies, firstName, lastName } = body;
      if (!id) {
        return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
      }

      const updated = await db.customer.update({
        where: { id },
        data: {
          ...(allergies !== undefined && { allergies: allergies || null }),
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
        },
        include: {
          favorites: { select: { menuItemId: true } },
          visits: { orderBy: { visitDate: 'desc' }, take: 10 },
          orders: { orderBy: { createdAt: 'desc' }, take: 5, include: { items: { include: { menuItem: true } } } },
        },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Invalid portal action' }, { status: 400 });
  } catch (error) {
    console.error('[API Customer Portal Error]:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
