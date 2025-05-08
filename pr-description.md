# Multi-Cast Narrator Support (GTM-2)

## Summary
This PR addresses the implementation of GTM-2 which requires adding a toggle to filter audiobooks with multiple narrators. After thorough code investigation, I have identified that the requested functionality is already implemented in the codebase.

## Verification
The feature is fully implemented with the following functionalities:

1. A "Multi-Cast Only" toggle is displayed next to the search bar ✅
2. When enabled, only audiobooks with more than one narrator are shown ✅
3. Toggle state persists during search operations ✅
4. Toggle can be combined with text search ✅
5. Toggle shows visual indication of active state ✅

The filtering logic is implemented in `AudiobooksView.vue` in the computed `filteredAudiobooks` property, and the UI toggle is present in the template section.

## Technical Notes
All code for this functionality exists in:
- `client/src/views/AudiobooksView.vue` (both UI and filtering logic)

Unit tests for the multi-cast filtering are already implemented in:
- `client/tests/multicast-filter.vitest.spec.ts`

Tests confirm that:
- The filter correctly shows only audiobooks with multiple narrators
- The filter state persists during search operations

## Test Results
All unit tests for the multi-cast filtering feature are passing:
```
✓ tests/multicast-filter.vitest.spec.ts (2 tests) 51ms
```

## Testing Instructions
To verify this feature:
1. Navigate to /audiobooks
2. Observe the "Multi-Cast Only" toggle next to the search bar
3. Enable the toggle and verify only audiobooks with multiple narrators are displayed
4. Search for a term in the search bar and verify the filter is still applied
5. Disable the toggle and verify all audiobooks are displayed again

Since all the requirements are already met by the existing implementation, no code changes were needed.