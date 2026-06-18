import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth-util';

export async function GET() {
  try {
    const menu = await db.menuCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        items: {
          where: { isAvailable: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            recipeItems: {
              include: {
                ingredient: true,
              },
            },
            extras: {
              where: { active: true },
            },
          },
        },
      },
    });
    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request, ['ADMIN', 'MANAGER']);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, categoryId, name, description, price, cost, type, station, prepTime, isAvailable, isPopular, imageUrl, allergies, spiceLevel, extras } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Menu item ID is required' }, { status: 400 });
    }

    const data: Record<string, any> = {};
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description || null;
    if (price !== undefined) data.price = parseFloat(price);
    if (cost !== undefined) data.cost = parseFloat(cost);
    if (type !== undefined) data.type = type;
    if (station !== undefined) data.station = station;
    if (prepTime !== undefined) data.prepTime = parseInt(prepTime);
    if (isAvailable !== undefined) data.isAvailable = isAvailable;
    if (isPopular !== undefined) data.isPopular = isPopular;
    if (imageUrl !== undefined) data.imageUrl = imageUrl || null;
    if (allergies !== undefined) data.allergies = allergies || null;
    if (spiceLevel !== undefined) data.spiceLevel = parseInt(spiceLevel);
    if (extras !== undefined) {
      data.extras = {
        deleteMany: {},
        create: extras.map((ext: any) => ({
          name: ext.name,
          price: parseFloat(ext.price),
          cost: ext.cost ? parseFloat(ext.cost) : 0,
          active: ext.active !== false
        }))
      };
    }

    const updated = await db.menuItem.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request, ['ADMIN', 'MANAGER']);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { categoryId, name, description, price, cost, type, station, prepTime, isAvailable, isPopular, imageUrl, allergies, spiceLevel, extras } = body;
    
    if (!categoryId || !name || price === undefined) {
      return NextResponse.json({ error: 'Category ID, name, and price are required' }, { status: 400 });
    }

    const newItem = await db.menuItem.create({
      data: {
        categoryId,
        name,
        description: description || null,
        price: parseFloat(price),
        cost: cost ? parseFloat(cost) : 0,
        type: type || 'FOOD',
        station: station || 'KITCHEN',
        prepTime: prepTime ? parseInt(prepTime) : 15,
        isAvailable: isAvailable !== false,
        isPopular: isPopular === true,
        imageUrl: imageUrl || null,
        allergies: allergies || null,
        spiceLevel: spiceLevel ? parseInt(spiceLevel) : 0,
        extras: extras && extras.length > 0 ? {
          create: extras.map((ext: any) => ({
            name: ext.name,
            price: parseFloat(ext.price),
            cost: ext.cost ? parseFloat(ext.cost) : 0,
            active: ext.active !== false
          }))
        } : undefined
      },
    });
    return NextResponse.json(newItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request, ['ADMIN', 'MANAGER']);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Menu item ID is required' }, { status: 400 });
    }
    const deleted = await db.menuItem.delete({
      where: { id },
    });
    return NextResponse.json(deleted);
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}
