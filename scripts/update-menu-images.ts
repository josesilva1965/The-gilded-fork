import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

const IMAGE_MAP: Record<string, string> = {
  'Caesar Salad': 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&auto=format&fit=crop&q=80',
  'Bruschetta': 'https://images.unsplash.com/photo-1572656631137-7935297eff55?w=600&auto=format&fit=crop&q=80',
  'Garlic Prawns': 'https://images.unsplash.com/photo-1625938146369-adc83368bda7?w=600&auto=format&fit=crop&q=80',
  'Soup of the Day': 'https://images.unsplash.com/photo-1547592165-e1d17fed6006?w=600&auto=format&fit=crop&q=80',
  'Grilled Ribeye': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
  'Pan-Seared Salmon': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop&q=80',
  'Chicken Marsala': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop&q=80',
  'Spaghetti Carbonara': 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&auto=format&fit=crop&q=80',
  'Veggie Risotto': 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&auto=format&fit=crop&q=80',
  'Fish & Chips': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
  'Chocolate Lava Cake': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
  'Tiramisu': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80',
  'Crème Brûlée': 'https://images.unsplash.com/photo-1470324161839-ce2bb6fa6bc3?w=600&auto=format&fit=crop&q=80',
  'Classic Mojito': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
  'Espresso Martini': 'https://images.unsplash.com/photo-1545438102-799c3991ffb2?w=600&auto=format&fit=crop&q=80',
  'Old Fashioned': 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&auto=format&fit=crop&q=80',
  'Gin & Tonic': 'https://images.unsplash.com/photo-1524156869117-e3009772c72b?w=600&auto=format&fit=crop&q=80',
  'Margarita': 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=600&auto=format&fit=crop&q=80',
  'House Red Wine': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80',
  'House White Wine': 'https://images.unsplash.com/photo-1525268771113-32d9e9021a97?w=600&auto=format&fit=crop&q=80',
  'Craft IPA': 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&auto=format&fit=crop&q=80',
  'Lager': 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=600&auto=format&fit=crop&q=80',
  'Espresso': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
  'Fresh Lemonade': 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80',
  'Sparkling Water': 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=600&auto=format&fit=crop&q=80',
  'Truffle Fries': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
  'Seasonal Vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
  'Garlic Bread': 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=600&auto=format&fit=crop&q=80',
  'Mashed Potatoes': 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&auto=format&fit=crop&q=80',
};

async function main() {
  console.log('Seeding menu item images...');
  for (const [name, url] of Object.entries(IMAGE_MAP)) {
    try {
      await db.menuItem.updateMany({
        where: { name },
        data: { imageUrl: url },
      });
      console.log(`Updated ${name} with image.`);
    } catch (err) {
      console.error(`Failed to update ${name}:`, err);
    }
  }
  console.log('Done.');
}

main().finally(() => db.$disconnect());
