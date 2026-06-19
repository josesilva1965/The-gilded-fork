import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth-util';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request, ['ADMIN', 'MANAGER']);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // day, week, month, all
    const type = searchParams.get('type') || 'all'; // all, inflow, outflow
    const search = searchParams.get('search') || '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate: Date | undefined;
    if (period === 'day') {
      startDate = today;
    } else if (period === 'week') {
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 30);
    }

    // 1. Fetch Completed Payments (Inflows)
    const paymentWhere: any = {
      status: 'COMPLETED',
    };
    if (startDate) {
      paymentWhere.createdAt = { gte: startDate };
    }
    const payments = await db.payment.findMany({
      where: paymentWhere,
      include: {
        order: {
          include: {
            table: true,
            creator: true,
            customer: true,
            items: { include: { menuItem: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Fetch Open/Unpaid/Partially Paid Orders Created in Period
    const orderWhere: any = {
      status: { not: 'CANCELLED' },
      paymentStatus: { in: ['PENDING', 'PARTIAL'] },
    };
    if (startDate) {
      orderWhere.createdAt = { gte: startDate };
    }
    const openOrders = await db.order.findMany({
      where: orderWhere,
      include: {
        table: true,
        creator: true,
        customer: true,
        items: { include: { menuItem: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Fetch Purchase Orders (Outflows)
    const poWhere: any = {
      status: { in: ['SENT', 'CONFIRMED', 'DELIVERED'] }, // skip DRAFT/CANCELLED
    };
    if (startDate) {
      poWhere.createdAt = { gte: startDate };
    }
    const purchaseOrders = await db.purchaseOrder.findMany({
      where: poWhere,
      include: {
        vendor: true,
        items: { include: { ingredient: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 4. Fetch Wastage (Outflows)
    const wastageWhere: any = {};
    if (startDate) {
      wastageWhere.createdAt = { gte: startDate };
    }
    const wastageLogs = await db.wastageLog.findMany({
      where: wastageWhere,
      include: {
        ingredient: true,
        menuItem: true,
        reporter: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 5. Fetch Daily Snapshots for Labor costs
    const snapshotWhere: any = {};
    if (startDate) {
      snapshotWhere.date = { gte: startDate };
    }
    const snapshots = await db.dailySnapshot.findMany({
      where: snapshotWhere,
    });
    const totalLaborCost = snapshots.reduce((sum, s) => sum + s.laborCost, 0);

    // Map into unified transaction format
    const transactions: any[] = [];

    // Map completed payments
    payments.forEach((p) => {
      const o = p.order;
      if (!o) return;
      transactions.push({
        id: p.id,
        type: 'INFLOW',
        category: 'SALE',
        description: `Sale - Table ${o.table.name} (${o.type})${p.reference ? ` - ${p.reference}` : ''}`,
        source: o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : 'Walk-in Guest',
        amount: p.amount,
        paymentMethod: p.method || 'CASH',
        operator: o.creator.name,
        status: 'COMPLETED',
        createdAt: p.createdAt,
        details: {
          subtotal: o.subtotal,
          taxAmount: o.taxAmount,
          guestCount: o.guestCount,
          notes: o.notes,
          items: o.items.map(i => `${i.quantity}x ${i.menuItem.name} @ $${i.unitPrice}`),
          tipAmount: p.tipAmount,
        }
      });
    });

    // Map open orders (remaining unpaid balance)
    openOrders.forEach((o) => {
      const totalPaid = o.payments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + p.amount, 0);
      const remainingBalance = o.totalAmount - totalPaid;
      
      if (remainingBalance > 0.05) {
        transactions.push({
          id: o.id,
          type: 'INFLOW',
          category: 'SALE',
          description: `Sale - Table ${o.table.name} (${o.type}) - Unpaid`,
          source: o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : 'Walk-in Guest',
          amount: remainingBalance,
          paymentMethod: o.paymentMethod || 'CASH',
          operator: o.creator.name,
          status: o.paymentStatus,
          createdAt: o.createdAt,
          details: {
            subtotal: o.subtotal,
            taxAmount: o.taxAmount,
            guestCount: o.guestCount,
            notes: o.notes,
            items: o.items.map(i => `${i.quantity}x ${i.menuItem.name} @ $${i.unitPrice}`),
          }
        });
      }
    });

    // Map purchase orders
    purchaseOrders.forEach((po) => {
      transactions.push({
        id: po.id,
        type: 'OUTFLOW',
        category: 'PURCHASE',
        description: `Purchase - PO #${po.id.substring(0, 8)} (${po.status})`,
        source: po.vendor.name,
        amount: po.totalAmount,
        paymentMethod: po.vendor.paymentTerms || 'Invoice',
        operator: 'System',
        status: po.status,
        createdAt: po.createdAt,
        details: {
          notes: po.notes,
          deliveredAt: po.deliveredAt,
          items: po.items.map(i => `${i.quantity}x ${i.ingredient.name} @ $${i.unitPrice}/${i.ingredient.unit}`),
        }
      });
    });

    // Map wastage logs
    wastageLogs.forEach((w) => {
      transactions.push({
        id: w.id,
        type: 'OUTFLOW',
        category: 'WASTAGE',
        description: `Wastage - ${w.quantity} ${w.ingredient.unit} of ${w.ingredient.name} (${w.reason})`,
        source: w.menuItem ? `Menu: ${w.menuItem.name}` : `Stock: ${w.ingredient.name}`,
        amount: w.value,
        paymentMethod: 'N/A',
        operator: w.reporter.name,
        status: 'COMPLETED',
        createdAt: w.createdAt,
        details: {
          notes: w.notes,
          reason: w.reason,
        }
      });
    });

    // Sort all unified transactions by date desc
    transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply client-side search query filtering
    let filteredTransactions = transactions;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      filteredTransactions = transactions.filter(t => 
        t.id.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.source.toLowerCase().includes(q) ||
        t.operator.toLowerCase().includes(q) ||
        t.paymentMethod.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q)
      );
    }

    // Apply type filter
    if (type === 'inflow') {
      filteredTransactions = filteredTransactions.filter(t => t.type === 'INFLOW');
    } else if (type === 'outflow') {
      filteredTransactions = filteredTransactions.filter(t => t.type === 'OUTFLOW');
    }

    return NextResponse.json({
      transactions: filteredTransactions,
      laborCost: totalLaborCost,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
