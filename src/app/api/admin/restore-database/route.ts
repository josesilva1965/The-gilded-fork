import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const dbPath = path.join(process.cwd(), 'db', 'custom.db');
    
    // Disconnect Prisma before replacing the underlying SQLite file
    await db.$disconnect();

    // Overwrite the database file
    await fs.promises.writeFile(dbPath, buffer);

    return NextResponse.json({ success: true, message: 'Database restored successfully' });
  } catch (error) {
    console.error('Error restoring database:', error);
    return NextResponse.json({ error: 'Failed to restore database' }, { status: 500 });
  }
}
