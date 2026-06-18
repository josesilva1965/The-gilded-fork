import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { notifyBrandingChange } from '@/lib/socket-server';
import { getAuthenticatedUser } from '@/lib/auth-util';

const CONFIG_PATH = path.join(process.cwd(), 'db', 'branding.json');

const DEFAULT_BRANDING = {
  themeMode: 'dark',
  brandColor: 'emerald',
  logoText: 'GF',
  logoIconType: 'text',
  logoEmoji: '🍴',
  logoUrl: '',
  restaurantName: 'The Gilded Fork',
};

function getBranding() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return { ...DEFAULT_BRANDING, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Error reading branding config:', error);
  }
  return DEFAULT_BRANDING;
}

export async function GET() {
  return NextResponse.json(getBranding());
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request, ['ADMIN', 'MANAGER']);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updates = {
      themeMode: body.themeMode || 'dark',
      brandColor: body.brandColor || 'emerald',
      logoText: body.logoText || 'GF',
      logoIconType: body.logoIconType || 'text',
      logoEmoji: body.logoEmoji || '🍴',
      logoUrl: body.logoUrl || '',
      restaurantName: body.restaurantName || 'The Gilded Fork',
    };

    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(updates, null, 2), 'utf-8');

    // Broadcast the update via websocket server
    notifyBrandingChange();

    return NextResponse.json({ success: true, branding: updates });
  } catch (error) {
    console.error('Error saving branding config:', error);
    return NextResponse.json({ error: 'Failed to save branding' }, { status: 500 });
  }
}
