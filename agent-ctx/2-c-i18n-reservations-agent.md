# Task 2-c: Add i18n translations to reservations.tsx

## Agent: i18n-reservations-agent

## Work Log:
- Read the full reservations.tsx file (1450 lines) and translations.ts to understand available keys
- Noted that useT was already imported from @/stores/locale-store on line 61
- Removed the module-level STATUS_LABELS constant and moved status labels inline into StatusBadge component using t.reservations.confirmed/cancelled/noShow/seated and t.common.completed
- Added const t = useT(); to all 8 component functions: StatusBadge, SummaryCards, TimelineReservation, WaitlistEntry, AddWalkInDialog, NewReservationDialog, SeatGuestDialog, Reservations
- Did NOT add useT() to non-component functions (getTimeCategory, formatTime12)
- Renamed callback parameter t to tbl in filter callbacks to avoid shadowing the translation t variable
- Replaced hardcoded strings with corresponding translation keys across all components
- Ran bun run lint - passed with zero errors
- Verified dev server compiles successfully

## Stage Summary:
- Replaced 40+ hardcoded English UI strings with i18n translation keys across 8 components
- Key mappings: status labels -> t.reservations.confirmed/cancelled/noShow/seated + t.common.completed; dialog titles/buttons -> t.reservations.newReservation/addToWaitlist; form labels -> t.reservations.guestName/partySize/date/time/notes/phone/estimatedWait/minutes; common actions -> t.common.cancel/email/completed/all; tab labels -> t.reservations.todayReservations/waitlist/title
- Strings without corresponding translation keys left as hardcoded English
- All filter callbacks that previously used (t) as parameter renamed to (tbl) to avoid variable shadowing
