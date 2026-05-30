export type TranslationKey = string;

export interface Translations {
  // ─── Common ───
  common: {
    loading: string;
    retry: string;
    refresh: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    search: string;
    filter: string;
    all: string;
    notes: string;
    noData: string;
    error: string;
    success: string;
    yes: string;
    no: string;
    back: string;
    next: string;
    previous: string;
    actions: string;
    status: string;
    active: string;
    inactive: string;
    pending: string;
    completed: string;
    cancelled: string;
    total: string;
    subtotal: string;
    tax: string;
    totalAmount: string;
    date: string;
    time: string;
    name: string;
    email: string;
    phone: string;
    description: string;
    quantity: string;
    price: string;
    unit: string;
    notesOptional: string;
    details: string;
    updating: string;
    noResults: string;
  };

  // ─── Auth / Role Selection ───
  auth: {
    restaurantName: string;
    managementSystem: string;
    selectRole: string;
    demoMode: string;
    switchRole: string;
    signOut: string;
  };

  // ─── Role Labels ───
  roles: {
    admin: string;
    manager: string;
    kitchen: string;
    bar: string;
    foh: string;
  };

  // ─── Navigation ───
  nav: {
    dashboard: string;
    floorPlan: string;
    pos: string;
    kds: string;
    reservations: string;
    inventory: string;
    staff: string;
    crm: string;
  };

  // ─── Dashboard ───
  dashboard: {
    title: string;
    realtimeOverview: string;
    todaysRevenue: string;
    vsYesterday: string;
    activeOrders: string;
    tableOccupancy: string;
    tables: string;
    staffOnShift: string;
    scheduledToday: string;
    sevenDayRevenue: string;
    topSellingItems: string;
    recentActivity: string;
    noRecentActivity: string;
    costBreakdown: string;
    laborCost: string;
    foodCost: string;
    other: string;
    inventoryAlerts: string;
    lowStockItems: string;
    critical: string;
    low: string;
    allStockOk: string;
    loadingDashboard: string;
    failedToLoad: string;
    revenue: string;
    qtySold: string;
  };

  // ─── Floor Plan ───
  floorPlan: {
    title: string;
    lastUpdated: string;
    refreshing: string;
    totalTables: string;
    occupied: string;
    free: string;
    reserved: string;
    needsCleaning: string;
    changeStatus: string;
    currentOrder: string;
    noActiveOrder: string;
    startOrderToBegin: string;
    continueOrder: string;
    startOrder: string;
    reservation: string;
    clearTable: string;
    upcomingReservation: string;
    seats: string;
    orderTotal: string;
    server: string;
    guest: string;
    guests: string;
    loadingFloorPlan: string;
    failedToLoad: string;
    // Sections
    mainDining: string;
    bar: string;
    patio: string;
    vip: string;
    // Table statuses
    statusFree: string;
    statusReserved: string;
    statusSeated: string;
    statusOrderPlaced: string;
    statusAppetizer: string;
    statusMain: string;
    statusDessert: string;
    statusBillRequested: string;
    statusDirty: string;
    // Edit table
    editTable: string;
    tableName: string;
    capacity: string;
    assignServer: string;
    noServer: string;
    removeServer: string;
    tableSection: string;
    tableShape: string;
    saveChanges: string;
    dragToReorder: string;
    tableUpdated: string;
    failedToUpdateTable: string;
  };

  // ─── POS ───
  pos: {
    newOrder: string;
    activeOrders: string;
    currentOrder: string;
    editOrder: string;
    table: string;
    selectTable: string;
    guests: string;
    seat: string;
    searchMenu: string;
    noItemsFound: string;
    tryDifferentSearch: string;
    noItemsYet: string;
    clickMenuToAdd: string;
    each: string;
    specialNotes: string;
    popular: string;
    // Item statuses
    pending: string;
    fired: string;
    preparing: string;
    ready: string;
    served: string;
    // Order statuses
    inProgress: string;
    // Actions
    fireOrder: string;
    clearOrder: string;
    splitBill: string;
    payNow: string;
    holdOrder: string;
    // Split bill
    splitBySeat: string;
    splitByItem: string;
    splitEqually: string;
    guest: string;
    // Confirm
    confirmFireTitle: string;
    confirmFireDesc: string;
    confirmCancelTitle: string;
    confirmCancelDesc: string;
    orderFired: string;
    orderFailed: string;
    stationKitchen: string;
    stationBar: string;
    editOrderBtn: string;
  };

  // ─── KDS ───
  kds: {
    title: string;
    kitchenDisplay: string;
    barDisplay: string;
    allStations: string;
    noTickets: string;
    allCaughtUp: string;
    markReady: string;
    markServed: string;
    bump: string;
    orderFor: string;
    itemsCount: string;
    elapsed: string;
    minutes: string;
    seconds: string;
  };

  // ─── Reservations ───
  reservations: {
    title: string;
    newReservation: string;
    editReservation: string;
    guestName: string;
    partySize: string;
    date: string;
    time: string;
    notes: string;
    phone: string;
    status: string;
    confirmed: string;
    pending: string;
    seated: string;
    cancelled: string;
    noShow: string;
    waitlist: string;
    addToWaitlist: string;
    estimatedWait: string;
    minutes: string;
    todayReservations: string;
    upcomingReservations: string;
    pastReservations: string;
  };

  // ─── Inventory ───
  inventory: {
    title: string;
    totalInventoryValue: string;
    lowStockAlerts: string;
    wastageThisWeek: string;
    activePurchaseOrders: string;
    stock: string;
    wastage: string;
    purchaseOrders: string;
    searchIngredients: string;
    lowStock: string;
    allCategories: string;
    allLocations: string;
    ingredient: string;
    stockLevel: string;
    costPerUnit: string;
    storage: string;
    vendor: string;
    adjustStockLevel: string;
    updateStockFor: string;
    currentStock: string;
    newStockLevel: string;
    change: string;
    min: string;
    max: string;
    logWastage: string;
    recordWastage: string;
    selectIngredient: string;
    reason: string;
    autoCalculatedValue: string;
    generatePO: string;
    suggestReorder: string;
    noIngredientsFound: string;
    tryAdjusting: string;
    showing: string;
    of: string;
    ingredients: string;
    wastageLog: string;
    noWastageLogged: string;
    notOrderedYet: string;
    // Categories
    produce: string;
    meat: string;
    dairy: string;
    dryGoods: string;
    beverages: string;
    other: string;
    // Storage locations
    fridge: string;
    freezer: string;
    dryStorage: string;
    bar: string;
    // Stock updated messages
    stockUpdated: string;
    failedToUpdateStock: string;
    draftPOCreated: string;
    failedToCreatePO: string;
    noVendorAssigned: string;
  };

  // ─── Staff ───
  staff: {
    title: string;
    staffRota: string;
    todayShift: string;
    clockedIn: string;
    onBreak: string;
    clockIn: string;
    clockOut: string;
    startBreak: string;
    endBreak: string;
    shiftSchedule: string;
    addShift: string;
    editShift: string;
    startTime: string;
    endTime: string;
    role: string;
    tips: string;
    tipDistribution: string;
    totalTips: string;
    distribute: string;
    hoursWorked: string;
    hourlyRate: string;
    noStaffOnShift: string;
  };

  // ─── CRM ───
  crm: {
    title: string;
    guestProfiles: string;
    totalGuests: string;
    vipGuests: string;
    newThisMonth: string;
    averageSpend: string;
    loyaltyPoints: string;
    visitHistory: string;
    preferences: string;
    allergies: string;
    addNote: string;
    lastVisit: string;
    totalVisits: string;
    totalSpent: string;
    noGuestsFound: string;
    searchGuests: string;
  };

  // ─── Footer ───
  footer: {
    copyright: string;
    version: string;
  };
}

/* ─── English (UK) — Base ─── */
export const enGB: Translations = {
  common: {
    loading: 'Loading...',
    retry: 'Retry',
    refresh: 'Refresh',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    notes: 'Notes',
    noData: 'No data available',
    error: 'Error',
    success: 'Success',
    yes: 'Yes',
    no: 'No',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    actions: 'Actions',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'Tax',
    totalAmount: 'Total',
    date: 'Date',
    time: 'Time',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    description: 'Description',
    quantity: 'Quantity',
    price: 'Price',
    unit: 'Unit',
    notesOptional: 'Notes (optional)',
    details: 'Details',
    updating: 'Updating...',
    noResults: 'No results found',
  },
  auth: {
    restaurantName: 'The Gilded Fork',
    managementSystem: 'Management System',
    selectRole: 'Select your role to continue',
    demoMode: 'Demo mode — No password required. Click any role to enter.',
    switchRole: 'Switch Role',
    signOut: 'Sign Out',
  },
  roles: {
    admin: 'Admin / Owner',
    manager: 'Manager',
    kitchen: 'Kitchen Staff',
    bar: 'Bar Staff',
    foh: 'Front of House',
  },
  nav: {
    dashboard: 'Dashboard',
    floorPlan: 'Floor Plan',
    pos: 'POS / Orders',
    kds: 'Kitchen / Bar',
    reservations: 'Reservations',
    inventory: 'Inventory',
    staff: 'Staff / Rota',
    crm: 'CRM / Guests',
  },
  dashboard: {
    title: 'Dashboard',
    realtimeOverview: 'Real-time overview',
    todaysRevenue: "Today's Revenue",
    vsYesterday: 'vs yesterday',
    activeOrders: 'Active Orders',
    tableOccupancy: 'Table Occupancy',
    tables: 'tables',
    staffOnShift: 'Staff On Shift',
    scheduledToday: 'scheduled today',
    sevenDayRevenue: '7-Day Revenue',
    topSellingItems: 'Top Selling Items',
    recentActivity: 'Recent Activity',
    noRecentActivity: 'No recent activity',
    costBreakdown: 'Cost Breakdown',
    laborCost: 'Labor Cost',
    foodCost: 'Food Cost',
    other: 'Other',
    inventoryAlerts: 'Inventory Alerts',
    lowStockItems: 'Low Stock Items',
    critical: 'Critical',
    low: 'Low',
    allStockOk: 'All stock levels OK',
    loadingDashboard: 'Loading dashboard...',
    failedToLoad: 'Failed to load dashboard',
    revenue: 'Revenue',
    qtySold: 'Qty Sold',
  },
  floorPlan: {
    title: 'Floor Plan',
    lastUpdated: 'Last updated',
    refreshing: 'Refreshing...',
    totalTables: 'Total Tables',
    occupied: 'Occupied',
    free: 'Free',
    reserved: 'Reserved',
    needsCleaning: 'Needs Cleaning',
    changeStatus: 'Change Status',
    currentOrder: 'Current Order',
    noActiveOrder: 'No active order',
    startOrderToBegin: 'Start an order to begin service',
    continueOrder: 'Continue Order',
    startOrder: 'Start Order',
    reservation: 'Reservation',
    clearTable: 'Clear Table',
    upcomingReservation: 'Upcoming Reservation',
    seats: 'seats',
    orderTotal: 'Order Total',
    server: 'Server',
    guest: 'guest',
    guests: 'guests',
    loadingFloorPlan: 'Loading floor plan...',
    failedToLoad: 'Failed to load floor plan',
    mainDining: 'Main Dining',
    bar: 'Bar',
    patio: 'Patio',
    vip: 'VIP',
    statusFree: 'Free',
    statusReserved: 'Reserved',
    statusSeated: 'Seated',
    statusOrderPlaced: 'Order Placed',
    statusAppetizer: 'Appetizer',
    statusMain: 'Main Course',
    statusDessert: 'Dessert',
    statusBillRequested: 'Bill Requested',
    statusDirty: 'Needs Cleaning',
    editTable: 'Edit Table',
    tableName: 'Table Name',
    capacity: 'Capacity',
    assignServer: 'Assign Server',
    noServer: 'No server assigned',
    removeServer: 'Remove server',
    tableSection: 'Section',
    tableShape: 'Shape',
    saveChanges: 'Save Changes',
    dragToReorder: 'Drag to reorder',
    tableUpdated: 'Table updated',
    failedToUpdateTable: 'Failed to update table',
  },
  pos: {
    newOrder: 'New Order',
    activeOrders: 'Active Orders',
    currentOrder: 'Current Order',
    editOrder: 'Edit Order',
    table: 'Table',
    selectTable: 'Select table...',
    guests: 'Guests',
    seat: 'Seat',
    searchMenu: 'Search menu items...',
    noItemsFound: 'No items found',
    tryDifferentSearch: 'Try a different search or category',
    noItemsYet: 'No items yet',
    clickMenuToAdd: 'Click menu items to add',
    each: 'each',
    specialNotes: 'Special notes...',
    popular: 'Popular',
    pending: 'Pending',
    fired: 'Fired',
    preparing: 'Prep',
    ready: 'Ready',
    served: 'Served',
    inProgress: 'In Progress',
    fireOrder: 'Fire Order',
    clearOrder: 'Clear',
    splitBill: 'Split Bill',
    payNow: 'Pay Now',
    holdOrder: 'Hold',
    splitBySeat: 'By Seat',
    splitByItem: 'By Item',
    splitEqually: 'Equally',
    guest: 'Guest',
    confirmFireTitle: 'Send order to kitchen?',
    confirmFireDesc: 'This will send all items to their respective stations for preparation.',
    confirmCancelTitle: 'Cancel order?',
    confirmCancelDesc: 'This will remove all items from the current order. This action cannot be undone.',
    orderFired: 'Order fired',
    orderFailed: 'Failed to create order',
    stationKitchen: 'KITCHEN',
    stationBar: 'BAR',
    editOrderBtn: 'Edit Order',
  },
  kds: {
    title: 'Kitchen / Bar Display',
    kitchenDisplay: 'Kitchen',
    barDisplay: 'Bar',
    allStations: 'All',
    noTickets: 'No tickets',
    allCaughtUp: 'All caught up!',
    markReady: 'Ready',
    markServed: 'Served',
    bump: 'Bump',
    orderFor: 'Order for',
    itemsCount: 'items',
    elapsed: 'elapsed',
    minutes: 'min',
    seconds: 's',
  },
  reservations: {
    title: 'Reservations',
    newReservation: 'New Reservation',
    editReservation: 'Edit Reservation',
    guestName: 'Guest Name',
    partySize: 'Party Size',
    date: 'Date',
    time: 'Time',
    notes: 'Notes',
    phone: 'Phone',
    status: 'Status',
    confirmed: 'Confirmed',
    pending: 'Pending',
    seated: 'Seated',
    cancelled: 'Cancelled',
    noShow: 'No Show',
    waitlist: 'Waitlist',
    addToWaitlist: 'Add to Waitlist',
    estimatedWait: 'Est. Wait',
    minutes: 'min',
    todayReservations: "Today's Reservations",
    upcomingReservations: 'Upcoming',
    pastReservations: 'Past',
  },
  inventory: {
    title: 'Inventory',
    totalInventoryValue: 'Total Inventory Value',
    lowStockAlerts: 'Low Stock Alerts',
    wastageThisWeek: 'Wastage This Week',
    activePurchaseOrders: 'Active Purchase Orders',
    stock: 'Stock',
    wastage: 'Wastage',
    purchaseOrders: 'Purchase Orders',
    searchIngredients: 'Search ingredients...',
    lowStock: 'Low Stock',
    allCategories: 'All Categories',
    allLocations: 'All Locations',
    ingredient: 'Ingredient',
    stockLevel: 'Stock Level',
    costPerUnit: 'Cost/Unit',
    storage: 'Storage',
    vendor: 'Vendor',
    adjustStockLevel: 'Adjust Stock Level',
    updateStockFor: 'Update the current stock for',
    currentStock: 'Current Stock',
    newStockLevel: 'New Stock Level',
    change: 'Change',
    min: 'Min',
    max: 'Max',
    logWastage: 'Log Wastage',
    recordWastage: 'Record wasted ingredient and deduct from stock',
    selectIngredient: 'Select ingredient...',
    reason: 'Reason',
    autoCalculatedValue: 'Auto-calculated Value',
    generatePO: 'Generate PO',
    suggestReorder: 'Suggest reorder',
    noIngredientsFound: 'No ingredients found',
    tryAdjusting: 'Try adjusting your search or filters',
    showing: 'Showing',
    of: 'of',
    ingredients: 'ingredients',
    wastageLog: 'Wastage Log',
    noWastageLogged: 'No wastage logged',
    notOrderedYet: 'Not ordered yet',
    produce: 'Produce',
    meat: 'Meat & Seafood',
    dairy: 'Dairy',
    dryGoods: 'Dry Goods',
    beverages: 'Beverages',
    other: 'Other',
    fridge: 'Fridge',
    freezer: 'Freezer',
    dryStorage: 'Dry Storage',
    bar: 'Bar',
    stockUpdated: 'Stock updated successfully',
    failedToUpdateStock: 'Failed to update stock',
    draftPOCreated: 'Draft PO created',
    failedToCreatePO: 'Failed to create purchase order',
    noVendorAssigned: 'No vendor assigned for this ingredient',
  },
  staff: {
    title: 'Staff / Rota',
    staffRota: 'Staff Rota',
    todayShift: "Today's Shift",
    clockedIn: 'Clocked In',
    onBreak: 'On Break',
    clockIn: 'Clock In',
    clockOut: 'Clock Out',
    startBreak: 'Start Break',
    endBreak: 'End Break',
    shiftSchedule: 'Shift Schedule',
    addShift: 'Add Shift',
    editShift: 'Edit Shift',
    startTime: 'Start Time',
    endTime: 'End Time',
    role: 'Role',
    tips: 'Tips',
    tipDistribution: 'Tip Distribution',
    totalTips: 'Total Tips',
    distribute: 'Distribute',
    hoursWorked: 'Hours Worked',
    hourlyRate: 'Hourly Rate',
    noStaffOnShift: 'No staff on shift',
  },
  crm: {
    title: 'CRM / Guests',
    guestProfiles: 'Guest Profiles',
    totalGuests: 'Total Guests',
    vipGuests: 'VIP Guests',
    newThisMonth: 'New This Month',
    averageSpend: 'Average Spend',
    loyaltyPoints: 'Loyalty Points',
    visitHistory: 'Visit History',
    preferences: 'Preferences',
    allergies: 'Allergies',
    addNote: 'Add Note',
    lastVisit: 'Last Visit',
    totalVisits: 'Total Visits',
    totalSpent: 'Total Spent',
    noGuestsFound: 'No guests found',
    searchGuests: 'Search guests...',
  },
  footer: {
    copyright: 'The Gilded Fork',
    version: 'Restaurant Management System v1.0',
  },
};

/* ─── Portuguese (Portugal) ─── */
export const ptPT: Translations = {
  common: {
    loading: 'A carregar...',
    retry: 'Tentar novamente',
    refresh: 'Atualizar',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    close: 'Fechar',
    search: 'Pesquisar',
    filter: 'Filtrar',
    all: 'Todos',
    notes: 'Notas',
    noData: 'Sem dados disponíveis',
    error: 'Erro',
    success: 'Sucesso',
    yes: 'Sim',
    no: 'Não',
    back: 'Voltar',
    next: 'Seguinte',
    previous: 'Anterior',
    actions: 'Ações',
    status: 'Estado',
    active: 'Ativo',
    inactive: 'Inativo',
    pending: 'Pendente',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'Imposto',
    totalAmount: 'Total',
    date: 'Data',
    time: 'Hora',
    name: 'Nome',
    email: 'Email',
    phone: 'Telefone',
    description: 'Descrição',
    quantity: 'Quantidade',
    price: 'Preço',
    unit: 'Unidade',
    notesOptional: 'Notas (opcional)',
    details: 'Detalhes',
    updating: 'A atualizar...',
    noResults: 'Sem resultados',
  },
  auth: {
    restaurantName: 'The Gilded Fork',
    managementSystem: 'Sistema de Gestão',
    selectRole: 'Selecione o seu papel para continuar',
    demoMode: 'Modo de demonstração — Sem palavra-passe. Clique em qualquer papel para entrar.',
    switchRole: 'Mudar Papel',
    signOut: 'Sair',
  },
  roles: {
    admin: 'Administrador / Proprietário',
    manager: 'Gerente',
    kitchen: 'Cozinha',
    bar: 'Bar',
    foh: 'Atendimento',
  },
  nav: {
    dashboard: 'Painel',
    floorPlan: 'Planta',
    pos: 'Caixa / Pedidos',
    kds: 'Cozinha / Bar',
    reservations: 'Reservas',
    inventory: 'Inventário',
    staff: 'Pessoal / Escala',
    crm: 'CRM / Clientes',
  },
  dashboard: {
    title: 'Painel',
    realtimeOverview: 'Visão em tempo real',
    todaysRevenue: 'Receita de Hoje',
    vsYesterday: 'vs ontem',
    activeOrders: 'Pedidos Ativos',
    tableOccupancy: 'Ocupação de Mesas',
    tables: 'mesas',
    staffOnShift: 'Pessoal no Turno',
    scheduledToday: 'agendados hoje',
    sevenDayRevenue: 'Receita de 7 Dias',
    topSellingItems: 'Itens Mais Vendidos',
    recentActivity: 'Atividade Recente',
    noRecentActivity: 'Sem atividade recente',
    costBreakdown: 'Distribuição de Custos',
    laborCost: 'Custo de Mão de Obra',
    foodCost: 'Custo de Alimentos',
    other: 'Outro',
    inventoryAlerts: 'Alertas de Inventário',
    lowStockItems: 'Itens em Baixa',
    critical: 'Crítico',
    low: 'Baixo',
    allStockOk: 'Todos os níveis de stock OK',
    loadingDashboard: 'A carregar painel...',
    failedToLoad: 'Falha ao carregar o painel',
    revenue: 'Receita',
    qtySold: 'Qtd Vendida',
  },
  floorPlan: {
    title: 'Planta',
    lastUpdated: 'Última atualização',
    refreshing: 'A atualizar...',
    totalTables: 'Total de Mesas',
    occupied: 'Ocupadas',
    free: 'Livres',
    reserved: 'Reservadas',
    needsCleaning: 'Necessita Limpeza',
    changeStatus: 'Alterar Estado',
    currentOrder: 'Pedido Atual',
    noActiveOrder: 'Sem pedido ativo',
    startOrderToBegin: 'Inicie um pedido para começar o serviço',
    continueOrder: 'Continuar Pedido',
    startOrder: 'Iniciar Pedido',
    reservation: 'Reserva',
    clearTable: 'Limpar Mesa',
    upcomingReservation: 'Próxima Reserva',
    seats: 'lugares',
    orderTotal: 'Total do Pedido',
    server: 'Empregado',
    guest: 'cliente',
    guests: 'clientes',
    loadingFloorPlan: 'A carregar planta...',
    failedToLoad: 'Falha ao carregar a planta',
    mainDining: 'Sala Principal',
    bar: 'Bar',
    patio: 'Esplanada',
    vip: 'VIP',
    statusFree: 'Livre',
    statusReserved: 'Reservada',
    statusSeated: 'Sentados',
    statusOrderPlaced: 'Pedido Feito',
    statusAppetizer: 'Entrada',
    statusMain: 'Prato Principal',
    statusDessert: 'Sobremesa',
    statusBillRequested: 'Conta Pedida',
    statusDirty: 'Necessita Limpeza',
    editTable: 'Editar Mesa',
    tableName: 'Nome da Mesa',
    capacity: 'Capacidade',
    assignServer: 'Atribuir Empregado',
    noServer: 'Sem empregado atribuído',
    removeServer: 'Remover empregado',
    tableSection: 'Secção',
    tableShape: 'Formato',
    saveChanges: 'Guardar Alterações',
    dragToReorder: 'Arraste para reordenar',
    tableUpdated: 'Mesa atualizada',
    failedToUpdateTable: 'Falha ao atualizar mesa',
  },
  pos: {
    newOrder: 'Novo Pedido',
    activeOrders: 'Pedidos Ativos',
    currentOrder: 'Pedido Atual',
    editOrder: 'Editar Pedido',
    table: 'Mesa',
    selectTable: 'Selecionar mesa...',
    guests: 'Clientes',
    seat: 'Lugar',
    searchMenu: 'Pesquisar itens do menu...',
    noItemsFound: 'Nenhum item encontrado',
    tryDifferentSearch: 'Tente uma pesquisa ou categoria diferente',
    noItemsYet: 'Sem itens ainda',
    clickMenuToAdd: 'Clique nos itens do menu para adicionar',
    each: 'cada',
    specialNotes: 'Notas especiais...',
    popular: 'Popular',
    pending: 'Pendente',
    fired: 'Enviado',
    preparing: 'Prep',
    ready: 'Pronto',
    served: 'Servido',
    inProgress: 'Em Preparação',
    fireOrder: 'Enviar Pedido',
    clearOrder: 'Limpar',
    splitBill: 'Dividir Conta',
    payNow: 'Pagar Agora',
    holdOrder: 'Pausar',
    splitBySeat: 'Por Lugar',
    splitByItem: 'Por Item',
    splitEqually: 'Igualmente',
    guest: 'Cliente',
    confirmFireTitle: 'Enviar pedido para a cozinha?',
    confirmFireDesc: 'Isto enviará todos os itens para as respetivas estações para preparação.',
    confirmCancelTitle: 'Cancelar pedido?',
    confirmCancelDesc: 'Isto removerá todos os itens do pedido atual. Esta ação não pode ser desfeita.',
    orderFired: 'Pedido enviado',
    orderFailed: 'Falha ao criar pedido',
    stationKitchen: 'COZINHA',
    stationBar: 'BAR',
    editOrderBtn: 'Editar Pedido',
  },
  kds: {
    title: 'Ecrã Cozinha / Bar',
    kitchenDisplay: 'Cozinha',
    barDisplay: 'Bar',
    allStations: 'Todos',
    noTickets: 'Sem tickets',
    allCaughtUp: 'Tudo em dia!',
    markReady: 'Pronto',
    markServed: 'Servido',
    bump: 'Avançar',
    orderFor: 'Pedido para',
    itemsCount: 'itens',
    elapsed: 'decorrido',
    minutes: 'min',
    seconds: 's',
  },
  reservations: {
    title: 'Reservas',
    newReservation: 'Nova Reserva',
    editReservation: 'Editar Reserva',
    guestName: 'Nome do Cliente',
    partySize: 'Tamanho do Grupo',
    date: 'Data',
    time: 'Hora',
    notes: 'Notas',
    phone: 'Telefone',
    status: 'Estado',
    confirmed: 'Confirmada',
    pending: 'Pendente',
    seated: 'Sentados',
    cancelled: 'Cancelada',
    noShow: 'Não Compareceu',
    waitlist: 'Lista de Espera',
    addToWaitlist: 'Adicionar à Lista',
    estimatedWait: 'Esp. Espera',
    minutes: 'min',
    todayReservations: 'Reservas de Hoje',
    upcomingReservations: 'Próximas',
    pastReservations: 'Passadas',
  },
  inventory: {
    title: 'Inventário',
    totalInventoryValue: 'Valor Total do Inventário',
    lowStockAlerts: 'Alertas de Stock Baixo',
    wastageThisWeek: 'Desperdício Esta Semana',
    activePurchaseOrders: 'Encomendas de Compra Ativas',
    stock: 'Stock',
    wastage: 'Desperdício',
    purchaseOrders: 'Encomendas de Compra',
    searchIngredients: 'Pesquisar ingredientes...',
    lowStock: 'Stock Baixo',
    allCategories: 'Todas as Categorias',
    allLocations: 'Todas as Localizações',
    ingredient: 'Ingrediente',
    stockLevel: 'Nível de Stock',
    costPerUnit: 'Custo/Unid',
    storage: 'Armazenamento',
    vendor: 'Fornecedor',
    adjustStockLevel: 'Ajustar Nível de Stock',
    updateStockFor: 'Atualizar stock atual para',
    currentStock: 'Stock Atual',
    newStockLevel: 'Novo Nível de Stock',
    change: 'Alteração',
    min: 'Mín',
    max: 'Máx',
    logWastage: 'Registar Desperdício',
    recordWastage: 'Registar ingrediente desperdiçado e deduzir do stock',
    selectIngredient: 'Selecionar ingrediente...',
    reason: 'Motivo',
    autoCalculatedValue: 'Valor Auto-calculado',
    generatePO: 'Gerar EC',
    suggestReorder: 'Sugerir reposição',
    noIngredientsFound: 'Nenhum ingrediente encontrado',
    tryAdjusting: 'Tente ajustar a pesquisa ou filtros',
    showing: 'A mostrar',
    of: 'de',
    ingredients: 'ingredientes',
    wastageLog: 'Registo de Desperdício',
    noWastageLogged: 'Sem desperdício registado',
    notOrderedYet: 'Ainda não encomendado',
    produce: 'Produtos Hortícolas',
    meat: 'Carne e Peixe',
    dairy: 'Laticínios',
    dryGoods: 'Mercearia',
    beverages: 'Bebidas',
    other: 'Outro',
    fridge: 'Frigorífico',
    freezer: 'Congelador',
    dryStorage: 'Armazém Seco',
    bar: 'Bar',
    stockUpdated: 'Stock atualizado com sucesso',
    failedToUpdateStock: 'Falha ao atualizar stock',
    draftPOCreated: 'Rascunho de EC criado',
    failedToCreatePO: 'Falha ao criar encomenda de compra',
    noVendorAssigned: 'Sem fornecedor atribuído para este ingrediente',
  },
  staff: {
    title: 'Pessoal / Escala',
    staffRota: 'Escala de Pessoal',
    todayShift: 'Turno de Hoje',
    clockedIn: 'Registado',
    onBreak: 'Em Pausa',
    clockIn: 'Registar Entrada',
    clockOut: 'Registar Saída',
    startBreak: 'Iniciar Pausa',
    endBreak: 'Terminar Pausa',
    shiftSchedule: 'Escala de Turnos',
    addShift: 'Adicionar Turno',
    editShift: 'Editar Turno',
    startTime: 'Hora de Início',
    endTime: 'Hora de Fim',
    role: 'Função',
    tips: 'Gorjetas',
    tipDistribution: 'Distribuição de Gorjetas',
    totalTips: 'Total de Gorjetas',
    distribute: 'Distribuir',
    hoursWorked: 'Horas Trabalhadas',
    hourlyRate: 'Taxa Horária',
    noStaffOnShift: 'Sem pessoal no turno',
  },
  crm: {
    title: 'CRM / Clientes',
    guestProfiles: 'Perfis de Clientes',
    totalGuests: 'Total de Clientes',
    vipGuests: 'Clientes VIP',
    newThisMonth: 'Novos Este Mês',
    averageSpend: 'Gasto Médio',
    loyaltyPoints: 'Pontos de Fidelidade',
    visitHistory: 'Histórico de Visitas',
    preferences: 'Preferências',
    allergies: 'Alergias',
    addNote: 'Adicionar Nota',
    lastVisit: 'Última Visita',
    totalVisits: 'Total de Visitas',
    totalSpent: 'Total Gasto',
    noGuestsFound: 'Nenhum cliente encontrado',
    searchGuests: 'Pesquisar clientes...',
  },
  footer: {
    copyright: 'The Gilded Fork',
    version: 'Sistema de Gestão de Restaurante v1.0',
  },
};

/* ─── French (France) ─── */
export const frFR: Translations = {
  common: {
    loading: 'Chargement...',
    retry: 'Réessayer',
    refresh: 'Actualiser',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    close: 'Fermer',
    search: 'Rechercher',
    filter: 'Filtrer',
    all: 'Tout',
    notes: 'Notes',
    noData: 'Aucune donnée disponible',
    error: 'Erreur',
    success: 'Succès',
    yes: 'Oui',
    no: 'Non',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    actions: 'Actions',
    status: 'Statut',
    active: 'Actif',
    inactive: 'Inactif',
    pending: 'En attente',
    completed: 'Terminé',
    cancelled: 'Annulé',
    total: 'Total',
    subtotal: 'Sous-total',
    tax: 'Taxe',
    totalAmount: 'Total',
    date: 'Date',
    time: 'Heure',
    name: 'Nom',
    email: 'Email',
    phone: 'Téléphone',
    description: 'Description',
    quantity: 'Quantité',
    price: 'Prix',
    unit: 'Unité',
    notesOptional: 'Notes (facultatif)',
    details: 'Détails',
    updating: 'Mise à jour...',
    noResults: 'Aucun résultat',
  },
  auth: {
    restaurantName: 'The Gilded Fork',
    managementSystem: 'Système de Gestion',
    selectRole: 'Sélectionnez votre rôle pour continuer',
    demoMode: 'Mode démo — Aucun mot de passe requis. Cliquez sur un rôle pour entrer.',
    switchRole: 'Changer de Rôle',
    signOut: 'Déconnexion',
  },
  roles: {
    admin: 'Administrateur / Propriétaire',
    manager: 'Responsable',
    kitchen: 'Cuisine',
    bar: 'Bar',
    foh: 'Service en Salle',
  },
  nav: {
    dashboard: 'Tableau de Bord',
    floorPlan: 'Plan de Salle',
    pos: 'Caisse / Commandes',
    kds: 'Cuisine / Bar',
    reservations: 'Réservations',
    inventory: 'Inventaire',
    staff: 'Personnel / Planning',
    crm: 'CRM / Clients',
  },
  dashboard: {
    title: 'Tableau de Bord',
    realtimeOverview: 'Aperçu en temps réel',
    todaysRevenue: "Chiffre d'affaires du jour",
    vsYesterday: "vs hier",
    activeOrders: 'Commandes Actives',
    tableOccupancy: 'Occupation des Tables',
    tables: 'tables',
    staffOnShift: 'Personnel en Service',
    scheduledToday: 'programmés aujourd\'hui',
    sevenDayRevenue: "CA sur 7 Jours",
    topSellingItems: 'Articles les Plus Vendus',
    recentActivity: 'Activité Récente',
    noRecentActivity: 'Aucune activité récente',
    costBreakdown: 'Répartition des Coûts',
    laborCost: 'Coût Main-d\'œuvre',
    foodCost: 'Coût Alimentaire',
    other: 'Autre',
    inventoryAlerts: "Alertes d'Inventaire",
    lowStockItems: 'Articles en Stock Faible',
    critical: 'Critique',
    low: 'Faible',
    allStockOk: 'Tous les niveaux de stock sont OK',
    loadingDashboard: 'Chargement du tableau de bord...',
    failedToLoad: 'Échec du chargement du tableau de bord',
    revenue: "Chiffre d'affaires",
    qtySold: 'Qté Vendue',
  },
  floorPlan: {
    title: 'Plan de Salle',
    lastUpdated: 'Dernière mise à jour',
    refreshing: 'Actualisation...',
    totalTables: 'Total Tables',
    occupied: 'Occupées',
    free: 'Libres',
    reserved: 'Réservées',
    needsCleaning: 'À Nettoyer',
    changeStatus: 'Changer le Statut',
    currentOrder: 'Commande Actuelle',
    noActiveOrder: 'Aucune commande active',
    startOrderToBegin: 'Démarrez une commande pour commencer le service',
    continueOrder: 'Continuer la Commande',
    startOrder: 'Nouvelle Commande',
    reservation: 'Réservation',
    clearTable: 'Libérer la Table',
    upcomingReservation: 'Prochaine Réservation',
    seats: 'places',
    orderTotal: 'Total de la Commande',
    server: 'Serveur',
    guest: 'client',
    guests: 'clients',
    loadingFloorPlan: 'Chargement du plan de salle...',
    failedToLoad: 'Échec du chargement du plan de salle',
    mainDining: 'Salle Principale',
    bar: 'Bar',
    patio: 'Terrasse',
    vip: 'VIP',
    statusFree: 'Libre',
    statusReserved: 'Réservée',
    statusSeated: 'Assis',
    statusOrderPlaced: 'Commande Passée',
    statusAppetizer: 'Entrée',
    statusMain: 'Plat Principal',
    statusDessert: 'Dessert',
    statusBillRequested: 'Note Demandée',
    statusDirty: 'À Nettoyer',
    editTable: 'Modifier la Table',
    tableName: 'Nom de la Table',
    capacity: 'Capacité',
    assignServer: 'Assigner un Serveur',
    noServer: 'Aucun serveur assigné',
    removeServer: 'Retirer le serveur',
    tableSection: 'Section',
    tableShape: 'Forme',
    saveChanges: 'Enregistrer',
    dragToReorder: 'Glisser pour réorganiser',
    tableUpdated: 'Table mise à jour',
    failedToUpdateTable: 'Échec de la mise à jour de la table',
  },
  pos: {
    newOrder: 'Nouvelle Commande',
    activeOrders: 'Commandes Actives',
    currentOrder: 'Commande Actuelle',
    editOrder: 'Modifier la Commande',
    table: 'Table',
    selectTable: 'Sélectionner une table...',
    guests: 'Clients',
    seat: 'Place',
    searchMenu: 'Rechercher dans le menu...',
    noItemsFound: 'Aucun article trouvé',
    tryDifferentSearch: 'Essayez une recherche ou catégorie différente',
    noItemsYet: 'Aucun article',
    clickMenuToAdd: 'Cliquez sur les articles du menu pour ajouter',
    each: 'chacun',
    specialNotes: 'Notes spéciales...',
    popular: 'Populaire',
    pending: 'En attente',
    fired: 'Envoyé',
    preparing: 'Prép',
    ready: 'Prêt',
    served: 'Servi',
    inProgress: 'En Cours',
    fireOrder: 'Envoyer la Commande',
    clearOrder: 'Effacer',
    splitBill: 'Partager l\'Addition',
    payNow: 'Payer',
    holdOrder: 'Pause',
    splitBySeat: 'Par Place',
    splitByItem: 'Par Article',
    splitEqually: 'Équitablement',
    guest: 'Client',
    confirmFireTitle: 'Envoyer la commande en cuisine ?',
    confirmFireDesc: 'Ceci enverra tous les articles vers leurs stations respectives pour préparation.',
    confirmCancelTitle: 'Annuler la commande ?',
    confirmCancelDesc: 'Ceci supprimera tous les articles de la commande actuelle. Cette action est irréversible.',
    orderFired: 'Commande envoyée',
    orderFailed: 'Échec de la création de la commande',
    stationKitchen: 'CUISINE',
    stationBar: 'BAR',
    editOrderBtn: 'Modifier la Commande',
  },
  kds: {
    title: 'Écran Cuisine / Bar',
    kitchenDisplay: 'Cuisine',
    barDisplay: 'Bar',
    allStations: 'Toutes',
    noTickets: 'Aucun ticket',
    allCaughtUp: 'Tout est à jour !',
    markReady: 'Prêt',
    markServed: 'Servi',
    bump: 'Suivant',
    orderFor: 'Commande pour',
    itemsCount: 'articles',
    elapsed: 'écoulé',
    minutes: 'min',
    seconds: 's',
  },
  reservations: {
    title: 'Réservations',
    newReservation: 'Nouvelle Réservation',
    editReservation: 'Modifier la Réservation',
    guestName: 'Nom du Client',
    partySize: 'Taille du Groupe',
    date: 'Date',
    time: 'Heure',
    notes: 'Notes',
    phone: 'Téléphone',
    status: 'Statut',
    confirmed: 'Confirmée',
    pending: 'En attente',
    seated: 'Assis',
    cancelled: 'Annulée',
    noShow: 'Non Présenté',
    waitlist: "Liste d'Attente",
    addToWaitlist: "Ajouter à la Liste",
    estimatedWait: 'Att. Est.',
    minutes: 'min',
    todayReservations: "Réservations du Jour",
    upcomingReservations: 'À venir',
    pastReservations: 'Passées',
  },
  inventory: {
    title: 'Inventaire',
    totalInventoryValue: 'Valeur Totale de l\'Inventaire',
    lowStockAlerts: 'Alertes de Stock Faible',
    wastageThisWeek: 'Pertes Cette Semaine',
    activePurchaseOrders: 'Bons de Commande Actifs',
    stock: 'Stock',
    wastage: 'Pertes',
    purchaseOrders: 'Bons de Commande',
    searchIngredients: 'Rechercher des ingrédients...',
    lowStock: 'Stock Faible',
    allCategories: 'Toutes les Catégories',
    allLocations: 'Tous les Emplacements',
    ingredient: 'Ingrédient',
    stockLevel: 'Niveau de Stock',
    costPerUnit: 'Coût/Unité',
    storage: 'Stockage',
    vendor: 'Fournisseur',
    adjustStockLevel: 'Ajuster le Niveau de Stock',
    updateStockFor: 'Mettre à jour le stock actuel pour',
    currentStock: 'Stock Actuel',
    newStockLevel: 'Nouveau Niveau de Stock',
    change: 'Changement',
    min: 'Min',
    max: 'Max',
    logWastage: 'Enregistrer les Pertes',
    recordWastage: 'Enregistrer l\'ingrédient perdu et déduire du stock',
    selectIngredient: 'Sélectionner un ingrédient...',
    reason: 'Raison',
    autoCalculatedValue: 'Valeur Auto-calculée',
    generatePO: 'Générer BC',
    suggestReorder: 'Suggérer réapprovisionnement',
    noIngredientsFound: 'Aucun ingrédient trouvé',
    tryAdjusting: 'Essayez d\'ajuster votre recherche ou vos filtres',
    showing: 'Affichage',
    of: 'de',
    ingredients: 'ingrédients',
    wastageLog: 'Journal des Pertes',
    noWastageLogged: 'Aucune perte enregistrée',
    notOrderedYet: 'Pas encore commandé',
    produce: 'Fruits et Légumes',
    meat: 'Viande et Poisson',
    dairy: 'Produits Laitiers',
    dryGoods: 'Épicerie',
    beverages: 'Boissons',
    other: 'Autre',
    fridge: 'Réfrigérateur',
    freezer: 'Congélateur',
    dryStorage: 'Réserve Sèche',
    bar: 'Bar',
    stockUpdated: 'Stock mis à jour avec succès',
    failedToUpdateStock: 'Échec de la mise à jour du stock',
    draftPOCreated: 'Brouillon de BC créé',
    failedToCreatePO: 'Échec de la création du bon de commande',
    noVendorAssigned: 'Aucun fournisseur assigné pour cet ingrédient',
  },
  staff: {
    title: 'Personnel / Planning',
    staffRota: 'Planning du Personnel',
    todayShift: 'Service du Jour',
    clockedIn: 'Pointé',
    onBreak: 'En Pause',
    clockIn: 'Pointer l\'Entrée',
    clockOut: 'Pointer la Sortie',
    startBreak: 'Début de Pause',
    endBreak: 'Fin de Pause',
    shiftSchedule: 'Planning des Services',
    addShift: 'Ajouter un Service',
    editShift: 'Modifier le Service',
    startTime: 'Heure de Début',
    endTime: 'Heure de Fin',
    role: 'Rôle',
    tips: 'Pourboires',
    tipDistribution: 'Distribution des Pourboires',
    totalTips: 'Total des Pourboires',
    distribute: 'Distribuer',
    hoursWorked: 'Heures Travaillées',
    hourlyRate: 'Taux Horaire',
    noStaffOnShift: 'Aucun personnel en service',
  },
  crm: {
    title: 'CRM / Clients',
    guestProfiles: 'Profils Clients',
    totalGuests: 'Total Clients',
    vipGuests: 'Clients VIP',
    newThisMonth: 'Nouveaux ce Mois',
    averageSpend: 'Dépense Moyenne',
    loyaltyPoints: 'Points de Fidélité',
    visitHistory: 'Historique des Visites',
    preferences: 'Préférences',
    allergies: 'Allergies',
    addNote: 'Ajouter une Note',
    lastVisit: 'Dernière Visite',
    totalVisits: 'Total des Visites',
    totalSpent: 'Total Dépensé',
    noGuestsFound: 'Aucun client trouvé',
    searchGuests: 'Rechercher des clients...',
  },
  footer: {
    copyright: 'The Gilded Fork',
    version: 'Système de Gestion de Restaurant v1.0',
  },
};

/* ─── Spanish (Spain) ─── */
export const esES: Translations = {
  common: {
    loading: 'Cargando...',
    retry: 'Reintentar',
    refresh: 'Actualizar',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    close: 'Cerrar',
    search: 'Buscar',
    filter: 'Filtrar',
    all: 'Todo',
    notes: 'Notas',
    noData: 'Sin datos disponibles',
    error: 'Error',
    success: 'Éxito',
    yes: 'Sí',
    no: 'No',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    actions: 'Acciones',
    status: 'Estado',
    active: 'Activo',
    inactive: 'Inactivo',
    pending: 'Pendiente',
    completed: 'Completado',
    cancelled: 'Cancelado',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'Impuesto',
    totalAmount: 'Total',
    date: 'Fecha',
    time: 'Hora',
    name: 'Nombre',
    email: 'Email',
    phone: 'Teléfono',
    description: 'Descripción',
    quantity: 'Cantidad',
    price: 'Precio',
    unit: 'Unidad',
    notesOptional: 'Notas (opcional)',
    details: 'Detalles',
    updating: 'Actualizando...',
    noResults: 'Sin resultados',
  },
  auth: {
    restaurantName: 'The Gilded Fork',
    managementSystem: 'Sistema de Gestión',
    selectRole: 'Seleccione su rol para continuar',
    demoMode: 'Modo demo — Sin contraseña. Haga clic en cualquier rol para entrar.',
    switchRole: 'Cambiar Rol',
    signOut: 'Cerrar Sesión',
  },
  roles: {
    admin: 'Administrador / Propietario',
    manager: 'Gerente',
    kitchen: 'Cocina',
    bar: 'Bar',
    foh: 'Sala',
  },
  nav: {
    dashboard: 'Panel',
    floorPlan: 'Plano',
    pos: 'Caja / Pedidos',
    kds: 'Cocina / Bar',
    reservations: 'Reservas',
    inventory: 'Inventario',
    staff: 'Personal / Turnos',
    crm: 'CRM / Clientes',
  },
  dashboard: {
    title: 'Panel',
    realtimeOverview: 'Vista en tiempo real',
    todaysRevenue: 'Ingresos de Hoy',
    vsYesterday: 'vs ayer',
    activeOrders: 'Pedidos Activos',
    tableOccupancy: 'Ocupación de Mesas',
    tables: 'mesas',
    staffOnShift: 'Personal en Turno',
    scheduledToday: 'programados hoy',
    sevenDayRevenue: 'Ingresos de 7 Días',
    topSellingItems: 'Artículos Más Vendidos',
    recentActivity: 'Actividad Reciente',
    noRecentActivity: 'Sin actividad reciente',
    costBreakdown: 'Desglose de Costes',
    laborCost: 'Coste Laboral',
    foodCost: 'Coste de Alimentos',
    other: 'Otro',
    inventoryAlerts: 'Alertas de Inventario',
    lowStockItems: 'Artículos con Stock Bajo',
    critical: 'Crítico',
    low: 'Bajo',
    allStockOk: 'Todos los niveles de stock OK',
    loadingDashboard: 'Cargando panel...',
    failedToLoad: 'Error al cargar el panel',
    revenue: 'Ingresos',
    qtySold: 'Cant. Vendida',
  },
  floorPlan: {
    title: 'Plano',
    lastUpdated: 'Última actualización',
    refreshing: 'Actualizando...',
    totalTables: 'Total Mesas',
    occupied: 'Ocupadas',
    free: 'Libres',
    reserved: 'Reservadas',
    needsCleaning: 'Necesita Limpieza',
    changeStatus: 'Cambiar Estado',
    currentOrder: 'Pedido Actual',
    noActiveOrder: 'Sin pedido activo',
    startOrderToBegin: 'Inicie un pedido para comenzar el servicio',
    continueOrder: 'Continuar Pedido',
    startOrder: 'Iniciar Pedido',
    reservation: 'Reserva',
    clearTable: 'Despejar Mesa',
    upcomingReservation: 'Próxima Reserva',
    seats: 'asientos',
    orderTotal: 'Total del Pedido',
    server: 'Camarero',
    guest: 'cliente',
    guests: 'clientes',
    loadingFloorPlan: 'Cargando plano...',
    failedToLoad: 'Error al cargar el plano',
    mainDining: 'Comedor Principal',
    bar: 'Bar',
    patio: 'Terraza',
    vip: 'VIP',
    statusFree: 'Libre',
    statusReserved: 'Reservada',
    statusSeated: 'Sentados',
    statusOrderPlaced: 'Pedido Realizado',
    statusAppetizer: 'Entrante',
    statusMain: 'Plato Principal',
    statusDessert: 'Postre',
    statusBillRequested: 'Cuenta Solicitada',
    statusDirty: 'Necesita Limpieza',
    editTable: 'Editar Mesa',
    tableName: 'Nombre de la Mesa',
    capacity: 'Capacidad',
    assignServer: 'Asignar Camarero',
    noServer: 'Sin camarero asignado',
    removeServer: 'Quitar camarero',
    tableSection: 'Sección',
    tableShape: 'Forma',
    saveChanges: 'Guardar Cambios',
    dragToReorder: 'Arrastra para reordenar',
    tableUpdated: 'Mesa actualizada',
    failedToUpdateTable: 'Error al actualizar mesa',
  },
  pos: {
    newOrder: 'Nuevo Pedido',
    activeOrders: 'Pedidos Activos',
    currentOrder: 'Pedido Actual',
    editOrder: 'Editar Pedido',
    table: 'Mesa',
    selectTable: 'Seleccionar mesa...',
    guests: 'Clientes',
    seat: 'Asiento',
    searchMenu: 'Buscar en el menú...',
    noItemsFound: 'Ningún artículo encontrado',
    tryDifferentSearch: 'Intente con otra búsqueda o categoría',
    noItemsYet: 'Sin artículos aún',
    clickMenuToAdd: 'Haga clic en los artículos del menú para añadir',
    each: 'cada uno',
    specialNotes: 'Notas especiales...',
    popular: 'Popular',
    pending: 'Pendiente',
    fired: 'Enviado',
    preparing: 'Prep',
    ready: 'Listo',
    served: 'Servido',
    inProgress: 'En Proceso',
    fireOrder: 'Enviar Pedido',
    clearOrder: 'Limpiar',
    splitBill: 'Divir Cuenta',
    payNow: 'Pagar',
    holdOrder: 'Pausar',
    splitBySeat: 'Por Asiento',
    splitByItem: 'Por Artículo',
    splitEqually: 'Igualmente',
    guest: 'Cliente',
    confirmFireTitle: '¿Enviar pedido a cocina?',
    confirmFireDesc: 'Esto enviará todos los artículos a sus respectivas estaciones para preparación.',
    confirmCancelTitle: '¿Cancelar pedido?',
    confirmCancelDesc: 'Esto eliminará todos los artículos del pedido actual. Esta acción no se puede deshacer.',
    orderFired: 'Pedido enviado',
    orderFailed: 'Error al crear el pedido',
    stationKitchen: 'COCINA',
    stationBar: 'BAR',
    editOrderBtn: 'Editar Pedido',
  },
  kds: {
    title: 'Pantalla Cocina / Bar',
    kitchenDisplay: 'Cocina',
    barDisplay: 'Bar',
    allStations: 'Todas',
    noTickets: 'Sin tickets',
    allCaughtUp: '¡Todo al día!',
    markReady: 'Listo',
    markServed: 'Servido',
    bump: 'Siguiente',
    orderFor: 'Pedido para',
    itemsCount: 'artículos',
    elapsed: 'transcurrido',
    minutes: 'min',
    seconds: 's',
  },
  reservations: {
    title: 'Reservas',
    newReservation: 'Nueva Reserva',
    editReservation: 'Editar Reserva',
    guestName: 'Nombre del Cliente',
    partySize: 'Tamaño del Grupo',
    date: 'Fecha',
    time: 'Hora',
    notes: 'Notas',
    phone: 'Teléfono',
    status: 'Estado',
    confirmed: 'Confirmada',
    pending: 'Pendiente',
    seated: 'Sentados',
    cancelled: 'Cancelada',
    noShow: 'No Presentado',
    waitlist: 'Lista de Espera',
    addToWaitlist: 'Añadir a la Lista',
    estimatedWait: 'Esp. Espera',
    minutes: 'min',
    todayReservations: 'Reservas de Hoy',
    upcomingReservations: 'Próximas',
    pastReservations: 'Pasadas',
  },
  inventory: {
    title: 'Inventario',
    totalInventoryValue: 'Valor Total del Inventario',
    lowStockAlerts: 'Alertas de Stock Bajo',
    wastageThisWeek: 'Merma Esta Semana',
    activePurchaseOrders: 'Órdenes de Compra Activas',
    stock: 'Stock',
    wastage: 'Merma',
    purchaseOrders: 'Órdenes de Compra',
    searchIngredients: 'Buscar ingredientes...',
    lowStock: 'Stock Bajo',
    allCategories: 'Todas las Categorías',
    allLocations: 'Todas las Ubicaciones',
    ingredient: 'Ingrediente',
    stockLevel: 'Nivel de Stock',
    costPerUnit: 'Coste/Unidad',
    storage: 'Almacenamiento',
    vendor: 'Proveedor',
    adjustStockLevel: 'Ajustar Nivel de Stock',
    updateStockFor: 'Actualizar el stock actual para',
    currentStock: 'Stock Actual',
    newStockLevel: 'Nuevo Nivel de Stock',
    change: 'Cambio',
    min: 'Mín',
    max: 'Máx',
    logWastage: 'Registrar Merma',
    recordWastage: 'Registrar ingrediente desperdiciado y deducir del stock',
    selectIngredient: 'Seleccionar ingrediente...',
    reason: 'Motivo',
    autoCalculatedValue: 'Valor Auto-calculado',
    generatePO: 'Generar OC',
    suggestReorder: 'Sugerir reposición',
    noIngredientsFound: 'Ningún ingrediente encontrado',
    tryAdjusting: 'Intente ajustar su búsqueda o filtros',
    showing: 'Mostrando',
    of: 'de',
    ingredients: 'ingredientes',
    wastageLog: 'Registro de Merma',
    noWastageLogged: 'Sin merma registrada',
    notOrderedYet: 'Aún no pedido',
    produce: 'Frutas y Verduras',
    meat: 'Carne y Pescado',
    dairy: 'Lácteos',
    dryGoods: 'Despensa',
    beverages: 'Bebidas',
    other: 'Otro',
    fridge: 'Nevera',
    freezer: 'Congelador',
    dryStorage: 'Almacén Seco',
    bar: 'Bar',
    stockUpdated: 'Stock actualizado con éxito',
    failedToUpdateStock: 'Error al actualizar el stock',
    draftPOCreated: 'Borrador de OC creado',
    failedToCreatePO: 'Error al crear la orden de compra',
    noVendorAssigned: 'Sin proveedor asignado para este ingrediente',
  },
  staff: {
    title: 'Personal / Turnos',
    staffRota: 'Cuadrante del Personal',
    todayShift: 'Turno de Hoy',
    clockedIn: 'Fichado',
    onBreak: 'En Descanso',
    clockIn: 'Fichar Entrada',
    clockOut: 'Fichar Salida',
    startBreak: 'Iniciar Descanso',
    endBreak: 'Fin del Descanso',
    shiftSchedule: 'Horario de Turnos',
    addShift: 'Añadir Turno',
    editShift: 'Editar Turno',
    startTime: 'Hora de Inicio',
    endTime: 'Hora de Fin',
    role: 'Rol',
    tips: 'Propinas',
    tipDistribution: 'Distribución de Propinas',
    totalTips: 'Total de Propinas',
    distribute: 'Distribuir',
    hoursWorked: 'Horas Trabajadas',
    hourlyRate: 'Tarifa Horaria',
    noStaffOnShift: 'Sin personal en turno',
  },
  crm: {
    title: 'CRM / Clientes',
    guestProfiles: 'Perfiles de Clientes',
    totalGuests: 'Total Clientes',
    vipGuests: 'Clientes VIP',
    newThisMonth: 'Nuevos Este Mes',
    averageSpend: 'Gasto Medio',
    loyaltyPoints: 'Puntos de Fidelidad',
    visitHistory: 'Historial de Visitas',
    preferences: 'Preferencias',
    allergies: 'Alergias',
    addNote: 'Añadir Nota',
    lastVisit: 'Última Visita',
    totalVisits: 'Total de Visitas',
    totalSpent: 'Total Gastado',
    noGuestsFound: 'Ningún cliente encontrado',
    searchGuests: 'Buscar clientes...',
  },
  footer: {
    copyright: 'The Gilded Fork',
    version: 'Sistema de Gestión de Restaurante v1.0',
  },
};

/* ─── Translation Map ─── */
export const TRANSLATIONS: Record<string, Translations> = {
  'en-GB': enGB,
  'pt-PT': ptPT,
  'fr-FR': frFR,
  'es-ES': esES,
};
