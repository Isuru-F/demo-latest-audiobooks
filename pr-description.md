## SonarQube Issue Fix: AZhyh5QGQkXnhmx4R6NI

### Issue Details
- **SonarQube Link**: https://sonarqube.company.com/project/issues?id=demo-latest-audiobooks&issues=AZhyh5QGQkXnhmx4R6NI
- **Issue Type**: Code Smell
- **Severity**: Major
- **File(s) Affected**: client/src/assets/base.css

### Problem Description
The CSS file contained duplicate `:root` selectors at lines 2 and 25, which can cause unpredictable styling behavior, override conflicts between CSS rules, maintenance difficulties, and performance issues.

### Solution Implemented
Consolidated the duplicate `:root` selectors into a single declaration block by merging all CSS custom properties from both selectors into the first `:root` block and removing the duplicate selector.

### Technical Notes
- Merged all CSS custom properties from both `:root` blocks
- Maintained logical grouping with comments to separate color palette variables from semantic color variables
- No property conflicts were present - all properties were unique between the two blocks
- CSS structure and hierarchy preserved

### Testing
- [x] Build passes (CSS compilation successful)
- [x] All existing tests pass
- [ ] New tests added (not applicable for CSS fix)
- [x] Manual testing completed (verified CSS consolidation)

### SonarQube Verification
- [ ] Issue resolved in SonarQube after merge
- [ ] No new issues introduced
