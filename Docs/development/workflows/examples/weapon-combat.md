---
title: Weapon Combat Example
aliases: [Combat Example]
tags: [example, combat, workflow]
created: 2025-01-01
updated: 2025-01-01
---

# Weapon Combat Implementation

> [!example]
> Complete workflow example for implementing Boot Hill v2 weapon combat.

## Task Overview
![[../../boot-hill-rules/combat-rules#Weapon Combat]]

## Planning Stage (Desktop)
```markdown
Help plan weapon combat implementation:
- Component: WeaponSelector 
- Rules: Boot Hill v2 combat
- Requirements: selection UI, stats display
```

## Implementation Stage (API)
```markdown
Create WeaponSelector component:
- Path: /app/components/Combat/WeaponSelector.tsx
- UI: shadcn/ui components
- Tests: selection, stats, rules compliance
```

## Cleanup Stage (API)
```markdown
Review implementation:
- Verify rules accuracy
- Update component docs
- Generate commit message
```

## Key Files
- `/app/components/Combat/WeaponSelector.tsx`
- `/app/types/combat.ts`
- `/app/components/Combat/WeaponSelector.test.tsx`

## Related
- [[../../boot-hill-rules/weapons-chart|Weapons Chart]]
- [[../../features/combat-base|Combat Base]]