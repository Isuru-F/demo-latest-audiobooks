# Implementation Decisions: KAN-1 - Add Sort Button

## Decision 1: Composable-based Architecture
**Decision:** Create a reusable `useSorting` composable instead of duplicating logic in each view.

**Rationale:**
- Promotes code reuse across HomeView and AudiobooksView
- Easier to test in isolation
- Follows Vue 3.5 Composition API best practices
- More maintainable and extensible

## Decision 2: Client-side Sorting
**Decision:** Implement sorting on the frontend rather than modifying the backend API.

**Rationale:**
- Spotify API doesn't support custom sorting parameters
- Dataset size is manageable (typically 20-50 items per view)
- No backend changes required
- Faster implementation

## Decision 3: Native Select Element for Sort UI
**Decision:** Use a native HTML `<select>` element styled to match the design system.

**Rationale:**
- Better accessibility out of the box
- Mobile-friendly with native device pickers
- No additional dependencies
- Matches the simplicity of the existing search input

## Decision 4: Sort Options Structure
**Decision:** Define sort options as simple value strings (e.g., 'name-asc', 'name-desc') with sorting logic in the view.

**Rationale:**
- Simpler than passing comparator functions as props
- Type-safe with TypeScript string literals
- Easier to test
- Clear separation of concerns (component handles UI, composable handles logic)

## Decision 5: No Persistent State
**Decision:** Do not persist sort selection to localStorage or URL params in this iteration.

**Rationale:**
- Keeps implementation simple
- Listed as future enhancement in PLAN.md
- Sort state resets on page navigation (acceptable for v1)
- Can be added later without breaking changes

---

## Implementation Status

### ✅ Completed Tasks
1. Created `useSorting` composable with generic sorting utilities
2. Created `SortButton.vue` component with accessible native select element
3. Integrated sorting into HomeView with 6 sort options
4. Integrated sorting into AudiobooksView with 6 sort options
5. Created comprehensive unit tests for both composable and component (22 tests, all passing)
6. Vite build succeeds without errors

### 📝 Notes
- All unit tests for new sorting functionality pass (22/22)
- Vite production build completes successfully
- Pre-existing TypeScript error in `spotify.ts` store exists but is unrelated to sorting implementation
- New code has zero TypeScript errors when checked in isolation
- All acceptance criteria from PLAN.md met
