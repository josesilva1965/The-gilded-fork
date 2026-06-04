import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.restaurantTable.findMany({
    include: {
      orders: {
        include: { items: true }
      }
    }
  });

  console.log('=== restaurant tables ===');
  for (const t of tables) {
    console.log(`Table #${t.number} (${t.name}): status=${t.status}, serverId=${t.serverId}, customerId=${t.customerId}`);
    console.log(`  Orders count: ${t.orders.length}`);
    for (const o of t.orders) {
      console.log(`    Order ID: ${o.id}, status=${o.status}, paymentStatus=${o.paymentStatus}, totalAmount=${o.totalAmount}`);
      console.log(`      Items:`, o.items.map(i => `${i.quantity}x menuItemId=${i.menuItemId} (status=${i.status})`).join(', '));
    }
  }

  const allOrders = await prisma.order.findMany({
    include: { items: true, table: true }
  });
  console.log('\n=== all orders in database ===');
  for (const o of allOrders) {
    console.log(`Order ID: ${o.id}, status=${o.status}, paymentStatus=${o.paymentStatus}, tableId=${o.tableId} (#${o.table?.number})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
