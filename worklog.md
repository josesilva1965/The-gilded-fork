---
Task ID: 1
Agent: main
Task: Fix drag-and-drop position persistence, seat count editing, and server assignment on floor plan

Work Log:
- Read floor-plan.tsx (1895 lines) and traced the entire drag-and-drop flow
- Read app-store.ts, API route /api/tables/route.ts, and Prisma schema
- Identified root cause: complex pendingPositionRef + debounced save mechanism had race condition where tables state updates from API or auto-refresh could overwrite local positions before the save was confirmed
- Rewrote FloorViewCanvas with simplified approach:
  - Replaced pendingPositionRef + saveTimeoutRef + debounce with simple draggingTableIdRef
  - During drag: only update local state (no API calls)
  - On drag end: immediately save position to API via new onDragEnd callback
  - Sync useEffect skips the currently-dragged table to prevent position jumps
  - Clear dragging flag after 500ms delay (enough for API + React state propagation)
- Added onDragEnd callback to CanvasTableCard - fires in handlePointerUp when a drag actually occurred
- Verified capacity change handlers work (optimistic update + API call)
- Verified server assignment popover works (data-interactive prevents drag, portal renders outside card DOM)
- Lint passes, no compilation errors

Stage Summary:
- Drag-and-drop: Fixed by simplifying position management - no more debounced saves or pending refs
- Seat count: Working correctly (+/- buttons use data-interactive to prevent drag interference)
- Server assignment: Working correctly (Popover portal + data-interactive prevents drag)
- Key fix: Table positions now persist because the drag end immediately saves to API, and the sync useEffect preserves local positions during active drags
