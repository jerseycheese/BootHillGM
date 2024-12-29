---
title: Character Creation
aliases: [Character Generation, Creating Characters, Boot Hill Character Rules, Character Creation Guide]
tags: [rules, character, boot-hill-v2, core-rules, mechanics]
created: 2024-12-28
updated: 2024-12-28
---

# Character Creation Rules

## Overview
This document outlines the process of creating characters in Boot Hill v2. For technical implementation details, see [[../features/_completed/character-creation|Character Creation System]].

## 1. Abilities
Roll percentile dice (d100) for each ability:
- Speed
- Gun Accuracy
- Throwing Accuracy
- Strength
- Bravery
- Experience

### Speed Table
| Die Score | Description | Ability Score |
|-----------|-------------|---------------|
| 01-05 | Slow | -5 |
| 06-10 | Below Average | -2 |
| 11-20 | Average | 0 |
| 21-35 | Above Average | +2 |
| 36-50 | Quick | +4 |
| 51-65 | Very Quick | +6 |
| 66-80 | Fast | +9 |
| 81-90 | Very Fast | +12 |
| 91-95 | Lightning | +15 |
| 96-00 | Greased Lightning | +18 to +22 |

### Gun Accuracy and Throwing Accuracy Table
| Die Score | Description | Ability Score |
|-----------|-------------|---------------|
| 01-05 | Very Poor | -9 |
| 06-15 | Poor | -6 |
| 16-25 | Below Average | -3 |
| 26-35 | Average | 0 |
| 36-50 | Above Average | +2 |
| 51-65 | Fair | +5 |
| 66-75 | Good | +7 |
| 76-85 | Very Good | +10 |
| 86-95 | Excellent | +15 |
| 96-98 | Crack Shot | +18 |
| 99-00 | Deadeye | +20 |

Note: Roll twice on the above chart, once for Gun Accuracy and once for Throwing Accuracy, recording each ability score separately.

### Strength Table
| Die Score | Description | Ability Score |
|-----------|-------------|---------------|
| 01-02 | Feeble | 8 |
| 03-05 | Puny | 9 |
| 06-10 | Frail | 10 |
| 11-17 | Weakling | 11 |
| 18-25 | Sickly | 12 |
| 26-40 | Average | 13 |
| 41-60 | Above Average | 14 |
| 61-75 | Sturdy | 15 |
| 76-83 | Hardy | 16 |
| 84-90 | Strong | 17 |
| 91-95 | Very Strong | 18 |
| 96-98 | Powerful | 19 |
| 99-00 | Mighty | 20 |

### Bravery Table
| Die Score | Description | Speed Modifier | Accuracy Modifier |
|-----------|-------------|----------------|-------------------|
| 01-10 | Coward | -4 | -6 |
| 11-20 | Cowardly | -2 | -3 |
| 21-35 | Average | 0 | 0 |
| 36-65 | Above Average | +1 | +3 |
| 66-80 | Brave | +2 | +6 |
| 81-90 | Very Brave | +3 | +10 |
| 91-98 | Fearless | +4 | +15 |
| 99-00 | Foolhardy | +5 | +15 |

### Experience Table
| Die Score | Previous Number of Gunfights | Ability Score Accuracy Modifier |
|-----------|------------------------------|--------------------------------|
| 01-40 | None | -10 |
| 41-60 | 1 | -5 |
| 61-75 | 2 | -5 |
| 76-85 | 3 | 0 |
| 86-90 | 4 | 0 |
| 91-93 | 5 | +2 |
| 94-95 | 6 | +2 |
| 96 | 7 | +6 |
| 97 | 8 | +6 |
| 98 | 9 | +8 |
| 99 | 10 | +8 |
| 00 | 11 or more | +10 |

## 2. Improving Character Abilities

### Initial Modification (Player characters only)
| Original Dice Score Rolled | Modification |
|----------------------------|--------------|
| 01-25 | Add 25 to percentile dice score |
| 26-50 | Add 15 to percentile dice score |
| 51-70 | Add 10 to percentile dice score |
| 71-90 | Add 5 to percentile dice score |
| 91-00 | Add nothing |

### Survival Modification (All characters)
| Current Dice Score | Modification to Dice Score |
|--------------------|----------------------------|
| 01-51 | Add 3 |
| 51-70 | Add 2 |
| 71-90 | Add 1 |
| 91-95 | Add ½ |
| 96-00 | Add nothing |

## 3. Starting Equipment
Each character starts with $150.00 to purchase equipment.

### Basic Equipment
- Clothing
- Personal items
- Basic tools

### Weapons
- Firearms
- Ammunition
- Melee weapons

### Special Items
- Horse and tack
- Professional tools
- Luxury items

For equipment details, see [[equipment|Equipment Rules]] and [[weapons-chart|Weapons Reference]].

## 4. Final Calculations

### Base Numbers
- Calculate combat base numbers
- Determine skill modifiers
- Set initial status values

For calculation details, see [[base-numbers|Base Numbers Calculation]].

### Equipment Load
- Calculate total weight
- Determine movement penalties
- Set encumbrance status

For inventory management, see [[../features/_current/inventory-interactions|Inventory System]].

## Technical Implementation

### Character State
```typescript
interface Character {
  attributes: {
    speed: number;
    gunAccuracy: number;
    throwingAccuracy: number;
    strength: number;
    brawling: number;
  };
  derived: {
    hitPoints: number;
    movement: number;
    combatModifiers: CombatModifiers;
  };
  equipment: InventoryItem[];
  status: CharacterStatus;
}
```

### Integration Points
- [[../core-systems/state-management|State Management]]
- [[../core-systems/ai-integration|AI Integration]]
- [[../core-systems/combat-system|Combat System]]

## Related Documentation
- [[../features/_completed/character-creation|Character Creation Implementation]]
- [[../ai/prompt-engineering/character-creation|Character Creation Prompts]]
- [[../technical-guides/testing|Character Testing Guide]]
- [[game-overview|Game Rules Overview]]

## Notes for Digital Implementation
- Character data is automatically saved
- AI assists with background generation
- System validates all calculations
- Equipment management is automated
- Character sheets are dynamically updated

For implementation details, see [[../architecture/state-management|State Management Architecture]].