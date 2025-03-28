---
title: Prompt Writing Guide
aliases: [Prompt Guide, Claude Prompts]
tags: [ai, prompts, claude]
created: 2025-01-01
updated: 2025-02-25
---

# Prompt Writing Guide

> [!note]
> Templates and examples for effective Claude prompts.

## Implementation Template
```markdown
# Implementation: [Feature]

## Task
[Brief description]

## Requirements
- Functional: [Core requirements]
- Technical: [Implementation details]

## Files
- New: [Paths]
- Modified: [Paths]

## Testing
- Unit: [Test cases]
- Integration: [Points]
```

## Refactoring Template
```markdown
# Refactoring: [Component]

## Target File
Path: [file path]
Current Size: [line count] lines
Target Size: < 300 lines

## Size Reduction Strategy
1. [ ] Extract standalone components
2. [ ] Split by feature/responsibility
3. [ ] Move types to separate files

## Handoff
[When complete, provide summary with metrics]

[See full template in examples]
```

## Example: Weapon Combat
```markdown
# Implementation: Weapon Selection

## Task
Add weapon selection to combat system

## Requirements
- Functional:
  - Display available weapons
  - Allow selection for both sides
  - Show weapon stats
- Technical:
  - Use shadcn/ui
  - Match Boot Hill v2 specs

## Files
- New:
  - /app/components/Combat/WeaponSelector.tsx
  - /app/components/Combat/WeaponSelector.test.tsx
- Modified:
  - /app/types/combat.ts

## Testing
- Unit:
  - Render options
  - Selection state
  - Stats display
- Integration:
  - Combat system
  - State persistence
```

## Key Points
1. Keep files under 300 lines
2. Reference specific files
3. Include test cases
4. Link to Boot Hill rules
5. Prioritize low-risk changes
6. Focus on MVP requirements
7. Always include handoff information at completion

## Related
- [[feature-workflow|Feature Workflow]]
- [[refactor-prompt|Refactoring Guide]]