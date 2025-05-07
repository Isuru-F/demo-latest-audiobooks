# Add multi-cast narrator support (GTM-2)

## Summary
This PR implements a "Multi-Cast Only" toggle filter for the audiobooks page, allowing users to easily find audiobooks with multiple narrators.

## Technical Notes
- Added a toggle component next to the search bar to filter for multi-cast audiobooks
- Implemented filter logic in computed property to show only audiobooks with multiple narrators
- Ensured toggle state persists during search operations
- Added styling for the toggle with visual feedback when active
- Filter works in combination with text search

## Tests Added (2 tests, 0 removed)
- `AudiobooksView component > filters audiobooks with multiple narrators when Multi-Cast Only is toggled`
- `AudiobooksView component > persists multi-cast filter while searching`

## Human Testing Instructions
1. Visit http://localhost:5173/
2. Toggle the "Multi-Cast Only" switch
3. Verify only audiobooks with multiple narrators are displayed
4. Enter text in the search field while toggle is active
5. Verify search results still respect the multi-cast filter
6. Toggle off "Multi-Cast Only"
7. Verify all audiobooks are displayed again

## Relevant Issues
- [GTM-2: Add multi-cast narrator support](https://linear.app/sourcegraph/issue/GTM-2/add-multi-cast-narrator-support)