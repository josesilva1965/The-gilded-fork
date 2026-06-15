import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { safeDbCall } from '@/lib/db-fallback';
import { MOCK_USERS } from '@/lib/mock-data';

export async function GET() {
  const users = await safeDbCall(
    () => db.user.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      include: {
        clockLogs: { orderBy: { timestamp: 'desc' }, take: 5 },
        shifts: { include: { shiftTemplate: true }, orderBy: { date: 'asc' } },
      },
    }),
    MOCK_USERS
  );
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, email, role, pin, hourlyRate, phone } = data;

    if (!name || !email || !role || !pin) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const existingRoleUser = await db.user.findFirst({
      where: { role },
      select: { tipPointValue: true },
    });
    const defaultTipPointValue = existingRoleUser ? existingRoleUser.tipPointValue : (role === 'ADMIN' ? 0 : role === 'MANAGER' ? 1.5 : role === 'BAR' ? 1.2 : 1.0);

    const user = await db.user.create({
      data: {
        name,
        email,
        role,
        pin,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : 0,
        tipPointValue: defaultTipPointValue,
        phone,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id, name, email, role, pin, hourlyRate, phone, active } = data;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (email) {
      const existingUser = await db.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== id) {
        return NextResponse.json({ error: 'Email already in use by another user' }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) {
      updateData.role = role;
      const existingRoleUser = await db.user.findFirst({
        where: { role },
        select: { tipPointValue: true },
      });
      updateData.tipPointValue = existingRoleUser ? existingRoleUser.tipPointValue : (role === 'ADMIN' ? 0 : role === 'MANAGER' ? 1.5 : role === 'BAR' ? 1.2 : 1.0);
    }
    if (pin !== undefined) updateData.pin = pin;
    if (hourlyRate !== undefined) updateData.hourlyRate = parseFloat(hourlyRate) || 0;
    if (phone !== undefined) updateData.phone = phone;
    if (active !== undefined) updateData.active = active;

    const user = await db.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}
