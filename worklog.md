---
Task ID: 1
Agent: main
Task: Fix floor plan table drag persistence, seat editing, and server assignment

Work Log:
- Analyzed root causes of all three bugs in floor-plan.tsx
- Position not persisting: handleDragMove only updated ref + DOM, not React state; useEffect overwrote positions on any tables state change
- Seat editing: +/- buttons only visible on hover, hover state unreliable due to pointer capture from drag
- Server assignment: popover only visible on hover, same pointer capture issue
- Added unsavedPositionRef to FloorViewCanvas to track tables with locally-modified positions
- Modified useEffect to skip overwriting unsaved positions when tables state changes
- Changed handleDragMove to update localPositions React state immediately (not just ref + DOM manipulation)
- Debounce only the API save (500ms), not the state update
- Changed CanvasTableCard capacity section: always show +/- buttons with opacity-50/opacity-100 transition
- Changed CanvasTableCard server section: always show server assignment popover button with opacity transition
- Made handleTablePositionChange silent (no success toast, only error toast)
- Verified all translation keys (quickAssignServer, positionSaveFailed) exist in all 4 locales
- Lint passes clean, dev server compiles successfully

Stage Summary:
- All three floor plan bugs fixed
- Position persistence: positions are now saved correctly via immediate state updates + debounced API saves
- Seat editing: +/- buttons always visible, clickable regardless of hover state
- Server assignment: server popover always accessible, clickable regardless of hover state
