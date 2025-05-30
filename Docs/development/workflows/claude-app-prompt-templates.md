---
title: Claude App Prompt Templates (Updated)
aliases: [App Prompts, Claude Prompt Library, Updated Prompt Templates]
tags: [development, workflow, claude, prompt, templates]
created: 2025-03-16
updated: 2025-04-02
---

# Claude App Prompt Templates (Updated)

> [!note]
> Optimized prompt templates for using Claude through the app interface with MCP tools, designed to strictly control scope. These templates are designed for easy single-click copying from Obsidian.

## Table of Contents
- [How to Use These Templates](#how-to-use-these-templates)
- [Analysis & Planning Phase](#analysis--planning-phase)
- [Define Tests Phase](#define-tests-phase)
- [Implementation Phase](#implementation-phase)
- [Build Phase](#build-phase)
- [Test Fixes Phase](#test-fixes-phase)
- [Manual Testing](#manual-testing)
- [Cleanup & Documentation Phase](#cleanup--documentation-phase)
- [Component Refactoring](#component-refactoring)
- [Bug Fix Request](#bug-fix-request)
- [Feature-Specific Implementation](#feature-specific-implementation)
- [IDE-Based Build & Test Request](#ide-based-build--test-request-clineroo)
- [GitHub Issue Management](#github-issue-management)
- [Related Documents](#related-documents)

## How to Use These Templates

Each template is contained in a single code block that you can copy with a single click in Obsidian. Simply:
1. Click anywhere inside the code block
2. Use the copy button that appears in the top right corner
3. Paste directly into Claude.ai or your IDE's Cline/Roo extension

## Analysis & Planning Phase

```
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

## Define Tests Phase

```
# Test Definition Request

## Context
I'm implementing this technical spec:

[PASTE SPEC ARTIFACT HERE]

## Request
Help me define the tests for this feature before implementation.

## Information Access
Please use MCP tools to:
1. Review existing test patterns at `/Users/jackhaas/Projects/BootHillGM/BootHillGMApp/app/tests`
2. Check component test examples at `/Users/jackhaas/Projects/BootHillGM/Docs/technical-guides/component-testing.md`

## Test Requirements
1. Write tests before implementation (TDD approach)
2. Only test what's in scope (as defined in the spec)
3. Follow our naming conventions in `/Users/jackhaas/Projects/BootHillGM/Docs/technical-guides/coding-naming-conventions.md`
4. Use data-testid attributes for element selection
5. Keep tests focused and minimal

## Output Format
Please provide:
1. A test specification artifact with:
   - Test file structure
   - Test cases covering functionality
   - Clear data-testid names following our convention
2. An explanation of your testing approach
3. A verification list of what is covered and what is not

Please only test what's explicitly in the spec - don't test edge cases or features outside the defined scope.
```

## Implementation Phase

```
# Implementation Request

## Context
I'm implementing this technical specification:

[PASTE SPEC ARTIFACT HERE]

And I've defined these tests:

[PASTE TEST ARTIFACT HERE]

## Request
Help me implement this specification to make the tests pass.

## Information Access
Please use MCP tools to:
1. Review related files at [specific paths]
2. Check our existing patterns for similar components
3. Follow our naming conventions in `/Users/jackhaas/Projects/BootHillGM/Docs/technical-guides/coding-naming-conventions.md`

## Scope Constraints
- Implement ONLY what's specified in the technical spec
- Do not add extra features, optimizations, or "nice-to-haves"
- Follow existing patterns exactly, even if you see potential improvements
- Use only the libraries and dependencies already in use
- Do not introduce additional state management approaches

## Implementation Approach
1. Test-driven development (make the defined tests pass)
2. Incremental implementation
3. Clean code principles
4. Error handling for specified cases only
5. Stay within the defined scope boundaries
6. Use existing utils and helpers in /BootHillGM/BootHillGMApp/app/tests or /BootHillGM/BootHillGMApp/app/utils

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

## Build Phase

```
# Build Phase Request

## Context
I've implemented this component:

[PASTE COMPONENT CODE]

## Request
Help me resolve any potential build issues before moving to testing.

## Information Access
Please use MCP tools to:
1. Check related component implementations
2. Review our TypeScript configuration
3. Follow our naming conventions in `/Users/jackhaas/Projects/BootHillGM/Docs/technical-guides/coding-naming-conventions.md`

## Scope Constraints
- Fix only build-related issues
- Do not enhance functionality
- Do not refactor unrelated code
- Stay within the original implementation approach

## Output Format
Please provide a summary in this format:

Note: This phase can also be handled in your IDE using Cline/Roo with auto-approve enabled.
```

## Test Fixes Phase

```
# Test Fixes Request

## Context
My implementation is now building successfully, but I need to fix the tests:

[PASTE COMPONENT AND TEST CODE]

## Request
Help me fix any failing tests without changing the core functionality.

## Scope Boundaries
- Fix only the failing tests for existing functionality
- Do not add tests for features not yet implemented
- Do not suggest component changes that would extend functionality
- Focus on making current tests pass, not on test coverage gaps

## Information Access
Please use MCP tools to:
1. Review the failing test file
2. Examine the component implementation
3. Review similar test patterns if needed
4. Use existing utils and helpers in /BootHillGM/BootHillGMApp/app/tests
5. Follow our naming conventions in `/Users/jackhaas/Projects/BootHillGM/Docs/technical-guides/coding-naming-conventions.md`

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

Note: This phase can also be handled in your IDE using Cline/Roo with auto-approve enabled.
```

## Manual Testing

```
# Manual Testing Request

## Context
I've implemented this feature and all automated tests are now passing:

[PASTE COMPONENT SUMMARY]

## Request
Help me plan manual testing steps to verify this implementation works as expected in real usage.

## Scope Boundaries
- Only test functionality within the defined scope
- Focus on user experience and edge cases automated tests might miss
- Do not suggest testing features outside the implemented scope

## Output Format
Please provide a testing plan including:
1. User scenarios to test
2. Edge cases to verify
3. Visual/UX aspects to check
4. Integration points to validate
5. Potential issues to watch for

These steps will help ensure the implementation works correctly in the real application environment.
```

## Cleanup & Documentation Phase

```
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
4. Follow our naming conventions in `/Users/jackhaas/Projects/BootHillGM/Docs/technical-guides/coding-naming-conventions.md`

## Output Format
Please provide a response with these sections:

CLEANUP & DOCS
GitHub Issue: #[number] [title]

CODE REVIEW
Quality:
- [ ] Code standards & style
- [ ] Error handling
- [ ] Performance considerations
- [ ] Security concerns
- [ ] Debug cleanup (logs, test outputs, flags)

Documentation:
- [ ] Code comments
- [ ] README updates
- [ ] API documentation
- [ ] Architecture changes
- [ ] System documentation

TEST COVERAGE
- Unit Tests: [coverage]
- Integration Tests: [coverage]
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

```
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
4. Use existing utils and helpers in /BootHillGM/BootHillGMApp/app/tests or /BootHillGM/BootHillGMApp/app/test or /BootHillGM/BootHillGMApp/app/utils
5. Follow our naming conventions in `/Users/jackhaas/Projects/BootHillGM/Docs/technical-guides/coding-naming-conventions.md

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

```
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
4. Check project documentation in `/Users/jackhaas/Projects/BootHillGM/Docs`
5. Follow our naming conventions in `/Users/jackhaas/Projects/BootHillGM/Docs/technical-guides/coding-naming-conventions.md`
6. Use existing utils and helpers in /BootHillGM/BootHillGMApp/app/tests or /BootHillGM/BootHillGMApp/app/utils

## Output Format
Please provide:
1. Root cause analysis
2. Minimal fix implementation as an artifact
3. Test updates to prevent regression
4. Verification steps specific to this bug
```

## Feature-Specific Implementation

```
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
- Follow our naming conventions in `/Users/jackhaas/Projects/BootHillGM/Docs/technical-guides/coding-naming-conventions.md`

## Information Access
Please use MCP to:
1. Examine the files to be modified
2. Review similar implementations
3. Check existing patterns
4. Use existing utils and helpers in /BootHillGM/BootHillGMApp/app/tests or /BootHillGM/BootHillGMApp/app/test or /BootHillGM/BootHillGMApp/app/utils

## Output Format
Please provide:
1. Implementation code that strictly adheres to requirements
2. Test code for specified functionality only
3. Verification that implementation meets all constraints
```

## IDE-Based Build & Test Request (Cline/Roo)

```
# IDE-Based Build & Test Request

## Context
I'm implementing this feature via Cline/Roo in my IDE to conserve Claude.ai usage:

[PASTE IMPLEMENTATION SUMMARY]

## Request
Help me efficiently fix build issues and test failures via the IDE.

## Process
1. First fix any build errors until the code compiles
2. Then address test failures one by one
3. Loop through build and test phases until both are successful

## Scope Boundaries
- Fix only issues that prevent building or passing tests
- Do not add features or enhancements
- Do not refactor unrelated code
- Follow our naming conventions in `/Users/jackhaas/Projects/BootHillGM/Docs/technical-guides/coding-naming-conventions.md`

## IDE Efficiency Tips
- I'll use the auto-approve option to speed up iteration
- Focus on one issue at a time
- Provide clear, concise explanations for changes
- Let me know when we should switch from build fixes to test fixes

## Output Format
Please start with:
1. A quick analysis of the implementation
2. A plan to address build issues first
3. Specific changes to fix each issue
4. A clear indication when we're transitioning to test fixes
```

## GitHub Issue Management

```
# GitHub Issue Management Request

## Context
I've completed this feature:

[PASTE IMPLEMENTATION SUMMARY]

## Request
Help me prepare GitHub issue updates and draft a commit message.

## Scope Focus
- Focus only on what was actually implemented
- Do not suggest enhancements outside the original scope
- Keep issue comments focused on completed work

## Information Access
Please use MCP to:
1. Review the original issue at [issue URL]
2. Check related issues
3. Review project conventions for commits

## Output Format
Please provide:

GITHUB ISSUE UPDATE
Issue #[number]
Status Update:
```
Feature completed with the following changes:
- [change 1]
- [change 2]
- [change 3]

All tests are passing and the feature has been manually verified.
```

FOLLOW-UP ISSUES
Create these issues:
1. Title: [issue title]
   Description: [brief description]
   Labels: [labels]
   
2. Title: [issue title]
   Description: [brief description]
   Labels: [labels]

COMMIT MESSAGE
```
[type](scope): Brief description

- Change detail 1
- Change detail 2

Issue: #[number]
```
```

## Related Documents
- [[updated-claude-app-workflow|Updated Claude App Workflow]]
- [[coding-naming-conventions|Coding Naming Conventions]]
- [[claude-app-mcp-optimization|MCP Optimization Guide]]
