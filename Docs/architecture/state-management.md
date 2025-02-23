---
title: State Management System
aliases: []
tags: [documentation]
created: 2024-01-04
updated: 2024-02-23
---

# State Management System

## Overview
The state management system provides centralized state handling using React Context with useReducer, implementing persistent storage and state restoration capabilities.

## Purpose
This documentation serves as a technical reference for developers working with the application's state management system. It provides insights into the architecture, implementation details, and best practices for:
- Developers maintaining state management features
- Engineers implementing new state-related functionality
- Technical reviewers assessing state architecture

## Implementation Details

### Core Components

#### GameProviderWrapper
Primary state container and provider component.

```typescript
interface GameState {
  campaign: CampaignState;
  character: CharacterState;
  combat: CombatState;
  inventory: InventoryState;
  journal: JournalState;
  settings: SettingsState;
}
```

### State Architecture

#### 1. State Hierarchy
- Root State (GameState)
  - Campaign State
  - Character State
  - Combat State
  - Inventory State
  - Journal State
  - Settings State
  - Location State

#### 2. State Updates
- Action Creators
- Reducers
- Middleware
- State Selectors

### Context Structure
```typescript
const GameContext = React.createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}>({
  state: initialState,
  dispatch: () => null,
});
```

### State Persistence
- localStorage integration
- Automatic state saving
- State restoration
- Version management

### Action Handling
1. Action Dispatch
2. Middleware Processing
3. Reducer Execution
4. State Update
5. Persistence Trigger

### State Modules

#### Campaign State
- Story progression
- World state
- NPC relationships
- Quest tracking

#### Character State
- Attributes
- Skills
- Equipment
- Status effects

#### Combat State
- Turn management
- Participant tracking (using Character references)
- Combat logs
- Active effects
- Strength derived from Character references, not duplicated in state

#### Inventory State
- Item management
- Equipment slots
- Currency tracking
- Item metadata

#### Journal State
- Entry management
- Categories
- Timestamps
- Tags

### Performance Optimization

#### Update Batching
- Batch similar updates
- Debounce saves
- Optimize rerenders
- Memoize selectors

#### Memory Management
- State pruning
- Log rotation
- Cache management
- Reference cleanup

### Error Handling

#### State Validation
The state management system includes comprehensive validation for all state types, with special focus on combat state validation:

- **Combat State Validation**
  - Validates required properties (combatType, participants, rounds, combatLog)
  - Ensures proper data types and value ranges
  - Cleans up unnecessary properties
  - Provides detailed error reporting

#### State Recovery
- Backup management
- Corruption detection
- Fallback states
- Version migration
- Automated retry for failed state updates
- Graceful degradation for invalid states
- State version compatibility checks

#### Error Boundaries
- State isolation
- Error logging
- Recovery actions
- User notification

For implementation details, see [[../core-systems/combat-system|Combat System]] and [[../architecture/technical-specification|Technical Specification]].

### Testing Strategy

#### Unit Testing
- Reducer tests
- Action creator tests
- Selector tests
- Middleware tests

#### Integration Testing
- State flow tests
- Persistence tests
- Recovery tests
- Performance tests

### Location State

#### Overview
The location state management system handles the current location and history of the player's character within the game world. It uses a combination of a custom hook (`useLocation`), a service (`LocationService`), and integration with the main game reducer.

#### Components

- **`useLocation` Hook:**
  - Manages location state and history.
  - Provides an `updateLocation` function for updating the current location.
  - Stores location history in `localStorage`.
  - Synchronizes with the global game state.

- **`LocationService`:**
  - Provides utility functions for location management.
  - Parses location strings into structured `LocationType` objects.
  - Validates `LocationType` objects.
  - Manages location history, enforcing a maximum history length.

- **`LocationType`:**
  - Defines the structure of location data:
    ```typescript
    export type LocationType =
      | { type: 'town'; name: string }
      | { type: 'wilderness'; description: string }
      | { type: 'landmark'; name: string; description?: string }
      | { type: 'unknown' };
    ```

- **Integration with `gameReducer`:**
  - The `SET_LOCATION` action updates the `location` property in the game state with a `LocationType` object.

#### Data Flow

1. **Location Update Request:** The `updateLocation` function from `useLocation` is called.
2. **Dispatch Action:** The `SET_LOCATION` action is dispatched to the `gameReducer`.
3. **State Update:** The `gameReducer` updates the `location` in the global state.
4. **`useLocation` Synchronization:** The `useEffect` hook in `useLocation` detects the change in `state.location` and updates the local state and history.
5. **Persistence:** The `useEffect` hook in `useLocation` updates the location history in `localStorage`.

## Related Documentation
- [[../index|Main Documentation]]
- [[../architecture/_index|Architecture Overview]]
- [[../core-systems/state-management|State Management Guide]]
- [[../technical-guides/testing|Testing Guide]]
- [[../services/locationService|Location Service]]

## Tags
#documentation #architecture #state-management

## Changelog
- 2024-01-04: Reformatted to follow documentation template
- 2025-02-23: Added Location State documentation
