---
title: Claude App Development Workflow
aliases: [Claude App Process, App-Based Development]
tags: [development, workflow, claude, process, claude-app]
created: 2025-03-16
updated: 2025-03-21
---

# Claude App Development Workflow

> [!note] 
> Optimized development workflow using Claude's app interface with MCP tools, designed for test-driven development with a KISS (Keep It Simple, Stupid) mindset and strict scope control.

## Development Flow
```mermaid
graph TD
    A[Task Analysis - New Chat] -->|MCP: Repo & Docs Analysis| B[Produce Technical Spec]
    B -->|Define Scope Boundaries| C[Define Tests]
    C -->|Write Tests First| D[Implementation Phase]
    D -->|Same Chat: Write Code| E[Build Issues]
    E -->|Fix & Retry| F{Build OK?}
    F -->|No| E
    F -->|Yes| G[Jest Tests]
    G -->|Fix & Retry| H{Tests Pass?}
    H -->|No| G
    H -->|Yes| I[Manual Testing]
    I -->|Issues Found| D
    I -->|All Good| J[Cleanup & Documentation]
    J -->|Run Tests Again| K{Tests Still Pass?}
    K -->|No| G
    K -->|Yes| L[GitHub Issue Management]
    L -->|Local: No MCP| M[Commit & Push]
    M -->|New Chat| A
```

## Workflow Phases

### 1. Task Analysis (New Chat)
**Purpose:** Select and plan next most valuable task
**Output:** Technical specification as artifact with clear scope boundaries

Start each task with a fresh chat:
```
I need to analyze a task for my BootHillGM project. Please use MCP to:
1. Check the GitHub repo at https://github.com/jerseycheese/BootHillGM
2. Review docs at /Users/jackhaas/Projects/BootHillGM/Docs
3. Help me [select a task from issues OR analyze this specific task: X]

Focus on keeping the solution simple and straightforward (KISS principle).

Important: Define strict scope boundaries in your analysis. I need to know:
1. Exactly what functionality is included in this task
2. What is explicitly OUT of scope
3. What existing patterns must be maintained
4. What technical approaches are off limits
```

**Key MCP Tools:**
- `list_directory` to explore repo structure
- `read_file` for roadmaps and issues
- `search_files` to find related code

**Expected Output:**
- Technical specification as an artifact
- Implementation steps prioritizing simplicity
- Files that need to be modified
- **Explicit scope boundaries and constraints**

### 2. Define Tests First (Same Chat)
**Purpose:** Apply TDD principles by defining expected behavior
**Output:** Test specifications as artifacts

Before writing implementation code:
```
Now that we have the technical spec with scope boundaries, let's define the Jest tests first. 
These tests should specify:
1. The expected behavior of the component ONLY within the defined scope
2. Edge cases specifically mentioned in the spec
3. Only test what's necessary (KISS principle)
4. Do NOT add tests for features outside the scope boundary

Keep tests focused only on the functionality defined in the spec.
```

**Key MCP Tools:**
- `read_file` to examine existing test files
- `search_files` to find similar test patterns

**Test Format:**
- Provide test code as artifacts
- Focus on the minimum tests needed to verify functionality
- Include data-testid attributes needed for testing
- Ensure tests only cover functionality within scope

### 3. Implementation Phase (Same Chat)
**Purpose:** Write minimal code to make tests pass
**Output:** Code artifacts that implement ONLY specified functionality

After defining tests, proceed to implementation:
```
With our tests defined, let's implement the component with the simplest 
code that will make these tests pass. Keep the implementation:
1. Minimal and focused
2. Easy to understand
3. Aligned with project patterns
4. Strictly within the scope boundaries

Do NOT add:
1. Extra features/enhancements not specified in the scope
2. "Nice-to-have" improvements
3. Performance optimizations unless explicitly required
4. New patterns or approaches not already used in the project
```

**Key MCP Tools:**
- `read_file` to examine existing similar components
- `read_multiple_files` to understand patterns

**Code Format:**
- Provide implementation code as artifacts
- Focus on making tests pass with minimal complexity
- Include only what's needed, avoid premature optimization
- Stay strictly within defined scope boundaries

### 4. Build Issues (Same Chat if Possible)
**Purpose:** Resolve any build errors
**Output:** Fixed code that builds successfully

After implementation:
```
Let's check for potential build issues:
1. TypeScript errors
2. Import/export problems
3. Missing dependencies

Please help me resolve these with minimal changes that maintain the scope boundaries.
Do NOT introduce new patterns or dependencies when fixing build issues.
```

**Iterative Process:**
- Fix build errors first before proceeding
- Return to implementation if substantial changes needed
- Only move forward when build succeeds
- Ensure fixes respect scope boundaries

### 5. Jest Tests (Same Chat if Possible)
**Purpose:** Ensure tests pass
**Output:** Working code verified by tests

After build issues are fixed:
```
Now let's run and fix the Jest tests. We need to:
1. Address any failing tests
2. Make minimal changes to make tests pass
3. Avoid introducing unnecessary complexity
4. Ensure we stay within our defined scope boundaries

Remember not to add functionality or tests for features outside our scope.
```

**Iterative Process:**
- Fix failing tests one by one
- Return to implementation if substantial changes needed
- Only move forward when all tests pass
- Maintain scope boundaries when fixing tests

### 6. Manual Testing (Same Chat if Possible)
**Purpose:** Verify user experience
**Output:** Final adjustments for real-world usage

After tests pass:
```
Now that all tests pass, let's manually test the implementation:
1. What behavior should I verify within our scope boundaries?
2. Are there any UI concerns tests might miss?
3. How should I test edge cases?

Focus ONLY on testing functionality within our defined scope.
Do NOT test or suggest enhancements outside the scope.
```

**Feedback Loop:**
- Document issues found during manual testing
- Return to implementation if issues require code changes
- Run both build and tests again after changes
- Keep all fixes within scope boundaries

### 7. Cleanup & Documentation (Same Chat if Possible)
**Purpose:** Clean up code and update documentation
**Output:** Clean codebase, updated documentation

After all testing is successful:
```
Now that implementation is complete and verified, let's:
1. Clean up the code (remove console.logs, TODOs)
2. Update documentation ONLY for the implemented functionality
3. Ensure inline comments explain complex logic
4. Verify tests still pass after cleanup

Do NOT add documentation for features outside our scope boundary.
Do NOT suggest future enhancements in the documentation.
```

**Key MCP Tools:**
- `read_file` on existing docs to maintain consistency
- `search_files` to find places needing docs updates

**Important:** Always run tests again after cleanup to ensure nothing broke. Maintain strict scope boundaries in documentation.

### 8. GitHub Issue Management
**Purpose:** Track work and maintain project backlog
**Output:** Updated GitHub issues

```
Let's finalize this feature by:
1. Creating a summary for the GitHub issue that focuses ONLY on what was implemented
2. Drafting any follow-up issues needed for features intentionally left out of scope
3. Preparing closing notes for the current issue

Please ensure all summaries reflect what was actually implemented, not what could be enhanced.
```

## KISS Principles for AI-Assisted Development

### Code Simplicity Guidelines
1. **Minimize Props**: Only include props that are actually needed
2. **Avoid Premature Abstraction**: Start concrete, abstract only when patterns emerge
3. **Prefer Pure Components**: Minimize side effects and state management
4. **Single Responsibility**: Each component should do one thing well
5. **Readable Over Clever**: Choose clarity over brevity or performance tricks

### Prompt Patterns for Scope Control
When asking Claude for implementation:
```
Please implement this component with the simplest approach possible:
- Implement ONLY the functionality specified in the requirements
- Do NOT add "nice-to-have" features or enhancements
- Do NOT introduce new patterns not already used in the project
- Do NOT suggest improvements outside the scope of this task
- Keep the implementation focused on exactly what was requested
```

## Recognizing Scope Creep

**Common Signs of Scope Creep:**
- "I've also added X feature which might be useful"
- "I took the liberty of enhancing Y functionality"
- "I've refactored this to be more efficient"
- "I added test coverage for potential edge cases"
- "I've implemented a more robust solution that handles future needs"

**How to Respond to Scope Creep:**
- Thank Claude but clarify you want only what was specified
- Use "scope boundaries" terminology in follow-up requests
- Specifically request removal of out-of-scope additions
- Reinforce the importance of minimal, focused implementation
- Reference your original scope definition

## Artifact Usage

### Key Artifacts
- **Technical specification**: Including explicit scope boundaries
- **Test specifications**: Limited to in-scope functionality
- **Component code**: Implementing only what's in scope
- **Build error fixes**: Minimal changes to resolve specific issues
- **Test fixes**: Targeted to make existing tests pass
- **Documentation**: Limited to implemented functionality

### Best Practices
- Use separate artifacts for tests and implementation
- Update artifacts incrementally instead of recreating
- Start simple, add complexity only when needed
- Run tests after every significant change
- Explicitly mark scope boundaries in all artifacts

## Document Templates

### Technical Specification Artifact
```markdown
# Technical Specification for [Feature]

## Scope Definition
What IS included:
- [Specific functionality 1]
- [Specific functionality 2]

What is NOT included:
- [Out of scope functionality 1]
- [Out of scope functionality 2]

Technical constraints:
- Must use [specific approach]
- Must not introduce [specific pattern/library]

## Component Design
[Component definition]

## Test Plan
[Test plan limited to in-scope functionality]
```

### Test Specification Artifact
```markdown
# Tests for [Component]

## Scope Boundaries
These tests ONLY cover:
- [Specific functionality 1]
- [Specific functionality 2]

These tests do NOT cover:
- [Out of scope functionality 1]
- [Out of scope functionality 2]

## Unit Tests
\`\`\`jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import [Component] from './[Component]';

describe('[Component]', () => {
  test('renders correctly with default props', () => {
    // Test minimum viable rendering
  });
  
  test('handles user interaction', async () => {
    // Test basic interactivity
  });
  
  test('edge case: [description]', () => {
    // Test important edge cases
  });
});
\`\`\`

## Test Checklist
- [ ] Basic rendering
- [ ] User interactions
- [ ] Prop variations
- [ ] Specified edge cases
- [ ] Error handling for defined cases
```

### Implementation Artifact
```markdown
# Implementation for [Component]

## Scope Boundaries
This implementation includes ONLY:
- [Specific functionality 1]
- [Specific functionality 2]

This implementation does NOT include:
- [Out of scope functionality 1]
- [Out of scope functionality 2]

## Component Implementation
\`\`\`jsx
import React from 'react';
// Minimal imports

// Simple implementation that passes tests
const [Component] = ({ prop1, prop2 }) => {
  // Minimal state and effects
  
  return (
    <div data-testid="component">
      {/* Simple JSX structure */}
    </div>
  );
};

export default [Component];
\`\`\`

## Implementation Notes
- Follows KISS principle by [explanation]
- Handles edge cases by [explanation]
- Stays within scope boundaries by [explanation]
```

## Related Documents
- [[tdd-with-kiss|Test-Driven Development with KISS]]
- [[kiss-principles-react|KISS Principles for React]]
- [[claude-app-mcp-optimization|MCP Optimization Guide]]
- [[claude-app-prompt-templates|Prompt Templates]]