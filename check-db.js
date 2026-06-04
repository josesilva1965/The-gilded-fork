const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.menuCategory.findMany({ include: { items: true } });
  console.log('Categories count:', categories.length);
  const itemsCount = categories.reduce((acc, cat) => acc + cat.items.length, 0);
  console.log('Total items:', itemsCount);
  const orders = await prisma.order.count();
  console.log('Total orders:', orders);
}

main().catch(console.error).finally(() => prisma.$disconnect());
