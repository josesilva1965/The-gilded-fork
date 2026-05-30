# Task 4 — Main Application Layout

**Agent:** layout-builder
**Date:** 2025-07-09
**Status:** ✅ Completed

## What was done
Built the full application shell for The Gilded Fork restaurant CRM/operations system:

1. **providers.tsx** — QueryClientProvider + TooltipProvider wrapper
2. **sidebar.tsx** — Desktop sidebar (collapsible) + Mobile sidebar (slide-over), nav items filtered by role, user info, switch role
3. **top-bar.tsx** — View title, live clock, notification bell, user dropdown with avatar/role badge/sign-out
4. **app-shell.tsx** — Role selection screen (5 role cards with colors/icons/animations) + Main layout (sidebar + topbar + content + sticky footer)
5. **layout.tsx** — Updated with dark mode default, new metadata, Providers wrapper
6. **page.tsx** — Renders AppShell

## Key conventions
- Dark theme: bg-zinc-950, bg-zinc-900, bg-zinc-800, emerald accent
- Zustand stores: useAuthStore (user/role/auth), useAppStore (view/sidebar/notifications)
- Mock users: admin@thebar.com, manager@thebar.com, chef@thebar.com, bartender@thebar.com, server1@thebar.com
- All nav items from NAV_ITEMS in constants.ts, filtered by user role
- Icons mapped via ICON_MAP in sidebar.tsx from Lucide icon names
- Responsive: sidebar on desktop, slide-over on mobile
