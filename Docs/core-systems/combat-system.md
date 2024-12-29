---
title: Combat System
aliases: [Combat Engine, Battle System]
tags: [core-system, combat, mechanics, implementation]
created: 2024-12-28
updated: 2024-12-28
---

# Combat System

## Overview
The BootHillGM combat system implements turn-based combat following Boot Hill RPG rules, with support for both brawling and weapon-based combat. The system is built around a core combat engine with dedicated UI components and state management.
For rules reference, see [[../boot-hill-rules/combat-rules|Boot Hill Combat Rules]].

## Core Components

### Combat Engine
- Uses `useCombatEngine` hook for core logic
- Manages turn-based combat flow
- Handles damage calculation
- Maintains combat log
- Supports state restoration

For implementation details, see [[../architecture/state-management|State Management]].

### Brawling Engine
- Pure combat logic implementation
- Damage calculations
- Combat rules processing
- Testable interface design

For brawling rules, see [[../boot-hill-rules/base-numbers|Base Numbers Calculation]].
For brawling rules, see [[../boot-hill-rules/base-numbers|Base Numbers Calculation]].

### Combat UI Components
- **CombatStatus**: Health display for combatants
- **CombatControls**: Turn and action management
- **CombatLog**: Scrollable combat history

## Technical Implementation

### Combat State
```typescript
interface CombatState {
  playerHealth: number;
  opponentHealth: number;
  currentTurn: 'player' | 'opponent';
  combatLog: string[];
  weapon?: {
    round: number;
    playerWeapon: Weapon | null;
    opponentWeapon: Weapon | null;
    currentRange: number;
    roundLog: LogEntry[];
    lastAction?: WeaponCombatAction['type'];
  };
}
```

### Wound System
```typescript
interface Wound {
  location: 'chest';
  severity: 'light' | 'serious' | 'mortal';
  strengthReduction: number;
  turnReceived: number;
}
```

### Combat Results
```typescript
interface WeaponCombatResult {
  type: 'fire' | 'aim' | 'move' | 'reload' | 'malfunction';
  hit: boolean;
  roll: number;
  modifiedRoll: number;
  targetNumber: number;
  message: string;
  damage?: number;
  newStrength?: number;
  targetRange?: number;
  weaponMalfunction?: boolean;
}
```

## Combat Flow

### Initialization
1. Combat state setup
2. Weapon assignment (if applicable)
3. Initial range determination
4. Turn order establishment

### Turn Structure
1. Action selection
2. Action resolution
3. State updates
4. Combat log entry creation
5. Victory/defeat check

### State Management
- Atomic state updates
- Combat state persistence
- State restoration on page reload
- Error recovery mechanisms

## Integration Points

### AI Integration
- Combat narration generation
- NPC action determination
- Combat outcome descriptions

For AI details, see [[../core-systems/ai-integration|AI Integration]].

### Journal System
- Combat result logging
- Action summaries
- Wound tracking

For journal details, see [[../core-systems/journal-system|Journal System]].

### Inventory System
- Weapon management
- Ammunition tracking
- Equipment effects

For inventory details, see [[../features/_current/inventory-interactions|Inventory System]].

## Combat Actions

### Weapon Combat
- Aim: Accuracy bonus accumulation
- Fire: Attack resolution
- Reload: Ammunition management
- Move: Range adjustment

For weapon details, see [[../boot-hill-rules/weapons-chart|Weapons Reference]].

### Brawling Combat
- Attack: Basic melee combat
- Defend: Damage reduction
- Special moves: Context-specific actions

## Performance Considerations

### State Updates
- Debounced combat state persistence
- Memoized component renders
- Optimized combat log management

### Error Handling
- Combat state validation
- Action validation
- State restoration fallbacks

## Related Documentation
- [[../boot-hill-rules/combat-rules|Boot Hill Combat Rules]]
- [[../ai/prompt-engineering/combat|Combat Prompts]]
- [[../features/_current/inventory-interactions|Inventory Management]]
- [[../features/_current/journal-enhancements|Combat Logging]]