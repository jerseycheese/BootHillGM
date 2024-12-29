---
title: Base Numbers Calculation
aliases: [Combat Base Numbers, Character Base Stats, Core Game Mathematics, Base Stats Guide]
tags: [rules, boot-hill-v2, combat, calculations, mechanics, core-rules]
created: 2024-12-28
updated: 2024-12-28
---

# Base Numbers Calculation

## Overview
After determining character abilities and equipment, calculate two important base numbers that are fundamental to combat resolution. For implementation details, see [[../core-systems/combat-system|Combat System Implementation]].

## 1. First Shot Determination
This determines who shoots first in combat.

### Calculation Formula
```
First Shot = Speed Ability Score + Bravery Speed Modifier + Weapon Speed Modifier
```

### Example Calculation
- Speed Ability Score: +12 (Very Fast)
- Bravery Speed Modifier: +1 (Above Average)
- Weapon Speed Modifier: +5 (Average speed weapon)
- Total First Shot Determination: 18

## 2. Hit Determination
This is the base chance to hit a target.

### Calculation Formula
```
Hit Determination = Accuracy Ability Score + Bravery Accuracy Modifier + Experience Accuracy Modifier + 50
```

### Example Calculation
- Gun Accuracy Ability Score: +5 (Fair)
- Bravery Accuracy Modifier: +3 (Above Average)
- Experience Accuracy Modifier: -10 (No previous gunfights)
- Base Hit Determination: 48 (5 + 3 - 10 + 50)

Note: Calculate separate Hit Determination scores for firearms and thrown/launched weapons.

## Attribute Base Numbers

### Speed Base (SB)
```
SB = Speed ÷ 10 (round down)
```
Used for:
- Initiative determination
- Movement calculations
- First shot bonus

### Gun Base (GB)
```
GB = Gun Accuracy ÷ 10 (round down)
```
Used for:
- Firearm accuracy
- Quick draw checks
- Weapon malfunction resistance

### Throwing Base (TB)
```
TB = Throwing Accuracy ÷ 10 (round down)
```
Used for:
- Thrown weapon accuracy
- Grenade targeting
- Object throwing checks

### Strength Base (STB)
```
STB = Strength ÷ 10 (round down)
```
Used for:
- Damage bonus in brawling
- Carrying capacity
- Physical feat checks

### Brawling Base (BB)
```
BB = Brawling ÷ 10 (round down)
```
Used for:
- Hand-to-hand combat
- Wrestling checks
- Defense in brawls

## Combat Calculations

### First Shot Determination
```
FSB = SB + GB + Weapon Modifier
```
Modifiers:
- Quick Draw Bonus: +1
- Ready Weapon: +2
- Holstered: -1
- Surprised: -2

### Hit Chance Calculation
```
Base Hit % = (GB × 10) + Range Modifier + Situation Modifiers
```
Modifiers:
- Point Blank: +20%
- Moving Target: -20%
- Cover: -10% to -40%
- Aiming: +10% per turn (max +30%)

### Damage Calculation
```
Total Damage = Weapon Base + STB (for melee)
```
Special Cases:
- Critical Hit: Maximum damage
- Glancing Hit: Minimum damage
- Called Shot: Special effects

## Technical Implementation

### Base Number Interface
```typescript
interface BaseNumbers {
  speedBase: number;
  gunBase: number;
  throwingBase: number;
  strengthBase: number;
  brawlingBase: number;
}

interface CombatModifiers {
  firstShotBonus: number;
  hitChanceModifier: number;
  damageModifier: number;
  defenseModifier: number;
}
```

### Calculation Functions
```typescript
function calculateBaseNumbers(attributes: CharacterAttributes): BaseNumbers {
  return {
    speedBase: Math.floor(attributes.speed / 10),
    gunBase: Math.floor(attributes.gunAccuracy / 10),
    throwingBase: Math.floor(attributes.throwingAccuracy / 10),
    strengthBase: Math.floor(attributes.strength / 10),
    brawlingBase: Math.floor(attributes.brawling / 10)
  };
}
```

## Usage Examples

### Combat Scenario
1. Calculate First Shot
   ```
   Character: SB 4, GB 5
   Weapon: Quick Draw +1
   FSB = 4 + 5 + 1 = 10
   ```

2. Determine Hit Chance
   ```
   Character: GB 5
   Base: 50%
   Range: Short (+10%)
   Moving: (-20%)
   Final: 40%
   ```

3. Calculate Damage
   ```
   Weapon: 2d10
   STB: 4
   Total: 2d10 + 4
   ```

## Integration Points

### Character Creation
- Initial base number calculation
- Attribute modification effects
- Equipment influences

For details, see [[character-creation|Character Creation Guide]].

### Combat System
- Hit chance determination
- Damage calculation
- Initiative ordering

For details, see [[combat-rules|Combat Rules]].

### Campaign Rules
- Experience effects
- Skill improvement
- Special ability modifiers

For details, see [[campaign-rules|Campaign Rules]].

## Related Documentation
- [[../core-systems/combat-system|Combat System Implementation]]
- [[../technical-guides/testing|Testing Guidelines]]
- [[../core-systems/combat-modifiers|Combat Modifiers]]
- [[weapons-chart|Weapons Reference]]

Note: These base numbers will be modified by various factors (range, movement, wounds, etc.) during actual combat resolution.

For technical details, see [[../architecture/state-management|State Management Architecture]].