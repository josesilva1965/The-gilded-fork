import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🕐 Seeding clock logs for today...');

  const staff = await prisma.user.findMany({ where: { active: true } });

  if (staff.length === 0) {
    console.log('No active staff found. Run main seed first.');
    return;
  }

  await prisma.clockLog.deleteMany();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const manager = staff.find(u => u.role === 'MANAGER');
  const chef = staff.find(u => u.role === 'KITCHEN' && u.pin === '3001');
  const sousChef = staff.find(u => u.role === 'KITCHEN' && u.pin === '3002');
  const bartender = staff.find(u => u.role === 'BAR' && u.pin === '4001');
  const barback = staff.find(u => u.role === 'BAR' && u.pin === '4002');
  const server1 = staff.find(u => u.role === 'FOH' && u.pin === '5001');
  const server2 = staff.find(u => u.role === 'FOH' && u.pin === '5002');
  const host = staff.find(u => u.role === 'FOH' && u.pin === '5004');

  // Use hours relative to midnight that stay within today's date
  // e.g. current hour is ~12, so use times from 6am to 11am to stay safely within today
  const nowHour = now.getHours();
  const clockInData: { userId: string; inTime: Date; outTime?: Date }[] = [
    manager ? { userId: manager.id, inTime: new Date(today.getTime() + 9 * 3600000) } : undefined,
    chef ? { userId: chef.id, inTime: new Date(today.getTime() + 7 * 3600000), outTime: new Date(today.getTime() + Math.min(nowHour, 15) * 3600000) } : undefined,
    sousChef ? { userId: sousChef.id, inTime: new Date(today.getTime() + 8 * 3600000) } : undefined,
    bartender ? { userId: bartender.id, inTime: new Date(today.getTime() + 10 * 3600000) } : undefined,
    barback ? { userId: barback.id, inTime: new Date(today.getTime() + 10 * 3600000 + 30 * 60000) } : undefined,
    server1 ? { userId: server1.id, inTime: new Date(today.getTime() + 9 * 3600000) } : undefined,
    server2 ? { userId: server2.id, inTime: new Date(today.getTime() + 10 * 3600000) } : undefined,
    host ? { userId: host.id, inTime: new Date(today.getTime() + 8 * 3600000), outTime: new Date(today.getTime() + Math.min(nowHour, 14) * 3600000) } : undefined,
  ].filter((d): d is { userId: string; inTime: Date; outTime?: Date } => d !== undefined);

  for (const entry of clockInData) {
    await prisma.clockLog.create({
      data: { userId: entry.userId, action: 'IN', timestamp: entry.inTime },
    });

    if (entry.outTime) {
      await prisma.clockLog.create({
        data: { userId: entry.userId, action: 'OUT', timestamp: entry.outTime },
      });
    }
  }

  console.log(`  ✅ Created clock logs for ${clockInData.length} staff members`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
