---
title: Documentation Updates Prompt
aliases: [Doc Updates Phase]
tags: [documentation, updates, workflow, prompt]
created: 2025-01-13
updated: 2025-01-13
---

# Documentation Updates Prompt

> [!note]
> Update documentation and clean up implementation.

## Quick Use Prompt
```markdown
Help me update documentation and clean up this implementation. Here's what we've completed:

[PASTE IMPLEMENTATION SUMMARY]

Please review these documents for context:
- /Docs/planning/roadmap.md
- /Docs/architecture/technical-specification.md
- /Docs/core-systems/_index.md

Then help me with:
1. Review all project documentation in /Docs and suggest updates based on our changes, including updating and closing related GitHub issues
2. Remove any debug code added during development
3. Review and adjust existing tests, suggesting new ones if needed
4. Add clear, plain-language code comments to explain recent changes
5. Suggest a suitable commit message for these changes

Use this format:

DOCUMENTATION UPDATES
GitHub Issue: #[number] [title]
Branch: [branch-name]

DOCUMENTATION REVIEW
Planning Updates:
- [ ] Roadmap updates
- [ ] Architecture changes
- [ ] System documentation

GITHUB UPDATES
Issues to Close:
- [ ] #[number]: [completion notes]
- [ ] #[number]: [completion notes]

Issues to Create:
- [ ] Title: [new issue title]
  Labels: [labels]
  Description: [details]

CODE CLEANUP
Debug Removal:
- [ ] Console logs
- [ ] Test outputs
- [ ] Debugging flags
- [ ] Temporary code

TEST UPDATES
Test Review:
- [ ] Existing test updates
- [ ] New test suggestions
- [ ] Coverage gaps
- [ ] Edge cases

CODE COMMENTS
Files to Update:
- [ ] [file]: [comment changes]
- [ ] [file]: [comment changes]

COMMIT MESSAGE
type(scope): Brief description

- Change detail 1
- Change detail 2

Issue: #[number]
```

## Purpose
Clean up implementation and ensure documentation reflects recent changes, focusing on clarity and maintainability while managing GitHub issues.

## Input Requirements
1. Implementation summary
2. Git diff of changes
3. Project documentation structure
4. Related GitHub issues

## Update Process

### 1. Documentation Review
- Update Planning Docs
  - Update roadmap
  - Check architecture docs
  - Review system docs
  - Update diagrams
- Manage GitHub Issues
  - Close completed issues
  - Update related issues
  - Create new issues
  - Add relevant labels

### 2. Code Cleanup
- Remove Debug Code
  - Console logs
  - Debug flags
  - Test outputs
  - Development helpers
- Clean Implementation
  - Remove unused code
  - Fix formatting
  - Order imports
  - Check naming

### 3. Test Management
- Review Tests
  - Update existing tests
  - Add missing tests
  - Check coverage
  - Verify edge cases
- Test Documentation
  - Test descriptions
  - Test organization
  - Coverage reports
  - Test data

### 4. Code Comments
- Add Clear Comments
  - Purpose explanations
  - Complex logic notes
  - Implementation details
  - API usage examples

## Output Format

```markdown
UPDATE REPORT
Component: [name]
Issue: [reference]

DOCUMENTATION CHANGES
Planning Updates:
1. [file]: [changes]
2. [file]: [changes]

GITHUB UPDATES
Closed Issues:
1. #[number]: [completion summary]
2. #[number]: [completion summary]

New Issues:
1. Title: [issue title]
   Labels: [labels]
   Description: [description]

CODE CLEANUP
Debug Removal:
1. [file]: Removed console.logs
2. [file]: Cleaned up test code

Implementation Cleanup:
1. [file]: [cleanup details]
2. [file]: [cleanup details]

TEST UPDATES
Modified Tests:
1. [test]: [changes]
2. [test]: [changes]

New Tests:
1. [test]: [purpose]
2. [test]: [purpose]

CODE COMMENTS
Updated Files:
1. [file]:
   ```[language]
   // Clear explanation of purpose
   // Usage example if needed
   implementation code
   ```

2. [file]:
   ```[language]
   // Function purpose and usage
   // Important considerations
   implementation code
   ```

COMMIT MESSAGE
[Suggested commit message with details]
```

## Example

```markdown
UPDATE REPORT
Component: CombatManager
Issue: #34 Add Weapon Selection

DOCUMENTATION CHANGES
Planning Updates:
1. /Docs/planning/roadmap.md: Marked combat system phase 1 complete
2. /Docs/core-systems/combat.md: Added weapon selection flow
3. /Docs/architecture/technical-specification.md: Updated combat diagram

GITHUB UPDATES
Closed Issues:
1. #34: Implemented weapon selection system
   - Added selection component
   - Implemented stats display
   - Added tests and documentation
2. #35: Added weapon stats display
   - Shows damage, range, and accuracy
   - Updated UI components
   - Added error handling

New Issues:
1. Title: Add weapon condition tracking
   Labels: enhancement, combat
   Description: Track weapon condition and maintenance requirements

CODE CLEANUP
Debug Removal:
1. src/components/Combat/WeaponSelector.tsx:
   - Removed console.log statements
   - Cleaned up test flags
   - Removed TODO comments

Implementation Cleanup:
1. src/types/combat.ts:
   - Organized imports
   - Fixed type naming
   - Removed unused interfaces

TEST UPDATES
Modified Tests:
1. src/components/Combat/__tests__/WeaponSelector.test.tsx:
   - Updated for new props
   - Added edge cases
   - Fixed async tests

New Tests:
1. src/components/Combat/__tests__/WeaponStats.test.tsx:
   - Test stat calculations
   - Verify display format
   - Check error states

CODE COMMENTS
Updated Files:
1. src/components/Combat/WeaponSelector.tsx:
   ```typescript
   // Handles weapon selection during combat
   // Displays available weapons and their stats
   // Updates combat state when weapon is selected
   export const WeaponSelector = ({ ... }) => {
     // WeaponStats are calculated using Boot Hill v2 rules
     // See /Docs/boot-hill-rules/combat.md for details
     const calculateWeaponStats = (weapon) => {
       ...
     }
   }
   ```

COMMIT MESSAGE
feat(combat): Add weapon selection to combat system

- Add weapon selection component with stats display
- Implement Boot Hill v2 weapon rules
- Add unit tests for selection and stats
- Update documentation and clean up implementation

Issue: #34
```

## Guidelines

### Documentation Review
- Check all relevant docs
- Update GitHub issues
- Maintain consistency
- Note future updates

### Code Cleanup
- Remove all debug code
- Keep useful comments
- Check formatting
- Verify imports

### Test Management
- Keep tests current
- Add missing coverage
- Document test cases
- Verify accuracy

### Comment Quality
- Use plain language
- Explain complex logic
- Reference docs
- Give examples

## Further Reading
- [[../prompt-guide|Prompt Writing Guide]]
- [[../testing-workflow|Testing Workflow]]
- [[../documentation-workflow|Documentation Workflow]]
