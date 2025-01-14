---
title: Prompt Writing Guide
aliases: [Prompt Guide, Claude Prompts]
tags: [ai, prompts, claude]
created: 2025-01-01
updated: 2025-01-01
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
1. Reference specific files
2. Include test cases
3. Link to Boot Hill rules

## Related
- [[feature-workflow|Feature Workflow]]