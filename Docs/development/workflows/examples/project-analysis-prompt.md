---
title: Project Analysis Prompt
aliases: [Analysis Phase]
tags: [analysis, planning, workflow, prompt]
created: 2025-01-13
updated: 2025-01-13
---

# Project Analysis Prompt

## Quick Use Prompt
```markdown
Help me select and analyze the next task to implement from my GitHub issues.

Please review these planning documents first for context:
- /Users/jackhaas/Projects/BootHillGM/Docs/index.md
- /Users/jackhaas/Projects/BootHillGM/Docs/planning/roadmap.md
- /Users/jackhaas/Projects/BootHillGM/Docs/architecture/technical-specification.md
- /Users/jackhaas/Projects/BootHillGM/Docs/core-systems/_index.md

Then review the codebase and issue list as needed:
Repository: https://github.com/jerseycheese/BootHillGM/

Then consider these selection criteria:
1. Priority status (using high-priority label)
2. Blocking status - does it block other critical features?
3. Dependencies - are its dependencies complete?
4. Technical complexity
5. Value/effort ratio

Please:
1. Review planning documents to understand the current state and requirements
2. Review all issues labeled as "high-priority"
3. Select the most critical task 
4. Break down the selected task into small, achievable steps
5. Identify the next concrete implementation task
6. Provide detailed implementation analysis using the standard task analysis format
```

## Purpose
Determine the most important task to implement next, considering project priorities, dependencies, and constraints.

## Input Requirements
1. Project documentation
2. Current issue list
3. Development status
4. System architecture docs

## Analysis Process

### 1. Documentation Review
- Read and understand project overview
- Review architecture decisions
- Check current feature status
- Understand system constraints

### 2. Issue Analysis
- Review high-priority issues
- Identify blocking issues
- Map issue dependencies
- Consider technical complexity

### 3. Selection Criteria
- Priority status (using labels)
- Blocking status - does it block other features?
- Dependencies - are its dependencies complete?
- Technical complexity
- Value/effort ratio

## Output Format

```markdown
TASK ANALYSIS
GitHub Issue: #[number] [title]
Labels: [high-priority, bug, feature, etc]
Description: [1-2 sentences]
Priority: [High/Medium/Low] ([reasoning])
Current State: [1-2 sentences]

IMPLEMENTATION STEPS
1. [ ] [First step to implement]
2. [ ] [Second step to implement]
3. [ ] [Third step to implement]
...

NEXT IMPLEMENTATION TASK
Description: [Clear description of the next specific task to implement]
Files to Modify:
- [path]: [specific, focused changes]
Files to Create:
- [path]: [clear, specific purpose]

SUCCESS CRITERIA
- [ ] [specific, testable criterion for this task]
- [ ] [specific, testable criterion for this task]
- [ ] [specific, testable criterion for this task]

TECHNICAL NOTES
- [specific technical detail relevant to this task]
- [specific technical detail relevant to this task]

FUTURE TASKS
- [ ] [Next task after this one]
- [ ] [Following task]
```

## Guidelines

### Focus on Clarity
- Use specific, actionable language
- Provide clear reasoning for selections
- Define concrete next steps

### Consider Dependencies
- Map task dependencies
- Identify blocking issues
- Note required precursors

### Scope Appropriately
- Choose manageable task size
- Consider development capacity
- Account for technical complexity

### Document Decisions
- Explain selection criteria
- Note considered alternatives
- Document assumptions

## Transition to Implementation Planning
1. Verify selection criteria were fully considered
2. Confirm task priority and scope are clear
3. Ensure all required context is documented
4. Hand off to implementation planning phase

## Example Analysis

```markdown
TASK ANALYSIS
GitHub Issue: #45 Add User Authentication
Labels: high-priority, feature, security
Description: Implement user authentication system using OAuth 2.0
Priority: High (Required for user data security and feature access control)
Current State: No authentication implemented, using mock user data

IMPLEMENTATION STEPS
1. [ ] Define authentication interfaces
2. [ ] Set up OAuth provider integration
3. [ ] Implement auth service
4. [ ] Add UI components
5. [ ] Update protected routes

NEXT IMPLEMENTATION TASK
Description: Create authentication service interfaces and types
Files to Modify:
- /src/types/auth.ts: Add auth-related type definitions
- /src/services/auth.ts: Create auth service skeleton
Files to Create:
- /src/services/__tests__/auth.test.ts: Auth service tests

SUCCESS CRITERIA
- [ ] Auth interfaces clearly define all required types
- [ ] Auth service implements required methods
- [ ] Test suite covers core functionality
- [ ] TypeScript compilation passes

TECHNICAL NOTES
- Use TypeScript strict mode for type safety
- Follow existing service patterns
- Consider token storage security

FUTURE TASKS
- [ ] Implement OAuth provider integration
- [ ] Add authentication UI components
- [ ] Update protected routes
```