---
title: State Management
aliases: [Game State System, State Architecture]
tags: [core-system, architecture, state, persistence]
created: 2024-12-28
updated: 2024-12-28
author: Jack Haas
---

# State Management

## Overview
BootHillGM uses React Context with useReducer for global state management, implementing atomic state updates and automatic persistence.

## Purpose
The State Management documentation aims to:
- Provide technical implementation details for developers
- Document state architecture and patterns
- Serve as a reference for state-related components
- Maintain consistency across system integrations

# State Management

## Overview
BootHillGM uses React Context with useReducer for global state management, implementing atomic state updates and automatic persistence. The system is built around the CampaignStateManager which provides centralized state control.

For architectural decisions, see [[../architecture/architecture-decisions|Architecture Decision Record]].

## Core Components

### CampaignStateManager
- Implements React Context for global state
- Handles localStorage persistence
- Provides custom hooks for state access
- Manages automated saving

### State Provider Interface
```typescript
interface CampaignStateContextType {
  state: GameState;
  dispatch: React.Dispatch<GameEngineAction>;
  saveGame: (state: GameState) => void;
  loadGame: () => GameState | null;
  cleanupState: () => void;
}
```

### Action Types
```typescript
type GameEngineAction =
  | { type: 'SET_PLAYER'; payload: string }
  | { type: 'SET_CHARACTER'; payload: Character | null }
  | { type: 'SET_LOCATION'; payload: string }
  | { type: 'SET_NARRATIVE'; payload: string }
  | { type: 'UPDATE_COMBAT_STATE'; payload: CombatState }
  | { type: 'SET_COMBAT_ACTIVE'; payload: boolean }
  | { type: 'SET_OPPONENT'; payload: Character | null }
  | { type: 'ADD_ITEM'; payload: InventoryItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'USE_ITEM'; payload: string }
  | { type: 'UPDATE_JOURNAL'; payload: JournalEntry }
  | { type: 'SET_STATE'; payload: Partial<GameState> }
  | { type: 'SET_SAVED_TIMESTAMP'; payload: number };
```

## Custom Hooks

### Core State Hooks
- useGameInitialization: Game state setup
- useGameSession: Session management
- useCombatEngine: Combat state control
- useAIInteractions: AI state coordination
- useCombatStateRestoration: Combat recovery

### Integration Hooks
For combat system integration, see [[../core-systems/combat-system|Combat System]].
For AI integration, see [[../core-systems/ai-integration|AI Integration]].
For journal integration, see [[../core-systems/journal-system|Journal System]].

## State Management Features

### Automatic Persistence
- Debounced state saving (1000ms)
- localStorage integration
- State validation on load
- Error recovery mechanisms

### State Protection
- Atomic state updates
- Operation queueing
- Timeout handling
- Error recovery

### Performance Optimization
- Memoized component renders
- Selective state updates
- Deduplication of updates
- Prevention of rapid saves

## Implementation Details

### State Provider
```typescript
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}
```

### Campaign State Provider
```typescript
export function CampaignStateProvider({ children }: { children: ReactNode }) {
  const [state, baseDispatch] = useReducer(gameReducer, initialState);
  const lastSavedRef = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const stateRef = useRef<GameState | null>(null);
  const previousNarrativeRef = useRef<string>('');
  const isInitializedRef = useRef(false);
}
```

## Error Handling

### Error Types
```typescript
interface GameError extends Error {
  type: 'ai' | 'state' | 'combat' | 'inventory';
  severity: 'low' | 'medium' | 'high';
  recoverable: boolean;
}
```

### Recovery Strategies
- State validation on load
- Combat state restoration
- Character creation state persistence
- Initialization flag management

## Integration Points

### Combat System
- Combat state updates
- Turn management
- Health tracking
- Action resolution

### AI System
- Response processing
- Context management
- State synchronization
- Error recovery

### Journal System
- Entry management
- State persistence
- History tracking
- Event logging

## Related Documentation
- [[../architecture/state-management|State Management Architecture]]
- [[../technical-guides/testing|Testing Guide]]
- [[../features/_current/inventory-interactions|Inventory System]]
- [[../features/_current/journal-enhancements|Journal System]]
