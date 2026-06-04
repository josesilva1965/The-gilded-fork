import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), 'db', 'custom.db');
    
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: 'Database file not found' }, { status: 404 });
    }

    const fileBuffer = await fs.promises.readFile(dbPath);
    const stat = await fs.promises.stat(dbPath);

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `backup-${dateStr}.db`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': stat.size.toString(),
      },
    });
  } catch (error) {
    console.error('Error backing up database:', error);
    return NextResponse.json({ error: 'Failed to backup database' }, { status: 500 });
  }
}
