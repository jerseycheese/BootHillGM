---
title: Combat System
aliases: [Combat Engine, Battle System]
tags: [core-system, combat, mechanics, implementation, rules]
created: 2024-12-28
updated: 2024-12-28
---

# Combat System

## Overview
The BootHillGM combat system implements turn-based combat following Boot Hill RPG rules, with support for both brawling and weapon-based combat.

## Purpose
The Combat System documentation aims to:
- Provide technical implementation details for developers
- Document combat flow and state management
- Serve as a reference for combat-related components
- Maintain consistency with Boot Hill RPG rules

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
  currentTurn: 'player' | 'opponent';
  combatLog: string[];
  participants: {
    playerCharacterId: string;
    opponentCharacterId: string;
  },
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
The CombatState interface defines the structure for managing real-time combat data. It tracks the current turn, maintains a combat log, and holds weapon-specific state if weapon combat is active. Importantly, it now uses `playerCharacterId` and `opponentCharacterId` to reference `Character` objects for participants, instead of storing duplicated strength values.

### Wound System
```typescript
interface Wound {
  location: 'chest';
  severity: 'light' | 'serious' | 'mortal';
  strengthReduction: number;
  turnReceived: number;
}
```

### Strength Validation System
The strength system ensures combat participants' strength is correctly derived from Character attributes and accounts for wound effects. Strength values are no longer directly managed in the combat state.

#### Key Features
- Derives strength values from Character attributes during combat calculations
- Handles wound stacking and timing via Character wounds
- Uses `calculateCurrentStrength` function to determine effective strength
- Ensures a minimum strength threshold (1)

#### Wound Effects
```typescript
const WOUND_EFFECTS = {
  LIGHT: 3,
  SERIOUS: 7,
  MORTAL: Infinity
};
```

#### Strength Calculation
```typescript
function calculateCurrentStrength(character: Character): number {
  const totalReduction = character.wounds.reduce(
    (total, wound) => total + wound.strengthReduction,
    0
  );
  return Math.max(1, character.attributes.baseStrength - totalReduction);
}
```

#### Integration Points
- Combat state initialization
- Damage application
- Wound processing
- Defeat condition checks

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
3. State updates, including participant tracking using Character references
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

#### State Validation
The combat system includes comprehensive state validation to ensure data integrity. The validation system:

- Validates required properties (combatType, participants, rounds, combatLog)
- Ensures proper data types and value ranges
- Cleans up unnecessary properties
- Provides detailed error reporting

Validation occurs during:
- Combat state initialization
- Combat state updates
- Combat state restoration
- Combat end transitions

#### Action Validation
- Verifies valid action types
- Ensures proper action parameters
- Validates action preconditions

#### State Recovery
- State restoration fallbacks
- Error recovery mechanisms
- Graceful degradation

For implementation details, see [[../architecture/state-management|State Management]] and [[../architecture/technical-specification|Technical Specification]].

## Dice Rolling and Rule Tables

The combat system utilizes the `rollDice` function from `diceUtils.ts` to handle all dice rolls during combat. This function provides a centralized and comprehensive way to manage dice rolls, supporting various options like the number of dice, sides, modifiers, advantage, and disadvantage.

### Brawling Combat Integration
The `rollDice` function has been fully integrated into the brawling combat system, replacing the previous local implementation. This change:
- Centralizes dice rolling logic across all combat systems
- Improves code reuse and maintainability
- Supports consistent dice rolling behavior
- Enables future enhancements like advantage/disadvantage in brawling

**Integration of `rollDice`:**

- The `rollDice` function is called whenever a dice roll is needed within the combat system, including:
  - Brawling attack rolls
  - Weapon attack rolls
  - Damage calculations
  - Skill checks
- The function's parameters are determined based on the specific combat situation, taking into account factors like weapon type, character stats, and situational modifiers.
- The results of the dice rolls are then used to determine the outcome of combat actions, such as whether an attack hits, how much damage is dealt, and whether any special effects are triggered.

**Testing and Validation:**
The integration of `rollDice` into the brawling combat system has been thoroughly tested, with all unit tests passing successfully. This ensures the system maintains its existing behavior while benefiting from the centralized dice rolling logic.

**Next Steps for Rule Tables:**

- The current combat system does not yet fully incorporate all Boot Hill rule tables.
- The next step is to integrate these tables using the type definitions provided in `ruleTableTypes.ts`.
- This will involve:
  1. **Gathering Information:** Researching and documenting the specific rule tables needed for the game, such as hit location tables, damage modifier tables, range modifier tables, and skill check difficulty tables.
  2. **Refining Type Definitions:** Expanding and refining the `RuleTable`, `TableEntry`, and `TableModifier` types in `ruleTableTypes.ts` to accurately represent the structure and data of these tables.
  3. **Implementing Table Integration:** Modifying the combat system to look up and apply data from the rule tables during combat calculations. This will likely involve creating functions that take the current combat state as input and return the appropriate table entries or modifiers based on the situation.
  4. **Testing:** Thoroughly testing the integration of rule tables to ensure they are being applied correctly and produce the expected results in various combat scenarios.

By completing these steps, the combat system will become more accurate and aligned with the Boot Hill rule set, providing a more authentic and engaging gameplay experience.

## Related Documentation
- [[../boot-hill-rules/combat-rules|Boot Hill Combat Rules]]
- [[../ai/prompt-engineering/combat|Combat Prompts]]
- [[../features/_current/inventory-interactions|Inventory Management]]
- [[../features/_current/journal-enhancements|Combat Logging]]
