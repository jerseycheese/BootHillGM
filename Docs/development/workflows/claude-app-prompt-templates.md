---
title: Claude App Prompt Templates
aliases: [App Prompts, Claude Prompt Library]
tags: [development, workflow, claude, prompt, templates]
created: 2025-03-16
updated: 2025-03-21
---

# Claude App Prompt Templates

> [!note]
> Optimized prompt templates for using Claude through the app interface with MCP tools, designed to strictly control scope.

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

## Scope Constraints
- Focus only on the current issue without adding enhancements
- Do not propose architectural changes unless explicitly requested
- Maintain existing patterns and approaches
- Don't suggest additional libraries or dependencies

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

OUT OF SCOPE
- [feature/enhancement to exclude]
- [pattern/approach to avoid]

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

## Scope Constraints
- Implement ONLY what's specified in the technical spec
- Do not add extra features, optimizations, or "nice-to-haves"
- Follow existing patterns exactly, even if you see potential improvements
- Use only the libraries and dependencies already in use
- Do not introduce additional state management approaches

## Implementation Approach
1. Test-driven development
2. Incremental implementation
3. Clean code principles
4. Error handling for specified cases only
5. Stay within the defined scope boundaries

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
- [ ] Unit tests for specified functionality only
- [ ] Integration tests as defined in spec
- [ ] Code standards
- [ ] Error handling for defined cases

Please create separate artifacts for:
1. Types (if substantial)
2. Tests (covering only specified cases)
3. Component implementation (limited to spec)
4. Any utility functions needed for implementation

For each implementation step, follow our coding standards:
- React functional components with hooks
- Proper TypeScript typing
- JSDoc comments for functions
- Error handling for specified edge cases only
```

## Component-Specific Implementation

```markdown
# Component Implementation Request

## Context
I need to implement this specific component:

## Component Definition
Name: [component name]
Purpose: [specific purpose]
Location: [file path]

## Required Functionality
This component must:
1. [functionality 1]
2. [functionality 2]
3. [functionality 3]

## Technical Requirements
- Props: [list specific props and types]
- State: [list specific state variables]
- Events: [list specific events to handle]

## Scope Boundaries
This component should NOT:
- [excluded functionality 1]
- [excluded functionality 2]
- [pattern to avoid]

## Existing Patterns
Please follow these specific patterns:
- State management: [specific approach]
- Event handling: [specific approach]
- Styling: [specific approach]

## Dependencies
Only use these imports:
- [specific import 1]
- [specific import 2]

## Output Format
Please provide a focused implementation with no additional features beyond what I've specified.
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

## Scope Focus
Please focus only on what was actually implemented, not on potential enhancements or improvements.

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

SCOPE BOUNDARIES MAINTAINED
- [confirm specific constraints were respected]
- [confirm no extra features were added]
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
Help me fix these test issues, focusing only on the existing functionality.

## Scope Boundaries
- Fix only the failing tests for existing functionality
- Do not add tests for features not yet implemented
- Do not suggest component changes that would extend functionality
- Focus on making current tests pass, not on test coverage gaps

## Information Access
Please use MCP tools to:
1. Read the failing test file at [path]
2. Examine the component implementation at [path]
3. Review similar test patterns if needed

## Test Requirements
1. Use Jest and React Testing Library
2. Follow our existing test patterns
3. Test only implemented functionality
4. Fix only the failing tests
5. Maintain good test isolation

## Output Format
Please provide:
1. Analysis of why tests are failing
2. Updated test code as an artifact
3. Only necessary component modifications to make tests pass
```

## Build Issues Phase

```markdown
# Build Issues Request

## Context
I'm facing build issues with this implementation:

[PASTE ERROR MESSAGES OR DESCRIBE ISSUES]

## Request
Help me diagnose and fix these build problems without changing the approach.

## Scope Boundaries
- Fix only the specific build errors
- Maintain the current implementation approach
- Do not introduce new patterns or restructuring
- Do not add dependencies or alter the build configuration
- Keep changes minimal and focused on the errors

## Information Access
Please use MCP tools to:
1. Check the component code at [path]
2. Review related files that might be causing conflicts
3. Examine our build configuration if needed

## Output Format
Please provide:
1. Analysis of the build issues
2. Specific, minimal solutions as code artifacts
3. Only necessary configuration changes
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

## Scope Boundaries
- Focus only on the implemented code
- Do not suggest refactoring or restructuring
- Do not propose new features or enhancements
- Keep documentation aligned with actual implementation
- Do not modify existing documentation patterns

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

## Component Refactoring

```markdown
# Component Refactoring Request

## Context
I need to refactor this component:

[PASTE COMPONENT CODE OR PATH]

## Target File
Path: [file path]
Target Size: < 300 lines

## Scope Boundaries
- Maintain exact functionality
- Do not add features or enhancements
- Keep the same state management approach
- Do not introduce new patterns
- Focus only on reorganizing code, not improving it

## Size Reduction Strategy
Priority approaches:
1. [ ] Extract standalone components
2. [ ] Split by feature/responsibility
3. [ ] Move types to separate files
4. [ ] Relocate utility functions

## Refactoring Goals
Priority order:
1. [ ] Component extraction
2. [ ] Type safety maintenance
3. [ ] File organization
4. [ ] Test coverage preservation

## Information Access
Please use MCP to:
1. Analyze the current component
2. Review our coding standards
3. Check similar components for patterns

## Requirements
### Must Have
- No behavioral changes
- Maintain existing functionality
- Each new file under 300 lines
- Clear component boundaries
- Type safety
- Existing test coverage

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
4. Before/after comparison highlighting organization improvements
```

## Bug Fix Request

```markdown
# Bug Fix Request

## Context
I'm experiencing this bug:

[DESCRIBE BUG WITH STEPS TO REPRODUCE]

## Request
Help me diagnose and fix this specific issue only.

## Scope Boundaries
- Fix only the described bug
- Do not add features or enhancements
- Do not refactor surrounding code
- Do not modify unrelated functionality
- Focus only on the minimum changes needed

## Information Access
Please use MCP to:
1. Examine related components at [paths]
2. Check test coverage
3. Review error handling

## Output Format
Please provide:
1. Root cause analysis
2. Minimal fix implementation as an artifact
3. Test updates to prevent regression
4. Verification steps specific to this bug
```

## Feature-Specific Implementation

```markdown
# Feature-Specific Implementation Request

## Context
I need to implement this specific feature:

[DESCRIBE FEATURE]

## Specific Requirements
1. [requirement 1]
2. [requirement 2]
3. [requirement 3]

## Technical Boundaries
- Files to modify: [specific files only]
- State management approach: [specific approach]
- UI patterns to follow: [specific patterns]
- Dependencies allowed: [specific dependencies]

## Explicitly Out of Scope
- [functionality to exclude]
- [enhancement to avoid]
- [pattern not to introduce]
- [optimization not to implement]

## Implementation Constraints
- Must match existing code style exactly
- Must use only specified dependencies
- Must only modify listed files
- Must implement exactly what's specified, no more

## Information Access
Please use MCP to:
1. Examine the files to be modified
2. Review similar implementations
3. Check existing patterns

## Output Format
Please provide:
1. Implementation code that strictly adheres to requirements
2. Test code for specified functionality only
3. Verification that implementation meets all constraints
```

## Related Documents
- [[claude-app-workflow|Claude App Workflow]]
- [[claude-app-workflow-handoffs|Handoff Templates]]
- [[claude-app-mcp-optimization|MCP Optimization Guide]]