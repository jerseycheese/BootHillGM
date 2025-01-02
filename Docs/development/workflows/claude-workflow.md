---
title: Claude Workflow
aliases: [AI Development Process]
tags: [development, process, ai, claude]
created: 2025-01-01
updated: 2025-01-01
---

# Claude Workflow

> [!note]
> Three-stage development process using Claude Desktop and API.

## Initial Project Analysis
Before starting development work, use the project analysis prompt to determine the most appropriate next task. See [[examples/project-analysis-prompt|Project Analysis Example]].

## App Walkthrough
During app testing, use the documentation assistant to track issues and improvements. See [[examples/walkthrough-documentation-prompt|Documentation Assistant]].

## Development Flow
```mermaid
graph TD
    Z[Project Analysis] --> A[Desktop/Planning]
    Z --> M[App Testing]
    M --> N[Documentation Updates]
    N --> A
    A[Desktop/Planning] --> B[API/Implementation]
    B --> C[API/Cleanup]
    A --> D[Requirements]
    A --> E[Prompts]
    A --> F[Checklist]
    B --> G[Code]
    B --> H[Tests]
    B --> I[Docs]
    C --> J[Verify]
    C --> K[Update]
    C --> L[Commit]
```

## Stages

### 1. Planning (Desktop)
Initial planning and setup stage using Claude Desktop:

1. Requirements Review
   - Analyze current stories and open issues
   - Review project status
   - Identify dependencies

2. Task Selection
   - Use project analysis prompt
   - Consider priorities and dependencies
   - Get specific task recommendation
   - See [[examples/project-analysis-prompt|Project Analysis]]

3. Completion Criteria
   - Create verification checklist
   - Define clear success metrics
   - Document requirements
   - See [[examples/verification-checklist-prompt|Verification Checklist]]

### 2. Implementation (API)
Main development stage using Claude API or Desktop:
1. Code Generation
   - Component implementation
   - State management
   - Game rule integration

2. Test Creation
   - Add focused unit tests for new components
   - Update existing tests as needed
   - See [[examples/test-creation-prompt|Test Creation Guide]]

3. Documentation
   - Update component docs
   - Add implementation notes
   - Record key decisions

### 3. Cleanup (API)
Final polish and verification stage:
1. Code Cleanup
   - Remove debug code
   - Add inline documentation
   - See [[examples/code-cleanup-prompt|Code Cleanup Guide]]

2. Documentation Updates
   - Create session log
   - Review and update relevant docs
   - Prepare commit message
   - See [[examples/doc-updates-prompt|Documentation Updates Guide]]

3. Final Verification
   - Check against verification checklist
   - Verify test coverage
   - Confirm documentation is current

## Best Practices

1. Component Focus
   - One component per prompt
   - Clear component boundaries
   - Focused testing scope

2. Path Management
   - Include complete file paths
   - Maintain consistent structure
   - Follow project organization

3. Game Rules
   - Reference Boot Hill rules directly
   - Validate rule implementations
   - Document rule applications

4. Testing Approach
   - Focus on key functionality
   - Unit tests for core features
   - Practical test coverage

5. Documentation
   - Keep session logs current
   - Update planning docs
   - Clear commit messages

## Templates
- [[prompt-guide|Prompt Guide]]
- [[examples/weapon-combat|Example]]
- [[examples/project-analysis-prompt|Project Analysis]]
- [[examples/verification-checklist-prompt|Verification Checklist]]
- [[examples/test-creation-prompt|Test Creation]]
- [[examples/code-cleanup-prompt|Code Cleanup]]
- [[examples/doc-updates-prompt|Documentation Updates]]

## Related
- [[feature-workflow|Feature Development]]
- [[../../boot-hill-rules/index|Boot Hill Rules]]