import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth-util';

const DEFAULT_MULTIPLIERS = {
  ADMIN: 0,
  MANAGER: 1.5,
  KITCHEN: 1.0,
  BAR: 1.2,
  FOH: 1.0,
};

export async function GET(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request, ['ADMIN', 'MANAGER']);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await db.user.findMany({
      select: { role: true, tipPointValue: true },
    });

    const multipliers = { ...DEFAULT_MULTIPLIERS };
    const roles = ['ADMIN', 'MANAGER', 'KITCHEN', 'BAR', 'FOH'] as const;

    for (const r of roles) {
      const userWithRole = users.find((u) => u.role === r);
      if (userWithRole) {
        multipliers[r] = userWithRole.tipPointValue;
      }
    }

    return NextResponse.json(multipliers);
  } catch (error) {
    console.error('Error fetching multipliers:', error);
    return NextResponse.json({ error: 'Failed to fetch multipliers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request, ['ADMIN']);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ADMIN, MANAGER, KITCHEN, BAR, FOH } = body;

    const updates: Promise<any>[] = [];
    if (typeof ADMIN === 'number') {
      updates.push(db.user.updateMany({ where: { role: 'ADMIN' }, data: { tipPointValue: ADMIN } }));
    }
    if (typeof MANAGER === 'number') {
      updates.push(db.user.updateMany({ where: { role: 'MANAGER' }, data: { tipPointValue: MANAGER } }));
    }
    if (typeof KITCHEN === 'number') {
      updates.push(db.user.updateMany({ where: { role: 'KITCHEN' }, data: { tipPointValue: KITCHEN } }));
    }
    if (typeof BAR === 'number') {
      updates.push(db.user.updateMany({ where: { role: 'BAR' }, data: { tipPointValue: BAR } }));
    }
    if (typeof FOH === 'number') {
      updates.push(db.user.updateMany({ where: { role: 'FOH' }, data: { tipPointValue: FOH } }));
    }

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating multipliers:', error);
    return NextResponse.json({ error: 'Failed to update multipliers' }, { status: 500 });
  }
}
