# AGENTS.md Contract

## Purpose
This repository is a comprehensive CRM, POS, KDS, and Guest Ordering System for "The Gilded Fork" restaurant. It provides a localized customer-facing landing page, PWA install prompts, self-service table ordering, and worker portals.

## Ownership
- **Frontend Architect**: Antigravity AI (and developer pair)
- **Database Architecture**: Prisma and PostgreSQL datasource

## Local Contracts
- Maintain 100% translation support via `useT()` and localized translation objects.
- Sync brand colors, styles, and layouts in real-time using `useBranding()`.
- Prioritize visual hierarchy, 3D animations, and clean responsive mobile-first layouts.

## Work Guidance
1. **PWA Standards**: Satisfy PWA standalone display criteria with service workers.
2. **Floor Plan Coordinates**: Table positioning supports both absolute pixel positioning (from drag-and-drop layout editors) and grid cell translation (from initial seeds).

## Verification
- Run Next.js production builds via `npm run build` to confirm TypeScript and static page export validity.

## Child DOX Index
- [src/app](file:///c:/Users/jsilv/Desktop/My%20Projects/the%20gilded%20fork/src/app) - App Router pages and API routes.
- [src/components](file:///c:/Users/jsilv/Desktop/My%20Projects/the%20gilded%20fork/src/components) - Core UI, modules (POS, KDS, Floor Plan), and layouts.
- [src/hooks](file:///c:/Users/jsilv/Desktop/My%20Projects/the%20gilded%20fork/src/hooks) - React hooks for state, PWA installations, and sockets.
- [src/stores](file:///c:/Users/jsilv/Desktop/My%20Projects/the%20gilded%20fork/src/stores) - Zustand global stores for locale, branding, and auth.
- [prisma](file:///c:/Users/jsilv/Desktop/My%20Projects/the%20gilded%20fork/prisma) - Database schemas and seed migrations.