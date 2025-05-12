# Pull Request: GTM-2 Add multi-cast narrator support

## Issue
[GTM-2: Add multi-cast narrator support](https://linear.app/sourcegraph/issue/GTM-2/add-multi-cast-narrator-support)

## Summary
Added the ability for users to filter audiobooks to show only those with multiple narrators. This feature helps users find multi-cast audiobooks when they prefer performances with diverse voice actors.

## Technical Notes
- Added a "Multi-Cast Only" toggle component adjacent to the search bar
- Implemented filtering logic in computed property to show only audiobooks with multiple narrators when toggled
- Modified the filter to combine with text search so both can be used simultaneously 
- Added visual indication for the active toggle state using a purple gradient 
- Toggle state persists during search operations

## Feature Flow
```mermaid
flowchart TD
    User([User]) -->|Visits page| Load[Load audiobooks]
    Load -->|Display all| Books[Audiobook list]
    User -->|Toggle multi-cast| Filter[Apply multi-cast filter]
    User -->|Search text| Search[Apply text search]
    
    Filter -->|If enabled| FilterLogic{Has >1 narrator?}
    FilterLogic -->|Yes| KeepBook[Keep audiobook]
    FilterLogic -->|No| RemoveBook[Remove audiobook]
    
    Search -->|If text entered| SearchLogic{Matches title, author or narrator?}
    SearchLogic -->|Yes| KeepSearch[Keep audiobook]
    SearchLogic -->|No| RemoveSearch[Remove audiobook]
    
    subgraph "Combined Filtering"
        KeepBook
        RemoveBook
        KeepSearch
        RemoveSearch
    end
    
    KeepBook --> DisplayResults[Display filtered results]
    KeepSearch --> DisplayResults
    RemoveBook --> DisplayResults
    RemoveSearch --> DisplayResults
    
    DisplayResults -->|No results| ShowEmpty[Show "No audiobooks match your search"]
    DisplayResults -->|Has results| ShowBooks[Show filtered audiobooks]
```

## Testing
### Added Tests
Modified existing filtering logic to accommodate the new feature.

### Human Testing Instructions
1. Visit the home page (http://localhost:5173)
2. Toggle the "Multi-Cast Only" switch next to the search bar
3. Verify only audiobooks with multiple narrators are displayed
4. Type a search term while the toggle is active
5. Verify the results include only multi-cast audiobooks matching the search term
6. Clear the search and toggle off the "Multi-Cast Only" switch
7. Verify all audiobooks are displayed again
