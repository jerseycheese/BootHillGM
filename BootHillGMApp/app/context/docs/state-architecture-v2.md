# State Architecture v2

## Overview

This document outlines the refined state management architecture for BootHillGM. The architecture is designed to provide a more maintainable, performant, and type-safe approach to state management as the application grows in complexity.

## Key Concepts

### 1. Domain-Specific State Slices

The global state is divided into logical domain-specific slices:

```typescript
export interface GameState {
  // Domain-specific slices
  character: CharacterState;
  combat: CombatState;
  inventory: InventoryState;
  journal: JournalState;
  narrative: NarrativeState;
  ui: UIState;
  
  // Top-level state
  currentPlayer: string;
  npcs: string[];
  location: LocationType | null;
  quests: string[];
  gameProgress: number;
  suggestedActions: SuggestedAction[];
  savedTimestamp?: number;
  isClient?: boolean;
}
```

Each domain slice encapsulates data related to a specific aspect of the game:

- **character**: Player and opponent character data
- **combat**: Combat state, turns, and logs
- **inventory**: Items owned by the player
- **journal**: Log of game events and discoveries
- **narrative**: Story points, choices, and narrative flow
- **ui**: UI-specific state like active tabs and modals

### 2. Selector Hooks Pattern

Instead of directly accessing the state, components use selector hooks to get the specific data they need:

```typescript
// Before: Direct state access
function PlayerHealth() {
  const { state } = useGame();
  const health = calculateHealth(state.player);
  
  return <div>Health: {health}</div>;
}

// After: Using selector hook
function PlayerHealth() {
  const health = usePlayerHealth();
  
  return <div>Health: {health}</div>;
}
```

Benefits of selector hooks:
- **