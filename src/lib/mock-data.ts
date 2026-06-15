import { TableStatus, TableSection, TableShape } from '@prisma/client';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  pin: string;
  role: string;
  avatarUrl?: string | null;
  phone?: string | null;
  active: boolean;
}

export interface MockMenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  cost: number;
  type: string;
  station: string;
  prepTime: number;
  isAvailable: boolean;
  isPopular: boolean;
  imageUrl: string | null;
  allergies: string | null;
  spiceLevel: number;
}

export interface MockTable {
  id: string;
  number: number;
  name: string;
  capacity: number;
  status: string;
  x: number;
  y: number;
  width: number;
  height: number;
  section: string;
  shape: string;
  serverId: string | null;
  customerId: string | null;
  active: boolean;
  server?: MockUser | null;
  orders: any[];
  reservations: any[];
}

export const MOCK_USERS: MockUser[] = [
  { id: 'cmpwrzrqc0000j7hw4g7fhh34', email: 'admin@thebar.com', name: 'Marco Rossi', pin: '1001', role: 'ADMIN', active: true, phone: '+1-555-0100' },
  { id: 'cmpwrzrqe0002j7hwnykw2ts2', email: 'manager@thebar.com', name: 'Sarah Chen', pin: '2001', role: 'MANAGER', active: true, phone: '+1-555-0200' },
  { id: 'cmpwrzrqe0001j7hwp1uvn8nq', email: 'chef@thebar.com', name: 'Antoine Dubois', pin: '3001', role: 'KITCHEN', active: true, phone: '+1-555-0300' },
  { id: 'cmpwrzrqh0006j7hwdh9y6x9x', email: 'bartender@thebar.com', name: 'Jake Morrison', pin: '4001', role: 'BAR', active: true, phone: '+1-555-0400' },
  { id: 'cmpwrzrqg0004j7hw0pxtsaip', email: 'server1@thebar.com', name: 'Emma Wilson', pin: '5001', role: 'FOH', active: true, phone: '+1-555-0500' },
];

export const MOCK_TABLES: MockTable[] = [
  // Main Dining Section
  { id: 'tbl-1', number: 1, name: 'Table 1', capacity: 2, status: 'FREE', x: 0, y: 0, width: 1, height: 1, section: 'MAIN', shape: 'ROUND', serverId: null, customerId: null, active: true, orders: [], reservations: [] },
  { id: 'tbl-2', number: 2, name: 'Table 2', capacity: 2, status: 'SEATED', x: 2, y: 0, width: 1, height: 1, section: 'MAIN', shape: 'ROUND', serverId: null, customerId: null, active: true, orders: [], reservations: [] },
  { id: 'tbl-3', number: 3, name: 'Table 3', capacity: 4, status: 'ORDER_PLACED', x: 4, y: 0, width: 1, height: 1, section: 'MAIN', shape: 'SQUARE', serverId: null, customerId: null, active: true, orders: [], reservations: [] },
  { id: 'tbl-4', number: 4, name: 'Table 4', capacity: 4, status: 'APPETIZER', x: 0, y: 2, width: 1, height: 1, section: 'MAIN', shape: 'SQUARE', serverId: null, customerId: null, active: true, orders: [], reservations: [] },
  { id: 'tbl-5', number: 5, name: 'Table 5', capacity: 6, status: 'MAIN', x: 2, y: 2, width: 2, height: 1, section: 'MAIN', shape: 'RECTANGLE', serverId: null, customerId: null, active: true, orders: [], reservations: [] },
  { id: 'tbl-6', number: 6, name: 'Table 6', capacity: 6, status: 'FREE', x: 4, y: 2, width: 2, height: 1, section: 'MAIN', shape: 'RECTANGLE', serverId: null, customerId: null, active: true, orders: [], reservations: [] },
  { id: 'tbl-7', number: 7, name: 'Table 7', capacity: 8, status: 'BILL_REQUESTED', x: 0, y: 4, width: 2, height: 1, section: 'MAIN', shape: 'RECTANGLE', serverId: null, customerId: null, active: true, orders: [], reservations: [] },
  { id: 'tbl-8', number: 8, name: 'Table 8', capacity: 4, status: 'DIRTY', x: 2, y: 4, width: 1, height: 1, section: 'MAIN', shape: 'SQUARE', serverId: null, customerId: null, active: true, orders: [], reservations: [] },
  { id: 'tbl-9', number: 9, name: 'Table 9', capacity: 4, status: 'FREE', x: 4, y: 4, width: 1, height: 1, section: 'MAIN', shape: 'SQUARE', serverId: null, customerId: null, active: true, orders: [], reservations: [] },
  { id: 'tbl-10', number: 10, name: 'Table 10', capacity: 2, status: 'RESERVED', x: 6, y: 0, width: 1, height: 1, section: 'MAIN', shape: 'ROUND', serverId: null, customerId: null, active: true, orders: [], reservations: [] },
  
  // Bar Section
  { id: 'tbl-11', number: 11, name: 'Bar Seat 1', capacity: 1, status: 'SEATED', x: 0, y: 0, width: 1, height: 1, section: 'BAR', shape: 'ROUND', serverId: null, customerId: null, active: true, orders: [], reservations: [] },
  { id: 'tbl-12', number: 12, name: 'Bar Seat 2', capacity: 1, status: 'ORDER_PLACED', x: 1, y: 0, width: 1, height: 1, section: 'BAR', shape: 'ROUND', serverId: null, customerId: null, active: true, orders: [], reservations: [] },
  { id: 'tbl-13', number: 13, name: 'Bar Seat 3', capacity: 1, status: 'FREE', x: 2, y: 0, width: 1, height: 1, section: 'BAR', shape: 'ROUND', serverId: null, customerId: null, active: true, orders: [], reservations: [] },
  { id: 'tbl-14', number: 14, name: 'Bar Seat 4', capacity: 1, status: 'FREE', x: 3, y: 0, width: 1, height: 1, section: 'BAR', shape: 'ROUND', serverId: null, customerId: null, active: true, orders: [], reservations: [] },
  { id: 'tbl-15', number: 15, name: 'Bar Seat 5', capacity: 1, status: 'SEATED', x: 4, y: 0, width: 1, height: 1, section: 'BAR', shape: 'ROUND', serverId: null, customerId: null, active: true, orders: [], reservations: [] },
  { id: 'tbl-16', number: 16, name: 'Bar Seat 6', capacity: 1, status: 'FREE', x: 5, y: 0, width: 1, height: 1, section: 'BAR', shape: 'ROUND', serverId: null, customerId: null, active: true, orders: [], reservations: [] },
  
  // Patio Section
  { id: 'tbl-17', number: 17, name: 'Patio 1', capacity: 4, status: 'FREE', x: 0, y: 0, width: 1, height: 1, section: 'PATIO', shape: 'ROUND', serverId: null, customerId: null, active: true, orders: [], reservations: [] },
  { id: 'tbl-18', number: 18, name: 'Patio 2', capacity: 4, status: 'RESERVED', x: 2, y: 0, width: 1, height: 1, section: 'PATIO', shape: 'ROUND', serverId: null, customerId: null, active: true, orders: [], reservations: [] },
  { id: 'tbl-19', number: 19, name: 'Patio 3', capacity: 6, status: 'FREE', x: 4, y: 0, width: 2, height: 1, section: 'PATIO', shape: 'RECTANGLE', serverId: null, customerId: null, active: true, orders: [], reservations: [] },
  { id: 'tbl-20', number: 20, name: 'Patio 4', capacity: 8, status: 'SEATED', x: 0, y: 2, width: 2, height: 1, section: 'PATIO', shape: 'RECTANGLE', serverId: null, customerId: null, active: true, orders: [], reservations: [] },
  
  // VIP Section
  { id: 'tbl-21', number: 21, name: 'VIP Booth 1', capacity: 6, status: 'FREE', x: 0, y: 0, width: 2, height: 1, section: 'VIP', shape: 'RECTANGLE', serverId: null, customerId: null, active: true, orders: [], reservations: [] },
  { id: 'tbl-22', number: 22, name: 'VIP Booth 2', capacity: 8, status: 'RESERVED', x: 2, y: 0, width: 2, height: 1, section: 'VIP', shape: 'RECTANGLE', serverId: null, customerId: null, active: true, orders: [], reservations: [] },
];

export const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'Starters', icon: 'Salad', sortOrder: 0, active: true },
  { id: 'cat-2', name: 'Mains', icon: 'UtensilsCrossed', sortOrder: 1, active: true },
  { id: 'cat-3', name: 'Desserts', icon: 'Cake', sortOrder: 2, active: true },
  { id: 'cat-4', name: 'Cocktails', icon: 'Wine', sortOrder: 3, active: true },
];

export const MOCK_MENU_ITEMS: MockMenuItem[] = [
  { id: 'mi-1', categoryId: 'cat-1', name: 'Caesar Salad', description: 'Crisp romaine, parmesan, croutons, anchovy dressing', price: 14, cost: 3.5, type: 'APPETIZER', station: 'KITCHEN', prepTime: 8, isAvailable: true, isPopular: true, imageUrl: null, allergies: 'dairy,fish,gluten', spiceLevel: 0 },
  { id: 'mi-2', categoryId: 'cat-1', name: 'Bruschetta', description: 'Toasted sourdough, vine tomatoes, fresh basil, balsamic glaze', price: 12, cost: 2.5, type: 'APPETIZER', station: 'KITCHEN', prepTime: 7, isAvailable: true, isPopular: false, imageUrl: null, allergies: 'gluten', spiceLevel: 0 },
  { id: 'mi-3', categoryId: 'cat-2', name: 'Grilled Ribeye', description: '12oz prime ribeye, truffle mash, seasonal vegetables, red wine jus', price: 42, cost: 16, type: 'FOOD', station: 'KITCHEN', prepTime: 25, isAvailable: true, isPopular: true, imageUrl: null, allergies: 'dairy', spiceLevel: 0 },
  { id: 'mi-4', categoryId: 'cat-2', name: 'Pan-Seared Salmon', description: 'Atlantic salmon, dill cream sauce, roasted potatoes, asparagus', price: 32, cost: 11, type: 'FOOD', station: 'KITCHEN', prepTime: 18, isAvailable: true, isPopular: true, imageUrl: null, allergies: 'dairy,fish', spiceLevel: 0 },
  { id: 'mi-5', categoryId: 'cat-3', name: 'Chocolate Lava Cake', description: 'Warm dark chocolate fondant, vanilla ice cream', price: 14, cost: 3.5, type: 'DESSERT', station: 'KITCHEN', prepTime: 12, isAvailable: true, isPopular: true, imageUrl: null, allergies: 'dairy,eggs,gluten', spiceLevel: 0 },
  { id: 'mi-6', categoryId: 'cat-4', name: 'Classic Mojito', description: 'White rum, fresh mint, lime, sugar, soda water', price: 14, cost: 3, type: 'DRINK', station: 'BAR', prepTime: 3, isAvailable: true, isPopular: true, imageUrl: null, allergies: null, spiceLevel: 0 },
];

export const MOCK_DASHBOARD = {
  todaySnapshot: null,
  weekSnapshots: [],
  activeOrders: 3,
  todayRevenue: 465.5,
  yesterdayRevenue: 380,
  revenueChange: 22.5,
  totalTables: 22,
  occupiedTables: 5,
  occupancyRate: 22,
  topItems: [
    { menuItemId: "mi-1", quantity: 12, totalPrice: 168, name: "Caesar Salad" },
    { menuItemId: "mi-3", quantity: 8, totalPrice: 336, name: "Grilled Ribeye" }
  ],
  lowStockCount: 2,
  lowStockItems: [
    { id: "ing-1", name: "Salmon Fillet", currentStock: 2.5, minStock: 3, unit: "KG" },
    { id: "ing-2", name: "Heavy Cream", currentStock: 1.5, minStock: 2, unit: "L" }
  ],
  todayShifts: 4,
  clockedIn: 3,
  recentActivity: [
    {
      id: "act-1",
      type: "order",
      description: "Order placed at Table 5 by Sarah Chen — $84.00",
      time: "10 min ago",
      createdAt: new Date().toISOString(),
      metadata: { tableName: "Table 5", creatorName: "Sarah Chen", totalAmount: 84 }
    },
    {
      id: "act-2",
      type: "reservation",
      description: "Reservation for Emma Watson — 4 guests at 19:30",
      time: "45 min ago",
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      metadata: { guestName: "Emma Watson", partySize: 4, reservationTime: "19:30" }
    }
  ],
  dailyOrders: []
};
