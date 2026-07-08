# The Gilded Fork 🍴
> A premium, avant-garde Restaurant Management System & POS Platform designed for high-end dining, busy bars, and casual bistros.

The Gilded Fork is a comprehensive restaurant management software built on Next.js, Prisma, and Tailwind CSS. It supports multi-locale localization (i18n), live status synchronization, visual floor plan management, real-time KDS workflow, staff rostering, CRM guest tracking, and advanced financial ledger analytics.

---

## 🌟 Key Modules & Features

### 1. Dashboard & Telemetry
- **Real-time Revenue Monitoring**: Displays live sales, average check size, and served check indicators.
- **Cost Metrics Breakdown**: Visual breakdown of Labor Costs, Food Costs, and miscellaneous overheads.
- **Service controls**: Reset shift operations or perform full database backups/wipes.
- **Daily Checklist Monitor**: Tracks operational readiness checklist logs for managers.

### 2. POS & Order Management
- **Interactive Cart**: Quick-add menu items with customized preparation notes.
- **Live Ticket Status Flow**: Tracks item preparation states chronologically: `Pending` ➔ `Fired` ➔ `Preparing` ➔ `Ready` ➔ `Served`.
- **Advanced Billing Splits**: Split bills equally, split by individual seat positions, or split by menu item.
- **Store Credit integration**: Authorize loyalty tier guests to settle orders via store credit.

### 3. Visual Floor Plan & Seating
- **Visual Canvas editor**: Move tables, adjust seating capacities, assign table shapes (round/square), and update sections (Main Dining, Bar, Patio, VIP).
- **Status telemetry**: Live color indicators representing table states:
  - 🟢 **Free**
  - 🔵 **Reserved**
  - 🟡 **Seated**
  - ⚪ **Needs Cleaning**
- **Server Assignment**: Assign waitstaff to specific tables with live shifts sync.

### 4. Kitchen Display System (KDS)
- **Station-Specific Routing**: Route order tickets to the Kitchen or Bar displays dynamically.
- **Interactive Kanban Board**: Drag tickets through preparation stages: `Queued`, `Preparing`, and `Ready`.
- **Chronological Logs**: Production histories with elapsed timers and bump metrics.

### 5. Reservations & Waitlist
- **Waitlist Coordinator**: Calculate estimated wait times and alert guests via automated notifications.
- **Interactive Table Grid**: Displays real-time table occupancy panel. Clicking a **Free** table pre-fills the booking details automatically.
- **CRM guest Lookup**: Auto-populate guest details using CRM indexing.

### 6. Inventory & Stock Control
- **Low-Stock Warnings**: Visual thresholds indicating item shortages.
- **Shopping List Generator**: Instantly generate and print a formatting-friendly shopping list of all low-stock items.
- **Wastage Ledger**: Log ingredient wastage with auto-calculated cost impacts.
- **PO Dispatcher**: Automatically suggest reorder quantities and draft Purchase Orders for vendors.

### 7. Staff & Rota Management
- **Scheduler**: Assign staff members to predefined shifts (Morning, Afternoon, Evening) with start/end override times.
- **Shift Deletion**: Cancel assignments safely with instant roster updates.
- **Clock In/Out Terminal**: Track staff hours, active statuses, and break intervals.
- **Tip Distribution Coordinator**: Distribute tips among clocked-in FOH and Kitchen crews.

### 8. CRM & Guests Profiles
- **Loyalty Program tracker**: Customers earn points to progress through tiers: `BRONZE`, `SILVER`, `GOLD`, and `PLATINUM`.
- **Milestones & Preferences**: Notes guest birthdays, favorite menu choices, and dietary allergies.
- **Store Credit Control**: Toggle store credit authorizations and credit limits.

### 9. Transaction Ledger & VAT Analytics
- **Cost ledger**: Group transaction records (Inflows/Outflows) matching sales, wastage, and PO costs.
- **VAT summary**: Real-time VAT summaries tracking VAT Received, VAT Paid, and Net VAT liabilities/refunds.

---

## 🌐 i18n & Multi-Language Support

The platform utilizes a customized React context (`useT()`) and a lightweight state management store (`locale-store`) to localize strings dynamically across **four supported languages**:
- 🇬🇧 **English (UK)** — `en-GB`
- 🇵🇹 **Portuguese (PT)** — `pt-PT`
- 🇫🇷 **French (FR)** — `fr-FR`
- 🇪🇸 **Spanish (ES)** — `es-ES`

All numbers, date formats, timestamps, and currency metrics are formatted dynamically according to the chosen locale rules.

---

## 🛠️ Technology Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) (micro-animations), [lucide-react](https://lucide.dev/) (icons)
- **Database**: SQLite (local development file)
- **ORM**: [Prisma ORM](https://www.prisma.io/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)

---

## 🚀 Getting Started & Local Setup

Follow these steps to set up and run the project locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/) package manager

### 1. Installation
Clone the repository and install dependencies:
```bash
# Using npm
npm install

# Or using bun
bun install
```

### 2. Database Configuration & Migrations
Initialize the SQLite database and seed the mock data:
```bash
# Generate Prisma Client and apply migrations
npx prisma migrate dev

# Seed database with initial menu items, tables, templates, and staff profiles
npx prisma db seed
```

### 3. Run Development Server
Start the development server:
```bash
# Using npm
npm run dev

# Or using bun
bun run dev
```
Open your browser and navigate to **`http://localhost:3000`** to access the platform.

### 4. Database Exploration (Prisma Studio)
To view or manually modify rows in the database tables, open Prisma Studio:
```bash
npx prisma studio
```
This runs a visual database explorer interface on **`http://localhost:5555`**.

---

## 🖥️ Windows Standalone POS & Kiosk App

The system includes a dedicated, self-contained desktop build pipeline designed to package the server and POS interface into a local kiosk application on Windows machines using a local SQLite database.

### How to Build the Standalone App

1. Make sure you have installed the project dependencies:
   ```bash
   npm install
   ```
2. Run the Windows standalone builder:
   ```bash
   npm run build:windows
   ```
   This script will:
   - Generate a SQLite-specific Prisma schema (`prisma/schema.sqlite.prisma`).
   - Create a clean local SQLite database (`dev.db`).
   - Run the DB sync and generate the SQLite Prisma client.
   - Run the Next.js production compiler in standalone output mode.
   - Package all static assets and server files into `.next/standalone`.
   - Automatically write a `Start-Server.bat` script inside the standalone folder.
   - Restore your original PostgreSQL Prisma config so the main development server remains untouched.

### How to Run the Standalone App

Once the build is complete, you can start the application at any time without opening a terminal:

1. Locate the **`Launch-POS.bat`** file in the root directory.
2. Double-click **`Launch-POS.bat`**.
   - This starts the local background server on port `3000`.
   - It will automatically launch Chrome or Edge in fullscreen **Kiosk App Mode** pointing directly to `/management`.
   - It disables HTTP caching to ensure the interface always displays the latest menu items and layout configurations.
3. To shut down the app and stop the server safely, click the **Exit App** (Power icon) button at the bottom of the management sidebar.
