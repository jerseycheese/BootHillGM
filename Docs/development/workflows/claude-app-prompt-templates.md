---
title: Claude App Prompt Templates
aliases: [App Prompts, Claude Prompt Library]
tags: [development, workflow, claude, prompt, templates]
created: 2025-03-16
updated: 2025-03-16
---

# Claude App Prompt Templates

> [!note]
> Optimized prompt templates for using Claude through the app interface with MCP tools.

## Analysis & Planning Phase

```markdown
# Project Analysis Request

## Context
I'm working on the BootHillGM project, a Next.js/React application for a western-themed RPG game.

## Request
Help me select and analyze the next task to implement.

## Information Access
Please use MCP tools to:
1. Review open issues at https://github.com/jerseycheese/BootHillGM/issues
2. Review the roadmap at `/Users/jackhaas/Projects/BootHillGM/Docs/planning/roadmap.md`
3. Check project documentation in `/Users/jackhaas/Projects/BootHillGM/Docs`
4. Check project structure at `/Users/jackhaas/Projects/BootHillGM/BootHillGMApp`

## Analysis Goals
Based on this information, please:
1. Identify the highest priority tasks
2. Assess implementation complexity and dependencies
3. Evaluate value to effort ratios
4. Check alignment with roadmap goals
5. Create a technical specification for implementation
6. Provide a clear, step-by-step plan

## Output Format
Please present your analysis as a markdown artifact with this structure:

TASK ANALYSIS
GitHub Issue: #[number] [title]
Labels: [labels]
Description: [1-2 sentences]
Priority: [High/Medium/Low] ([reasoning])
Current State: [1-2 sentences]

TECHNICAL DESIGN
Data Flow:
- [flow point 1]
- [flow point 2]

Core Changes:
1. [Change Area 1]
   - Location: [file]
   - Details: [specifics]
   
2. [Change Area 2]
   - Location: [file]
   - Details: [specifics]

INTERFACES
[Interface definitions]

IMPLEMENTATION STEPS
1. [ ] [First step]
2. [ ] [Second step]

Files to Modify:
- [path]: [changes]
Files to Create:
- [path]: [purpose]

TEST PLAN
1. Unit Tests:
   - [test scenario]
2. Integration Tests:
   - [test scenario]

SUCCESS CRITERIA
- [ ] [criterion]
- [ ] [criterion]

TECHNICAL NOTES
- [technical detail]
- [technical detail]

FUTURE TASKS
- [ ] [future task]
- [ ] [future task]
```

## Implementation Phase

```markdown
# Implementation Request

## Context
I'm implementing this technical specification:

[PASTE SPEC ARTIFACT HERE]

## Request
Help me implement this spec using a test-driven approach.

## Information Access
Please use MCP tools to:
1. Review related files at [specific paths]
2. Check our existing patterns for similar components

## Implementation Approach
1. Test-driven development
2. Incremental implementation
3. Clean code principles
4. Error handling
5. Edge cases

## Output Format
Please provide implementation in this format:

IMPLEMENTATION PROGRESS
Component: [name]
Current Step: [step number/name]

CURRENT IMPLEMENTATION
File: [current file]
Status: [In Progress/Complete]

CODE CHANGES
```[language]
[Actual code changes]
```

VERIFICATION
- [ ] Unit tests
- [ ] Integration tests
- [ ] Code standards
- [ ] Error handling

Please create separate artifacts for:
1. Types (if substantial)
2. Tests
3. Component implementation
4. Any utility functions

For each implementation step, follow our coding standards:
- React functional components with hooks
- Proper TypeScript typing
- JSDoc comments for functions
- Error handling for edge cases
```

## Implementation Summary

```markdown
# Implementation Summary Request

## Context
I've completed the implementation for this feature. 

## Request
Help me create a summary of the implementation to track what's been done.

## Information
The implementation involved these files:
[LIST FILES]

## Output Format
Please provide a summary in this format:

IMPLEMENTATION COMPLETE
Component: [name]
Issue: #[number]

CHANGES MADE
Files Modified:
- [file]: [changes]
- [file]: [changes]

Files Created:
- [file]: [purpose]
- [file]: [purpose]

TEST STATUS
- Unit Tests: [status]
- Integration: [status]
- Coverage: [percentage]

MANUAL TESTING STEPS
- [manual testing step]
- [manual testing step]

CLEANUP NOTES (console logs to remove, comments to add, etc...)
- [cleanup task]
- [cleanup task]
```

## Test Fixes Phase

```markdown
# Test Fixes Request

## Context
I'm working on fixing tests for this implementation:

[PASTE COMPONENT CODE OR DESCRIBE FEATURE]

## Current Test Issues
[DESCRIBE FAILING TESTS OR WHAT NEEDS TO BE FIXED]

## Request
Help me fix these test issues and improve test coverage.

## Information Access
Please use MCP tools to:
1. Read the failing test file at [path]
2. Examine the component implementation at [path]
3. Review similar test patterns if needed

## Test Requirements
1. Use Jest and React Testing Library
2. Follow our existing test patterns
3. Test all key functionality
4. Handle edge cases
5. Maintain good test isolation

## Output Format
Please provide:
1. Analysis of why tests are failing
2. Updated test code as an artifact
3. Any needed component modifications
```

## Build Issues Phase

```markdown
# Build Issues Request

## Context
I'm facing build issues with this implementation:

[PASTE ERROR MESSAGES OR DESCRIBE ISSUES]

## Request
Help me diagnose and fix these build problems.

## Information Access
Please use MCP tools to:
1. Check the component code at [path]
2. Review related files that might be causing conflicts
3. Examine our build configuration if needed

## Output Format
Please provide:
1. Analysis of the build issues
2. Specific solutions as code artifacts
3. Any configuration changes needed
4. Verification steps
```

## Cleanup & Documentation Phase

```markdown
# Cleanup & Documentation Request

## Context
I've implemented this feature:

[PASTE IMPLEMENTATION SUMMARY]

## Request
Help me review, clean up, and document this implementation.

## Information Access
Please use MCP to:
1. Review the implemented files
2. Check for cleanup opportunities
3. Review existing documentation structure in `/Users/jackhaas/Projects/BootHillGM/Docs`

## Output Format
Please provide a response in this format:

CLEANUP & DOCS
GitHub Issue: #[number] [title]

CODE REVIEW
Quality:
- [ ] Code standards & style
- [ ] Error handling
- [ ] Performance
- [ ] Security
- [ ] Debug cleanup (logs, test outputs, flags)

Documentation:
- [ ] Code comments
- [ ] README updates
- [ ] API documentation
- [ ] Architecture changes
- [ ] System documentation

TEST COVERAGE
- Unit Tests: [percentage]
- Integration Tests: [percentage]
- Edge Cases: [list]
- Missing Coverage: [areas]

GITHUB UPDATES
Issues to Close:
- [ ] #[number]: [completion notes]

Issues to Create:
- [ ] Title: [new issue title]
  Labels: [labels]
  Description: [details]

Commit Message:
```
[type](scope): Brief description

- Change detail 1
- Change detail 2

Issue: #[number]
```
```

## Cleanup & Documentation Summary

```markdown
# Cleanup Summary Request

## Context 
I've completed cleanup and documentation for this feature.

## Request
Help me create a summary of the cleanup and documentation work.

## Output Format
Please provide a summary in this format:

CLEANUP & DOCS COMPLETE
Issue: #[number]

QUALITY CHECK
- Code Standards: [Pass/Needs Work]
- Test Coverage: [percentage]
- Documentation: [Complete/Needs Work]

DOCS UPDATED
- [file]: [changes]
- [file]: [changes]

ISSUES
Closed:
- #[number]: [summary]
Created:
- #[number]: [summary]

FINAL COMMIT
[commit message]
```

## GitHub Issue Management

```markdown
# GitHub Issue Management Request

## Context
I've completed this feature:

[PASTE IMPLEMENTATION SUMMARY]

## Request
Help me prepare GitHub issue updates. I only want to create issues if they don't already exist in my issue queue. See /Users/jackhaas/Projects/BootHillGM/Docs/development/issue_templates for formatting.

## Information Access
Please use MCP to review:
1. The original issue description if available
2. Related documentation
3. Implementation details

## Output Format
Please create artifacts for:
1. Issue closure comment with:
   - Summary of changes
   - Testing status
   - Documentation references
2. Any follow-up issues needed:
   - Clear title
   - Detailed description
   - Suggested labels
   - Priority assessment
```

## Component Refactoring

```markdown
# Component Refactoring Request

## Context
I need to refactor this component:

[PASTE COMPONENT CODE OR PATH]

## Target File
Path: [file path]
Target Size: < 300 lines

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

## Information Access
Please use MCP to:
1. Analyze the current component
2. Review our coding standards
3. Check similar components for patterns

## Requirements
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

## Output Format
Please provide:
1. Analysis of current issues
2. Refactored component as an artifact
3. Any necessary test updates
4. Before/after comparison highlighting improvements
```

## Refactoring Summary

```markdown
# Refactoring Summary Request

## Context
I've completed the refactoring.

## Request
Help me create a summary of the refactoring work.

## Output Format
Please provide a summary in this format:

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

## Bug Fix Request

```markdown
# Bug Fix Request

## Context
I'm experiencing this bug:

[DESCRIBE BUG WITH STEPS TO REPRODUCE]

## Request
Help me diagnose and fix this issue.

## Information Access
Please use MCP to:
1. Examine related components at [paths]
2. Check test coverage
3. Review error handling

## Output Format
Please provide:
1. Root cause analysis
2. Fix implementation as an artifact
3. Test updates to prevent regression
4. Verification steps
```

## Continuation Templates

### Analysis to Implementation
```markdown
# Continuing Implementation

## Context
We were working on analyzing task #[number] but had to create a new chat due to length limits.

## Previous Progress
[PASTE SUMMARY ARTIFACT]

## Request
Let's continue with implementation phase based on this analysis.

## Next Steps
The next tasks are:
1. [specific next step]
2. [following steps]

Please use MCP tools to re-examine the relevant files, and let's continue implementation.
```

### Implementation to Test Fixes
```markdown
# Continuing Test Fixes

## Context
We were implementing task #[number] but had to create a new chat due to length limits.

## Previous Progress
[PASTE SUMMARY ARTIFACT]

## Request
Let's continue with test fixes and validation.

## Current Status
Components implemented:
- [component 1]
- [component 2]

Current test issues:
- [issue 1]
- [issue 2]

Please use MCP tools to re-examine the test files and component code.
```

### Test Fixes to Cleanup
```markdown
# Continuing with Cleanup

## Context
We were fixing tests for task #[number] but had to create a new chat due to length limits.

## Previous Progress
[PASTE SUMMARY ARTIFACT]

## Request
All tests are now passing, let's continue with cleanup and documentation.

## Current Status
Implementation complete with all tests passing.

Cleanup needed:
- [cleanup task 1]
- [cleanup task 2]

Documentation needed:
- [doc task 1]
- [doc task 2]

Please use MCP tools to examine the code and existing documentation.
```

## Related Documents
- [[claude-app-workflow|Claude App Workflow]]
- [[claude-app-workflow-handoffs|Handoff Templates]]
- [[claude-app-mcp-optimization|MCP Optimization Guide]]
