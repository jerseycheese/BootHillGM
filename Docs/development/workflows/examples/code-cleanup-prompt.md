---
title: Code Cleanup Prompt
aliases: [Implementation Cleanup Prompt]
tags: [development, process, ai, claude, cleanup]
created: 2025-01-01
updated: 2025-01-01
---

# Code Cleanup Prompt

```markdown
Now that we've completed the implementation, let's clean up the code:

1. Review the implementation for any debug code to remove:
   - console.log statements
   - Temporary test values
   - Commented-out code
   - TODO comments that have been addressed

2. Add inline documentation where helpful:
   - Brief explanations of non-obvious logic
   - Game rule references where relevant
   - Parameter descriptions for complex functions
   - Return value documentation

Please point out what you're changing and why.

<cleanup>
Files to clean:
[list of files modified during implementation]

Changes:
[Describe cleanup changes by file]

Updated Code:
```typescript
// Clean version of the code
```
</cleanup>
```

## Example Usage

After implementing a combat calculation component:

Input:
```markdown
[Having just finished implementation, paste the prompt above]
```

Example Response:
```markdown
<cleanup>
Files to clean:
- BootHillGMApp/app/lib/combat/calculateDamage.ts

Changes:
1. Removed debug statements:
   - Removed console.log for damage rolls
   - Removed commented-out old calculation method
   - Deleted TODO about checking weapon types (implemented)

2. Added documentation:
   - Added explanation of critical hit calculation
   - Documented weapon damage multiplier rules
   - Added parameter descriptions

Updated Code:
```typescript
/**
 * Calculates combat damage based on Boot Hill v2 rules
 * @param weapon - Weapon used in the attack
 * @param hitLocation - Where the attack landed
 * @param isCritical - Whether the attack was a critical hit
 * @returns Calculated damage and any special effects
 */
export function calculateDamage({
  weapon,
  hitLocation,
  isCritical
}: DamageParams): DamageResult {
  // Apply location-specific multipliers per p.34 of rules
  const locationMultiplier = LOCATION_MULTIPLIERS[hitLocation]
  
  // Critical hits double base damage before multipliers
  const baseDamage = isCritical ? weapon.damage * 2 : weapon.damage
  
  const totalDamage = Math.floor(baseDamage * locationMultiplier)
  
  return {
    damage: totalDamage,
    effects: determineSpecialEffects(hitLocation, totalDamage)
  }
}
```
</cleanup>
```