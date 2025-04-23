---
title: State Management Architecture
aliases: [Redux Architecture, Game State Management]
tags: [redux, state, architecture, game]
created: 2025-04-23
updated: 2025-04-23
---

# State Management Architecture

## Overview

Boot Hill GM uses a Redux-like state management system to handle all game state. The architecture follows a domain-driven design pattern where each part of the application state is managed by specialized reducers.

## Game Reducer Structure

The state management system is centered around the `gameReducer`, which orchestrates multiple domain-specific reducers:

```
/app/reducers/
├── gameReducer.ts              # Main orchestrator
├── domain/
│   ├── characterReducer.ts     # Character state
│   ├── combatReducer.ts        # Combat state
│   ├── gameReducer.ts          # Game-specific state
│   ├── inventoryReducer.ts     # Inventory state
│   ├── journalReducer.ts       # Journal state
│   ├── narrativeReducer.ts     # Narrative state
│   └── placeholderReducers.ts  # Future domain reducers
└── utils/
    └── reducerUtils.ts         # Helper functions
```

## Domain-Specific Reducers

Each domain reducer is responsible for a specific slice of the game state:

- **Character Reducer**: Manages player character and opponent states
- **Combat Reducer**: Handles combat flow, turns, and combat logs
- **Game Reducer**: Manages game-specific state like player info and game progress
- **Inventory Reducer**: Handles item management
- **Journal Reducer**: Manages game journal entries
- **Narrative Reducer**: Controls narrative progression and history

## Action Flow

1. Actions are dispatched from components
2. The main `gameReducer` receives all actions
3. Legacy action types are normalized through `mapLegacyActionType`
4. Global actions (SET_STATE, RESET_STATE, etc.) are processed directly
5. Domain-specific actions are routed to their corresponding reducers based on action type prefix
6. Domain reducers update their slice of the state
7. Updated state flows back to components

## Action Type Convention

Actions follow a namespaced convention:

```typescript
// Example action types
'character/SET_CHARACTER'
'combat/END_COMBAT'
'inventory/ADD_ITEM'
'journal/ADD_ENTRY'
'narrative/ADD_NARRATIVE_HISTORY'
'game/SET_PLAYER'
```

## State Persistence

The game state can be saved and loaded:

- `SAVE_GAME` action triggers the `persistState` function
- `LOAD_GAME` action triggers the `loadPersistedState` function
- Both functions are defined in `stateProtection.ts`

## Adding New Reducers

When extending functionality:

1. Create a new domain reducer in `/app/reducers/domain/`
2. Update action types in `actionTypes.ts`
3. Add routing logic in `processDomainReducers` function of main `gameReducer`

## Type Safety

All reducers enforce strong typing:

- `GameState` interface defines the complete state structure
- `GameAction` type covers all possible actions
- Domain-specific action types (e.g., `CharacterAction`)
- Payload types ensure consistent data handling

## Implementation Notes

- All state updates follow immutability principles using spread operators
- Type assertions are used to safely handle payloads
- Defensive coding prevents errors from malformed or unexpected actions
- Each reducer is kept under 300 lines for maintainability
