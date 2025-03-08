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
  inventory: InventoryState; // Managed by inventoryReducer
  journal: JournalState;
  settings: SettingsState;
  game: GameState; // Top level gameReducer state.
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

### Reducer Structure
The `gameReducer` has been split into multiple reducers to improve code organization and maintainability. Each reducer is responsible for a specific domain of the game state.

- `gameReducer`: Handles overall game state and delegates to sub-reducers.
- `inventoryReducer`: Manages the inventory state.

The reducers are combined using a custom `combineReducers` function located in `app/reducers/index.ts`. This function takes an object of reducers and returns a single reducer function that can be used with `useReducer`.

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

### Brawling Combat State Management

#### Overview
Brawling combat state is managed through a combination of custom hooks and a dedicated reducer. This modular design promotes separation of concerns and improves code maintainability.

#### Components

- **`useBrawlingCombat` Hook:**
  - The primary hook for interacting with brawling combat.
  - Orchestrates the other hooks (`useBrawlingState`, `useBrawlingActions`, `useBrawlingSync`).
  - Provides a simplified interface for components.

- **`useBrawlingState` Hook:**
  - Manages the core brawling combat state using `useReducer`.
  - Defines the initial state and utilizes the `brawlingReducer`.
  - Exposes the current `brawlingState`, a `dispatchBrawling` function, and flags for `isProcessing` and `isCombatEnded`.

- **`useBrawlingActions` Hook:**
  - Encapsulates the logic for handling combat actions (e.g., `applyWound`, `handleCombatAction`, `processRound`).
  - Interacts with `brawlingSystem` and `BrawlingEngine` for combat resolution.
  - Dispatches actions to update the brawling state via `dispatchBrawling`.

- **`useBrawlingSync` Hook:**
  - Responsible for synchronizing the local brawling combat state with the global game state.
  - Provides functions for `endCombat` and `syncWithGlobalState`.
  - Dispatches actions to update the global state (`UPDATE_COMBAT_STATE`, `UPDATE_CHARACTER`).

- **`brawlingReducer`:**
  - A pure reducer function that handles state updates based on dispatched actions.
  - Processes actions such as `APPLY_DAMAGE`, `ADD_LOG_ENTRY`, `UPDATE_MODIFIERS`, `END_ROUND`, and `END_COMBAT`.

- **`BrawlingAction` Type:**
  - Defines the structure of all possible actions that can modify the brawling state.

- **`BrawlingState` Type:**
    - Defines the structure of brawling state data:
    ```typescript
      round: 1 | 2;
      playerModifier: number;
      opponentModifier: number;
      playerCharacterId: string;
      opponentCharacterId: string;
      roundLog: LogEntry[];
    ```
#### Data Flow
1.  **Action Trigger:** A component calls a function from `useBrawlingCombat` (e.g., `processRound`).
2.  **Action Handling:** `useBrawlingActions` handles the action, potentially calling functions from `brawlingSystem` and `BrawlingEngine`.
3.  **Dispatch:** `dispatchBrawling` (from `useBrawlingState`) sends a `BrawlingAction` to the `brawlingReducer`.
4.  **State Update:** `brawlingReducer` updates the `brawlingState` based on the action.
5.  **Synchronization:** `useBrawlingSync` dispatches actions to update the global game state.
6.  **UI Update:** Components using `useBrawlingCombat` re-render based on the updated state.

#### File Structure
-   `app/hooks/useBrawlingCombat.ts`: Main hook for brawling combat.
-   `app/hooks/combat/useBrawlingState.ts`: Manages brawling state.
-   `app/hooks/combat/useBrawlingActions.ts`: Handles combat actions.
-   `app/hooks/combat/useBrawlingSync.ts`: Synchronizes with global state.
-   `app/utils/combat/brawlingReducer.ts`: Reducer function.
-   `app/types/brawling.types.ts`: Type definitions for brawling combat.

### Narrative State

#### Overview
The narrative state manages the progression of the story, including the current story point, player choices, narrative history, and display mode. It utilizes the `narrativeReducer` and the `NarrativeState` and `NarrativeContext` interfaces defined in `app/types/narrative.types.ts`.

#### Components

- **`narrativeReducer`:**
  - Handles all narrative-related actions.
  - Ensures immutable state updates.
  - Validates story points and choices.
  - Manages narrative arcs and branches.

- **`NarrativeState` Interface:**
  - Defines the structure of the narrative state:
    ```typescript
    export interface NarrativeState {
      currentStoryPoint: StoryPoint | null;
      visitedPoints: string[];
      availableChoices: NarrativeChoice[];
      narrativeHistory: string[];
      displayMode: NarrativeDisplayMode;
      narrativeContext?: NarrativeContext;
      selectedChoice?: string;
    }
    ```

- **`NarrativeContext` Interface:**
  -  Provides additional context for the narrative, including:
    ```typescript
      export interface NarrativeContext {
        tone?: 'serious' | 'lighthearted' | 'tense' | 'mysterious';
        characterFocus: string[];
        themes: string[];
        worldContext: string;
        importantEvents: string[];
        playerChoices: Array<{
          choice: string;
          consequence: string;
          timestamp: number;
        }>;
        storyPoints: Record<string, StoryPoint>;
        narrativeArcs: Record<string, NarrativeArc>;
        narrativeBranches: Record<string, NarrativeBranch>;
        currentArcId?: string;
        currentBranchId?: string;
      }
    ```
- **Actions:**
  - `NAVIGATE_TO_POINT`: Navigates to a specific story point.
  - `SELECT_CHOICE`: Records the player's choice.
  - `ADD_NARRATIVE_HISTORY`: Adds an entry to the narrative history.
  - `SET_DISPLAY_MODE`: Sets the narrative display mode.
  - `START_NARRATIVE_ARC`: Starts a new narrative arc.
  - `COMPLETE_NARRATIVE_ARC`: Marks a narrative arc as completed.
  - `ACTIVATE_BRANCH`: Activates a narrative branch.
  - `COMPLETE_BRANCH`: Marks a narrative branch as completed.
  - `UPDATE_NARRATIVE_CONTEXT`: Updates the narrative context.
  - `RESET_NARRATIVE`: Resets the narrative state to its initial values.

#### Integration with `gameReducer`
The `narrativeReducer` is integrated into the main `combinedReducer` in `app/reducers/index.ts`.  It handles all actions with types defined in `NarrativeActionType`.

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
- 2025-02-23: Added Location State documentation
- 2025-02-23: Added Brawling Combat State Management documentation
- 2025-03-07: Added Narrative State documentation