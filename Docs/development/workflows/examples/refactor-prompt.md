---
title: Refactoring Prompt
aliases:
  - Refactoring Template
  - Code Refactoring Guide
tags:
  - refactoring
  - prompts
  - code-quality
  - claude
created: 2025-02-23
updated: 2025-02-25
---

## Target File
Path: [file path]
Target Size: < 300 lines
Use MCP server tools to review/edit

## Size Reduction Strategy
Priority approaches:
1. [ ] Extract standalone components
2. [ ] Split by feature/responsibility
3. [ ] Move types to separate files
4. [ ] Relocate utility functions

## Refactoring Goals
Priority order (highest impact, lowest risk first):
1. [ ] Component extraction
2. [ ] Type safety improvements
3. [ ] File organization
4. [ ] Performance quick wins
5. [ ] Test coverage gaps

## MVP Requirements
### Must Have
- No breaking changes
- Maintain existing behavior
- Each new file under 300 lines
- Clear component boundaries
- Type safety
- Basic test coverage

### Nice to Have
- Additional test cases
- Performance optimizations
- Enhanced error handling
- Improved documentation

## New Files
- Components: [new component files]
- Types: [type definition files]
- Utils: [utility function files]
- Tests: [test files]

## Risk Assessment
### Safe to Split Out
- Standalone UI components
- Type definitions
- Utility functions
- Constants and configs
- Test files

### Handle with Care
- Shared state logic
- Event handler chains
- Complex data transformations
- API integration points

## References
- Original feature documentation
- Related Boot Hill rules
- Component dependencies

## Refactoring Handoff
When completing this phase, provide a summary in this format:

```markdown
REFACTORING COMPLETE
Target File: [original file path]
Issue: #[number]

CHANGES MADE
Files Modified:
- [file]: [changes]
- [file]: [changes]

Files Created:
- [file]: [purpose]
- [file]: [purpose]

Files Removed:
- [file]: [reason]

TEST STATUS
- Unit Tests: [status]
- Integration: [status]
- Coverage: [percentage]

CODE METRICS
- Original Size: [lines]
- New Size: [total lines across all new files]
- Largest File: [file name - lines]
- Type Safety: [improved/same]

VERIFICATION
- [ ] No breaking changes
- [ ] All tests passing
- [ ] Behavior preserved
- [ ] Code standards maintained
- [ ] Documentation updated

NEXT STEPS
- [suggested follow-up tasks]
- [areas for future improvement]
```