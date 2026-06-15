import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { TableOrderClient } from './table-order-client';
import { Utensils } from 'lucide-react';
import Link from 'next/link';
import { safeDbCall } from '@/lib/db-fallback';
import { MOCK_TABLES, MOCK_CATEGORIES, MOCK_MENU_ITEMS } from '@/lib/mock-data';

interface PageProps {
  params: Promise<{ number: string }>;
}

export default async function TablePage({ params }: PageProps) {
  const { number } = await params;
  const tableNumber = parseInt(number, 10);

  if (isNaN(tableNumber)) {
    return <TableNotFoundMessage reason="Invalid table number format" />;
  }

  // Fallback objects if DB is unreachable
  const fallbackTableData = MOCK_TABLES.find(t => t.number === tableNumber) || {
    id: `tbl-mock-${tableNumber}`,
    number: tableNumber,
    name: `Table ${tableNumber}`,
    capacity: 4,
    status: 'FREE',
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    section: 'MAIN',
    shape: 'ROUND',
    active: true,
    orders: []
  };

  const fallbackMenuData = MOCK_CATEGORIES.map(category => ({
    ...category,
    items: MOCK_MENU_ITEMS.filter(item => item.categoryId === category.id).map(item => ({
      ...item,
      extras: []
    }))
  }));

  // Fetch the table and its active unpaid orders
  const tableRaw = await safeDbCall(
    () => db.restaurantTable.findUnique({
      where: { number: tableNumber },
      include: {
        orders: {
          where: {
            status: { not: 'CANCELLED' },
            paymentStatus: { in: ['PENDING', 'PARTIAL'] }
          },
          include: {
            items: {
              include: {
                menuItem: true,
                extras: true
              },
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    }),
    fallbackTableData
  );

  if (!tableRaw) {
    return <TableNotFoundMessage reason={`Table ${tableNumber} was not found in our system`} />;
  }

  if (!tableRaw.active) {
    return <TableNotFoundMessage reason={`Table ${tableNumber} is currently inactive`} />;
  }

  // Fetch active menu categories and available items
  const menuRaw = await safeDbCall(
    () => db.menuCategory.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        items: {
          where: { isAvailable: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            extras: {
              where: { active: true }
            }
          }
        }
      }
    }),
    fallbackMenuData
  );

  // Safe serialization for Next.js props (handles Date conversion)
  const table = JSON.parse(JSON.stringify(tableRaw));
  const menu = JSON.parse(JSON.stringify(menuRaw));

  return <TableOrderClient table={table} menu={menu} />;
}

function TableNotFoundMessage({ reason }: { reason: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 text-zinc-100 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center shadow-2xl">
        <div className="flex justify-center mb-5">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-950/50 border border-red-900/30 text-red-500">
            <Utensils className="size-7" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Access Restricted</h2>
        <p className="text-sm text-zinc-400 mt-2">{reason}</p>
        
        <div className="mt-6 p-4 rounded-xl bg-zinc-950/40 border border-zinc-800 text-xs text-zinc-500 text-left space-y-2">
          <p className="font-semibold text-zinc-400">What should you do?</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Ensure you scanned the QR code on your table correctly.</li>
            <li>Ask one of our staff members to verify your table code.</li>
          </ul>
        </div>

        <div className="mt-6">
          <Link
            href="/management"
            className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-semibold transition-colors border border-zinc-700"
          >
            Go to Management Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
