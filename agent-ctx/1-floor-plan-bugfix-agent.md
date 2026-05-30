# Task 1 - Floor Plan Bug Fix Agent

## Task: Fix three bugs in floor plan module

### Bugs Fixed

1. **Tables move but don't stay where you drag them to** (position doesn't persist after drag)
2. **Can't change the amount of seats** on a table
3. **Can't assign a worker/server** to a table

### Changes Made

**File: `/home/z/my-project/src/components/modules/floor-plan/floor-plan.tsx`**

#### Change 1: FloorViewCanvas - Fix position persistence
- Added `unsavedPositionRef` (`useRef<Set<string>>(new Set())`) to track table IDs with locally-modified positions not yet saved to API
- Modified `useEffect` that syncs positions to skip overwriting positions for tables in the unsaved set
- Rewrote `handleDragMove` to:
  - Update React state immediately (`setLocalPositions`) instead of only updating ref + direct DOM manipulation
  - Mark table as unsaved via `unsavedPositionRef.current.add(tableId)`
  - Debounce only the API save (500ms), not the state update
  - Remove table from unsaved set after API save completes

#### Change 2: CanvasTableCard - Always show capacity controls
- Replaced conditional rendering (`{hovered && (...)}`) for +/- buttons with always-visible buttons
- Added opacity transition: `opacity-50` when not hovered, `opacity-100` when hovered
- Wrapped in `cn("flex items-center gap-0.5 transition-opacity duration-150", hovered ? "opacity-100" : "opacity-50")`

#### Change 3: CanvasTableCard - Always show server assignment
- Replaced conditional rendering (`{hovered ? (...) : table.server ? (...) : null}`) with always-visible popover
- Wrapped Popover in a div with `cn("transition-opacity duration-150", hovered ? "opacity-100" : "opacity-50")`
- Server assignment button is always clickable, not dependent on hover state

#### Change 4: Silent position save toast
- Removed `toast({ title: t.floorPlan.positionSaved })` from `handleTablePositionChange` in the FloorPlan component
- Added comment explaining why: fires frequently during drag
- Error toast still shown on failure

### Verification
- `bun run lint` passes clean with no errors
- Dev server compiles successfully
