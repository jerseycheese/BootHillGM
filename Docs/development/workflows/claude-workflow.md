---
title: Claude Legacy API Development Workflow
aliases: [Claude API Process, Three-Phase Development, Legacy Claude Process]
tags: [development, workflow, claude, process, api, legacy]
created: 2025-01-13
updated: 2025-03-16
---

# Three-Phase Claude API Development Workflow (Legacy)

> [!warning] 
> This is a legacy workflow using Claude API via VS Code extensions like Cline/Roo Code. The recommended approach is now the [[claude-app-workflow|Claude App Workflow]] which uses MCP tools for better cost efficiency and capability.

## Development Flow
```mermaid
graph TD
    A[Analysis & Planning - Sonnet] -->|Technical Spec| B[Implementation - Sonnet]
    B -->|Code Complete| C[Cleanup & Documentation - Haiku]
    C -->|Task Complete| A
```

## Workflow Phases

### 1. Analysis & Planning (Sonnet)
**Purpose:** Select and plan next most valuable task
**Output:** Combined Analysis & Technical Specification

> [!tip] Use the Analysis & Planning templates in [[claude-app-prompt-templates|Claude App Prompt Templates]]

Selection Criteria:
1. Priority & blocking status
2. Dependencies
3. Technical complexity
4. Value/effort ratio

Planning Focus:
1. Technical design
2. Interfaces
3. Data flow
4. Test strategy
5. Migration steps

### 2. Implementation (Sonnet)
**Purpose:** Execute technical specification
**Output:** Code Changes, Tests, Core Documentation

> [!tip] Use the Implementation templates in [[claude-app-prompt-templates|Claude App Prompt Templates]]

Implementation Steps:
1. Write tests
2. Create/update interfaces
3. Implement core changes
4. Verify criteria
5. Add essential docs

### 3. Cleanup & Documentation (Haiku)
**Purpose:** Clean up code and update documentation
**Output:** Clean codebase, updated documentation, closed issues

> [!tip] Use the Cleanup & Documentation templates in [[claude-app-prompt-templates|Claude App Prompt Templates]]

Cleanup Steps:
1. Update project docs
2. Clean up code
3. Review/update tests
4. Update issues
5. Final commit

## Phase Transitions

### Analysis & Planning → Implementation
1. Complete combined analysis & technical spec
2. Verify interfaces defined
3. Create implementation chat
4. Hand off spec

### Implementation → Cleanup
1. Verify implementation
2. Basic tests passing
3. Create cleanup chat
4. Hand off summary

### Cleanup → Next Analysis
1. Verify criteria met
2. Close issues
3. Create analysis chat
4. Begin next task

## Document Templates

### Combined Analysis & Technical Specification
```markdown
TASK ANALYSIS
GitHub Issue: #[number] [title]
Labels: [high-priority, bug, feature, etc]
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

MIGRATION PLAN
1. [Step 1]
2. [Step 2]

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

## Best Practices

### Chat Management
- One chat for analysis & planning
- Clear transitions
- Context in handoffs
- Link GitHub issues

### Documentation
- Update during dev
- Keep templates current
- Document decisions
- Note future tasks

### Testing
- Tests first
- Cover edge cases
- Verify criteria

### GitHub Integration
- Reference issues
- Close completed
- Create follow-ups
- Update labels

## Related Documents
- [[claude-app-workflow|Claude App Workflow]] - Recommended current approach
- [[api-vs-app-comparison|API vs App Comparison]]
- [[claude-app-prompt-templates|Claude App Prompt Templates]]
- GitHub: https://github.com/jerseycheese/BootHillGM
