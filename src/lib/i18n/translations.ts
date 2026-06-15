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
    none: string;
    add: string;
    per: string;
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
    transactions: string;
    settings: string;
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
    activityOrderPlaced: string;
    activityReservation: string;
    activityClockIn: string;
    minAgo: string;
    hoursAgo: string;
    daysAgo: string;
    now: string;
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
    resetShift: string;
    clearShiftOperations: string;
    clearAllData: string;
    dailyCheckMonitor: string;
    todaysSales: string;
    cashPayments: string;
    cardPayments: string;
    creditPayments: string;
    avgCheckSize: string;
    activeServedChecks: string;
    tableTallies: string;
    serverSales: string;
    noActiveTablesToday: string;
    noServerRecordsToday: string;
    serviceNotStartedYet: string;
    noMatchingOrdersFound: string;
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
    addTable: string;
    deleteTable: string;
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
    // Canvas view
    sectionView: string;
    floorView: string;
    dragToMove: string;
    positionSaved: string;
    positionSaveFailed: string;
    quickEditSeats: string;
    quickAssignServer: string;
    seatsShort: string;
    maxSeats: string;
    editLayout: string;
    doneEditing: string;
    clickEditLayoutToMove: string;
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
    settleBill: string;
    payBill: string;
    selectPaymentMethod: string;
    cash: string;
    card: string;
    credit: string;
    paymentProcessing: string;
    paymentSuccessful: string;
    paymentFailed: string;
    checkPaidClosed: string;
    authorizeStoreCredit: string;
    allowedCreditDesc: string;
    creditApproved: string;
    creditApprovedDesc: string;
    creditDenied: string;
    creditDeniedDesc: string;
    searchSelectGuest: string;
    blocked: string;
    selectCustomerCredit: string;
    creditNotAllowed: string;
    customerGuest: string;
    noCustomerAssigned: string;
    manageMenu: string;
    category_Starters: string;
    category_Mains: string;
    category_Desserts: string;
    category_Cocktails: string;
    category_Beer_and_Wine: string;
    category_Non_Alcoholic: string;
    category_Sides: string;
    sortBy: string;
    popularity: string;
    sortName: string;
    sortPriceLow: string;
    sortPriceHigh: string;
    menuManagement: string;
    menuManagementDesc: string;
    addNewDish: string;
    itemsCountLabel: string;
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
    activeTickets: string;
    kanbanBoard: string;
    queued: string;
    preparing: string;
    ready: string;
    itemReadyAlert: string;
    produced: string;
    today: string;
    week: string;
    month: string;
    productionDetails: string;
    preparedItems: string;
    chronologicalLog: string;
    groupedSummary: string;
    item: string;
    qty: string;
    station: string;
    preparedTime: string;
    searchItems: string;
    noItemsPrepared: string;
  };

  // ─── Transactions Ledger ───
  transactions: {
    title: string;
    subtitle: string;
    inflow: string;
    outflow: string;
    netProfit: string;
    labor: string;
    searchPlaceholder: string;
    all: string;
    inflows: string;
    outflows: string;
    category: string;
    amount: string;
    operator: string;
    date: string;
    noTransactions: string;
    details: string;
    poDetails: string;
    wastageDetails: string;
    saleDetails: string;
    day: string;
    week: string;
    month: string;
    taxSummary: string;
    vatReceived: string;
    vatExpected: string;
    vatPaid: string;
    netVat: string;
    vatReceivedDesc: string;
    vatExpectedDesc: string;
    vatPaidDesc: string;
    netVatDesc: string;
    vatOwedToTaxMan: string;
    vatReclaimable: string;
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
    availableTables: string;
    noTablesAvailable: string;
    tablesOverview: string;
    noReservationsToday: string;
    createResOrCreateWalkIn: string;
    noGuestsWaitlist: string;
    addWalkInGetStarted: string;
    crmLookup: string;
    searchCrmPlaceholder: string;
    specialRequestsPlaceholder: string;
    seatGuest: string;
    assignTable: string;
    selectTablePlaceholder: string;
    noTableAssigned: string;
    waitMinutes: string;
    now: string;
    successRefreshed: string;
    successSeated: string;
    errorSeated: string;
    successCancelled: string;
    errorCancelled: string;
    successNoShow: string;
    errorNoShow: string;
    successWaitlistAdded: string;
    errorWaitlistAdded: string;
    successCreated: string;
    errorCreated: string;
    smsNotified: string;
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
    addProduct: string;
    addNewProduct: string;
    createProductDesc: string;
    editProductStock: string;
    configureThresholds: string;
    productInfo: string;
    productName: string;
    unitLabel: string;
    category: string;
    storageLocation: string;
    vendorLabel: string;
    stockCostLevels: string;
    addToStock: string;
    minLevelAlert: string;
    maxLevelTarget: string;
    costPerUnitLabel: string;
    printList: string;
    saveChanges: string;
    quickAdd: string;
    shoppingList: string;
    generatedOn: string;
    itemsLowInStock: string;
    ingredientProduct: string;
    suggestedReorder: string;
    estCost: string;
    totalEstRestockValue: string;
    popupBlockedTitle: string;
    popupBlockedDesc: string;
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
    deleteShift: string;
    confirmDeleteShift: string;
    shiftDeleted: string;
    errorDeleteShift: string;
    shiftAssigned: string;
    shiftUpdated: string;
    errorSaveShift: string;
    editShiftAssignment: string;
    assignShift: string;
    staffMember: string;
    shiftTemplate: string;
    selectTemplate: string;
    startTimeOverride: string;
    endTimeOverride: string;
    positionRole: string;
    additionalInstructions: string;
    noShiftsScheduled: string;
    assignFirstShift: string;
    shift: string;
    shifts: string;
    requiredFieldsError: string;
    positionServer: string;
    positionBartender: string;
    positionChef: string;
    positionHost: string;
    positionManager: string;
    positionBusboy: string;
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
    firstName: string;
    lastName: string;
    birthday: string;
    marketingOptIn: string;
    addCustomer: string;
    addNewCustomer: string;
    addNewCustomerDesc: string;
    nameRequired: string;
    errorCreateCustomer: string;
    filterByTier: string;
    tier: string;
    contactInfo: string;
    loyaltyProgram: string;
    progressTo: string;
    pointsTo: string;
    addPoints: string;
    sendMarketingEmail: string;
    pointsAdded: string;
    creditAuthorized: string;
    creditRevoked: string;
    errorLoadCustomers: string;
    memberSince: string;
    allergiesPlaceholder: string;
    marketingEmailAlert: string;
    noEmailOnFile: string;
    errorAddPoints: string;
    errorUpdateCredit: string;
  };

  // ─── Settings ───

  settings: {
    title: string;
    dataManagement: string;
    dangerZone: string;
    clearDatabase: string;
    clearDatabaseDesc: string;
    backupDatabase: string;
    backupDatabaseDesc: string;
    confirmClearTitle: string;
    confirmClearDesc: string;
    clearSuccess: string;
    clearFailed: string;
    backupSuccess: string;
    backupFailed: string;
    restoreDatabase: string;
    restoreSuccess: string;
    restoreFailed: string;
    localization: string;
    localizationDesc: string;
    language: string;
    customTaxRate: string;
    resetToDefault: string;
    brandingTitle: string;
    brandingDesc: string;
    systemTheme: string;
    darkTheme: string;
    lightTheme: string;
    primaryColorAccent: string;
    restaurantIdentity: string;
    restaurantName: string;
    logoDisplayType: string;
    logoInitials: string;
    logoEmoji: string;
    logoUrlLabel: string;
    logoUploadOrUrl: string;
    logoSelectFile: string;
    logoClearImage: string;
    saveBranding: string;
    resetBranding: string;
    staffPinConfig: string;
    staffPinDesc: string;
    showPin: string;
    hidePin: string;
    setPin: string;
    roleMultipliersTitle: string;
    roleMultipliersDesc: string;
  };

  tableOrder: {
    premiumSelfService: string;
    searchPlaceholder: string;
    noItemsFound: string;
    liveBillTracker: string;
    dishesInPrep: string;
    noActiveOrders: string;
    addItemsToOrder: string;
    tableBillTotal: string;
    modifierTitle: string;
    notesTitle: string;
    addToCart: string;
    reviewOrder: string;
    cartTitle: string;
    specialRequests: string;
    placeOrderBtn: string;
    orderSubmitted: string;
    orderFailed: string;
    prepStatusOrdered: string;
    prepStatusPreparing: string;
    prepStatusReady: string;
    prepStatusServed: string;
    modifierRequired: string;
    modifierOptional: string;
    browseMenu: string;
    trackOrders: string;
    guestsSeated: string;
    viewCart: string;
    popularBadge: string;
    modifiersRequiredBadge: string;
    extrasTitle: string;
    itemAddedToCart: string;
    cartEmpty: string;
    placedBySelf: string;
  };

  menuManagement: {
    title: string;
    editDesc: string;
    searchPlaceholder: string;
    noItemsFound: string;
    editItem: string;
    editItemDesc: string;
    itemName: string;
    basePrice: string;
    image: string;
    imagePlaceholder: string;
    upload: string;
    uploading: string;
    optionalExtras: string;
    addExtra: string;
    extraPlaceholder: string;
    noExtras: string;
    createOne: string;
    saving: string;
    saveChanges: string;
    toastUpdated: string;
    toastFailed: string;
    toastUploaded: string;
    toastUploadFailed: string;
  };

  landing: {
    welcome: string;
    tagline: string;
    guestSectionTitle: string;
    guestSectionDesc: string;
    viewMenuBtn: string;
    selectTableLabel: string;
    selectTablePlaceholder: string;
    installGuestBtn: string;
    installGuestDesc: string;
    staffSectionTitle: string;
    staffSectionDesc: string;
    goToManagementBtn: string;
    installStaffBtn: string;
    installStaffDesc: string;
    pwaInstructionsTitle: string;
    pwaInstructionsIOS: string;
    pwaInstructionsInstalled: string;
    bookTableBtn: string;
    selectTableBtn: string;
    tableSelectedLabel: string;
    browseMenuBtn: string;
    selectedUnlocked: string;
    signatureCutsTitle: string;
    signatureCutsDesc: string;
    coastalDelicaciesTitle: string;
    coastalDelicaciesDesc: string;
    bookTableModalTitle: string;
    bookTableModalDesc: string;
    emailOptionalLabel: string;
    tableOptionalLabel: string;
    autoAssignTableOpt: string;
    bookOnlineResBtn: string;
    interactiveFloorPlanTitle: string;
    floorPlanDesc: string;
    selectTableDropdownPlaceholder: string;
    floorPlanSizingLabel: string;
    legendFree: string;
    legendSeated: string;
    legendReserved: string;
    staffPortalAccessBtn: string;
    ourAddress: string;
    guestOption: string;
    guestsOption: string;
    bookingLoading: string;
    toastTableSelectedTitle: string;
    toastTableSelectedDesc: string;
    toastTableTapOrderDesc: string;
    seatsLabel: string;
    zoomLabel: string;
    fitBtn: string;
    noTablesFound: string;
    installAppBtn: string;
  };

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
    none: 'None',
    add: 'Add',
    per: 'per',
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
    transactions: 'Transactions',
    settings: 'Settings',
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
    activityOrderPlaced: 'Order placed at {table} by {creator} — {amount}',
    activityReservation: 'Reservation for {guest} — {partySize} guests at {time}',
    activityClockIn: '{user} clocked in',
    minAgo: '{min} min ago',
    hoursAgo: '{hours}h ago',
    daysAgo: '{days}d ago',
    now: 'Just now',
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
    resetShift: 'Reset Shift',
    clearShiftOperations: 'Clear Shift Operations?',
    clearAllData: 'Clear All Data',
    dailyCheckMonitor: 'Daily Check Monitor',
    todaysSales: "Today's Sales",
    cashPayments: 'Cash Payments',
    cardPayments: 'Card Payments',
    creditPayments: 'Credit Payments',
    avgCheckSize: 'Avg Check Size',
    activeServedChecks: 'Active & Served Checks',
    tableTallies: 'Table Tallies',
    serverSales: 'Server Sales',
    noActiveTablesToday: 'No active tables today',
    noServerRecordsToday: 'No server records today',
    serviceNotStartedYet: 'Service has not started yet',
    noMatchingOrdersFound: 'No matching orders found',
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
    addTable: 'Add Table',
    deleteTable: 'Delete Table',
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
    sectionView: 'Sections',
    floorView: 'Floor View',
    dragToMove: 'Drag table to reposition',
    positionSaved: 'Position saved',
    positionSaveFailed: 'Failed to save position',
    quickEditSeats: 'Seats',
    quickAssignServer: 'Server',
    seatsShort: 'seats',
    maxSeats: 'Max 20 seats',
    editLayout: 'Edit Layout',
    doneEditing: 'Done Editing',
    clickEditLayoutToMove: 'Click "Edit Layout" to reposition tables',
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
    settleBill: 'Settle Bill',
    payBill: 'Pay Bill',
    selectPaymentMethod: 'Select Payment Method',
    cash: 'Cash',
    card: 'Card',
    credit: 'Credit',
    paymentProcessing: 'Processing payment...',
    paymentSuccessful: 'Payment successful. Table cleared.',
    paymentFailed: 'Payment transaction failed',
    checkPaidClosed: 'Check successfully paid & closed',
    authorizeStoreCredit: 'Authorize Store Credit',
    allowedCreditDesc: 'Allows guest to charge bills to store credit account.',
    creditApproved: 'Credit Authorization Approved',
    creditApprovedDesc: 'Manually authorized customer is cleared for store credit.',
    creditDenied: 'Authorization Denied',
    creditDeniedDesc: 'Store credit requires explicit manager authorization override.',
    searchSelectGuest: 'Search or select guest...',
    blocked: 'Blocked',
    selectCustomerCredit: 'Please select a customer to apply credit.',
    creditNotAllowed: 'Selected customer is not authorized by management to use store credit.',
    customerGuest: 'Customer / Guest',
    noCustomerAssigned: 'Walk-in / No Customer',
    manageMenu: 'Manage Menu',
    category_Starters: 'Starters',
    category_Mains: 'Mains',
    category_Desserts: 'Desserts',
    category_Cocktails: 'Cocktails',
    category_Beer_and_Wine: 'Beer & Wine',
    category_Non_Alcoholic: 'Non-Alcoholic',
    category_Sides: 'Sides',
    sortBy: 'Sort by',
    popularity: 'Popularity',
    sortName: 'Name (A-Z)',
    sortPriceLow: 'Price: Low-High',
    sortPriceHigh: 'Price: High-Low',
    menuManagement: 'Menu Management',
    menuManagementDesc: 'Create, edit, or remove dishes from the digital restaurant menu.',
    addNewDish: 'Add New Dish',
    itemsCountLabel: 'items',
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
    activeTickets: 'Active Tickets',
    kanbanBoard: 'Kanban Board',
    queued: 'Queued',
    preparing: 'Preparing',
    ready: 'Ready',
    itemReadyAlert: 'Dish is ready for pickup!',
    produced: 'Produced',
    today: 'Today',
    week: 'This Week',
    month: 'This Month',
    productionDetails: 'Production Details',
    preparedItems: 'Prepared Dishes & Drinks',
    chronologicalLog: 'Chronological Log',
    groupedSummary: 'Grouped Summary',
    item: 'Item',
    qty: 'Qty',
    station: 'Station',
    preparedTime: 'Prepared Time',
    searchItems: 'Search items...',
    noItemsPrepared: 'No items prepared in this period',
  },
  transactions: {
    title: 'Transactions Ledger',
    subtitle: 'Manage and audit all financial inflows and outflows',
    inflow: 'Inflow (Sales)',
    outflow: 'Outflow (Expenses)',
    netProfit: 'Net Profit/Loss',
    labor: 'Labor Cost',
    searchPlaceholder: 'Search by ID, customer, vendor, operator...',
    all: 'All Transactions',
    inflows: 'Inflows Only',
    outflows: 'Outflows Only',
    category: 'Category',
    amount: 'Amount',
    operator: 'Operator',
    date: 'Date & Time',
    noTransactions: 'No transactions found in this period',
    details: 'Transaction Details',
    poDetails: 'Purchase Order Details',
    wastageDetails: 'Wastage Details',
    saleDetails: 'Sale Details',
    day: 'Today',
    week: 'This Week',
    month: 'This Month',
    taxSummary: 'Tax & VAT Summary',
    vatReceived: 'VAT Received (Paid Sales)',
    vatExpected: 'VAT Accrued (Total Sales)',
    vatPaid: 'Estimated VAT Paid (Purchases)',
    netVat: 'Net VAT Position',
    vatReceivedDesc: 'Actual VAT collected from settled orders',
    vatExpectedDesc: 'Total VAT generated on all sales (accrued)',
    vatPaidDesc: 'Estimated VAT paid on inventory purchases',
    netVatDesc: 'Net VAT balance (VAT Received - VAT Paid)',
    vatOwedToTaxMan: 'Owed to Tax Man',
    vatReclaimable: 'Tax Reclaimable',
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
    availableTables: 'Available Tables',
    noTablesAvailable: 'No tables available',
    tablesOverview: 'Tables Seating Overview',
    noReservationsToday: 'No reservations for today',
    createResOrCreateWalkIn: 'Create a new reservation or add a walk-in guest',
    noGuestsWaitlist: 'No guests on the waitlist',
    addWalkInGetStarted: 'Add a walk-in guest to get started',
    crmLookup: 'CRM Lookup (optional)',
    searchCrmPlaceholder: 'Search by name, email, or phone...',
    specialRequestsPlaceholder: 'Special requests, allergies, celebrations...',
    seatGuest: 'Seat Guest',
    assignTable: 'Assign Table',
    selectTablePlaceholder: 'Select a table',
    noTableAssigned: 'No table assigned',
    waitMinutes: 'wait',
    now: 'NOW',
    successRefreshed: 'Reservations refreshed',
    successSeated: 'Guest seated successfully',
    errorSeated: 'Failed to seat guest',
    successCancelled: 'Reservation cancelled',
    errorCancelled: 'Failed to cancel reservation',
    successNoShow: 'Guest marked as no-show',
    errorNoShow: 'Failed to update reservation',
    successWaitlistAdded: 'Guest added to waitlist',
    errorWaitlistAdded: 'Failed to add walk-in guest',
    successCreated: 'Reservation created successfully',
    errorCreated: 'Failed to create reservation',
    smsNotified: 'SMS notification sent',
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
    addProduct: 'Add Product',
    addNewProduct: 'Add New Product',
    createProductDesc: 'Create a new inventory item and set its default levels.',
    editProductStock: 'Edit Product & Stock Levels',
    configureThresholds: 'Configure thresholds, vendor, and levels',
    productInfo: 'Product Info',
    productName: 'Product Name',
    unitLabel: 'Unit (e.g. KG, L, UNIT)',
    category: 'Category',
    storageLocation: 'Storage Location',
    vendorLabel: 'Vendor',
    stockCostLevels: 'Stock & Cost Levels',
    addToStock: 'Add to Stock (Restock)',
    minLevelAlert: 'Min Level',
    maxLevelTarget: 'Max Level',
    costPerUnitLabel: 'Cost per Unit',
    printList: 'Print List',
    saveChanges: 'Save Changes',
    quickAdd: 'Quick Add',
    shoppingList: 'Shopping List',
    generatedOn: 'Generated on',
    itemsLowInStock: 'Items Low in Stock',
    ingredientProduct: 'Ingredient / Product',
    suggestedReorder: 'Suggested Reorder',
    estCost: 'Est. Cost',
    totalEstRestockValue: 'Total Estimated Restock Value',
    popupBlockedTitle: 'Pop-up Blocked',
    popupBlockedDesc: 'Please allow pop-ups to print the shopping list.',
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
    deleteShift: 'Delete Shift',
    confirmDeleteShift: 'Are you sure you want to delete this shift assignment?',
    shiftDeleted: 'Shift deleted successfully.',
    errorDeleteShift: 'Failed to delete shift.',
    shiftAssigned: 'Shift assigned successfully.',
    shiftUpdated: 'Shift updated successfully.',
    errorSaveShift: 'Failed to save shift.',
    editShiftAssignment: 'Edit Shift Assignment',
    assignShift: 'Assign Shift',
    staffMember: 'Staff Member',
    shiftTemplate: 'Shift Template',
    selectTemplate: 'Select a Template',
    startTimeOverride: 'Start Time Override',
    endTimeOverride: 'End Time Override',
    positionRole: 'Position / Role',
    additionalInstructions: 'Additional instructions...',
    noShiftsScheduled: 'No shifts scheduled for this date.',
    assignFirstShift: 'Assign First Shift',
    shift: 'shift',
    shifts: 'shifts',
    requiredFieldsError: 'Please fill in all required fields.',
    positionServer: 'Server',
    positionBartender: 'Bartender',
    positionChef: 'Chef',
    positionHost: 'Host',
    positionManager: 'Manager',
    positionBusboy: 'Busboy',
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
    firstName: 'First Name',
    lastName: 'Last Name',
    birthday: 'Birthday',
    marketingOptIn: 'Marketing opt-in',
    addCustomer: 'Add Customer',
    addNewCustomer: 'Add New Customer',
    addNewCustomerDesc: 'Add a new guest to the CRM system.',
    nameRequired: 'First name and last name are required.',
    errorCreateCustomer: 'Failed to create customer',
    filterByTier: 'Filter by tier',
    tier: 'Tier',
    contactInfo: 'Contact Info',
    loyaltyProgram: 'Loyalty Program',
    progressTo: 'Progress to',
    pointsTo: 'points to',
    addPoints: 'Add Points',
    sendMarketingEmail: 'Send Marketing Email',
    pointsAdded: 'Points added to customer',
    creditAuthorized: 'Store credit authorized for guest',
    creditRevoked: 'Store credit revoked for guest',
    errorLoadCustomers: 'Failed to load customers',
    memberSince: 'Member since',
    allergiesPlaceholder: 'nuts, gluten (comma-separated)',
    marketingEmailAlert: 'Marketing email would be sent to',
    noEmailOnFile: 'no email on file',
    errorAddPoints: 'Failed to add points',
    errorUpdateCredit: 'Failed to update credit authorization',
  },
  settings: {
    title: 'Settings',
    dataManagement: 'Data Management',
    dangerZone: 'Danger Zone',
    clearDatabase: 'Clear Database',
    clearDatabaseDesc: 'Wipes all orders, transactions, and customers. Keeps menu and staff.',
    backupDatabase: 'Backup Database',
    backupDatabaseDesc: 'Download a copy of the database before making changes.',
    confirmClearTitle: 'Are you absolutely sure?',
    confirmClearDesc: 'This will delete all historical transactional data.',
    clearSuccess: 'Database cleared successfully.',
    clearFailed: 'Failed to clear database.',
    backupSuccess: 'Backup downloaded successfully.',
    backupFailed: 'Failed to backup database.',
    restoreDatabase: 'Restore Database',
    restoreSuccess: 'Database restored successfully.',
    restoreFailed: 'Failed to restore database.',
    localization: 'Localization & Tax',
    localizationDesc: 'Configure your region, language, and override default tax rates.',
    language: 'Language & Region',
    customTaxRate: 'Custom Tax Rate (%)',
    resetToDefault: 'Reset to Default',
    brandingTitle: 'Branding & Visual Themes',
    brandingDesc: 'Customize the restaurant identity, color theme, and logos globally.',
    systemTheme: 'System Theme',
    darkTheme: 'Dark Theme',
    lightTheme: 'Light Theme',
    primaryColorAccent: 'Primary Color Accent',
    restaurantIdentity: 'Restaurant Identity & Logo',
    restaurantName: 'Restaurant Name',
    logoDisplayType: 'Logo Display Type',
    logoInitials: 'Logo Text Initials (max 4 chars)',
    logoEmoji: 'Logo Emoji',
    logoUrlLabel: 'Logo Image URL',
    logoUploadOrUrl: 'Or upload local image',
    logoSelectFile: 'Select local file',
    logoClearImage: 'Clear Image',
    saveBranding: 'Save Branding',
    resetBranding: 'Reset to Defaults',
    staffPinConfig: 'Staff PIN Configuration',
    staffPinDesc: 'Configure and attribute numeric 4-digit PINs for employee clock-ins.',
    showPin: 'Show PIN',
    hidePin: 'Hide PIN',
    setPin: 'Set PIN',
    roleMultipliersTitle: 'Role Multipliers for Tips',
    roleMultipliersDesc: 'Configure point weights for tip distribution by staff role.',
  },
  tableOrder: {
    premiumSelfService: 'Premium Self-Service',
    searchPlaceholder: 'Search menu items...',
    noItemsFound: 'No items found',
    liveBillTracker: 'Live Bill & Status Tracker',
    dishesInPrep: 'Dishes In Preparation',
    noActiveOrders: 'No active orders yet',
    addItemsToOrder: 'Add items below to start your order.',
    tableBillTotal: 'Table Bill Total',
    modifierTitle: 'Customize Item',
    notesTitle: 'Kitchen notes (allergies, requests...)',
    addToCart: 'Add to Order',
    reviewOrder: 'Review Order',
    cartTitle: 'Your Table Cart',
    specialRequests: 'Special requests...',
    placeOrderBtn: 'Submit Order to Kitchen',
    orderSubmitted: 'Order submitted to kitchen successfully!',
    orderFailed: 'Failed to place order. Please try again.',
    prepStatusOrdered: 'Ordered',
    prepStatusPreparing: 'Preparing',
    prepStatusReady: 'Ready',
    prepStatusServed: 'Served',
    modifierRequired: 'Required selection',
    modifierOptional: 'Optional modifier',
    browseMenu: 'Browse Menu',
    trackOrders: 'Track Orders',
    guestsSeated: 'Guests Seated:',
    viewCart: 'View Cart',
    popularBadge: 'Popular',
    modifiersRequiredBadge: 'Required',
    extrasTitle: 'Select Extras',
    itemAddedToCart: 'Item added to cart',
    cartEmpty: 'Your cart is empty',
    placedBySelf: 'Guest Order',
  },
  menuManagement: {
    title: 'Menu Management',
    editDesc: 'Edit menu items, images, and optional extras.',
    searchPlaceholder: 'Search items...',
    noItemsFound: 'No menu items found matching',
    editItem: 'Edit {name}',
    editItemDesc: 'Update the menu item details, image, and optional extras.',
    itemName: 'Item Name',
    basePrice: 'Base Price',
    image: 'Image',
    imagePlaceholder: 'https://... or upload local',
    upload: 'Upload',
    uploading: 'Uploading...',
    optionalExtras: 'Optional Extras (Additions)',
    addExtra: 'Add Extra',
    extraPlaceholder: 'Extra name (e.g. Extra Cheese)',
    noExtras: 'No optional extras configured.',
    createOne: 'Create one now',
    saving: 'Saving...',
    saveChanges: 'Save Changes',
    toastUpdated: 'Menu item updated successfully',
    toastFailed: 'Failed to update menu item',
    toastUploaded: 'Image uploaded successfully',
    toastUploadFailed: 'Failed to upload image',
  },
  landing: {
    welcome: 'Welcome to',
    tagline: 'Experience premium dining with interactive self-service ordering at your table.',
    guestSectionTitle: 'For Our Guests',
    guestSectionDesc: 'Browse the menu, customize your order, and submit it directly to the kitchen.',
    viewMenuBtn: 'Browse Menu & Order',
    selectTableLabel: 'Select Your Table',
    selectTablePlaceholder: 'Choose a table...',
    installGuestBtn: 'Install Guest Web App',
    installGuestDesc: 'Add the Gilded Fork to your home screen for instant table ordering.',
    staffSectionTitle: 'For Staff & Operations',
    staffSectionDesc: 'Access POS orders, KDS kitchen display, floor plan layout, CRM, and system settings.',
    goToManagementBtn: 'Go to Management App',
    installStaffBtn: 'Install Staff Pad App',
    installStaffDesc: 'Install the full management suite on service tablets and pads.',
    pwaInstructionsTitle: 'Installation Guide',
    pwaInstructionsIOS: 'On iOS, tap the Share button and select "Add to Home Screen".',
    pwaInstructionsInstalled: 'App is already installed and ready on this device.',
    bookTableBtn: 'Book a Table',
    selectTableBtn: 'Select Table & Order',
    tableSelectedLabel: 'Table: {name}',
    browseMenuBtn: 'Browse Menu & Order',
    selectedUnlocked: 'Selected: {name} (unlocked for order placement)',
    signatureCutsTitle: 'Signature Cuts',
    signatureCutsDesc: 'Dry-aged prime steak prepared by our master chefs.',
    coastalDelicaciesTitle: 'Coastal Delicacies',
    coastalDelicaciesDesc: 'Fresh roasted lobster tail & wild prawns with herb butter.',
    bookTableModalTitle: 'Book Your Table',
    bookTableModalDesc: 'Instant verification. Reserve online seamlessly.',
    emailOptionalLabel: 'Email (Optional)',
    tableOptionalLabel: 'Table (Optional)',
    autoAssignTableOpt: 'Auto Assign Table',
    bookOnlineResBtn: 'Book Online Reservation',
    interactiveFloorPlanTitle: 'Interactive Restaurant Floor Plan',
    floorPlanDesc: 'Click any free table (green) to select it for your order.',
    selectTableDropdownPlaceholder: 'Select table from list...',
    floorPlanSizingLabel: 'Floor Plan Sizing',
    legendFree: 'Free',
    legendSeated: 'Seated',
    legendReserved: 'Reserved',
    staffPortalAccessBtn: 'Staff Portal Access',
    ourAddress: 'Our Address',
    guestOption: 'Guest',
    guestsOption: 'Guests',
    bookingLoading: 'Booking...',
    toastTableSelectedTitle: 'Table Selected',
    toastTableSelectedDesc: 'You have selected Table {name}.',
    toastTableTapOrderDesc: 'Selected {name}. Tap order button to proceed.',
    seatsLabel: 'seats',
    zoomLabel: 'Zoom',
    fitBtn: 'Fit',
    noTablesFound: 'No tables found.',
    installAppBtn: 'Install App',
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
    none: 'Nenhum',
    add: 'Adicionar',
    per: 'por',
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
    transactions: 'Transações',
    settings: 'Configurações',
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
    activityOrderPlaced: 'Pedido efetuado em {table} por {creator} — {amount}',
    activityReservation: 'Reserva para {guest} — {partySize} clientes às {time}',
    activityClockIn: '{user} iniciou o turno',
    minAgo: 'há {min} min',
    hoursAgo: 'há {hours}h',
    daysAgo: 'há {days}d',
    now: 'Agora mesmo',
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
    resetShift: 'Reiniciar Turno',
    clearShiftOperations: 'Limpar Operações do Turno?',
    clearAllData: 'Limpar Todos os Dados',
    dailyCheckMonitor: 'Monitor de Pedidos Diários',
    todaysSales: "Vendas de Hoje",
    cashPayments: 'Pagamentos em Dinheiro',
    cardPayments: 'Pagamentos com Cartão',
    creditPayments: 'Pagamentos a Crédito',
    avgCheckSize: 'Valor Médio por Pedido',
    activeServedChecks: 'Pedidos Ativos e Servidos',
    tableTallies: 'Totais de Mesas',
    serverSales: 'Vendas por Empregado',
    noActiveTablesToday: 'Sem mesas ativas hoje',
    noServerRecordsToday: 'Sem registos de empregados hoje',
    serviceNotStartedYet: 'O serviço ainda não começou',
    noMatchingOrdersFound: 'Nenhum pedido correspondente encontrado',
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
    addTable: 'Adicionar Mesa',
    deleteTable: 'Eliminar Mesa',
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
    sectionView: 'Secções',
    floorView: 'Vista Planta',
    dragToMove: 'Arraste a mesa para reposicionar',
    positionSaved: 'Posição guardada',
    positionSaveFailed: 'Falha ao guardar posição',
    quickEditSeats: 'Lugares',
    quickAssignServer: 'Empregado',
    seatsShort: 'lug.',
    maxSeats: 'Máx. 20 lugares',
    editLayout: 'Editar Planta',
    doneEditing: 'Concluído',
    clickEditLayoutToMove: 'Clique em "Editar Planta" para reposicionar',
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
    settleBill: 'Fechar Conta',
    payBill: 'Pagar Conta',
    selectPaymentMethod: 'Selecionar Método de Pagamento',
    cash: 'Numerário',
    card: 'Cartão',
    credit: 'Crédito',
    paymentProcessing: 'A processar pagamento...',
    paymentSuccessful: 'Pagamento concluído. Mesa livre.',
    paymentFailed: 'A transação de pagamento falhou',
    checkPaidClosed: 'Conta paga e fechada com sucesso',
    authorizeStoreCredit: 'Autorizar Crédito da Loja',
    allowedCreditDesc: 'Permite que o cliente debite contas na sua conta de crédito.',
    creditApproved: 'Autorização de Crédito Aprovada',
    creditApprovedDesc: 'Cliente autorizado manualmente está liberado para crédito.',
    creditDenied: 'Autorização Negada',
    creditDeniedDesc: 'O crédito exige autorização explícita do gerente.',
    searchSelectGuest: 'Procurar ou selecionar cliente...',
    blocked: 'Bloqueado',
    selectCustomerCredit: 'Por favor, selecione um cliente para aplicar o crédito.',
    creditNotAllowed: 'O cliente selecionado não tem autorização da gerência para usar crédito.',
    customerGuest: 'Cliente / Convidado',
    noCustomerAssigned: 'Cliente de passagem / Não Atribuído',
    manageMenu: 'Gerenciar Menu',
    category_Starters: 'Entradas',
    category_Mains: 'Pratos Principais',
    category_Desserts: 'Sobremesas',
    category_Cocktails: 'Cocktails',
    category_Beer_and_Wine: 'Cerveja e Vinho',
    category_Non_Alcoholic: 'Bebidas sem Álcool',
    category_Sides: 'Acompanhamentos',
    sortBy: 'Ordenar por',
    popularity: 'Popularidade',
    sortName: 'Nome (A-Z)',
    sortPriceLow: 'Preço: Baixo-Alto',
    sortPriceHigh: 'Preço: Alto-Baixo',
    menuManagement: 'Gestão de Menu',
    menuManagementDesc: 'Crie, edite ou remova pratos do menu digital do restaurante.',
    addNewDish: 'Adicionar Prato',
    itemsCountLabel: 'itens',
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
    activeTickets: 'Fichas Ativas',
    kanbanBoard: 'Quadro Kanban',
    queued: 'Na Fila',
    preparing: 'A Preparar',
    ready: 'Pronto',
    itemReadyAlert: 'Prato pronto para servir!',
    produced: 'Produzido',
    today: 'Hoje',
    week: 'Esta Semana',
    month: 'Este Mês',
    productionDetails: 'Detalhes de Produção',
    preparedItems: 'Pratos e Bebidas Preparados',
    chronologicalLog: 'Registo Cronológico',
    groupedSummary: 'Resumo Agrupado',
    item: 'Item',
    qty: 'Qtd',
    station: 'Estação',
    preparedTime: 'Hora de Preparação',
    searchItems: 'Procurar itens...',
    noItemsPrepared: 'Nenhum item preparado neste período',
  },
  transactions: {
    title: 'Livro de Transações',
    subtitle: 'Gerencie e audite todos os fluxos de entrada e saída',
    inflow: 'Entrada (Vendas)',
    outflow: 'Saída (Despesas)',
    netProfit: 'Lucro Líquido',
    labor: 'Custo de Mão de Obra',
    searchPlaceholder: 'Buscar por ID, cliente, fornecedor, operador...',
    all: 'Todas as Transações',
    inflows: 'Apenas Entradas',
    outflows: 'Apenas Saídas',
    category: 'Categoria',
    amount: 'Valor',
    operator: 'Operador',
    date: 'Data e Hora',
    noTransactions: 'Nenhuma transação encontrada neste período',
    details: 'Detalhes da Transação',
    poDetails: 'Detalhes do Pedido de Compra',
    wastageDetails: 'Detalhes de Desperdício',
    saleDetails: 'Detalhes da Venda',
    day: 'Hoje',
    week: 'Esta Semana',
    month: 'Este Mês',
    taxSummary: 'Resumo de Impostos e IVA',
    vatReceived: 'IVA Recebido (Vendas Pagas)',
    vatExpected: 'IVA Acumulado (Total de Vendas)',
    vatPaid: 'IVA Pago Estimado (Compras)',
    netVat: 'Posição Líquida do IVA',
    vatReceivedDesc: 'IVA real cobrado de pedidos liquidados',
    vatExpectedDesc: 'IVA total gerado em todas as vendas (acumulado)',
    vatPaidDesc: 'IVA estimado pago em compras de inventário',
    netVatDesc: 'Saldo líquido de IVA (IVA Recebido - IVA Pago)',
    vatOwedToTaxMan: 'Devido às Finanças',
    vatReclaimable: 'IVA a Recuperar',
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
    availableTables: 'Mesas Disponíveis',
    noTablesAvailable: 'Nenhuma mesa disponível',
    tablesOverview: 'Visão Geral das Mesas',
    noReservationsToday: 'Sem reservas para hoje',
    createResOrCreateWalkIn: 'Crie uma nova reserva ou adicione um cliente sem reserva',
    noGuestsWaitlist: 'Nenhum cliente na lista de espera',
    addWalkInGetStarted: 'Adicione um cliente sem reserva para começar',
    crmLookup: 'Pesquisa de CRM (opcional)',
    searchCrmPlaceholder: 'Pesquisar por nome, email ou telefone...',
    specialRequestsPlaceholder: 'Pedidos especiais, alergias, celebrações...',
    seatGuest: 'Sentar Cliente',
    assignTable: 'Atribuir Mesa',
    selectTablePlaceholder: 'Selecione uma mesa',
    noTableAssigned: 'Sem mesa atribuída',
    waitMinutes: 'espera',
    now: 'AGORA',
    successRefreshed: 'Reservas atualizadas',
    successSeated: 'Cliente sentado com sucesso',
    errorSeated: 'Falha ao sentar cliente',
    successCancelled: 'Reserva cancelada',
    errorCancelled: 'Falha ao cancelar reserva',
    successNoShow: 'Cliente marcado como não compareceu',
    errorNoShow: 'Falha ao atualizar reserva',
    successWaitlistAdded: 'Cliente adicionado à lista de espera',
    errorWaitlistAdded: 'Falha ao adicionar cliente sem reserva',
    successCreated: 'Reserva criada com sucesso',
    errorCreated: 'Falha ao criar reserva',
    smsNotified: 'Notificação SMS enviada',
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
    addProduct: 'Adicionar Produto',
    addNewProduct: 'Adicionar Novo Produto',
    createProductDesc: 'Crie um novo item de inventário e defina os seus níveis padrão.',
    editProductStock: 'Editar Níveis de Produto e Stock',
    configureThresholds: 'Configure limites, fornecedor e níveis',
    productInfo: 'Informações do Produto',
    productName: 'Nome do Produto',
    unitLabel: 'Unidade (ex. KG, L, UNID)',
    category: 'Categoria',
    storageLocation: 'Local de Armazenamento',
    vendorLabel: 'Fornecedor',
    stockCostLevels: 'Níveis de Stock e Custo',
    addToStock: 'Adicionar ao Stock (Restock)',
    minLevelAlert: 'Nível Mínimo',
    maxLevelTarget: 'Nível Máximo',
    costPerUnitLabel: 'Custo por Unidade',
    printList: 'Imprimir Lista',
    saveChanges: 'Guardar Alterações',
    quickAdd: 'Adicionar Rápido',
    shoppingList: 'Lista de Compras',
    generatedOn: 'Gerado em',
    itemsLowInStock: 'Itens com Stock Baixo',
    ingredientProduct: 'Ingrediente / Produto',
    suggestedReorder: 'Reabastecimento Sugerido',
    estCost: 'Custo Est.',
    totalEstRestockValue: 'Valor Total Estimado de Reabastecimento',
    popupBlockedTitle: 'Pop-up Bloqueado',
    popupBlockedDesc: 'Por favor, permita pop-ups para imprimir a lista de compras.',
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
    deleteShift: 'Eliminar Turno',
    confirmDeleteShift: 'Tem a certeza de que deseja eliminar esta atribuição de turno?',
    shiftDeleted: 'Turno eliminado com sucesso.',
    errorDeleteShift: 'Falha ao eliminar o turno.',
    shiftAssigned: 'Turno atribuído com sucesso.',
    shiftUpdated: 'Turno atualizado com sucesso.',
    errorSaveShift: 'Falha ao salvar o turno.',
    editShiftAssignment: 'Editar Atribuição de Turno',
    assignShift: 'Atribuir Turno',
    staffMember: 'Membro da Equipa',
    shiftTemplate: 'Modelo de Turno',
    selectTemplate: 'Selecione um Modelo',
    startTimeOverride: 'Substituição da Hora de Início',
    endTimeOverride: 'Substituição da Hora de Fim',
    positionRole: 'Posição / Função',
    additionalInstructions: 'Instruções adicionais...',
    noShiftsScheduled: 'Nenhum turno agendado para esta data.',
    assignFirstShift: 'Atribuir Primeiro Turno',
    shift: 'turno',
    shifts: 'turnos',
    requiredFieldsError: 'Por favor, preencha todos os campos obrigatórios.',
    positionServer: 'Empregado de Mesa',
    positionBartender: 'Barman',
    positionChef: 'Chef',
    positionHost: 'Anfitrião',
    positionManager: 'Gerente',
    positionBusboy: 'Ajudante de Mesa',
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
    firstName: 'Primeiro Nome',
    lastName: 'Apelido',
    birthday: 'Data de Nascimento',
    marketingOptIn: 'Autorizar marketing',
    addCustomer: 'Adicionar Cliente',
    addNewCustomer: 'Adicionar Novo Cliente',
    addNewCustomerDesc: 'Adicione um novo cliente ao sistema CRM.',
    nameRequired: 'O primeiro nome e o apelido são obrigatórios.',
    errorCreateCustomer: 'Falha ao criar cliente',
    filterByTier: 'Filtrar por nível',
    tier: 'Nível',
    contactInfo: 'Informações de Contacto',
    loyaltyProgram: 'Programa de Fidelização',
    progressTo: 'Progresso para',
    pointsTo: 'pontos para',
    addPoints: 'Adicionar Pontos',
    sendMarketingEmail: 'Enviar E-mail de Marketing',
    pointsAdded: 'Pontos adicionados ao cliente',
    creditAuthorized: 'Crédito de loja autorizado para o cliente',
    creditRevoked: 'Crédito de loja revogado para o cliente',
    errorLoadCustomers: 'Falha ao carregar clientes',
    memberSince: 'Membro desde',
    allergiesPlaceholder: 'frutos secos, glúten (separados por vírgula)',
    marketingEmailAlert: 'O e-mail de marketing seria enviado para',
    noEmailOnFile: 'nenhum e-mail registrado',
    errorAddPoints: 'Falha ao adicionar pontos',
    errorUpdateCredit: 'Falha ao atualizar a autorização de crédito',
  },
  settings: {
    title: 'Configurações',
    dataManagement: 'Gerenciamento de Dados',
    dangerZone: 'Zona de Perigo',
    clearDatabase: 'Limpar Banco de Dados',
    clearDatabaseDesc: 'Limpa todos os pedidos, transações e clientes. Mantém o menu e equipe.',
    backupDatabase: 'Fazer Backup',
    backupDatabaseDesc: 'Baixe uma cópia do banco de dados antes de fazer alterações.',
    confirmClearTitle: 'Você tem certeza absoluta?',
    confirmClearDesc: 'Isso excluirá todos os dados transacionais históricos.',
    clearSuccess: 'Banco de dados limpo com sucesso.',
    clearFailed: 'Falha ao limpar o banco de dados.',
    backupSuccess: 'Backup baixado com sucesso.',
    backupFailed: 'Falha ao fazer backup do banco de dados.',
    restoreDatabase: 'Restaurar Banco de Dados',
    restoreSuccess: 'Banco de dados restaurado com sucesso.',
    restoreFailed: 'Falha ao restaurar o banco de dados.',
    localization: 'Localização e Impostos',
    localizationDesc: 'Configure sua região, idioma e substitua as taxas de imposto padrão.',
    language: 'Idioma e Região',
    customTaxRate: 'Taxa de Imposto Personalizada (%)',
    resetToDefault: 'Redefinir Padrão',
    brandingTitle: 'Marca e Temas Visuais',
    brandingDesc: 'Personalize a identidade do restaurante, tema de cores e logótipos globalmente.',
    systemTheme: 'Tema do Sistema',
    darkTheme: 'Tema Escuro',
    lightTheme: 'Tema Claro',
    primaryColorAccent: 'Cor de Destaque Principal',
    restaurantIdentity: 'Identidade e Logótipo do Restaurante',
    restaurantName: 'Nome do Restaurante',
    logoDisplayType: 'Tipo de Exibição do Logótipo',
    logoInitials: 'Iniciais do Logótipo (máx 4 caracteres)',
    logoEmoji: 'Emoji do Logótipo',
    logoUrlLabel: 'URL da Imagem do Logótipo',
    logoUploadOrUrl: 'Ou carregar imagem local',
    logoSelectFile: 'Selecionar ficheiro local',
    logoClearImage: 'Limpar Imagem',
    saveBranding: 'Guardar Marca',
    resetBranding: 'Repor Predefinições',
    staffPinConfig: 'Configuração de PIN do Pessoal',
    staffPinDesc: 'Configure e atribua PINs numéricos de 4 dígitos para registo de entrada dos funcionários.',
    showPin: 'Mostrar PIN',
    hidePin: 'Ocultar PIN',
    setPin: 'Definir PIN',
    roleMultipliersTitle: 'Multiplicadores de Tipos de Papéis para Gorjetas',
    roleMultipliersDesc: 'Configure pesos de pontos para distribuição de gorjetas por papel de funcionário.',
  },
  tableOrder: {
    premiumSelfService: 'Self-Service Premium',
    searchPlaceholder: 'Pesquisar itens do menu...',
    noItemsFound: 'Nenhum item encontrado',
    liveBillTracker: 'Conta e Acompanhamento em Tempo Real',
    dishesInPrep: 'Pratos em Preparação',
    noActiveOrders: 'Ainda sem pedidos ativos',
    addItemsToOrder: 'Adicione itens abaixo para iniciar o seu pedido.',
    tableBillTotal: 'Total da Conta da Mesa',
    modifierTitle: 'Personalizar Item',
    notesTitle: 'Notas para a cozinha (alergias, pedidos...)',
    addToCart: 'Adicionar ao Pedido',
    reviewOrder: 'Rever Pedido',
    cartTitle: 'Carrinho da Mesa',
    specialRequests: 'Pedidos especiais...',
    placeOrderBtn: 'Enviar Pedido para a Cozinha',
    orderSubmitted: 'Pedido enviado para a cozinha com sucesso!',
    orderFailed: 'Falha ao efetuar o pedido. Tente novamente.',
    prepStatusOrdered: 'Enviado',
    prepStatusPreparing: 'A Preparar',
    prepStatusReady: 'Pronto',
    prepStatusServed: 'Servido',
    modifierRequired: 'Seleção obrigatória',
    modifierOptional: 'Opcional',
    browseMenu: 'Ver Menu',
    trackOrders: 'Acompanhar Pedidos',
    guestsSeated: 'Clientes Sentados:',
    viewCart: 'Ver Carrinho',
    popularBadge: 'Popular',
    modifiersRequiredBadge: 'Obrigatório',
    extrasTitle: 'Selecionar Extras',
    itemAddedToCart: 'Item adicionado ao carrinho',
    cartEmpty: 'O seu carrinho está vazio',
    placedBySelf: 'Pedido do Cliente',
  },
  menuManagement: {
    title: 'Gestão do Menu',
    editDesc: 'Edite itens do menu, imagens e extras opcionais.',
    searchPlaceholder: 'Pesquisar itens...',
    noItemsFound: 'Nenhum item de menu encontrado correspondente a',
    editItem: 'Editar {name}',
    editItemDesc: 'Atualize os detalhes do item do menu, imagem e extras opcionais.',
    itemName: 'Nome do Item',
    basePrice: 'Preço Base',
    image: 'Imagem',
    imagePlaceholder: 'https://... ou carregar local',
    upload: 'Carregar',
    uploading: 'A carregar...',
    optionalExtras: 'Extras Opcionais (Adições)',
    addExtra: 'Adicionar Extra',
    extraPlaceholder: 'Nome do extra (ex. Queijo Extra)',
    noExtras: 'Nenhum extra opcional configurado.',
    createOne: 'Criar um agora',
    saving: 'A guardar...',
    saveChanges: 'Guardar Alterações',
    toastUpdated: 'Item de menu atualizado com sucesso',
    toastFailed: 'Falha ao atualizar item de menu',
    toastUploaded: 'Imagem carregada com sucesso',
    toastUploadFailed: 'Falha ao carregar imagem',
  },
  landing: {
    welcome: 'Bem-vindo ao',
    tagline: 'Experimente um serviço premium com pedidos interativos diretamente na sua mesa.',
    guestSectionTitle: 'Para os Nossos Clientes',
    guestSectionDesc: 'Navegue pelo menu, personalize o seu pedido e envie-o diretamente para a cozinha.',
    viewMenuBtn: 'Ver Menu e Pedir',
    selectTableLabel: 'Selecione a Sua Mesa',
    selectTablePlaceholder: 'Escolha uma mesa...',
    installGuestBtn: 'Instalar App do Cliente',
    installGuestDesc: 'Adicione o Gilded Fork ao seu ecrã principal para pedidos rápidos na mesa.',
    staffSectionTitle: 'Para Funcionários e Operações',
    staffSectionDesc: 'Aceda aos pedidos do POS, ecrã de cozinha KDS, planta de sala, CRM e definições.',
    goToManagementBtn: 'Ir para App de Gestão',
    installStaffBtn: 'Instalar App no Tablet',
    installStaffDesc: 'Instale a suite de gestão completa nos tablets de serviço.',
    pwaInstructionsTitle: 'Guia de Instalação',
    pwaInstructionsIOS: 'No iOS, toque no botão Partilhar e selecione "Adicionar ao Ecrã Principal".',
    pwaInstructionsInstalled: 'A aplicação já está instalada e pronta neste dispositivo.',
    bookTableBtn: 'Reservar Mesa',
    selectTableBtn: 'Selecionar Mesa e Pedir',
    tableSelectedLabel: 'Mesa: {name}',
    browseMenuBtn: 'Ver Menu e Pedir',
    selectedUnlocked: 'Selecionado: {name} (desbloqueado para pedidos)',
    signatureCutsTitle: 'Cortes Especiais',
    signatureCutsDesc: 'Bife maturado de primeira qualidade preparado pelos nossos chefs.',
    coastalDelicaciesTitle: 'Delícias da Costa',
    coastalDelicaciesDesc: 'Cauda de lagosta assada e camarão selvagem com manteiga de ervas.',
    bookTableModalTitle: 'Reserve a Sua Mesa',
    bookTableModalDesc: 'Confirmação instantânea. Reserve online de forma simples.',
    emailOptionalLabel: 'E-mail (Opcional)',
    tableOptionalLabel: 'Mesa (Opcional)',
    autoAssignTableOpt: 'Atribuição Automática',
    bookOnlineResBtn: 'Confirmar Reserva Online',
    interactiveFloorPlanTitle: 'Plano Interativo da Sala',
    floorPlanDesc: 'Clique em qualquer mesa livre (verde) para a selecionar para o seu pedido.',
    selectTableDropdownPlaceholder: 'Selecione uma mesa da lista...',
    floorPlanSizingLabel: 'Tamanho do Plano',
    legendFree: 'Livre',
    legendSeated: 'Ocupado',
    legendReserved: 'Reservado',
    staffPortalAccessBtn: 'Acesso ao Portal do Pessoal',
    ourAddress: 'O Nosso Endereço',
    guestOption: 'Cliente',
    guestsOption: 'Clientes',
    bookingLoading: 'A reservar...',
    toastTableSelectedTitle: 'Mesa Selecionada',
    toastTableSelectedDesc: 'Selecionou a Mesa {name}.',
    toastTableTapOrderDesc: 'Mesa {name} selecionada. Toque no botão de pedido para prosseguir.',
    seatsLabel: 'lugares',
    zoomLabel: 'Zoom',
    fitBtn: 'Ajustar',
    noTablesFound: 'Nenhuma mesa encontrada.',
    installAppBtn: 'Instalar App',
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
    none: 'Aucun',
    add: 'Ajouter',
    per: 'par',
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
    transactions: 'Transactions',
    settings: 'Paramètres',
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
    activityOrderPlaced: 'Commande passée à la {table} par {creator} — {amount}',
    activityReservation: 'Réservation pour {guest} — {partySize} personnes à {time}',
    activityClockIn: '{user} a pris son service',
    minAgo: 'il y a {min} min',
    hoursAgo: 'il y a {hours}h',
    daysAgo: 'il y a {days}d',
    now: "À l'instant",
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
    resetShift: 'Réinitialiser le Service',
    clearShiftOperations: 'Effacer les Opérations du Service ?',
    clearAllData: 'Effacer Toutes les Données',
    dailyCheckMonitor: 'Moniteur de Commandes Quotidien',
    todaysSales: "Ventes du Jour",
    cashPayments: 'Règlements Espèces',
    cardPayments: 'Règlements Carte',
    creditPayments: 'Règlements Crédit',
    avgCheckSize: 'Panier Moyen',
    activeServedChecks: 'Commandes Actives et Servies',
    tableTallies: 'Totaux des Tables',
    serverSales: 'Ventes par Serveur',
    noActiveTablesToday: 'Aucune table active aujourd\'hui',
    noServerRecordsToday: 'Aucun enregistrement de serveur aujourd\'hui',
    serviceNotStartedYet: 'Le service n\'a pas encore commencé',
    noMatchingOrdersFound: 'Aucune commande correspondante trouvée',
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
    addTable: 'Ajouter une Table',
    deleteTable: 'Supprimer la Table',
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
    sectionView: 'Sections',
    floorView: 'Vue Plan',
    dragToMove: 'Glissez la table pour la déplacer',
    positionSaved: 'Position enregistrée',
    positionSaveFailed: 'Échec de l\'enregistrement de la position',
    quickEditSeats: 'Places',
    quickAssignServer: 'Serveur',
    seatsShort: 'pl.',
    maxSeats: 'Max 20 places',
    editLayout: 'Modifier le Plan',
    doneEditing: 'Terminé',
    clickEditLayoutToMove: 'Cliquez sur "Modifier le Plan" pour repositionner',
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
    settleBill: 'Régler l\'Addition',
    payBill: 'Payer',
    selectPaymentMethod: 'Sélectionner le Mode de Paiement',
    cash: 'Espèces',
    card: 'Carte',
    credit: 'Crédit',
    paymentProcessing: 'Traitement du paiement en cours...',
    paymentSuccessful: 'Paiement réussi. Table libérée.',
    paymentFailed: 'Échec de la transaction de paiement',
    checkPaidClosed: 'Addition payée et clôturée avec succès',
    authorizeStoreCredit: 'Autoriser le Crédit Magasin',
    allowedCreditDesc: 'Permet au client de facturer des additions sur son compte de crédit.',
    creditApproved: 'Autorisation de Crédit Approuvée',
    creditApprovedDesc: 'Le client autorisé manuellement est validé pour le crédit magasin.',
    creditDenied: 'Autorisation Refusée',
    creditDeniedDesc: 'Le crédit magasin nécessite une autorisation explicite du gérant.',
    searchSelectGuest: 'Rechercher ou sélectionner un client...',
    blocked: 'Bloqué',
    selectCustomerCredit: 'Veuillez sélectionner un client pour appliquer le crédit.',
    creditNotAllowed: 'Le client sélectionné n\'est pas autorisé par la direction à utiliser le crédit magasin.',
    customerGuest: 'Client / Invité',
    noCustomerAssigned: 'Client de passage / Non Attribué',
    manageMenu: 'Gérer le Menu',
    category_Starters: 'Entrées',
    category_Mains: 'Plats Principaux',
    category_Desserts: 'Desserts',
    category_Cocktails: 'Cocktails',
    category_Beer_and_Wine: 'Bière et Vin',
    category_Non_Alcoholic: 'Bébidas sans Alcool',
    category_Sides: 'Accompagnements',
    sortBy: 'Trier par',
    popularity: 'Popularité',
    sortName: 'Nom (A-Z)',
    sortPriceLow: 'Prix: Bas-Élevé',
    sortPriceHigh: 'Prix: Élevé-Bas',
    menuManagement: 'Gestion du Menu',
    menuManagementDesc: 'Créez, modifiez ou supprimez des plats du menu numérique du restaurant.',
    addNewDish: 'Ajouter un Plat',
    itemsCountLabel: 'articles',
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
    activeTickets: 'Fiches Actives',
    kanbanBoard: 'Tableau Kanban',
    queued: 'En File',
    preparing: 'En Préparation',
    ready: 'Prêt',
    itemReadyAlert: 'Le plat est prêt !',
    produced: 'Produit',
    today: 'Aujourd\'hui',
    week: 'Cette Semaine',
    month: 'Ce Mois',
    productionDetails: 'Détails de Production',
    preparedItems: 'Plats et Boissons Préparés',
    chronologicalLog: 'Journal Chronologique',
    groupedSummary: 'Résumé Groupé',
    item: 'Article',
    qty: 'Qté',
    station: 'Station',
    preparedTime: 'Heure de Préparation',
    searchItems: 'Rechercher des articles...',
    noItemsPrepared: 'Aucun article préparé durant cette période',
  },
  transactions: {
    title: 'Livre de Comptes',
    subtitle: 'Gérer et auditer les entrées et sorties financières',
    inflow: 'Entrées (Ventes)',
    outflow: 'Sorties (Dépenses)',
    netProfit: 'Bénéfice Net',
    labor: 'Coût de Main-d\'œuvre',
    searchPlaceholder: 'Rechercher par ID, client, fournisseur, opérateur...',
    all: 'Toutes les Transactions',
    inflows: 'Entrées Uniquement',
    outflows: 'Sorties Uniquement',
    category: 'Catégorie',
    amount: 'Montant',
    operator: 'Opérateur',
    date: 'Date & Heure',
    noTransactions: 'Aucune transaction trouvée pour cette période',
    details: 'Détails de la Transaction',
    poDetails: 'Détails du Bon de Commande',
    wastageDetails: 'Détails du Gaspillage',
    saleDetails: 'Détails de la Vente',
    day: 'Aujourd\'hui',
    week: 'Cette Semaine',
    month: 'Ce Mois',
    taxSummary: 'Résumé de la TVA et Taxes',
    vatReceived: 'TVA Collectée (Ventes Payées)',
    vatExpected: 'TVA Facturée (Total des Ventes)',
    vatPaid: 'TVA Déductible Estimée (Achats)',
    netVat: 'Position Nette de TVA',
    vatReceivedDesc: 'TVA réelle collectée sur les commandes réglées',
    vatExpectedDesc: 'TVA totale générée sur toutes les ventes (facturée)',
    vatPaidDesc: 'TVA estimée payée sur les achats de stock',
    netVatDesc: 'Solde net de TVA (TVA Collectée - TVA Déductible)',
    vatOwedToTaxMan: 'Dû au Fisc',
    vatReclaimable: 'Crédit de TVA',
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
    availableTables: 'Tables Disponibles',
    noTablesAvailable: 'Aucune table disponible',
    tablesOverview: 'Aperçu du Placement des Tables',
    noReservationsToday: 'Aucune réservation pour aujourd\'hui',
    createResOrCreateWalkIn: 'Créer une nouvelle réservation ou ajouter un client sans réservation',
    noGuestsWaitlist: 'Aucun client sur la liste d\'attente',
    addWalkInGetStarted: 'Ajouter un client sans réservation pour commencer',
    crmLookup: 'Recherche CRM (optionnel)',
    searchCrmPlaceholder: 'Rechercher par nom, e-mail ou téléphone...',
    specialRequestsPlaceholder: 'Demandes spéciales, allergies, célébrations...',
    seatGuest: 'Installer le Client',
    assignTable: 'Assigner une Table',
    selectTablePlaceholder: 'Sélectionner une table',
    noTableAssigned: 'Aucune table assignée',
    waitMinutes: 'd\'attente',
    now: 'MAINTENANT',
    successRefreshed: 'Réservations actualisées',
    successSeated: 'Client installé avec succès',
    errorSeated: 'Échec de l\'installation du client',
    successCancelled: 'Réservation annulée',
    errorCancelled: 'Échec de l\'annulation de la réservation',
    successNoShow: 'Client marqué comme non présent',
    errorNoShow: 'Échec de la mise à jour de la réservation',
    successWaitlistAdded: 'Client ajouté à la liste d\'attente',
    errorWaitlistAdded: 'Échec de l\'ajout du client sans réservation',
    successCreated: 'Réservation créée avec succès',
    errorCreated: 'Échec de la création de la réservation',
    smsNotified: 'Notification SMS envoyée',
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
    addProduct: 'Ajouter un Produit',
    addNewProduct: 'Ajouter un Nouveau Produit',
    createProductDesc: 'Créez un nouvel article d\'inventaire et définissez ses niveaux par défaut.',
    editProductStock: 'Modifier les Niveaux de Produit et Stock',
    configureThresholds: 'Configurer les seuils, le fournisseur et les niveaux',
    productInfo: 'Informations Produit',
    productName: 'Nom du Produit',
    unitLabel: 'Unité (ex. KG, L, UNITÉ)',
    category: 'Catégorie',
    storageLocation: 'Lieu de Stockage',
    vendorLabel: 'Fournisseur',
    stockCostLevels: 'Niveau de Stock et Coût',
    addToStock: 'Ajouter au Stock (Restock)',
    minLevelAlert: 'Seuil Minimum',
    maxLevelTarget: 'Seuil Maximum',
    costPerUnitLabel: 'Coût par Unité',
    printList: 'Imprimer la Liste',
    saveChanges: 'Enregistrer les Modifications',
    quickAdd: 'Ajout Rapide',
    shoppingList: 'Liste d\'Achats',
    generatedOn: 'Généré le',
    itemsLowInStock: 'Articles en Stock Faible',
    ingredientProduct: 'Ingrédient / Produit',
    suggestedReorder: 'Réapprovisionnement Suggéré',
    estCost: 'Coût Est.',
    totalEstRestockValue: 'Valeur Totale Estimée du Réapprovisionnement',
    popupBlockedTitle: 'Fenêtre contextuelle bloquée',
    popupBlockedDesc: 'Veuillez autoriser les fenêtres contextuelles pour imprimer la liste d\'achats.',
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
    deleteShift: 'Supprimer le quart de travail',
    confirmDeleteShift: 'Êtes-vous sûr de vouloir supprimer cette affectation de quart de travail ?',
    shiftDeleted: 'Quart de travail supprimé avec succès.',
    errorDeleteShift: 'Échec de la suppression du quart de travail.',
    shiftAssigned: 'Quart de travail attribué avec succès.',
    shiftUpdated: 'Quart de travail mis à jour avec succès.',
    errorSaveShift: 'Échec de l\'enregistrement du quart de travail.',
    editShiftAssignment: 'Modifier l\'affectation du quart de travail',
    assignShift: 'Attribuer un quart de travail',
    staffMember: 'Membre du personnel',
    shiftTemplate: 'Modèle de quart',
    selectTemplate: 'Sélectionner un modèle',
    startTimeOverride: 'Surcharge de l\'heure de début',
    endTimeOverride: 'Surcharge de l\'heure de fin',
    positionRole: 'Poste / Rôle',
    additionalInstructions: 'Instructions supplémentaires...',
    noShiftsScheduled: 'Aucun quart de travail prévu pour cette date.',
    assignFirstShift: 'Attribuer le premier quart',
    shift: 'quart de travail',
    shifts: 'quarts de travail',
    requiredFieldsError: 'Veuillez remplir tous les champs obligatoires.',
    positionServer: 'Serveur',
    positionBartender: 'Barman',
    positionChef: 'Chef',
    positionHost: 'Hôte',
    positionManager: 'Directeur',
    positionBusboy: 'Commis de salle',
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
    firstName: 'Prénom',
    lastName: 'Nom',
    birthday: 'Date de naissance',
    marketingOptIn: 'Option marketing',
    addCustomer: 'Ajouter un client',
    addNewCustomer: 'Ajouter un nouveau client',
    addNewCustomerDesc: 'Ajouter un nouveau client au système CRM.',
    nameRequired: 'Le prénom et le nom sont requis.',
    errorCreateCustomer: 'Échec de la création du client',
    filterByTier: 'Filtrer par niveau',
    tier: 'Niveau',
    contactInfo: 'Coordonnées',
    loyaltyProgram: 'Programme de fidélité',
    progressTo: 'Progression vers',
    pointsTo: 'points vers',
    addPoints: 'Ajouter des points',
    sendMarketingEmail: 'Envoyer un e-mail marketing',
    pointsAdded: 'Points ajoutés au client',
    creditAuthorized: 'Crédit magasin autorisé pour le client',
    creditRevoked: 'Crédit magasin révoqué pour le client',
    errorLoadCustomers: 'Échec du chargement des clients',
    memberSince: 'Membre depuis',
    allergiesPlaceholder: 'fruits à coque, gluten (séparés par des virgules)',
    marketingEmailAlert: 'L\'e-mail marketing serait envoyé à',
    noEmailOnFile: 'aucun e-mail enregistré',
    errorAddPoints: 'Échec de l\'ajout de points',
    errorUpdateCredit: 'Échec de la mise à jour de l\'autorisation de crédit',
  },
  settings: {
    title: 'Paramètres',
    dataManagement: 'Gestion des Données',
    dangerZone: 'Zone de Danger',
    clearDatabase: 'Effacer la Base de Données',
    clearDatabaseDesc: 'Efface toutes les commandes, transactions et clients. Conserve le menu et le personnel.',
    backupDatabase: 'Sauvegarder la Base',
    backupDatabaseDesc: 'Téléchargez une copie de la base de données.',
    confirmClearTitle: 'Êtes-vous absolument sûr ?',
    confirmClearDesc: 'Cela supprimera toutes les données transactionnelles historiques.',
    clearSuccess: 'Base de données effacée avec succès.',
    clearFailed: 'Échec de l\'effacement de la base de données.',
    backupSuccess: 'Sauvegarde téléchargée avec succès.',
    backupFailed: 'Échec de la sauvegarde.',
    restoreDatabase: 'Restaurer la Base de Données',
    restoreSuccess: 'Base de données restaurée avec succès.',
    restoreFailed: 'Échec de la restauration.',
    localization: 'Localisation et Taxes',
    localizationDesc: 'Configurez votre région, langue et remplacez les taux de taxes par défaut.',
    language: 'Langue et Région',
    customTaxRate: 'Taux de Taxe Personnalisé (%)',
    resetToDefault: 'Réinitialiser',
    brandingTitle: 'Image de marque et thèmes visuels',
    brandingDesc: "Personnalisez l'identité du restaurant, le thème de couleur et les logos à l'échelle globale.",
    systemTheme: 'Thème du système',
    darkTheme: 'Thème sombre',
    lightTheme: 'Thème clair',
    primaryColorAccent: 'Couleur d\'accentuation principale',
    restaurantIdentity: 'Identité et logo du restaurant',
    restaurantName: 'Nom du restaurant',
    logoDisplayType: 'Type d\'affichage du logo',
    logoInitials: 'Initiales du logo (max 4 caractères)',
    logoEmoji: 'Emoji du logo',
    logoUrlLabel: 'URL de l\'image du logo',
    logoUploadOrUrl: 'Ou charger une image locale',
    logoSelectFile: 'Sélectionner un fichier local',
    logoClearImage: 'Effacer l\'image',
    saveBranding: 'Enregistrer la marque',
    resetBranding: 'Réinitialiser aux valeurs par défaut',
    staffPinConfig: 'Configuration du code PIN du personnel',
    staffPinDesc: 'Configurez et attribuez des codes PIN numériques à 4 chiffres pour les pointages des employés.',
    showPin: 'Afficher le code PIN',
    hidePin: 'Masquer le code PIN',
    setPin: 'Définir le code PIN',
    roleMultipliersTitle: 'Multiplicateurs de rôle pour les pourboires',
    roleMultipliersDesc: 'Configurez les poids des points pour la répartition des pourboires par rôle.',
  },
  tableOrder: {
    premiumSelfService: 'Self-service Premium',
    searchPlaceholder: 'Rechercher dans le menu...',
    noItemsFound: 'Aucun article trouvé',
    liveBillTracker: 'Suivi de la facture et des plats',
    dishesInPrep: 'Plats en cours de préparation',
    noActiveOrders: 'Aucune commande active pour le moment',
    addItemsToOrder: 'Ajoutez des articles ci-dessous pour commencer votre commande.',
    tableBillTotal: 'Total de la facture de la table',
    modifierTitle: "Personnaliser l'article",
    notesTitle: 'Remarques pour la cuisine (allergies, demandes...)',
    addToCart: 'Ajouter à la commande',
    reviewOrder: 'Vérifier la commande',
    cartTitle: 'Panier de votre table',
    specialRequests: 'Demandes spéciales...',
    placeOrderBtn: 'Envoyer la commande en cuisine',
    orderSubmitted: 'Commande envoyée en cuisine avec succès !',
    orderFailed: "Échec de l'envoi de la commande. Veuillez réessayer.",
    prepStatusOrdered: 'Commandé',
    prepStatusPreparing: 'En préparation',
    prepStatusReady: 'Prêt',
    prepStatusServed: 'Servi',
    modifierRequired: 'Sélection requise',
    modifierOptional: 'Optionnel',
    browseMenu: 'Parcourir le menu',
    trackOrders: 'Suivre les commandes',
    guestsSeated: 'Clients assis :',
    viewCart: 'Voir le panier',
    popularBadge: 'Populaire',
    modifiersRequiredBadge: 'Requis',
    extrasTitle: 'Sélectionner des suppléments',
    itemAddedToCart: 'Article ajouté au panier',
    cartEmpty: 'Votre panier est vide',
    placedBySelf: 'Commande client',
  },
  menuManagement: {
    title: 'Gestion du Menu',
    editDesc: 'Modifiez les éléments du menu, les images et les suppléments optionnels.',
    searchPlaceholder: 'Rechercher des éléments...',
    noItemsFound: 'Aucun élément de menu correspondant trouvé pour',
    editItem: 'Modifier {name}',
    editItemDesc: 'Mettez à jour les détails de l\'élément du menu, l\'image et les suppléments optionnels.',
    itemName: 'Nom de l\'élément',
    basePrice: 'Prix de Base',
    image: 'Image',
    imagePlaceholder: 'https://... ou charger en local',
    upload: 'Téléverser',
    uploading: 'Téléversement...',
    optionalExtras: 'Suppléments Optionnels (Ajouts)',
    addExtra: 'Ajouter un Supplément',
    extraPlaceholder: 'Nom du supplément (ex. Supplément Fromage)',
    noExtras: 'Aucun supplément optionnel configuré.',
    createOne: 'Créer maintenant',
    saving: 'Enregistrement...',
    saveChanges: 'Enregistrer les Modifications',
    toastUpdated: 'Élément du menu mis à jour avec succès',
    toastFailed: 'Échec de la mise à jour de l\'élément du menu',
    toastUploaded: 'Image téléversée avec succès',
    toastUploadFailed: 'Échec du téléversement de l\'image',
  },
  landing: {
    welcome: 'Bienvenue au',
    tagline: 'Vivez une expérience culinaire premium avec commande interactive directement à votre table.',
    guestSectionTitle: 'Pour Nos Clients',
    guestSectionDesc: 'Parcourez le menu, personnalisez votre commande et envoyez-la directement en cuisine.',
    viewMenuBtn: 'Parcourir le Menu et Commander',
    selectTableLabel: 'Sélectionnez Votre Table',
    selectTablePlaceholder: 'Choisissez une table...',
    installGuestBtn: 'Installer l\'Application Client',
    installGuestDesc: 'Ajoutez The Gilded Fork à votre écran d\'accueil pour commander rapidement à table.',
    staffSectionTitle: 'Pour le Personnel et les Opérations',
    staffSectionDesc: 'Accédez aux commandes POS, à l\'écran de cuisine KDS, au plan de salle, au CRM et aux paramètres.',
    goToManagementBtn: 'Aller à l\'Application de Gestion',
    installStaffBtn: 'Installer l\'App sur Tablette',
    installStaffDesc: 'Installez la suite de gestion complète sur les tablettes de service.',
    pwaInstructionsTitle: 'Guide d\'Installation',
    pwaInstructionsIOS: 'Sur iOS, appuyez sur le bouton Partager et sélectionnez "Sur l\'écran d\'accueil".',
    pwaInstructionsInstalled: 'L\'application est déjà installée et prête sur cet appareil.',
    bookTableBtn: 'Réserver une Table',
    selectTableBtn: 'Sélectionner Table & Commander',
    tableSelectedLabel: 'Table: {name}',
    browseMenuBtn: 'Parcourir le Menu & Commander',
    selectedUnlocked: 'Sélectionné: {name} (débloqué pour la commande)',
    signatureCutsTitle: 'Coupures Signature',
    signatureCutsDesc: 'Côte de bœuf maturée préparée par nos chefs cuisiniers.',
    coastalDelicaciesTitle: 'Délices Côtiers',
    coastalDelicaciesDesc: 'Queue de homard rôtie et crevettes sauvages au beurre d\'herbes.',
    bookTableModalTitle: 'Réservez Votre Table',
    bookTableModalDesc: 'Vérification instantanée. Réservez en ligne en toute simplicité.',
    emailOptionalLabel: 'E-mail (Optionnel)',
    tableOptionalLabel: 'Table (Optionnelle)',
    autoAssignTableOpt: 'Assignation Automatique',
    bookOnlineResBtn: 'Confirmer la Réservation en Ligne',
    interactiveFloorPlanTitle: 'Plan de Salle Interactif',
    floorPlanDesc: 'Cliquez sur une table libre (verte) pour la sélectionner pour votre commande.',
    selectTableDropdownPlaceholder: 'Sélectionnez une table dans la liste...',
    floorPlanSizingLabel: 'Taille du Plan de salle',
    legendFree: 'Libre',
    legendSeated: 'Occupé',
    legendReserved: 'Réservé',
    staffPortalAccessBtn: 'Accès Portail Personnel',
    ourAddress: 'Notre Adresse',
    guestOption: 'Client',
    guestsOption: 'Clients',
    bookingLoading: 'Réservation...',
    toastTableSelectedTitle: 'Table Sélectionnée',
    toastTableSelectedDesc: 'Vous avez sélectionné la Table {name}.',
    toastTableTapOrderDesc: 'Table {name} sélectionnée. Appuyez sur le bouton de commande pour continuer.',
    seatsLabel: 'places',
    zoomLabel: 'Zoom',
    fitBtn: 'Ajuster',
    noTablesFound: 'Aucune table trouvée.',
    installAppBtn: 'Installer l\'App',
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
    none: 'Ninguno',
    add: 'Añadir',
    per: 'por',
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
    transactions: 'Transacciones',
    settings: 'Ajustes',
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
    activityOrderPlaced: 'Pedido realizado en {table} por {creator} — {amount}',
    activityReservation: 'Reserva para {guest} — {partySize} personas a las {time}',
    activityClockIn: '{user} inició turno',
    minAgo: 'hace {min} min',
    hoursAgo: 'hace {hours}h',
    daysAgo: 'hace {days}d',
    now: 'Ahora mismo',
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
    resetShift: 'Reiniciar Turno',
    clearShiftOperations: '¿Borrar Operaciones del Turno?',
    clearAllData: 'Borrar Todos los Datos',
    dailyCheckMonitor: 'Monitor de Pedidos Diarios',
    todaysSales: "Ventas de Hoy",
    cashPayments: 'Pagos en Efectivo',
    cardPayments: 'Pagos con Tarjeta',
    creditPayments: 'Pagos a Crédito',
    avgCheckSize: 'Ticket Promedio',
    activeServedChecks: 'Pedidos Activos y Servidos',
    tableTallies: 'Totales de Mesas',
    serverSales: 'Ventas por Camarero',
    noActiveTablesToday: 'No hay mesas activas hoy',
    noServerRecordsToday: 'No hay registros de camareros hoy',
    serviceNotStartedYet: 'El servicio aún no ha comenzado',
    noMatchingOrdersFound: 'No se encontraron pedidos coincidentes',
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
    addTable: 'Añadir Mesa',
    deleteTable: 'Eliminar Mesa',
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
    sectionView: 'Secciones',
    floorView: 'Vista Plano',
    dragToMove: 'Arrastra la mesa para reposicionar',
    positionSaved: 'Posición guardada',
    positionSaveFailed: 'Error al guardar posición',
    quickEditSeats: 'Asientos',
    quickAssignServer: 'Camarero',
    seatsShort: 'as.',
    maxSeats: 'Máx. 20 asientos',
    editLayout: 'Editar Plano',
    doneEditing: 'Terminado',
    clickEditLayoutToMove: 'Haga clic en "Editar Plano" para reposicionar',
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
    settleBill: 'Cerrar Cuenta',
    payBill: 'Pagar Cuenta',
    selectPaymentMethod: 'Seleccionar Método de Pago',
    cash: 'Efectivo',
    card: 'Tarjeta',
    credit: 'Crédito',
    paymentProcessing: 'Procesando pago...',
    paymentSuccessful: 'Pago exitoso. Mesa liberada.',
    paymentFailed: 'Transacción de pago fallida',
    checkPaidClosed: 'Cuenta pagada y cerrada con éxito',
    authorizeStoreCredit: 'Autorizar Crédito de Tienda',
    allowedCreditDesc: 'Permite al cliente cargar cuentas a su cuenta de crédito de tienda.',
    creditApproved: 'Autorización de Crédito Aprovada',
    creditApprovedDesc: 'Cliente autorizado manualmente está aprobado para crédito.',
    creditDenied: 'Autorización Denegada',
    creditDeniedDesc: 'El crédito requiere autorización explícita de la gerencia.',
    searchSelectGuest: 'Buscar o seleccionar cliente...',
    blocked: 'Bloqueado',
    selectCustomerCredit: 'Por favor seleccione un cliente para aplicar crédito.',
    creditNotAllowed: 'El cliente seleccionado no está autorizado a usar crédito.',
    customerGuest: 'Cliente / Invitado',
    noCustomerAssigned: 'Cliente de paso / No Asignado',
    manageMenu: 'Administrar Menú',
    category_Starters: 'Entrantes',
    category_Mains: 'Platos Principales',
    category_Desserts: 'Postres',
    category_Cocktails: 'Cócteles',
    category_Beer_and_Wine: 'Cerveza y Vino',
    category_Non_Alcoholic: 'Bebidas sin Alcohol',
    category_Sides: 'Guarniciones',
    sortBy: 'Ordenar por',
    popularity: 'Popularidad',
    sortName: 'Nombre (A-Z)',
    sortPriceLow: 'Precio: Bajo-Alto',
    sortPriceHigh: 'Precio: Alto-Bajo',
    menuManagement: 'Gestión de Menú',
    menuManagementDesc: 'Cree, edite o elimine platos del menú digital del restaurante.',
    addNewDish: 'Añadir Plato',
    itemsCountLabel: 'artículos',
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
    activeTickets: 'Fichas Activas',
    kanbanBoard: 'Tablero Kanban',
    queued: 'En Cola',
    preparing: 'Preparando',
    ready: 'Listo',
    itemReadyAlert: '¡El plato está listo!',
    produced: 'Producido',
    today: 'Hoy',
    week: 'Esta Semana',
    month: 'Este Mes',
    productionDetails: 'Detalles de Producción',
    preparedItems: 'Platos y Bebidas Preparados',
    chronologicalLog: 'Registro Chronológico',
    groupedSummary: 'Resumen Agrupado',
    item: 'Artículo',
    qty: 'Cant',
    station: 'Estación',
    preparedTime: 'Hora de Preparación',
    searchItems: 'Buscar artículos...',
    noItemsPrepared: 'No se prepararon artículos en este período',
  },
  transactions: {
    title: 'Libro de Transacciones',
    subtitle: 'Gestione y audite todos los flujos de entrada y salida',
    inflow: 'Entrada (Ventas)',
    outflow: 'Salida (Gastos)',
    netProfit: 'Beneficio Neto',
    labor: 'Costo de Mano de Obra',
    searchPlaceholder: 'Buscar por ID, cliente, proveedor, operador...',
    all: 'Todas las Transacciones',
    inflows: 'Solo Entradas',
    outflows: 'Solo Salidas',
    category: 'Categoría',
    amount: 'Monto',
    operator: 'Operador',
    date: 'Fecha y Hora',
    noTransactions: 'No se encontraron transacciones en este período',
    details: 'Detalles de la Transacción',
    poDetails: 'Detalles del Pedido de Compra',
    wastageDetails: 'Detalles del Desperdicio',
    saleDetails: 'Detalles de la Vente',
    day: 'Hoy',
    week: 'Esta Semana',
    month: 'Este Mes',
    taxSummary: 'Resumen de Impuestos e IVA',
    vatReceived: 'IVA Repercutido (Ventas Cobradas)',
    vatExpected: 'IVA Devengado (Total de Ventas)',
    vatPaid: 'IVA Soportado Estimado (Compras)',
    netVat: 'Posición Neta del IVA',
    vatReceivedDesc: 'IVA real cobrado de pedidos pagados',
    vatExpectedDesc: 'IVA total generado en todas las ventas (devengado)',
    vatPaidDesc: 'IVA estimado pagado en compras de inventario',
    netVatDesc: 'Saldo neto de IVA (IVA Repercutido - IVA Soportado)',
    vatOwedToTaxMan: 'A pagar a Hacienda',
    vatReclaimable: 'IVA a Devolver',
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
    availableTables: 'Mesas Disponibles',
    noTablesAvailable: 'No hay mesas disponibles',
    tablesOverview: 'Resumen de Ocupación de Mesas',
    noReservationsToday: 'No hay reservas para hoy',
    createResOrCreateWalkIn: 'Crear una nueva reserva o añadir un cliente sin reserva',
    noGuestsWaitlist: 'No hay clientes en la lista de espera',
    addWalkInGetStarted: 'Añada un cliente sin reserva para comenzar',
    crmLookup: 'Búsqueda de CRM (opcional)',
    searchCrmPlaceholder: 'Buscar por nombre, correo electrónico o teléfono...',
    specialRequestsPlaceholder: 'Peticiones especiales, alergias, celebraciones...',
    seatGuest: 'Sentar Cliente',
    assignTable: 'Asignar Mesa',
    selectTablePlaceholder: 'Seleccionar una mesa',
    noTableAssigned: 'Sin mesa asignada',
    waitMinutes: 'de espera',
    now: 'AHORA',
    successRefreshed: 'Reservas actualizadas',
    successSeated: 'Cliente sentado con éxito',
    errorSeated: 'Error al sentar al cliente',
    successCancelled: 'Reserva cancelada',
    errorCancelled: 'Error al cancelar la reserva',
    successNoShow: 'Cliente marcado como no presentado',
    errorNoShow: 'Error al actualizar la reserva',
    successWaitlistAdded: 'Cliente añadido a la lista de espera',
    errorWaitlistAdded: 'Error al añadir al cliente sin reserva',
    successCreated: 'Reserva creada con éxito',
    errorCreated: 'Error al crear la reserva',
    smsNotified: 'Notificación SMS enviada',
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
    addProduct: 'Añadir Producto',
    addNewProduct: 'Añadir Nuevo Producto',
    createProductDesc: 'Cree un nuevo artículo de inventario y establezca sus niveles predeterminados.',
    editProductStock: 'Editar Niveles de Producto y Stock',
    configureThresholds: 'Configurar umbrales, proveedor y niveles',
    productInfo: 'Información del Producto',
    productName: 'Nombre del Producto',
    unitLabel: 'Unidad (ej. KG, L, UNID)',
    category: 'Categoría',
    storageLocation: 'Lugar de Almacenamiento',
    vendorLabel: 'Proveedor',
    stockCostLevels: 'Niveles de Stock y Costo',
    addToStock: 'Añadir al Stock (Restock)',
    minLevelAlert: 'Nivel Mínimo',
    maxLevelTarget: 'Nivel Máximo',
    costPerUnitLabel: 'Costo por Unidad',
    printList: 'Imprimir Lista',
    saveChanges: 'Guardar Cambios',
    quickAdd: 'Añadir Rápido',
    shoppingList: 'Lista de Compras',
    generatedOn: 'Generado el',
    itemsLowInStock: 'Artículos con Stock Bajo',
    ingredientProduct: 'Ingrediente / Producto',
    suggestedReorder: 'Reabastecimiento Sugerido',
    estCost: 'Coste Est.',
    totalEstRestockValue: 'Valor Total Estimado de Reabastecimiento',
    popupBlockedTitle: 'Pop-up Bloqueado',
    popupBlockedDesc: 'Por favor, permita pop-ups para imprimir la lista de compras.',
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
    deleteShift: 'Eliminar Turno',
    confirmDeleteShift: '¿Está seguro de que desea eliminar esta asignación de turno?',
    shiftDeleted: 'Turno eliminado con éxito.',
    errorDeleteShift: 'Error al eliminar el turno.',
    shiftAssigned: 'Turno asignado con éxito.',
    shiftUpdated: 'Turno actualizado con éxito.',
    errorSaveShift: 'Error al guardar el turno.',
    editShiftAssignment: 'Editar Asignación de Turno',
    assignShift: 'Asignar Turno',
    staffMember: 'Miembro del Personal',
    shiftTemplate: 'Plantilla de Turno',
    selectTemplate: 'Seleccionar una Plantilla',
    startTimeOverride: 'Anulación de Hora de Inicio',
    endTimeOverride: 'Anulación de Hora de Fin',
    positionRole: 'Puesto / Rol',
    additionalInstructions: 'Instrucciones adicionales...',
    noShiftsScheduled: 'No hay turnos programados para esta fecha.',
    assignFirstShift: 'Asignar Primer Turno',
    shift: 'turno',
    shifts: 'turnos',
    requiredFieldsError: 'Por favor, rellene todos los campos obligatorios.',
    positionServer: 'Camarero',
    positionBartender: 'Barman',
    positionChef: 'Chef',
    positionHost: 'Anfitrión',
    positionManager: 'Gerente',
    positionBusboy: 'Ayudante de Camarero',
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
    firstName: 'Nombre',
    lastName: 'Apellido',
    birthday: 'Fecha de nacimiento',
    marketingOptIn: 'Opción de marketing',
    addCustomer: 'Añadir Cliente',
    addNewCustomer: 'Añadir Nuevo Cliente',
    addNewCustomerDesc: 'Añada un nuevo cliente al sistema CRM.',
    nameRequired: 'El nombre y el apellido son obligatorios.',
    errorCreateCustomer: 'Error al crear el cliente',
    filterByTier: 'Filtrar por nivel',
    tier: 'Nivel',
    contactInfo: 'Información de Contacto',
    loyaltyProgram: 'Programa de Fidelización',
    progressTo: 'Progreso hacia',
    pointsTo: 'puntos para',
    addPoints: 'Añadir Puntos',
    sendMarketingEmail: 'Enviar Correo de Marketing',
    pointsAdded: 'Puntos añadidos al cliente',
    creditAuthorized: 'Crédito de tienda autorizado para el cliente',
    creditRevoked: 'Crédito de tienda revocado para el cliente',
    errorLoadCustomers: 'Error al cargar clientes',
    memberSince: 'Miembro desde',
    allergiesPlaceholder: 'frutos secos, gluten (separados por comas)',
    marketingEmailAlert: 'El correo de marketing se enviaría a',
    noEmailOnFile: 'sin correo registrado',
    errorAddPoints: 'Error al añadir puntos',
    errorUpdateCredit: 'Error al actualizar la asignación de crédito',
  },
  settings: {
    title: 'Ajustes',
    dataManagement: 'Gestión de Datos',
    dangerZone: 'Zona de Peligro',
    clearDatabase: 'Borrar Base de Datos',
    clearDatabaseDesc: 'Borra todos los pedidos, transacciones y clientes. Mantiene menú y personal.',
    backupDatabase: 'Copia de Seguridad',
    backupDatabaseDesc: 'Descargue una copia de la base de datos antes de hacer cambios.',
    confirmClearTitle: '¿Estás absolutamente seguro?',
    confirmClearDesc: 'Esto eliminará todos los datos transaccionales históricos.',
    clearSuccess: 'Base de datos borrada con éxito.',
    clearFailed: 'Fallo al borrar la base de datos.',
    backupSuccess: 'Copia de seguridad descargada con éxito.',
    backupFailed: 'Fallo al hacer copia de seguridad.',
    restoreDatabase: 'Restaurar Base de Datos',
    restoreSuccess: 'Base de datos restaurada con éxito.',
    restoreFailed: 'Fallo al restaurar la base de datos.',
    localization: 'Localización e Impuestos',
    localizationDesc: 'Configure su región, idioma y sobreescriba los impuestos por defecto.',
    language: 'Idioma y Región',
    customTaxRate: 'Tasa de Impuesto Personalizada (%)',
    resetToDefault: 'Restablecer por Defecto',
    brandingTitle: 'Identidad y Temas Visuales',
    brandingDesc: 'Personalice la identidad del restaurante, el tema de colores y los logotipos de forma global.',
    systemTheme: 'Tema del Sistema',
    darkTheme: 'Tema Oscuro',
    lightTheme: 'Tema Claro',
    primaryColorAccent: 'Color de Acento Principal',
    restaurantIdentity: 'Identidad y Logotipo del Restaurante',
    restaurantName: 'Nombre del Restaurante',
    logoDisplayType: 'Tipo de Visualización del Logotipo',
    logoInitials: 'Iniciales del Logotipo (máx 4 caracteres)',
    logoEmoji: 'Emoji del Logotipo',
    logoUrlLabel: 'URL de la Imagen del Logotipo',
    logoUploadOrUrl: 'O subir imagen local',
    logoSelectFile: 'Seleccionar archivo local',
    logoClearImage: 'Limpar Imagen',
    saveBranding: 'Guardar Identidad',
    resetBranding: 'Restablecer por Defecto',
    staffPinConfig: 'Configuración del PIN del Personal',
    staffPinDesc: 'Configure y atribuya PINs numéricos de 4 dígitos para el registro de entrada de los empleados.',
    showPin: 'Mostrar PIN',
    hidePin: 'Ocultar PIN',
    setPin: 'Establecer PIN',
    roleMultipliersTitle: 'Multiplicadores de Rol para Propinas',
    roleMultipliersDesc: 'Configure el peso de los puntos para la distribución de propinas por rol de empleado.',
  },
  tableOrder: {
    premiumSelfService: 'Autoservicio Premium',
    searchPlaceholder: 'Buscar artículos del menú...',
    noItemsFound: 'No se encontraron artículos',
    liveBillTracker: 'Seguimiento de la cuenta y estado en vivo',
    dishesInPrep: 'Platos en preparación',
    noActiveOrders: 'Aún no hay pedidos activos',
    addItemsToOrder: 'Añada artículos a continuación para iniciar su pedido.',
    tableBillTotal: 'Total de la cuenta de la mesa',
    modifierTitle: 'Personalizar artículo',
    notesTitle: 'Notas para la cocina (alergias, peticiones...)',
    addToCart: 'Añadir al pedido',
    reviewOrder: 'Revisar pedido',
    cartTitle: 'Carrito de la mesa',
    specialRequests: 'Peticiones especiales...',
    placeOrderBtn: 'Enviar pedido a la cocina',
    orderSubmitted: '¡Pedido enviado a la cocina con éxito!',
    orderFailed: 'Error al realizar el pedido. Por favor, inténtelo de nuevo.',
    prepStatusOrdered: 'Pedido',
    prepStatusPreparing: 'Preparando',
    prepStatusReady: 'Listo',
    prepStatusServed: 'Servido',
    modifierRequired: 'Selección obligatoria',
    modifierOptional: 'Opcional',
    browseMenu: 'Ver menú',
    trackOrders: 'Seguimiento de pedidos',
    guestsSeated: 'Clientes sentados:',
    viewCart: 'Ver carrito',
    popularBadge: 'Popular',
    modifiersRequiredBadge: 'Obligatorio',
    extrasTitle: 'Seleccionar extras',
    itemAddedToCart: 'Artículo añadido al carrito',
    cartEmpty: 'Su carrito está vacío',
    placedBySelf: 'Pedido de cliente',
  },
  menuManagement: {
    title: 'Gestión del Menú',
    editDesc: 'Edite elementos del menú, imágenes y extras opcionales.',
    searchPlaceholder: 'Buscar artículos...',
    noItemsFound: 'No se encontraron elementos de menú que coincidan con',
    editItem: 'Editar {name}',
    editItemDesc: 'Actualice los detalles del elemento del menú, la imagen y los extras opcionales.',
    itemName: 'Nombre del Artículo',
    basePrice: 'Precio Base',
    image: 'Imagen',
    imagePlaceholder: 'https://... o subir local',
    upload: 'Subir',
    uploading: 'Subiendo...',
    optionalExtras: 'Extras Opcionales (Adiciones)',
    addExtra: 'Añadir Extra',
    extraPlaceholder: 'Nombre del extra (ej. Queso Extra)',
    noExtras: 'No hay extras opcionales configurados.',
    createOne: 'Crear uno ahora',
    saving: 'Guardando...',
    saveChanges: 'Guardar Cambios',
    toastUpdated: 'Elemento del menú actualizado con éxito',
    toastFailed: 'Error al actualizar el elemento del menú',
    toastUploaded: 'Imagen subida con éxito',
    toastUploadFailed: 'Error al subir la imagen',
  },
  landing: {
    welcome: 'Bienvenido a',
    tagline: 'Disfrute de una experiencia gastronómica premium con pedidos interactivos en su mesa.',
    guestSectionTitle: 'Para Nuestros Clientes',
    guestSectionDesc: 'Explore el menú, personalice su pedido y envíelo directamente a la cocina.',
    viewMenuBtn: 'Ver Menú y Pedir',
    selectTableLabel: 'Seleccione Su Mesa',
    selectTablePlaceholder: 'Elija una mesa...',
    installGuestBtn: 'Instalar App del Cliente',
    installGuestDesc: 'Añada The Gilded Fork a su pantalla de inicio para realizar pedidos rápidos en la mesa.',
    staffSectionTitle: 'Para el Personal y Operaciones',
    staffSectionDesc: 'Acceda a pedidos POS, pantalla de cocina KDS, plano de sala, CRM y configuración del sistema.',
    goToManagementBtn: 'Ir a la App de Gestión',
    installStaffBtn: 'Instalar App en la Tableta',
    installStaffDesc: 'Instale la suite de gestión completa en las tabletas de servicio.',
    pwaInstructionsTitle: 'Guía de Instalación',
    pwaInstructionsIOS: 'En iOS, pulse el botón Compartir y seleccione "Añadir a la pantalla de inicio".',
    pwaInstructionsInstalled: 'La aplicación ya está instalada y lista en este dispositivo.',
    bookTableBtn: 'Reservar Mesa',
    selectTableBtn: 'Seleccionar Mesa y Pedir',
    tableSelectedLabel: 'Mesa: {name}',
    browseMenuBtn: 'Ver Menú y Pedir',
    selectedUnlocked: 'Seleccionado: {name} (desbloqueado para pedidos)',
    signatureCutsTitle: 'Cortes Especiales',
    signatureCutsDesc: 'Carne madurada de primera calidad preparada por nossos chefs.',
    coastalDelicaciesTitle: 'Delicias de la Costa',
    coastalDelicaciesDesc: 'Cola de langosta asada y langostinos salvajes con mantequilla de hierbas.',
    bookTableModalTitle: 'Reserve Su Mesa',
    bookTableModalDesc: 'Confirmación al instante. Reserve online sin complicaciones.',
    emailOptionalLabel: 'Correo Electrónico (Opcional)',
    tableOptionalLabel: 'Mesa (Opcional)',
    autoAssignTableOpt: 'Asignar Mesa Automáticamente',
    bookOnlineResBtn: 'Confirmar Reserva Online',
    interactiveFloorPlanTitle: 'Plano Interactivo del Restaurante',
    floorPlanDesc: 'Haga clic en cualquier mesa libre (verde) para seleccionarla.',
    selectTableDropdownPlaceholder: 'Seleccione una mesa de la lista...',
    floorPlanSizingLabel: 'Tamaño del Plano',
    legendFree: 'Libre',
    legendSeated: 'Ocupado',
    legendReserved: 'Reservado',
    staffPortalAccessBtn: 'Acceso Portal Personal',
    ourAddress: 'Nuestra Dirección',
    guestOption: 'Cliente',
    guestsOption: 'Clientes',
    bookingLoading: 'Reservando...',
    toastTableSelectedTitle: 'Mesa Seleccionada',
    toastTableSelectedDesc: 'Ha seleccionado la Mesa {name}.',
    toastTableTapOrderDesc: 'Mesa {name} seleccionada. Toque el botón de pedido para continuar.',
    seatsLabel: 'asientos',
    zoomLabel: 'Zoom',
    fitBtn: 'Ajustar',
    noTablesFound: 'No se encontraron mesas.',
    installAppBtn: 'Instalar App',
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
