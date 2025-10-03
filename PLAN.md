# Implementation Plan: KAN-1 - Add Sort Button

**Issue:** KAN-1  
**Title:** Add sort button  
**Description:** No description provided  
**Date:** 2025-10-03

---

## 1. Requirements Analysis

### Context
The Jukebox application is a Spotify music discovery app built with Vue 3.5 (frontend) and Node.js/Express (backend). It displays music releases and audiobooks from the Spotify API.

### Current State
The application has three main views that display list data:
- **HomeView**: Displays new music releases (albums) in a grid
- **AudiobooksView**: Displays audiobooks in a grid
- **GenresView**: Displays genres as buttons (not suitable for sorting)

Both HomeView and AudiobooksView have search functionality but lack sorting capabilities.

### Requirements Interpretation
Since the Jira issue lacks specific requirements, we will implement sort functionality for the two main list views:

1. **HomeView (Latest Releases)**: 
   - Sort albums by: Name (A-Z, Z-A), Release Date (Newest, Oldest), Artist Name (A-Z, Z-A)
   
2. **AudiobooksView**: 
   - Sort audiobooks by: Title (A-Z, Z-A), Release Date (Newest, Oldest), Author Name (A-Z, Z-A)

### Functional Requirements
- Add a sort button/dropdown component to both views
- Provide multiple sort criteria relevant to each content type
- Maintain sort state during search operations
- Persist sort selection within the session
- Provide clear visual indication of active sort option
- Ensure sort works seamlessly with existing search functionality

### Non-Functional Requirements
- Follow existing code conventions (Vue 3.5 with TypeScript)
- Match existing UI/UX design patterns
- Maintain responsive design
- Add comprehensive unit tests
- No performance degradation for large datasets

---

## 2. Files to Create/Modify

### Files to Create
1. **`client/src/components/SortButton.vue`**
   - Reusable dropdown component for sort options
   - Props: sortOptions array, current sort value, emit change event
   
2. **`client/src/composables/useSorting.ts`**
   - Composable function for sorting logic
   - Reusable across different views
   - Type-safe sorting utilities

3. **`client/src/tests/unit/components/SortButton.spec.ts`**
   - Unit tests for SortButton component

4. **`client/src/tests/unit/composables/useSorting.spec.ts`**
   - Unit tests for sorting logic

### Files to Modify
1. **`client/src/views/HomeView.vue`**
   - Add SortButton component
   - Integrate sorting logic with existing search
   - Update computed property for filteredReleases to include sorting

2. **`client/src/views/AudiobooksView.vue`**
   - Add SortButton component
   - Integrate sorting logic with existing search
   - Update computed property for filteredAudiobooks to include sorting

3. **`client/src/types/spotify.ts`** (optional)
   - Add type definitions for sort options if needed

---

## 3. Architecture Decisions

### Component Architecture
- **SortButton Component**: A reusable dropdown/select component
  - Generic and reusable across different content types
  - Accepts sort options as props
  - Emits events on selection change
  - Styled consistently with existing design (matches search input style)

### Sorting Strategy
- **Client-side sorting**: Sort data in the frontend after fetching
  - Rationale: Spotify API doesn't support custom sorting parameters
  - Simple implementation, no backend changes required
  - Suitable for the current dataset size

### State Management
- **Local component state**: Use Vue ref() in each view
  - No need for global state (Pinia) as sort preference is view-specific
  - Simpler implementation
  - Can be enhanced later if cross-view persistence is needed

### Composable Pattern
- **useSorting composable**: Encapsulates sorting logic
  - Promotes code reuse
  - Easier to test
  - Type-safe with TypeScript generics
  - Returns sorting function and utilities

### Sort Options Structure
```typescript
interface SortOption {
  label: string;      // Display text (e.g., "Name (A-Z)")
  value: string;      // Unique identifier (e.g., "name-asc")
  sortFn: (a, b) => number;  // Sort comparator function
}
```

### Design Decisions
1. **Placement**: Position sort button next to search input in the header
2. **UI Pattern**: Dropdown select styled as a button to match existing design
3. **Default Sort**: No sorting initially (preserve API response order)
4. **Icons**: Use simple text labels or CSS arrows (no icon library needed)

---

## 4. Implementation Steps

### Phase 1: Create Reusable Composable (Day 1)
1. Create `client/src/composables/useSorting.ts`
   - Implement generic sorting function with TypeScript generics
   - Add comparator functions for common sort types (string, date, number)
   - Export composable with sorting utilities

2. Create tests for composable
   - Test ascending/descending string sorting
   - Test date sorting
   - Test nested property access (e.g., artist.name)

### Phase 2: Create Sort Button Component (Day 1)
1. Create `client/src/components/SortButton.vue`
   - Design dropdown/select component
   - Accept props: options array, modelValue, placeholder
   - Emit update:modelValue event
   - Style to match existing design system (purple gradient theme)
   - Add accessibility attributes (aria-label, role)

2. Create tests for SortButton component
   - Test rendering of options
   - Test selection change event
   - Test default state
   - Test accessibility

### Phase 3: Integrate into HomeView (Day 2)
1. Modify `client/src/views/HomeView.vue`
   - Import SortButton and useSorting composable
   - Define sort options for albums:
     - Name (A-Z)
     - Name (Z-A)
     - Release Date (Newest First)
     - Release Date (Oldest First)
     - Artist (A-Z)
     - Artist (Z-A)
   - Add ref for current sort selection
   - Update filteredReleases computed property to apply sorting
   - Add SortButton to releases-header section
   - Ensure sorting works with search

2. Test manually in browser
   - Verify all sort options work correctly
   - Test interaction with search functionality
   - Check responsive design

### Phase 4: Integrate into AudiobooksView (Day 2)
1. Modify `client/src/views/AudiobooksView.vue`
   - Import SortButton and useSorting composable
   - Define sort options for audiobooks:
     - Title (A-Z)
     - Title (Z-A)
     - Release Date (Newest First)
     - Release Date (Oldest First)
     - Author (A-Z)
     - Author (Z-A)
   - Add ref for current sort selection
   - Update filteredAudiobooks computed property to apply sorting
   - Add SortButton to audiobooks-header section
   - Ensure sorting works with search

2. Test manually in browser
   - Verify all sort options work correctly
   - Test interaction with search functionality
   - Check responsive design

### Phase 5: Testing & Refinement (Day 3)
1. Write/update view tests
   - Add tests for HomeView sorting behavior
   - Add tests for AudiobooksView sorting behavior
   - Test edge cases (empty results, single item, etc.)

2. Run all tests
   ```bash
   cd client
   npm run test:unit
   ```

3. Perform manual QA testing
   - Test all sort options in both views
   - Test sort + search combinations
   - Test on different screen sizes
   - Test with empty/error states

4. Code review and cleanup
   - Ensure code follows existing conventions
   - Check for any console warnings
   - Verify TypeScript types are correct
   - Format code with Prettier

### Phase 6: Build & Type Check (Day 3)
1. Run build command
   ```bash
   cd client
   npm run build
   ```

2. Run type check
   ```bash
   cd client
   npm run type-check
   ```

3. Fix any type errors or build issues

---

## 5. Testing Approach

### Unit Tests

#### SortButton Component Tests
```typescript
// client/src/tests/unit/components/SortButton.spec.ts
describe('SortButton', () => {
  it('renders sort options correctly')
  it('emits update:modelValue when option is selected')
  it('displays placeholder when no option is selected')
  it('highlights selected option')
  it('is accessible (proper ARIA labels)')
})
```

#### useSorting Composable Tests
```typescript
// client/src/tests/unit/composables/useSorting.spec.ts
describe('useSorting', () => {
  it('sorts strings in ascending order')
  it('sorts strings in descending order')
  it('sorts dates in ascending order')
  it('sorts dates in descending order')
  it('sorts by nested properties (e.g., artist.name)')
  it('handles undefined/null values gracefully')
  it('maintains stable sort for equal values')
})
```

#### HomeView Integration Tests
```typescript
// client/src/views/__tests__/HomeView.spec.ts (update existing)
describe('HomeView sorting', () => {
  it('sorts albums by name A-Z')
  it('sorts albums by name Z-A')
  it('sorts albums by release date newest first')
  it('sorts albums by release date oldest first')
  it('sorts albums by artist name A-Z')
  it('sorts albums by artist name Z-A')
  it('maintains sort when searching')
  it('resets to default when clearing sort')
})
```

#### AudiobooksView Integration Tests
```typescript
// client/src/views/__tests__/AudiobooksView.spec.ts (create/update)
describe('AudiobooksView sorting', () => {
  it('sorts audiobooks by title A-Z')
  it('sorts audiobooks by title Z-A')
  it('sorts audiobooks by release date newest first')
  it('sorts audiobooks by release date oldest first')
  it('sorts audiobooks by author name A-Z')
  it('sorts audiobooks by author name Z-A')
  it('maintains sort when searching')
})
```

### Manual Testing Checklist

#### Functional Testing
- [ ] Sort button appears in both HomeView and AudiobooksView
- [ ] All sort options are displayed correctly
- [ ] Clicking sort option changes the order of items
- [ ] Sort persists when using search
- [ ] Sort clears when navigating away and returning
- [ ] Empty states handle sorting gracefully
- [ ] Error states handle sorting gracefully

#### UI/UX Testing
- [ ] Sort button matches existing design style
- [ ] Sort button is positioned correctly in header
- [ ] Active sort option is visually indicated
- [ ] Dropdown animations are smooth
- [ ] Sort button is keyboard accessible
- [ ] Sort button works on mobile devices
- [ ] Sort button is responsive across screen sizes

#### Performance Testing
- [ ] No lag when sorting large datasets (50+ items)
- [ ] Search + sort combination performs well
- [ ] No memory leaks when switching sort options
- [ ] Build size doesn't increase significantly

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## 6. Implementation Details

### SortButton Component Example Structure
```vue
<template>
  <div class="sort-button">
    <select v-model="selectedValue" @change="handleChange">
      <option value="">{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
```

### useSorting Composable Example Structure
```typescript
export function useSorting<T>() {
  const sortBy = (
    items: T[],
    key: keyof T | string,
    direction: 'asc' | 'desc' = 'asc'
  ): T[] => {
    // Implementation
  }
  
  return { sortBy }
}
```

### Integration in HomeView Example
```vue
<script setup>
import { ref, computed } from 'vue'
import SortButton from '@/components/SortButton.vue'
import { useSorting } from '@/composables/useSorting'

const { sortBy } = useSorting()
const currentSort = ref('')

const sortOptions = [
  { label: 'Name (A-Z)', value: 'name-asc' },
  { label: 'Name (Z-A)', value: 'name-desc' },
  // ... more options
]

const sortedAndFilteredReleases = computed(() => {
  let results = filteredReleases.value
  
  if (currentSort.value) {
    // Apply sorting based on currentSort value
  }
  
  return results
})
</script>

<template>
  <div class="releases-header">
    <h2>Latest Releases</h2>
    <div class="controls">
      <div class="search-container">
        <input v-model="searchQuery" ... />
      </div>
      <SortButton 
        v-model="currentSort" 
        :options="sortOptions"
        placeholder="Sort by..."
      />
    </div>
  </div>
</template>
```

---

## 7. Acceptance Criteria

### Feature Complete When:
- [ ] Sort button is visible on HomeView (Latest Releases)
- [ ] Sort button is visible on AudiobooksView
- [ ] Users can sort albums by: Name (A-Z/Z-A), Release Date (Newest/Oldest), Artist (A-Z/Z-A)
- [ ] Users can sort audiobooks by: Title (A-Z/Z-A), Release Date (Newest/Oldest), Author (A-Z/Z-A)
- [ ] Sorting works correctly in combination with search
- [ ] Sort button UI matches existing design system
- [ ] Sort button is responsive on mobile devices
- [ ] All unit tests pass
- [ ] Code builds without errors
- [ ] TypeScript type checking passes with no errors
- [ ] Manual testing confirms all features work as expected

---

## 8. Risks & Mitigation

### Risk 1: Performance with Large Datasets
- **Impact**: Sorting could be slow if dataset grows significantly
- **Likelihood**: Low (Spotify API returns limited results)
- **Mitigation**: Use efficient sorting algorithms; consider memoization if needed

### Risk 2: State Management Complexity
- **Impact**: Sorting + searching + filtering could create complex state
- **Likelihood**: Medium
- **Mitigation**: Use computed properties correctly; test thoroughly; keep logic in composables

### Risk 3: Design Inconsistency
- **Impact**: New sort button might not match existing design
- **Likelihood**: Low
- **Mitigation**: Follow existing patterns from search input; review with design in mind

### Risk 4: Mobile UX
- **Impact**: Dropdown might be difficult to use on mobile
- **Likelihood**: Medium
- **Mitigation**: Test on real devices; ensure touch targets are adequate; consider native select element

---

## 9. Timeline Estimate

- **Phase 1**: Composable & Tests - 2 hours
- **Phase 2**: SortButton Component & Tests - 3 hours
- **Phase 3**: HomeView Integration - 2 hours
- **Phase 4**: AudiobooksView Integration - 2 hours
- **Phase 5**: Testing & QA - 2 hours
- **Phase 6**: Build & Refinement - 1 hour

**Total Estimated Time**: 12 hours (~1.5 days)

---

## 10. Future Enhancements

Potential improvements for future iterations:
- Persist sort preference in localStorage
- Add server-side sorting if API supports it
- Add more sort options (popularity, duration, etc.)
- Add sort direction toggle button (separate from dropdown)
- Add multi-level sorting (primary + secondary sort)
- Add sort animations/transitions
- Add "Default Order" option to reset sorting

---

## 11. References

- **Linear Issue**: KAN-1
- **Design System**: Match existing purple gradient theme (#8a42ff, #e942ff)
- **Framework**: Vue 3.5 Composition API
- **Testing**: Vitest for unit tests
- **Code Style**: Prettier (no semicolons, single quotes, 100 char width)
