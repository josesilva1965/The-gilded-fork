import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.orderItemExtra.deleteMany();
  await prisma.menuItemExtra.deleteMany();
  await prisma.topSellingItem.deleteMany();
  await prisma.dailySnapshot.deleteMany();
  await prisma.customerVisit.deleteMany();
  await prisma.customerFavorite.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.clockLog.deleteMany();
  await prisma.shiftAssignment.deleteMany();
  await prisma.shiftTemplate.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.wastageLog.deleteMany();
  await prisma.stockLedger.deleteMany();
  await prisma.recipeItem.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.restaurantTable.deleteMany();
  await prisma.user.deleteMany();

  // ===== USERS / STAFF =====
  const users = await Promise.all([
    prisma.user.create({ data: { email: 'admin@thebar.com', name: 'Marco Rossi', pin: '1001', role: 'ADMIN', hourlyRate: 0, tipPointValue: 0, phone: '+1-555-0100' } }),
    prisma.user.create({ data: { email: 'manager@thebar.com', name: 'Sarah Chen', pin: '2001', role: 'MANAGER', hourlyRate: 28, tipPointValue: 1.5, phone: '+1-555-0200' } }),
    prisma.user.create({ data: { email: 'chef@thebar.com', name: 'Antoine Dubois', pin: '3001', role: 'KITCHEN', hourlyRate: 22, tipPointValue: 1.0, phone: '+1-555-0300' } }),
    prisma.user.create({ data: { email: 'sous@thebar.com', name: 'Yuki Tanaka', pin: '3002', role: 'KITCHEN', hourlyRate: 18, tipPointValue: 0.8, phone: '+1-555-0301' } }),
    prisma.user.create({ data: { email: 'bartender@thebar.com', name: 'Jake Morrison', pin: '4001', role: 'BAR', hourlyRate: 16, tipPointValue: 1.2, phone: '+1-555-0400' } }),
    prisma.user.create({ data: { email: 'barback@thebar.com', name: 'Liam Patel', pin: '4002', role: 'BAR', hourlyRate: 14, tipPointValue: 0.6, phone: '+1-555-0401' } }),
    prisma.user.create({ data: { email: 'server1@thebar.com', name: 'Emma Wilson', pin: '5001', role: 'FOH', hourlyRate: 12, tipPointValue: 1.0, phone: '+1-555-0500' } }),
    prisma.user.create({ data: { email: 'server2@thebar.com', name: 'Carlos Rivera', pin: '5002', role: 'FOH', hourlyRate: 12, tipPointValue: 1.0, phone: '+1-555-0501' } }),
    prisma.user.create({ data: { email: 'server3@thebar.com', name: 'Aisha Johnson', pin: '5003', role: 'FOH', hourlyRate: 12, tipPointValue: 1.0, phone: '+1-555-0502' } }),
    prisma.user.create({ data: { email: 'host@thebar.com', name: 'Mia Thompson', pin: '5004', role: 'FOH', hourlyRate: 13, tipPointValue: 0.5, phone: '+1-555-0503' } }),
  ]);
  console.log(`  ✅ Created ${users.length} users`);

  // ===== TABLES / FLOOR PLAN =====
  const tables = await Promise.all([
    // Main Dining Section
    prisma.restaurantTable.create({ data: { number: 1, name: 'Table 1', capacity: 2, status: 'FREE', x: 0, y: 0, width: 1, height: 1, section: 'MAIN', shape: 'ROUND' } }),
    prisma.restaurantTable.create({ data: { number: 2, name: 'Table 2', capacity: 2, status: 'SEATED', x: 2, y: 0, width: 1, height: 1, section: 'MAIN', shape: 'ROUND' } }),
    prisma.restaurantTable.create({ data: { number: 3, name: 'Table 3', capacity: 4, status: 'ORDER_PLACED', x: 4, y: 0, width: 1, height: 1, section: 'MAIN', shape: 'SQUARE' } }),
    prisma.restaurantTable.create({ data: { number: 4, name: 'Table 4', capacity: 4, status: 'APPETIZER', x: 0, y: 2, width: 1, height: 1, section: 'MAIN', shape: 'SQUARE' } }),
    prisma.restaurantTable.create({ data: { number: 5, name: 'Table 5', capacity: 6, status: 'MAIN', x: 2, y: 2, width: 2, height: 1, section: 'MAIN', shape: 'RECTANGLE' } }),
    prisma.restaurantTable.create({ data: { number: 6, name: 'Table 6', capacity: 6, status: 'FREE', x: 4, y: 2, width: 2, height: 1, section: 'MAIN', shape: 'RECTANGLE' } }),
    prisma.restaurantTable.create({ data: { number: 7, name: 'Table 7', capacity: 8, status: 'BILL_REQUESTED', x: 0, y: 4, width: 2, height: 1, section: 'MAIN', shape: 'RECTANGLE' } }),
    prisma.restaurantTable.create({ data: { number: 8, name: 'Table 8', capacity: 4, status: 'DIRTY', x: 2, y: 4, width: 1, height: 1, section: 'MAIN', shape: 'SQUARE' } }),
    prisma.restaurantTable.create({ data: { number: 9, name: 'Table 9', capacity: 4, status: 'FREE', x: 4, y: 4, width: 1, height: 1, section: 'MAIN', shape: 'SQUARE' } }),
    prisma.restaurantTable.create({ data: { number: 10, name: 'Table 10', capacity: 2, status: 'RESERVED', x: 6, y: 0, width: 1, height: 1, section: 'MAIN', shape: 'ROUND' } }),
    // Bar Section
    prisma.restaurantTable.create({ data: { number: 11, name: 'Bar Seat 1', capacity: 1, status: 'SEATED', x: 0, y: 0, width: 1, height: 1, section: 'BAR', shape: 'ROUND' } }),
    prisma.restaurantTable.create({ data: { number: 12, name: 'Bar Seat 2', capacity: 1, status: 'ORDER_PLACED', x: 1, y: 0, width: 1, height: 1, section: 'BAR', shape: 'ROUND' } }),
    prisma.restaurantTable.create({ data: { number: 13, name: 'Bar Seat 3', capacity: 1, status: 'FREE', x: 2, y: 0, width: 1, height: 1, section: 'BAR', shape: 'ROUND' } }),
    prisma.restaurantTable.create({ data: { number: 14, name: 'Bar Seat 4', capacity: 1, status: 'FREE', x: 3, y: 0, width: 1, height: 1, section: 'BAR', shape: 'ROUND' } }),
    prisma.restaurantTable.create({ data: { number: 15, name: 'Bar Seat 5', capacity: 1, status: 'SEATED', x: 4, y: 0, width: 1, height: 1, section: 'BAR', shape: 'ROUND' } }),
    prisma.restaurantTable.create({ data: { number: 16, name: 'Bar Seat 6', capacity: 1, status: 'FREE', x: 5, y: 0, width: 1, height: 1, section: 'BAR', shape: 'ROUND' } }),
    // Patio Section
    prisma.restaurantTable.create({ data: { number: 17, name: 'Patio 1', capacity: 4, status: 'FREE', x: 0, y: 0, width: 1, height: 1, section: 'PATIO', shape: 'ROUND' } }),
    prisma.restaurantTable.create({ data: { number: 18, name: 'Patio 2', capacity: 4, status: 'RESERVED', x: 2, y: 0, width: 1, height: 1, section: 'PATIO', shape: 'ROUND' } }),
    prisma.restaurantTable.create({ data: { number: 19, name: 'Patio 3', capacity: 6, status: 'FREE', x: 4, y: 0, width: 2, height: 1, section: 'PATIO', shape: 'RECTANGLE' } }),
    prisma.restaurantTable.create({ data: { number: 20, name: 'Patio 4', capacity: 8, status: 'SEATED', x: 0, y: 2, width: 2, height: 1, section: 'PATIO', shape: 'RECTANGLE' } }),
    // VIP Section
    prisma.restaurantTable.create({ data: { number: 21, name: 'VIP Booth 1', capacity: 6, status: 'FREE', x: 0, y: 0, width: 2, height: 1, section: 'VIP', shape: 'RECTANGLE' } }),
    prisma.restaurantTable.create({ data: { number: 22, name: 'VIP Booth 2', capacity: 8, status: 'RESERVED', x: 2, y: 0, width: 2, height: 1, section: 'VIP', shape: 'RECTANGLE' } }),
  ]);
  console.log(`  ✅ Created ${tables.length} tables`);

  // ===== VENDORS =====
  const vendors = await Promise.all([
    prisma.vendor.create({ data: { name: 'Fresh Valley Produce', contactName: 'Tom Green', email: 'tom@freshvalley.com', phone: '+1-555-1001', category: 'PRODUCE', leadTimeDays: 1, minOrder: 100, paymentTerms: 'NET_30' } }),
    prisma.vendor.create({ data: { name: 'Prime Cuts Butchery', contactName: 'Frank Miller', email: 'frank@primecuts.com', phone: '+1-555-1002', category: 'MEAT', leadTimeDays: 2, minOrder: 200, paymentTerms: 'NET_30' } }),
    prisma.vendor.create({ data: { name: 'Dairy Direct', contactName: 'Lisa Park', email: 'lisa@dairydirect.com', phone: '+1-555-1003', category: 'DAIRY', leadTimeDays: 1, minOrder: 75, paymentTerms: 'COD' } }),
    prisma.vendor.create({ data: { name: 'Pacific Spirits Co', contactName: 'Mike Chang', email: 'mike@pacificspirits.com', phone: '+1-555-1004', category: 'BEVERAGE', leadTimeDays: 3, minOrder: 500, paymentTerms: 'NET_30' } }),
    prisma.vendor.create({ data: { name: 'Dry Goods International', contactName: 'Anna Schmidt', email: 'anna@drygoods.com', phone: '+1-555-1005', category: 'DRY_GOODS', leadTimeDays: 2, minOrder: 150, paymentTerms: 'NET_30' } }),
  ]);
  console.log(`  ✅ Created ${vendors.length} vendors`);

  // ===== INGREDIENTS =====
  // Some items are AT or BELOW minStock to demonstrate low-stock alerts
  const ingredients = await Promise.all([
    prisma.ingredient.create({ data: { name: 'Beef Tenderloin', unit: 'KG', currentStock: 8.5, minStock: 5, maxStock: 20, costPerUnit: 32, storageLocation: 'FRIDGE', category: 'MEAT', vendorId: vendors[1].id } }),
    prisma.ingredient.create({ data: { name: 'Salmon Fillet', unit: 'KG', currentStock: 2.5, minStock: 3, maxStock: 10, costPerUnit: 28, storageLocation: 'FRIDGE', category: 'MEAT', vendorId: vendors[1].id } }), // LOW
    prisma.ingredient.create({ data: { name: 'Chicken Breast', unit: 'KG', currentStock: 12, minStock: 5, maxStock: 25, costPerUnit: 14, storageLocation: 'FRIDGE', category: 'MEAT', vendorId: vendors[1].id } }),
    prisma.ingredient.create({ data: { name: 'Olive Oil', unit: 'L', currentStock: 15, minStock: 5, maxStock: 30, costPerUnit: 8, storageLocation: 'DRY_STORAGE', category: 'DRY', vendorId: vendors[4].id } }),
    prisma.ingredient.create({ data: { name: 'Butter', unit: 'KG', currentStock: 6, minStock: 3, maxStock: 15, costPerUnit: 12, storageLocation: 'FRIDGE', category: 'DAIRY', vendorId: vendors[2].id } }),
    prisma.ingredient.create({ data: { name: 'Heavy Cream', unit: 'L', currentStock: 1.5, minStock: 2, maxStock: 10, costPerUnit: 6, storageLocation: 'FRIDGE', category: 'DAIRY', vendorId: vendors[2].id } }), // LOW
    prisma.ingredient.create({ data: { name: 'Parmesan Cheese', unit: 'KG', currentStock: 3, minStock: 2, maxStock: 8, costPerUnit: 22, storageLocation: 'FRIDGE', category: 'DAIRY', vendorId: vendors[2].id } }),
    prisma.ingredient.create({ data: { name: 'Romaine Lettuce', unit: 'UNIT', currentStock: 15, minStock: 8, maxStock: 30, costPerUnit: 2.5, storageLocation: 'FRIDGE', category: 'PRODUCE', vendorId: vendors[0].id } }),
    prisma.ingredient.create({ data: { name: 'Tomatoes', unit: 'KG', currentStock: 5, minStock: 3, maxStock: 12, costPerUnit: 4, storageLocation: 'FRIDGE', category: 'PRODUCE', vendorId: vendors[0].id } }),
    prisma.ingredient.create({ data: { name: 'Lemon', unit: 'UNIT', currentStock: 30, minStock: 15, maxStock: 60, costPerUnit: 0.5, storageLocation: 'FRIDGE', category: 'PRODUCE', vendorId: vendors[0].id } }),
    prisma.ingredient.create({ data: { name: 'Garlic', unit: 'KG', currentStock: 2, minStock: 1, maxStock: 5, costPerUnit: 8, storageLocation: 'DRY_STORAGE', category: 'PRODUCE', vendorId: vendors[0].id } }),
    prisma.ingredient.create({ data: { name: 'Pasta (Spaghetti)', unit: 'KG', currentStock: 10, minStock: 5, maxStock: 25, costPerUnit: 3, storageLocation: 'DRY_STORAGE', category: 'DRY', vendorId: vendors[4].id } }),
    prisma.ingredient.create({ data: { name: 'Bread (Sourdough)', unit: 'UNIT', currentStock: 8, minStock: 4, maxStock: 20, costPerUnit: 4, storageLocation: 'DRY_STORAGE', category: 'DRY', vendorId: vendors[4].id } }),
    prisma.ingredient.create({ data: { name: 'Vodka', unit: 'L', currentStock: 6, minStock: 3, maxStock: 12, costPerUnit: 18, storageLocation: 'BAR', category: 'BEVERAGE', vendorId: vendors[3].id } }),
    prisma.ingredient.create({ data: { name: 'Gin', unit: 'L', currentStock: 4, minStock: 2, maxStock: 8, costPerUnit: 22, storageLocation: 'BAR', category: 'BEVERAGE', vendorId: vendors[3].id } }),
    prisma.ingredient.create({ data: { name: 'Whiskey', unit: 'L', currentStock: 1.8, minStock: 2, maxStock: 8, costPerUnit: 30, storageLocation: 'BAR', category: 'BEVERAGE', vendorId: vendors[3].id } }), // LOW
    prisma.ingredient.create({ data: { name: 'White Wine', unit: 'L', currentStock: 12, minStock: 6, maxStock: 24, costPerUnit: 10, storageLocation: 'BAR', category: 'BEVERAGE', vendorId: vendors[3].id } }),
    prisma.ingredient.create({ data: { name: 'Red Wine', unit: 'L', currentStock: 10, minStock: 6, maxStock: 24, costPerUnit: 12, storageLocation: 'BAR', category: 'BEVERAGE', vendorId: vendors[3].id } }),
    prisma.ingredient.create({ data: { name: 'Tonic Water', unit: 'L', currentStock: 8, minStock: 4, maxStock: 16, costPerUnit: 3, storageLocation: 'BAR', category: 'BEVERAGE', vendorId: vendors[3].id } }),
    prisma.ingredient.create({ data: { name: 'Fresh Lime Juice', unit: 'L', currentStock: 0.8, minStock: 1, maxStock: 5, costPerUnit: 6, storageLocation: 'FRIDGE', category: 'BEVERAGE', vendorId: vendors[0].id } }), // LOW
    prisma.ingredient.create({ data: { name: 'Eggs', unit: 'UNIT', currentStock: 48, minStock: 24, maxStock: 96, costPerUnit: 0.35, storageLocation: 'FRIDGE', category: 'DAIRY', vendorId: vendors[2].id } }),
    prisma.ingredient.create({ data: { name: 'Flour', unit: 'KG', currentStock: 8, minStock: 4, maxStock: 20, costPerUnit: 1.5, storageLocation: 'DRY_STORAGE', category: 'DRY', vendorId: vendors[4].id } }),
    prisma.ingredient.create({ data: { name: 'Sugar', unit: 'KG', currentStock: 6, minStock: 3, maxStock: 15, costPerUnit: 2, storageLocation: 'DRY_STORAGE', category: 'DRY', vendorId: vendors[4].id } }),
    prisma.ingredient.create({ data: { name: 'Chocolate (Dark)', unit: 'KG', currentStock: 2.5, minStock: 1, maxStock: 5, costPerUnit: 18, storageLocation: 'DRY_STORAGE', category: 'DRY', vendorId: vendors[4].id } }),
    prisma.ingredient.create({ data: { name: 'Coffee Beans', unit: 'KG', currentStock: 5, minStock: 2, maxStock: 10, costPerUnit: 24, storageLocation: 'DRY_STORAGE', category: 'BEVERAGE', vendorId: vendors[4].id } }),
    prisma.ingredient.create({ data: { name: 'Fresh Basil', unit: 'BUNCH', currentStock: 2, minStock: 4, maxStock: 12, costPerUnit: 3.5, storageLocation: 'FRIDGE', category: 'PRODUCE', vendorId: vendors[0].id } }), // LOW
    prisma.ingredient.create({ data: { name: 'Mozzarella', unit: 'KG', currentStock: 1, minStock: 2, maxStock: 6, costPerUnit: 16, storageLocation: 'FRIDGE', category: 'DAIRY', vendorId: vendors[2].id } }), // LOW
    prisma.ingredient.create({ data: { name: 'Rum (White)', unit: 'L', currentStock: 3, minStock: 2, maxStock: 8, costPerUnit: 20, storageLocation: 'BAR', category: 'BEVERAGE', vendorId: vendors[3].id } }),
    prisma.ingredient.create({ data: { name: 'Tequila', unit: 'L', currentStock: 1.5, minStock: 2, maxStock: 6, costPerUnit: 25, storageLocation: 'BAR', category: 'BEVERAGE', vendorId: vendors[3].id } }), // LOW
    prisma.ingredient.create({ data: { name: 'Milk', unit: 'L', currentStock: 8, minStock: 4, maxStock: 20, costPerUnit: 2, storageLocation: 'FRIDGE', category: 'DAIRY', vendorId: vendors[2].id } }),
  ]);
  console.log(`  ✅ Created ${ingredients.length} ingredients`);

  // ===== MENU CATEGORIES =====
  const categories = await Promise.all([
    prisma.menuCategory.create({ data: { name: 'Starters', icon: 'Salad', sortOrder: 0 } }),
    prisma.menuCategory.create({ data: { name: 'Mains', icon: 'UtensilsCrossed', sortOrder: 1 } }),
    prisma.menuCategory.create({ data: { name: 'Desserts', icon: 'Cake', sortOrder: 2 } }),
    prisma.menuCategory.create({ data: { name: 'Cocktails', icon: 'Wine', sortOrder: 3 } }),
    prisma.menuCategory.create({ data: { name: 'Beer & Wine', icon: 'Beer', sortOrder: 4 } }),
    prisma.menuCategory.create({ data: { name: 'Non-Alcoholic', icon: 'Coffee', sortOrder: 5 } }),
    prisma.menuCategory.create({ data: { name: 'Sides', icon: 'CircleDot', sortOrder: 6 } }),
  ]);
  console.log(`  ✅ Created ${categories.length} menu categories`);

  // ===== MENU ITEMS =====
  const menuItems = await Promise.all([
    // Starters
    prisma.menuItem.create({ data: { categoryId: categories[0].id, name: 'Caesar Salad', description: 'Crisp romaine, parmesan, croutons, anchovy dressing', price: 14, cost: 3.5, type: 'APPETIZER', station: 'KITCHEN', prepTime: 8, isPopular: true, allergies: 'dairy,fish,gluten' } }),
    prisma.menuItem.create({ data: { categoryId: categories[0].id, name: 'Bruschetta', description: 'Toasted sourdough, vine tomatoes, fresh basil, balsamic glaze', price: 12, cost: 2.5, type: 'APPETIZER', station: 'KITCHEN', prepTime: 7, allergies: 'gluten' } }),
    prisma.menuItem.create({ data: { categoryId: categories[0].id, name: 'Garlic Prawns', description: 'Sautéed prawns in garlic butter with lemon and herbs', price: 18, cost: 7, type: 'APPETIZER', station: 'KITCHEN', prepTime: 10, allergies: 'shellfish,dairy' } }),
    prisma.menuItem.create({ data: { categoryId: categories[0].id, name: 'Soup of the Day', description: 'Freshly prepared daily - ask your server', price: 10, cost: 2, type: 'APPETIZER', station: 'KITCHEN', prepTime: 5 } }),
    // Mains
    prisma.menuItem.create({ data: { categoryId: categories[1].id, name: 'Grilled Ribeye', description: '12oz prime ribeye, truffle mash, seasonal vegetables, red wine jus', price: 42, cost: 16, type: 'FOOD', station: 'KITCHEN', prepTime: 25, isPopular: true, allergies: 'dairy' } }),
    prisma.menuItem.create({ data: { categoryId: categories[1].id, name: 'Pan-Seared Salmon', description: 'Atlantic salmon, dill cream sauce, roasted potatoes, asparagus', price: 32, cost: 11, type: 'FOOD', station: 'KITCHEN', prepTime: 18, isPopular: true, allergies: 'dairy,fish' } }),
    prisma.menuItem.create({ data: { categoryId: categories[1].id, name: 'Chicken Marsala', description: 'Breaded chicken, marsala wine sauce, mushrooms, linguine', price: 26, cost: 7, type: 'FOOD', station: 'KITCHEN', prepTime: 20, allergies: 'gluten,dairy' } }),
    prisma.menuItem.create({ data: { categoryId: categories[1].id, name: 'Spaghetti Carbonara', description: 'Guanciale, pecorino, egg yolk, black pepper', price: 22, cost: 5, type: 'FOOD', station: 'KITCHEN', prepTime: 15, isPopular: true, allergies: 'dairy,eggs,gluten' } }),
    prisma.menuItem.create({ data: { categoryId: categories[1].id, name: 'Veggie Risotto', description: 'Arborio rice, seasonal vegetables, parmesan, white wine', price: 20, cost: 4.5, type: 'FOOD', station: 'KITCHEN', prepTime: 22, allergies: 'dairy' } }),
    prisma.menuItem.create({ data: { categoryId: categories[1].id, name: 'Fish & Chips', description: 'Beer-battered cod, hand-cut chips, mushy peas, tartar sauce', price: 24, cost: 6, type: 'FOOD', station: 'KITCHEN', prepTime: 15, allergies: 'fish,gluten' } }),
    // Desserts
    prisma.menuItem.create({ data: { categoryId: categories[2].id, name: 'Chocolate Lava Cake', description: 'Warm dark chocolate fondant, vanilla ice cream', price: 14, cost: 3.5, type: 'DESSERT', station: 'KITCHEN', prepTime: 12, isPopular: true, allergies: 'dairy,eggs,gluten' } }),
    prisma.menuItem.create({ data: { categoryId: categories[2].id, name: 'Tiramisu', description: 'Classic Italian tiramisu with espresso and mascarpone', price: 12, cost: 3, type: 'DESSERT', station: 'KITCHEN', prepTime: 5, allergies: 'dairy,eggs,gluten' } }),
    prisma.menuItem.create({ data: { categoryId: categories[2].id, name: 'Crème Brûlée', description: 'Vanilla bean custard with caramelized sugar top', price: 11, cost: 2, type: 'DESSERT', station: 'KITCHEN', prepTime: 5, allergies: 'dairy,eggs' } }),
    // Cocktails
    prisma.menuItem.create({ data: { categoryId: categories[3].id, name: 'Classic Mojito', description: 'White rum, fresh mint, lime, sugar, soda water', price: 14, cost: 3, type: 'DRINK', station: 'BAR', prepTime: 3, isPopular: true } }),
    prisma.menuItem.create({ data: { categoryId: categories[3].id, name: 'Espresso Martini', description: 'Vodka, coffee liqueur, fresh espresso', price: 16, cost: 4, type: 'DRINK', station: 'BAR', prepTime: 3, isPopular: true } }),
    prisma.menuItem.create({ data: { categoryId: categories[3].id, name: 'Old Fashioned', description: 'Bourbon, bitters, sugar, orange peel', price: 15, cost: 4.5, type: 'DRINK', station: 'BAR', prepTime: 2 } }),
    prisma.menuItem.create({ data: { categoryId: categories[3].id, name: 'Gin & Tonic', description: 'Premium gin, tonic water, cucumber, juniper', price: 13, cost: 3, type: 'DRINK', station: 'BAR', prepTime: 2 } }),
    prisma.menuItem.create({ data: { categoryId: categories[3].id, name: 'Margarita', description: 'Tequila, triple sec, lime juice, salt rim', price: 14, cost: 3.5, type: 'DRINK', station: 'BAR', prepTime: 3 } }),
    // Beer & Wine
    prisma.menuItem.create({ data: { categoryId: categories[4].id, name: 'House Red Wine', description: 'Cabernet Sauvignon, Napa Valley', price: 12, cost: 4, type: 'DRINK', station: 'BAR', prepTime: 1 } }),
    prisma.menuItem.create({ data: { categoryId: categories[4].id, name: 'House White Wine', description: 'Chardonnay, Sonoma Coast', price: 12, cost: 4, type: 'DRINK', station: 'BAR', prepTime: 1 } }),
    prisma.menuItem.create({ data: { categoryId: categories[4].id, name: 'Craft IPA', description: 'Local brewery rotating tap', price: 9, cost: 3, type: 'DRINK', station: 'BAR', prepTime: 1 } }),
    prisma.menuItem.create({ data: { categoryId: categories[4].id, name: 'Lager', description: 'Premium lager on tap', price: 7, cost: 2, type: 'DRINK', station: 'BAR', prepTime: 1 } }),
    // Non-Alcoholic
    prisma.menuItem.create({ data: { categoryId: categories[5].id, name: 'Espresso', description: 'Double shot, locally roasted', price: 5, cost: 1, type: 'DRINK', station: 'BAR', prepTime: 2 } }),
    prisma.menuItem.create({ data: { categoryId: categories[5].id, name: 'Fresh Lemonade', description: 'House-made with fresh lemons and mint', price: 6, cost: 1, type: 'DRINK', station: 'BAR', prepTime: 3 } }),
    prisma.menuItem.create({ data: { categoryId: categories[5].id, name: 'Sparkling Water', description: 'San Pellegrino 750ml', price: 5, cost: 1.5, type: 'DRINK', station: 'BAR', prepTime: 1 } }),
    // Sides
    prisma.menuItem.create({ data: { categoryId: categories[6].id, name: 'Truffle Fries', description: 'Hand-cut, truffle oil, parmesan, herbs', price: 10, cost: 2.5, type: 'SIDE', station: 'KITCHEN', prepTime: 10, isPopular: true, allergies: 'dairy' } }),
    prisma.menuItem.create({ data: { categoryId: categories[6].id, name: 'Seasonal Vegetables', description: 'Grilled seasonal selection', price: 8, cost: 2, type: 'SIDE', station: 'KITCHEN', prepTime: 8 } }),
    prisma.menuItem.create({ data: { categoryId: categories[6].id, name: 'Garlic Bread', description: 'Sourdough, roasted garlic butter, herbs', price: 7, cost: 1.5, type: 'SIDE', station: 'KITCHEN', prepTime: 6, allergies: 'gluten,dairy' } }),
    prisma.menuItem.create({ data: { categoryId: categories[6].id, name: 'Mashed Potatoes', description: 'Creamy butter mash with chives', price: 7, cost: 1.5, type: 'SIDE', station: 'KITCHEN', prepTime: 8, allergies: 'dairy' } }),
  ]);
  console.log(`  ✅ Created ${menuItems.length} menu items`);

  // ===== MENU ITEM EXTRAS =====
  const extras = await Promise.all([
    // Caesar Salad
    prisma.menuItemExtra.create({ data: { menuItemId: menuItems[0].id, name: 'Extra Chicken', price: 5.0, cost: 1.5 } }),
    prisma.menuItemExtra.create({ data: { menuItemId: menuItems[0].id, name: 'Extra Prawns', price: 7.0, cost: 2.5 } }),
    prisma.menuItemExtra.create({ data: { menuItemId: menuItems[0].id, name: 'Extra Bacon', price: 2.0, cost: 0.5 } }),

    // Grilled Ribeye
    prisma.menuItemExtra.create({ data: { menuItemId: menuItems[4].id, name: 'Truffle Butter', price: 2.50, cost: 0.8 } }),
    prisma.menuItemExtra.create({ data: { menuItemId: menuItems[4].id, name: 'Extra Sauce', price: 1.50, cost: 0.3 } }),

    // Spaghetti Carbonara
    prisma.menuItemExtra.create({ data: { menuItemId: menuItems[7].id, name: 'Extra Guanciale', price: 3.50, cost: 1.0 } }),
    prisma.menuItemExtra.create({ data: { menuItemId: menuItems[7].id, name: 'Gluten-Free Pasta', price: 2.0, cost: 0.5 } }),

    // Classic Mojito
    prisma.menuItemExtra.create({ data: { menuItemId: menuItems[13].id, name: 'Extra Rum', price: 4.0, cost: 1.0 } }),
    prisma.menuItemExtra.create({ data: { menuItemId: menuItems[13].id, name: 'Extra Mint', price: 0.5, cost: 0.1 } }),
    prisma.menuItemExtra.create({ data: { menuItemId: menuItems[13].id, name: 'Extra Lime', price: 0.5, cost: 0.1 } }),

    // Espresso
    prisma.menuItemExtra.create({ data: { menuItemId: menuItems[22].id, name: 'Double Shot', price: 1.5, cost: 0.3 } }),
    prisma.menuItemExtra.create({ data: { menuItemId: menuItems[22].id, name: 'Oat Milk', price: 0.8, cost: 0.2 } }),
    prisma.menuItemExtra.create({ data: { menuItemId: menuItems[22].id, name: 'Almond Milk', price: 0.8, cost: 0.2 } }),
    prisma.menuItemExtra.create({ data: { menuItemId: menuItems[22].id, name: 'Vanilla Syrup', price: 0.5, cost: 0.1 } }),
    prisma.menuItemExtra.create({ data: { menuItemId: menuItems[22].id, name: 'Caramel Syrup', price: 0.5, cost: 0.1 } }),
  ]);
  console.log(`  ✅ Created ${extras.length} menu item extras`);

  // ===== RECIPE ITEMS (Ingredient mapping) =====
  const recipeItems = await Promise.all([
    // Caesar Salad
    prisma.recipeItem.create({ data: { menuItemId: menuItems[0].id, ingredientId: ingredients[7].id, quantity: 0.5 } }),
    prisma.recipeItem.create({ data: { menuItemId: menuItems[0].id, ingredientId: ingredients[6].id, quantity: 0.05 } }),
    // Bruschetta
    prisma.recipeItem.create({ data: { menuItemId: menuItems[1].id, ingredientId: ingredients[12].id, quantity: 0.25 } }),
    prisma.recipeItem.create({ data: { menuItemId: menuItems[1].id, ingredientId: ingredients[8].id, quantity: 0.15 } }),
    // Grilled Ribeye
    prisma.recipeItem.create({ data: { menuItemId: menuItems[4].id, ingredientId: ingredients[0].id, quantity: 0.4 } }),
    prisma.recipeItem.create({ data: { menuItemId: menuItems[4].id, ingredientId: ingredients[4].id, quantity: 0.05 } }),
    // Pan-Seared Salmon
    prisma.recipeItem.create({ data: { menuItemId: menuItems[5].id, ingredientId: ingredients[1].id, quantity: 0.25 } }),
    prisma.recipeItem.create({ data: { menuItemId: menuItems[5].id, ingredientId: ingredients[5].id, quantity: 0.05 } }),
    // Spaghetti Carbonara
    prisma.recipeItem.create({ data: { menuItemId: menuItems[7].id, ingredientId: ingredients[11].id, quantity: 0.15 } }),
    prisma.recipeItem.create({ data: { menuItemId: menuItems[7].id, ingredientId: ingredients[6].id, quantity: 0.03 } }),
    prisma.recipeItem.create({ data: { menuItemId: menuItems[7].id, ingredientId: ingredients[20].id, quantity: 1 } }),
    // Chocolate Lava Cake
    prisma.recipeItem.create({ data: { menuItemId: menuItems[10].id, ingredientId: ingredients[23].id, quantity: 0.08 } }),
    prisma.recipeItem.create({ data: { menuItemId: menuItems[10].id, ingredientId: ingredients[4].id, quantity: 0.05 } }),
    // Classic Mojito
    prisma.recipeItem.create({ data: { menuItemId: menuItems[13].id, ingredientId: ingredients[19].id, quantity: 0.03 } }),
    // Espresso Martini
    prisma.recipeItem.create({ data: { menuItemId: menuItems[14].id, ingredientId: ingredients[13].id, quantity: 0.05 } }),
    prisma.recipeItem.create({ data: { menuItemId: menuItems[14].id, ingredientId: ingredients[24].id, quantity: 0.02 } }),
    // Old Fashioned
    prisma.recipeItem.create({ data: { menuItemId: menuItems[15].id, ingredientId: ingredients[15].id, quantity: 0.06 } }),
    // Gin & Tonic
    prisma.recipeItem.create({ data: { menuItemId: menuItems[16].id, ingredientId: ingredients[14].id, quantity: 0.05 } }),
    prisma.recipeItem.create({ data: { menuItemId: menuItems[16].id, ingredientId: ingredients[18].id, quantity: 0.15 } }),
  ]);
  console.log(`  ✅ Created ${recipeItems.length} recipe items`);

  // ===== CUSTOMERS =====
  const customers = await Promise.all([
    prisma.customer.create({ data: { firstName: 'James', lastName: 'Anderson', email: 'james@email.com', phone: '+1-555-2001', birthday: new Date('1985-03-15'), loyaltyPoints: 2450, loyaltyTier: 'GOLD', lifetimeSpend: 3250, visitCount: 48, lastVisit: new Date('2025-03-10'), marketingOptIn: true } }),
    prisma.customer.create({ data: { firstName: 'Sophie', lastName: 'Laurent', email: 'sophie@email.com', phone: '+1-555-2002', birthday: new Date('1992-07-22'), allergies: 'nuts,gluten', loyaltyPoints: 1200, loyaltyTier: 'SILVER', lifetimeSpend: 1680, visitCount: 22, lastVisit: new Date('2025-03-12'), marketingOptIn: true } }),
    prisma.customer.create({ data: { firstName: 'Michael', lastName: 'Chen', email: 'michael.c@email.com', phone: '+1-555-2003', birthday: new Date('1978-11-30'), loyaltyPoints: 5200, loyaltyTier: 'PLATINUM', lifetimeSpend: 8900, visitCount: 95, lastVisit: new Date('2025-03-13'), marketingOptIn: true } }),
    prisma.customer.create({ data: { firstName: 'Emma', lastName: 'Davis', email: 'emma.d@email.com', phone: '+1-555-2004', birthday: new Date('1995-05-08'), allergies: 'shellfish', loyaltyPoints: 500, loyaltyTier: 'BRONZE', lifetimeSpend: 620, visitCount: 8, lastVisit: new Date('2025-03-09') } }),
    prisma.customer.create({ data: { firstName: 'Robert', lastName: 'Kim', email: 'robert.k@email.com', phone: '+1-555-2005', birthday: new Date('1988-09-14'), loyaltyPoints: 800, loyaltyTier: 'SILVER', lifetimeSpend: 1120, visitCount: 15, lastVisit: new Date('2025-03-11') } }),
    prisma.customer.create({ data: { firstName: 'Isabella', lastName: 'Martinez', email: 'isabella@email.com', phone: '+1-555-2006', birthday: new Date('1990-12-25'), allergies: 'dairy,eggs', loyaltyPoints: 3200, loyaltyTier: 'GOLD', lifetimeSpend: 4500, visitCount: 60, lastVisit: new Date('2025-03-13'), marketingOptIn: true } }),
    prisma.customer.create({ data: { firstName: 'David', lastName: 'Wilson', email: 'david.w@email.com', phone: '+1-555-2007', loyaltyPoints: 150, loyaltyTier: 'BRONZE', lifetimeSpend: 180, visitCount: 3, lastVisit: new Date('2025-03-08') } }),
    prisma.customer.create({ data: { firstName: 'Olivia', lastName: 'Brown', email: 'olivia.b@email.com', phone: '+1-555-2008', birthday: new Date('1993-02-14'), loyaltyPoints: 1800, loyaltyTier: 'SILVER', lifetimeSpend: 2400, visitCount: 30, lastVisit: new Date('2025-03-12'), marketingOptIn: true } }),
  ]);
  console.log(`  ✅ Created ${customers.length} customers`);

  // Customer favorites
  await Promise.all([
    prisma.customerFavorite.create({ data: { customerId: customers[0].id, menuItemId: menuItems[4].id } }),
    prisma.customerFavorite.create({ data: { customerId: customers[0].id, menuItemId: menuItems[13].id } }),
    prisma.customerFavorite.create({ data: { customerId: customers[2].id, menuItemId: menuItems[5].id } }),
    prisma.customerFavorite.create({ data: { customerId: customers[5].id, menuItemId: menuItems[10].id } }),
    prisma.customerFavorite.create({ data: { customerId: customers[7].id, menuItemId: menuItems[7].id } }),
  ]);

  // ===== RESERVATIONS =====
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Today's confirmed reservations
  await Promise.all([
    prisma.reservation.create({ data: { tableId: tables[0].id, customerId: customers[1].id, guestName: 'Sophie Laurent', guestPhone: '+1-555-2002', guestEmail: 'sophie@email.com', partySize: 2, status: 'CONFIRMED', reservationDate: today, reservationTime: '17:30', notes: 'Allergic to nuts and gluten', estimatedDuration: 90 } }),
    prisma.reservation.create({ data: { tableId: tables[9].id, customerId: customers[0].id, guestName: 'James Anderson', guestPhone: '+1-555-2001', guestEmail: 'james@email.com', partySize: 2, status: 'CONFIRMED', reservationDate: today, reservationTime: '19:00', notes: 'Anniversary dinner - window seat preferred', estimatedDuration: 120 } }),
    prisma.reservation.create({ data: { tableId: tables[17].id, customerId: customers[2].id, guestName: 'Michael Chen', guestPhone: '+1-555-2003', guestEmail: 'michael.c@email.com', partySize: 4, status: 'CONFIRMED', reservationDate: today, reservationTime: '18:30', notes: 'VIP regular - prefers quiet corner', estimatedDuration: 150 } }),
    prisma.reservation.create({ data: { tableId: tables[21].id, customerId: customers[5].id, guestName: 'Isabella Martinez', guestPhone: '+1-555-2006', guestEmail: 'isabella@email.com', partySize: 6, status: 'CONFIRMED', reservationDate: today, reservationTime: '20:00', notes: 'Birthday celebration - dairy/egg allergies', estimatedDuration: 180 } }),
    prisma.reservation.create({ data: { guestName: 'Robert Kim', guestPhone: '+1-555-2005', guestEmail: 'robert.k@email.com', partySize: 2, status: 'CONFIRMED', reservationDate: today, reservationTime: '20:30', estimatedDuration: 90 } }),
    prisma.reservation.create({ data: { tableId: tables[2].id, customerId: customers[7].id, guestName: 'Olivia Brown', guestPhone: '+1-555-2008', guestEmail: 'olivia.b@email.com', partySize: 4, status: 'CONFIRMED', reservationDate: today, reservationTime: '19:30', notes: 'Business dinner', estimatedDuration: 120 } }),
    prisma.reservation.create({ data: { tableId: tables[8].id, guestName: 'Alex Turner', guestPhone: '+1-555-3010', partySize: 4, status: 'CONFIRMED', reservationDate: today, reservationTime: '18:00', estimatedDuration: 90 } }),
    prisma.reservation.create({ data: { tableId: tables[16].id, guestName: 'Nina Patel', guestPhone: '+1-555-3011', partySize: 3, status: 'CONFIRMED', reservationDate: today, reservationTime: '21:00', notes: 'Late dinner', estimatedDuration: 90 } }),
    // Today's seated reservation
    prisma.reservation.create({ data: { tableId: tables[3].id, customerId: customers[3].id, guestName: 'Emma Davis', guestPhone: '+1-555-2004', guestEmail: 'emma.d@email.com', partySize: 4, status: 'SEATED', reservationDate: today, reservationTime: '18:00', seatedAt: new Date(Date.now() - 20 * 60000), notes: 'Shellfish allergy', estimatedDuration: 120 } }),
    // Today's completed reservation
    prisma.reservation.create({ data: { tableId: tables[0].id, guestName: 'Lunch Guest 1', guestPhone: '+1-555-4001', partySize: 2, status: 'COMPLETED', reservationDate: today, reservationTime: '12:00', seatedAt: new Date(Date.now() - 4 * 3600000), completedAt: new Date(Date.now() - 3 * 3600000), estimatedDuration: 60 } }),
    prisma.reservation.create({ data: { tableId: tables[2].id, guestName: 'Lunch Guest 2', guestPhone: '+1-555-4002', partySize: 3, status: 'COMPLETED', reservationDate: today, reservationTime: '12:30', seatedAt: new Date(Date.now() - 3.5 * 3600000), completedAt: new Date(Date.now() - 2.5 * 3600000), estimatedDuration: 60 } }),
    // Today's cancelled reservation
    prisma.reservation.create({ data: { guestName: 'Cancelled Guest', guestPhone: '+1-555-5001', partySize: 2, status: 'CANCELLED', reservationDate: today, reservationTime: '19:00', notes: 'Called to cancel - flight delayed', estimatedDuration: 90 } }),
    // Today's no-show
    prisma.reservation.create({ data: { tableId: tables[8].id, guestName: 'No Show Guest', guestPhone: '+1-555-5002', partySize: 4, status: 'NO_SHOW', reservationDate: today, reservationTime: '17:00', estimatedDuration: 90 } }),
  ]);

  // Walk-in waitlist
  await Promise.all([
    prisma.reservation.create({ data: { guestName: 'Tom Walker', guestPhone: '+1-555-6001', partySize: 2, status: 'CONFIRMED', reservationDate: today, reservationTime: '19:30', isWalkIn: true, waitListPosition: 1, estimatedWait: 10, createdAt: new Date(Date.now() - 12 * 60000) } }),
    prisma.reservation.create({ data: { guestName: 'Sarah Miller', guestPhone: '+1-555-6002', partySize: 4, status: 'CONFIRMED', reservationDate: today, reservationTime: '19:45', isWalkIn: true, waitListPosition: 2, estimatedWait: 20, createdAt: new Date(Date.now() - 8 * 60000) } }),
    prisma.reservation.create({ data: { guestName: 'David Wilson', guestPhone: '+1-555-2007', partySize: 1, status: 'CONFIRMED', reservationDate: today, reservationTime: '20:00', isWalkIn: true, waitListPosition: 3, estimatedWait: 25, notes: 'Bar seat OK', createdAt: new Date(Date.now() - 5 * 60000) } }),
  ]);

  // Tomorrow's reservations
  await Promise.all([
    prisma.reservation.create({ data: { tableId: tables[0].id, customerId: customers[4].id, guestName: 'Robert Kim', guestPhone: '+1-555-2005', guestEmail: 'robert.k@email.com', partySize: 2, status: 'CONFIRMED', reservationDate: tomorrow, reservationTime: '19:00', estimatedDuration: 90 } }),
    prisma.reservation.create({ data: { tableId: tables[20].id, customerId: customers[0].id, guestName: 'James Anderson', guestPhone: '+1-555-2001', partySize: 6, status: 'CONFIRMED', reservationDate: tomorrow, reservationTime: '20:00', notes: 'Corporate dinner', estimatedDuration: 180 } }),
    prisma.reservation.create({ data: { tableId: tables[16].id, guestName: 'Lisa Park', guestPhone: '+1-555-6003', partySize: 4, status: 'CONFIRMED', reservationDate: tomorrow, reservationTime: '18:30', estimatedDuration: 120 } }),
  ]);

  // Yesterday's completed reservations
  await Promise.all([
    prisma.reservation.create({ data: { tableId: tables[0].id, guestName: 'Yesterday Guest 1', guestPhone: '+1-555-7001', partySize: 2, status: 'COMPLETED', reservationDate: yesterday, reservationTime: '19:00', seatedAt: new Date(yesterday.getTime() + 19 * 3600000), completedAt: new Date(yesterday.getTime() + 21 * 3600000), estimatedDuration: 90 } }),
    prisma.reservation.create({ data: { tableId: tables[3].id, guestName: 'Yesterday Guest 2', guestPhone: '+1-555-7002', partySize: 4, status: 'COMPLETED', reservationDate: yesterday, reservationTime: '20:00', seatedAt: new Date(yesterday.getTime() + 20 * 3600000), completedAt: new Date(yesterday.getTime() + 22.5 * 3600000), estimatedDuration: 120 } }),
    prisma.reservation.create({ data: { guestName: 'Yesterday No Show', guestPhone: '+1-555-7003', partySize: 3, status: 'NO_SHOW', reservationDate: yesterday, reservationTime: '18:00', estimatedDuration: 90 } }),
  ]);
  console.log('  ✅ Created reservations & waitlist');

  // ===== SHIFT TEMPLATES & ASSIGNMENTS =====
  const shiftTemplates = await Promise.all([
    prisma.shiftTemplate.create({ data: { name: 'Lunch Service', startTime: '10:00', endTime: '16:00', type: 'AFTERNOON' } }),
    prisma.shiftTemplate.create({ data: { name: 'Dinner Service', startTime: '16:00', endTime: '23:00', type: 'EVENING' } }),
    prisma.shiftTemplate.create({ data: { name: 'Late Night Bar', startTime: '20:00', endTime: '02:00', type: 'NIGHT' } }),
    prisma.shiftTemplate.create({ data: { name: 'Kitchen Prep', startTime: '08:00', endTime: '14:00', type: 'MORNING' } }),
  ]);

  for (let d = 0; d < 7; d++) {
    const shiftDate = new Date(today);
    shiftDate.setDate(shiftDate.getDate() + d);
    await Promise.all([
      prisma.shiftAssignment.create({ data: { userId: users[1].id, shiftTemplateId: shiftTemplates[1].id, date: shiftDate, position: 'MANAGER' } }),
      prisma.shiftAssignment.create({ data: { userId: users[2].id, shiftTemplateId: shiftTemplates[3].id, date: shiftDate, position: 'CHEF' } }),
      prisma.shiftAssignment.create({ data: { userId: users[2].id, shiftTemplateId: shiftTemplates[1].id, date: shiftDate, position: 'CHEF' } }),
      prisma.shiftAssignment.create({ data: { userId: users[3].id, shiftTemplateId: shiftTemplates[1].id, date: shiftDate, position: 'CHEF' } }),
      prisma.shiftAssignment.create({ data: { userId: users[4].id, shiftTemplateId: shiftTemplates[1].id, date: shiftDate, position: 'BARTENDER' } }),
      prisma.shiftAssignment.create({ data: { userId: users[4].id, shiftTemplateId: shiftTemplates[2].id, date: shiftDate, position: 'BARTENDER' } }),
      prisma.shiftAssignment.create({ data: { userId: users[6].id, shiftTemplateId: shiftTemplates[1].id, date: shiftDate, position: 'SERVER' } }),
      prisma.shiftAssignment.create({ data: { userId: users[7].id, shiftTemplateId: shiftTemplates[1].id, date: shiftDate, position: 'SERVER' } }),
      prisma.shiftAssignment.create({ data: { userId: users[8].id, shiftTemplateId: shiftTemplates[0].id, date: shiftDate, position: 'SERVER' } }),
      prisma.shiftAssignment.create({ data: { userId: users[8].id, shiftTemplateId: shiftTemplates[1].id, date: shiftDate, position: 'SERVER' } }),
      prisma.shiftAssignment.create({ data: { userId: users[9].id, shiftTemplateId: shiftTemplates[0].id, date: shiftDate, position: 'HOST' } }),
    ]);
  }
  console.log('  ✅ Created shift templates & assignments');

  // ===== ACTIVE ORDERS =====
  // Order 1 — Table 2, 5 min ago (GREEN urgency), mixed kitchen/bar items
  const order1 = await prisma.order.create({
    data: {
      tableId: tables[1].id, createdBy: users[6].id, status: 'IN_PROGRESS', type: 'DINE_IN', guestCount: 2,
      subtotal: 46, taxAmount: 4.6, totalAmount: 50.6, createdAt: new Date(Date.now() - 5 * 60000),
      items: {
        create: [
          { menuItemId: menuItems[0].id, quantity: 1, unitPrice: 14, totalPrice: 14, status: 'PREPARING', station: 'KITCHEN', seatNumber: 1, createdAt: new Date(Date.now() - 5 * 60000) },
          { menuItemId: menuItems[13].id, quantity: 2, unitPrice: 14, totalPrice: 28, status: 'READY', station: 'BAR', seatNumber: 1, firedAt: new Date(Date.now() - 180000), createdAt: new Date(Date.now() - 5 * 60000) },
          { menuItemId: menuItems[4].id, quantity: 1, unitPrice: 42, totalPrice: 42, status: 'PREPARING', station: 'KITCHEN', seatNumber: 2, firedAt: new Date(Date.now() - 600000), notes: 'Medium rare please', createdAt: new Date(Date.now() - 5 * 60000) },
        ]
      }
    }
  });

  // Order 2 — Table 3, 15 min ago (AMBER urgency), items with notes
  const order2 = await prisma.order.create({
    data: {
      tableId: tables[2].id, createdBy: users[7].id, status: 'IN_PROGRESS', type: 'DINE_IN', guestCount: 4,
      subtotal: 136, taxAmount: 13.6, totalAmount: 149.6, createdAt: new Date(Date.now() - 15 * 60000),
      items: {
        create: [
          { menuItemId: menuItems[3].id, quantity: 2, unitPrice: 10, totalPrice: 20, status: 'SERVED', station: 'KITCHEN', seatNumber: 1, createdAt: new Date(Date.now() - 15 * 60000) },
          { menuItemId: menuItems[5].id, quantity: 2, unitPrice: 32, totalPrice: 64, status: 'PREPARING', station: 'KITCHEN', seatNumber: 2, firedAt: new Date(Date.now() - 900000), notes: 'No dill sauce', createdAt: new Date(Date.now() - 15 * 60000) },
          { menuItemId: menuItems[14].id, quantity: 2, unitPrice: 16, totalPrice: 32, status: 'READY', station: 'BAR', seatNumber: 3, firedAt: new Date(Date.now() - 120000), createdAt: new Date(Date.now() - 15 * 60000) },
          { menuItemId: menuItems[25].id, quantity: 1, unitPrice: 10, totalPrice: 10, status: 'READY', station: 'KITCHEN', seatNumber: 4, createdAt: new Date(Date.now() - 15 * 60000) },
        ]
      }
    }
  });

  // Order 3 — Table 4, 8 min ago (GREEN urgency), spaghetti fired
  const order3 = await prisma.order.create({
    data: {
      tableId: tables[3].id, createdBy: users[6].id, status: 'IN_PROGRESS', type: 'DINE_IN', guestCount: 4,
      subtotal: 80, taxAmount: 8, totalAmount: 88, createdAt: new Date(Date.now() - 8 * 60000),
      items: {
        create: [
          { menuItemId: menuItems[0].id, quantity: 2, unitPrice: 14, totalPrice: 28, status: 'SERVED', station: 'KITCHEN', seatNumber: 1, createdAt: new Date(Date.now() - 8 * 60000) },
          { menuItemId: menuItems[7].id, quantity: 1, unitPrice: 22, totalPrice: 22, status: 'FIRED', station: 'KITCHEN', seatNumber: 2, firedAt: new Date(), notes: 'Extra guanciale', createdAt: new Date(Date.now() - 8 * 60000) },
          { menuItemId: menuItems[15].id, quantity: 1, unitPrice: 15, totalPrice: 15, status: 'PREPARING', station: 'BAR', seatNumber: 3, createdAt: new Date(Date.now() - 8 * 60000) },
        ]
      }
    }
  });

  // Order 4 — Table 5, 25 min ago (RED urgency — urgent!)
  const order4 = await prisma.order.create({
    data: {
      tableId: tables[4].id, createdBy: users[7].id, status: 'IN_PROGRESS', type: 'DINE_IN', guestCount: 6,
      subtotal: 220, taxAmount: 22, totalAmount: 242, createdAt: new Date(Date.now() - 25 * 60000), notes: 'VIP guests — priority!',
      items: {
        create: [
          { menuItemId: menuItems[2].id, quantity: 2, unitPrice: 18, totalPrice: 36, status: 'SERVED', station: 'KITCHEN', seatNumber: 1, createdAt: new Date(Date.now() - 25 * 60000) },
          { menuItemId: menuItems[4].id, quantity: 2, unitPrice: 42, totalPrice: 84, status: 'PREPARING', station: 'KITCHEN', seatNumber: 2, firedAt: new Date(Date.now() - 1200000), notes: 'One medium, one well-done', createdAt: new Date(Date.now() - 25 * 60000) },
          { menuItemId: menuItems[5].id, quantity: 1, unitPrice: 32, totalPrice: 32, status: 'PREPARING', station: 'KITCHEN', seatNumber: 3, firedAt: new Date(Date.now() - 600000), createdAt: new Date(Date.now() - 25 * 60000) },
          { menuItemId: menuItems[19].id, quantity: 2, unitPrice: 12, totalPrice: 24, status: 'READY', station: 'BAR', seatNumber: 4, createdAt: new Date(Date.now() - 25 * 60000) },
          { menuItemId: menuItems[15].id, quantity: 2, unitPrice: 15, totalPrice: 30, status: 'PREPARING', station: 'BAR', seatNumber: 5, createdAt: new Date(Date.now() - 25 * 60000) },
          { menuItemId: menuItems[28].id, quantity: 1, unitPrice: 14, totalPrice: 14, status: 'PENDING', station: 'KITCHEN', seatNumber: 6, createdAt: new Date(Date.now() - 25 * 60000) },
        ]
      }
    }
  });

  // Order 5 — Bar Seat 1, 3 min ago (GREEN), all items READY → shows BUMP button
  const order5 = await prisma.order.create({
    data: {
      tableId: tables[10].id, createdBy: users[6].id, status: 'IN_PROGRESS', type: 'DINE_IN', guestCount: 1,
      subtotal: 30, taxAmount: 3, totalAmount: 33, createdAt: new Date(Date.now() - 3 * 60000),
      items: {
        create: [
          { menuItemId: menuItems[14].id, quantity: 1, unitPrice: 16, totalPrice: 16, status: 'READY', station: 'BAR', firedAt: new Date(Date.now() - 60000), readyAt: new Date(Date.now() - 30000), createdAt: new Date(Date.now() - 3 * 60000) },
          { menuItemId: menuItems[0].id, quantity: 1, unitPrice: 14, totalPrice: 14, status: 'READY', station: 'KITCHEN', readyAt: new Date(Date.now() - 15000), createdAt: new Date(Date.now() - 3 * 60000) },
        ]
      }
    }
  });

  // Order 6 — Bar Seat 2, 12 min ago (AMBER), bar items
  const order6 = await prisma.order.create({
    data: {
      tableId: tables[11].id, createdBy: users[7].id, status: 'IN_PROGRESS', type: 'DINE_IN', guestCount: 1,
      subtotal: 29, taxAmount: 2.9, totalAmount: 31.9, createdAt: new Date(Date.now() - 12 * 60000),
      items: {
        create: [
          { menuItemId: menuItems[15].id, quantity: 1, unitPrice: 15, totalPrice: 15, status: 'PREPARING', station: 'BAR', createdAt: new Date(Date.now() - 12 * 60000) },
          { menuItemId: menuItems[17].id, quantity: 1, unitPrice: 14, totalPrice: 14, status: 'PREPARING', station: 'BAR', notes: 'Salt rim, on the rocks', createdAt: new Date(Date.now() - 12 * 60000) },
        ]
      }
    }
  });

  // Order 7 — Table 7, all items SERVED (won't show on KDS)
  const order7 = await prisma.order.create({
    data: {
      tableId: tables[6].id, createdBy: users[6].id, status: 'IN_PROGRESS', type: 'DINE_IN', guestCount: 8,
      subtotal: 380, taxAmount: 38, totalAmount: 418, createdAt: new Date(Date.now() - 45 * 60000),
      items: {
        create: [
          { menuItemId: menuItems[2].id, quantity: 4, unitPrice: 18, totalPrice: 72, status: 'SERVED', station: 'KITCHEN', seatNumber: 1, createdAt: new Date(Date.now() - 45 * 60000) },
          { menuItemId: menuItems[4].id, quantity: 3, unitPrice: 42, totalPrice: 126, status: 'SERVED', station: 'KITCHEN', seatNumber: 2, createdAt: new Date(Date.now() - 45 * 60000) },
          { menuItemId: menuItems[5].id, quantity: 2, unitPrice: 32, totalPrice: 64, status: 'SERVED', station: 'KITCHEN', seatNumber: 3, createdAt: new Date(Date.now() - 45 * 60000) },
          { menuItemId: menuItems[10].id, quantity: 4, unitPrice: 14, totalPrice: 56, status: 'SERVED', station: 'KITCHEN', seatNumber: 4, createdAt: new Date(Date.now() - 45 * 60000) },
          { menuItemId: menuItems[13].id, quantity: 4, unitPrice: 14, totalPrice: 56, status: 'SERVED', station: 'BAR', seatNumber: 5, createdAt: new Date(Date.now() - 45 * 60000) },
          { menuItemId: menuItems[20].id, quantity: 2, unitPrice: 12, totalPrice: 24, status: 'SERVED', station: 'BAR', seatNumber: 6, createdAt: new Date(Date.now() - 45 * 60000) },
        ]
      }
    }
  });

  // Order 8 — Patio 4, 18 min ago (AMBER), large party
  const order8 = await prisma.order.create({
    data: {
      tableId: tables[19].id, createdBy: users[8].id, status: 'IN_PROGRESS', type: 'DINE_IN', guestCount: 8,
      subtotal: 310, taxAmount: 31, totalAmount: 341, createdAt: new Date(Date.now() - 18 * 60000),
      items: {
        create: [
          { menuItemId: menuItems[0].id, quantity: 3, unitPrice: 14, totalPrice: 42, status: 'SERVED', station: 'KITCHEN', seatNumber: 1, createdAt: new Date(Date.now() - 18 * 60000) },
          { menuItemId: menuItems[6].id, quantity: 2, unitPrice: 26, totalPrice: 52, status: 'PREPARING', station: 'KITCHEN', seatNumber: 2, createdAt: new Date(Date.now() - 18 * 60000) },
          { menuItemId: menuItems[8].id, quantity: 2, unitPrice: 20, totalPrice: 40, status: 'PREPARING', station: 'KITCHEN', seatNumber: 3, notes: 'No mushrooms, allergy', createdAt: new Date(Date.now() - 18 * 60000) },
          { menuItemId: menuItems[10].id, quantity: 3, unitPrice: 14, totalPrice: 42, status: 'PENDING', station: 'KITCHEN', seatNumber: 4, createdAt: new Date(Date.now() - 18 * 60000) },
          { menuItemId: menuItems[16].id, quantity: 4, unitPrice: 13, totalPrice: 52, status: 'READY', station: 'BAR', seatNumber: 5, createdAt: new Date(Date.now() - 18 * 60000) },
          { menuItemId: menuItems[22].id, quantity: 4, unitPrice: 9, totalPrice: 36, status: 'SERVED', station: 'BAR', seatNumber: 6, createdAt: new Date(Date.now() - 18 * 60000) },
        ]
      }
    }
  });

  // Order 9 — Patio 1, just now (GREEN), brand new order
  const order9 = await prisma.order.create({
    data: {
      tableId: tables[16].id, createdBy: users[8].id, status: 'IN_PROGRESS', type: 'DINE_IN', guestCount: 4,
      subtotal: 112, taxAmount: 11.2, totalAmount: 123.2,
      items: {
        create: [
          { menuItemId: menuItems[1].id, quantity: 2, unitPrice: 12, totalPrice: 24, status: 'PENDING', station: 'KITCHEN', seatNumber: 1 },
          { menuItemId: menuItems[9].id, quantity: 2, unitPrice: 24, totalPrice: 48, status: 'PENDING', station: 'KITCHEN', seatNumber: 2, notes: 'Extra crispy batter' },
          { menuItemId: menuItems[16].id, quantity: 2, unitPrice: 13, totalPrice: 26, status: 'PENDING', station: 'BAR', seatNumber: 3 },
          { menuItemId: menuItems[26].id, quantity: 1, unitPrice: 14, totalPrice: 14, status: 'PENDING', station: 'KITCHEN', seatNumber: 4 },
        ]
      }
    }
  });

  // Order 10 — Bar Seat 5, 35 min ago (RED — very urgent), bar-only items
  const order10 = await prisma.order.create({
    data: {
      tableId: tables[14].id, createdBy: users[6].id, status: 'IN_PROGRESS', type: 'DINE_IN', guestCount: 1,
      subtotal: 45, taxAmount: 4.5, totalAmount: 49.5, createdAt: new Date(Date.now() - 35 * 60000),
      items: {
        create: [
          { menuItemId: menuItems[13].id, quantity: 2, unitPrice: 14, totalPrice: 28, status: 'PREPARING', station: 'BAR', firedAt: new Date(Date.now() - 1200000), createdAt: new Date(Date.now() - 35 * 60000) },
          { menuItemId: menuItems[24].id, quantity: 1, unitPrice: 5, totalPrice: 5, status: 'PENDING', station: 'BAR', notes: 'Double shot', createdAt: new Date(Date.now() - 35 * 60000) },
          { menuItemId: menuItems[12].id, quantity: 1, unitPrice: 12, totalPrice: 12, status: 'READY', station: 'KITCHEN', readyAt: new Date(), createdAt: new Date(Date.now() - 35 * 60000) },
        ]
      }
    }
  });

  console.log('  ✅ Created 10 active orders with items');

  // ===== CLOCK LOGS =====
  const clockInTime = new Date(today);
  clockInTime.setHours(10, 0, 0);
  await Promise.all([
    prisma.clockLog.create({ data: { userId: users[1].id, action: 'IN', timestamp: new Date(today.getTime() + 16 * 3600000) } }),
    prisma.clockLog.create({ data: { userId: users[2].id, action: 'IN', timestamp: new Date(today.getTime() + 8 * 3600000) } }),
    prisma.clockLog.create({ data: { userId: users[3].id, action: 'IN', timestamp: new Date(today.getTime() + 16 * 3600000) } }),
    prisma.clockLog.create({ data: { userId: users[4].id, action: 'IN', timestamp: new Date(today.getTime() + 16 * 3600000) } }),
    prisma.clockLog.create({ data: { userId: users[6].id, action: 'IN', timestamp: new Date(today.getTime() + 16 * 3600000) } }),
    prisma.clockLog.create({ data: { userId: users[7].id, action: 'IN', timestamp: new Date(today.getTime() + 16 * 3600000) } }),
    prisma.clockLog.create({ data: { userId: users[8].id, action: 'IN', timestamp: new Date(today.getTime() + 10 * 3600000) } }),
    prisma.clockLog.create({ data: { userId: users[9].id, action: 'IN', timestamp: new Date(today.getTime() + 10 * 3600000) } }),
  ]);
  console.log('  ✅ Created clock logs');

  // ===== WASTAGE LOGS (this week) =====
  await Promise.all([
    prisma.wastageLog.create({ data: { ingredientId: ingredients[0].id, quantity: 0.5, reason: 'SPOILED', reportedBy: users[2].id, value: 16, notes: 'Left out too long', createdAt: new Date(Date.now() - 1 * 86400000) } }),
    prisma.wastageLog.create({ data: { ingredientId: ingredients[7].id, quantity: 3, reason: 'EXPIRED', reportedBy: users[3].id, value: 7.5, createdAt: new Date(Date.now() - 2 * 86400000) } }),
    prisma.wastageLog.create({ data: { ingredientId: ingredients[19].id, quantity: 0.5, reason: 'SPILLED', reportedBy: users[4].id, value: 3, notes: 'Knocked over during rush', createdAt: new Date(Date.now() - 2 * 86400000) } }),
    prisma.wastageLog.create({ data: { ingredientId: ingredients[5].id, quantity: 1, reason: 'EXPIRED', reportedBy: users[2].id, value: 6, createdAt: new Date(Date.now() - 3 * 86400000) } }),
    prisma.wastageLog.create({ data: { ingredientId: ingredients[15].id, quantity: 0.3, reason: 'SPILLED', reportedBy: users[4].id, value: 9, notes: 'Dropped bottle at bar', createdAt: new Date(Date.now() - 3 * 86400000) } }),
    prisma.wastageLog.create({ data: { ingredientId: ingredients[8].id, quantity: 2, reason: 'SPOILED', reportedBy: users[3].id, value: 8, notes: 'Overripe, unusable', createdAt: new Date(Date.now() - 4 * 86400000) } }),
    prisma.wastageLog.create({ data: { ingredientId: ingredients[26].id, quantity: 1, reason: 'DAMAGED', reportedBy: users[6].id, value: 16, notes: 'Dropped during prep', createdAt: new Date(Date.now() - 5 * 86400000) } }),
    prisma.wastageLog.create({ data: { ingredientId: ingredients[1].id, quantity: 0.8, reason: 'COMPED', reportedBy: users[1].id, value: 22.4, notes: 'VIP table - wrong preparation', createdAt: new Date(Date.now() - 5 * 86400000) } }),
    prisma.wastageLog.create({ data: { ingredientId: ingredients[10].id, quantity: 0.3, reason: 'OTHER', reportedBy: users[2].id, value: 2.4, notes: 'Miscounted during inventory', createdAt: new Date(Date.now() - 6 * 86400000) } }),
  ]);
  console.log('  ✅ Created wastage logs');

  // ===== DAILY SNAPSHOTS (last 7 days) =====
  for (let d = 6; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const base = 3000 + Math.random() * 2000;
    await prisma.dailySnapshot.create({
      data: {
        date,
        totalRevenue: Math.round(base * 100) / 100,
        totalOrders: Math.round(20 + Math.random() * 25),
        avgOrderValue: Math.round(base / (20 + Math.random() * 25) * 100) / 100,
        laborCost: Math.round(base * 0.28 * 100) / 100,
        laborPercent: 28,
        foodCost: Math.round(base * 0.32 * 100) / 100,
        seatTurnoverRate: Math.round((1.5 + Math.random() * 1.5) * 100) / 100,
        inventoryValue: Math.round(8000 + Math.random() * 4000),
        wastageValue: Math.round(50 + Math.random() * 100),
        guestCount: Math.round(60 + Math.random() * 40),
      }
    });
  }
  console.log('  ✅ Created 7 daily snapshots');

  // ===== STOCK LEDGER ENTRIES =====
  for (const ing of ingredients.slice(0, 10)) {
    await prisma.stockLedger.create({
      data: { ingredientId: ing.id, change: ing.currentStock, reason: 'RESTOCK', notes: 'Initial stock' }
    });
  }
  console.log('  ✅ Created stock ledger entries');

  // ===== PURCHASE ORDERS =====
  const po1 = await prisma.purchaseOrder.create({
    data: {
      vendorId: vendors[0].id, status: 'DELIVERED', totalAmount: 245, orderedAt: new Date(today.getTime() - 3 * 86400000), deliveredAt: new Date(today.getTime() - 2 * 86400000),
      items: {
        create: [
          { ingredientId: ingredients[7].id, quantity: 20, unitPrice: 2.5, totalPrice: 50 },
          { ingredientId: ingredients[8].id, quantity: 10, unitPrice: 4, totalPrice: 40 },
          { ingredientId: ingredients[9].id, quantity: 40, unitPrice: 0.5, totalPrice: 20 },
          { ingredientId: ingredients[19].id, quantity: 5, unitPrice: 6, totalPrice: 30 },
        ]
      }
    }
  });

  const po2 = await prisma.purchaseOrder.create({
    data: {
      vendorId: vendors[1].id, status: 'SENT', totalAmount: 520, orderedAt: new Date(today.getTime() - 86400000),
      items: {
        create: [
          { ingredientId: ingredients[0].id, quantity: 10, unitPrice: 32, totalPrice: 320 },
          { ingredientId: ingredients[1].id, quantity: 5, unitPrice: 28, totalPrice: 140 },
          { ingredientId: ingredients[2].id, quantity: 10, unitPrice: 14, totalPrice: 140 },
        ]
      }
    }
  });

  const po3 = await prisma.purchaseOrder.create({
    data: {
      vendorId: vendors[3].id, status: 'DRAFT', totalAmount: 360,
      items: {
        create: [
          { ingredientId: ingredients[13].id, quantity: 6, unitPrice: 18, totalPrice: 108 },
          { ingredientId: ingredients[14].id, quantity: 4, unitPrice: 22, totalPrice: 88 },
          { ingredientId: ingredients[17].id, quantity: 8, unitPrice: 3, totalPrice: 24 },
          { ingredientId: ingredients[18].id, quantity: 10, unitPrice: 10, totalPrice: 100 },
        ]
      }
    }
  });

  const po4 = await prisma.purchaseOrder.create({
    data: {
      vendorId: vendors[2].id, status: 'CONFIRMED', totalAmount: 285, orderedAt: new Date(today.getTime() - 2 * 86400000),
      items: {
        create: [
          { ingredientId: ingredients[4].id, quantity: 10, unitPrice: 12, totalPrice: 120 },
          { ingredientId: ingredients[5].id, quantity: 8, unitPrice: 6, totalPrice: 48 },
          { ingredientId: ingredients[6].id, quantity: 3, unitPrice: 22, totalPrice: 66 },
          { ingredientId: ingredients[20].id, quantity: 30, unitPrice: 0.35, totalPrice: 10.5 },
          { ingredientId: ingredients[29].id, quantity: 10, unitPrice: 2, totalPrice: 20 },
        ]
      }
    }
  });

  const po5 = await prisma.purchaseOrder.create({
    data: {
      vendorId: vendors[0].id, status: 'CANCELLED', totalAmount: 150, notes: 'Vendor could not fulfill - substituted with PO from Pacific Spirits',
      items: {
        create: [
          { ingredientId: ingredients[25].id, quantity: 10, unitPrice: 3.5, totalPrice: 35 },
          { ingredientId: ingredients[8].id, quantity: 8, unitPrice: 4, totalPrice: 32 },
        ]
      }
    }
  });
  console.log('  ✅ Created purchase orders');

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
