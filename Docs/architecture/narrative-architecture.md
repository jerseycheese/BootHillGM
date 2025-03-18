---
title: Narrative Architecture
aliases: [Narrative System Architecture, Story Engine Architecture]
tags: [architecture, narrative, redux, state-management]
created: 2025-03-16
updated: 2025-03-16
---

# Narrative System Architecture

## Overview

The Narrative System architecture follows Redux principles with a modular design that separates concerns for better maintainability and testability. The architecture prioritizes type safety, immutable state updates, and clear boundaries between components.

## Architecture Diagram

```mermaid
graph TD
    subgraph "UI Components"
        UI[UI Component] --> |Renders state| State
        UI --> |Dispatches actions| ActionCreators
        ErrorDisplay[Error Display] --> |Shows errors| State
    end
    
    subgraph "Actions"
        ActionCreators[Action Creators] --> |Creates| Actions
        Actions --> Dispatch
    end
    
    subgraph "State Management"
        Dispatch[Dispatch] --> Reducers
        
        subgraph "Reducers"
            Reducers[Main Reducer] --> |Updates| State
            Reducers --> DecisionReducer
            DecisionReducer[Decision Reducer] --> |Updates| State
        end
        
        State[Narrative State]
    end
    
    subgraph "Utilities"
        Reducers --> |Uses| Helpers
        DecisionReducer --> |Uses| DecisionUtils
        DecisionReducer --> |Uses| ImpactUtils
        
        Helpers[Narrative Helpers]
        DecisionUtils[Decision Utilities]
        ImpactUtils[Impact Utilities]
    end
    
    subgraph "Types"
        CoreTypes[Narrative Core Types] --> |Defines structure for| State
        CoreTypes --> |Provides types for| ActionCreators
        CoreTypes --> |Validates data in| Reducers
        
        subgraph "Specialized Types"
            ActionTypes[Action Types]
            ChoiceTypes[Choice Types]
            StoryPointTypes[Story Point Types]
            DecisionTypes[Decision Types]
            ErrorTypes[Error Types]
            ContextTypes[Context Types]
            ArcTypes[Arc Types]
            ProgressionTypes[Progression Types]
        end
        
        CoreTypes --> |Imports from| ChoiceTypes
        CoreTypes --> |Imports from| StoryPointTypes
        CoreTypes --> |Imports from| DecisionTypes
        CoreTypes --> |Imports from| ErrorTypes
        CoreTypes --> |Imports from| ContextTypes
        CoreTypes --> |Imports from| ArcTypes
        CoreTypes --> |Imports from| ProgressionTypes
        CoreTypes --> |Imports from| ActionTypes
    end
```

## Directory Structure

```
BootHillGMApp/
├── actions/
│   └── narrativeActions.ts    # Action creators 
├── reducers/
│   ├── narrativeReducer.ts    # Core state management
│   ├── decisionReducer.ts     # Decision-specific handlers
│   └── index.ts               # Exports all reducer functionality
├── types/
│   ├── narrative.types.ts     # Core type definitions (re-exports)
│   └── narrative/             # Modularized type definitions
│       ├── actions.types.ts   # Action types
│       ├── arc.types.ts       # Arc and branch types
│       ├── choice.types.ts    # Choice types
│       ├── context.types.ts   # Context types
│       ├── decision.types.ts  # Decision types
│       ├── error.types.ts     # Error types
│       ├── hooks.types.ts     # Hook interfaces
│       ├── index.ts           # Barrel file for exports
│       ├── progression.types.ts # Progression types
│       ├── segment.types.ts   # Segment types
│       ├── story-point.types.ts # Story point types
│       └── utils.ts           # Type guards and initial states
└── utils/
    ├── narrativeHelpers.ts    # Utility functions
    ├── decisionUtils.ts       # Decision-related utilities
    └── decisionImpactUtils.ts # Impact calculation utilities
```

## Core Components

### 1. State Management

#### narrativeReducer.ts
The main reducer handles general narrative state transitions:
- Story point navigation
- Choice selection
- Narrative history updates
- Display mode changes
- Narrative arc and branch management

```typescript
function narrativeReducer(
  state: NarrativeState = initialNarrativeState,
  action: NarrativeAction
): NarrativeState {
  switch (action.type) {
    case 'NAVIGATE_TO_POINT': {
      // State transformation logic...
    }
    // Other cases...
  }
}
```

#### decisionReducer.ts
Specialized reducer for decision-related state handling:
- Decision presentation
- Decision recording
- Decision impact processing
- Impact state updates
- Impact evolution over time

### 2. Action Creation

#### narrativeActions.ts
Provides strongly-typed action creators:

```typescript
// Import specific types from their respective modules
import { NarrativeAction } from '../types/narrative/actions.types';
import { NarrativeDisplayMode } from '../types/narrative/choice.types';

export const navigateToPoint = (storyPointId: string): NarrativeAction => ({
  type: 'NAVIGATE_TO_POINT',
  payload: storyPointId,
});

export const recordDecision = (
  decisionId: string,
  selectedOptionId: string,
  narrative: string
): NarrativeAction => ({
  type: 'RECORD_DECISION',
  payload: { decisionId, selectedOptionId, narrative },
});
```

### 3. Types & Interfaces

The types system has been modularized for better organization and maintainability. 

#### narrative.types.ts
Core type definitions that re-export specialized types for backward compatibility:

```typescript
import { NarrativeChoice, NarrativeDisplayMode } from './narrative/choice.types';
import { StoryPoint } from './narrative/story-point.types';
// Other imports...

// Re-export types
export {
  NarrativeChoice,
  StoryPoint,
  // Other re-exports...
};

// Define core interfaces that depend on multiple specialized types
export interface NarrativeState {
  currentStoryPoint: StoryPoint | null;
  visitedPoints: string[];
  availableChoices: NarrativeChoice[];
  narrativeHistory: string[];
  displayMode: NarrativeDisplayMode;
  // Other properties...
}
```

#### Specialized Type Modules

Each specialized aspect of the narrative system has its own type module:

- **choice.types.ts**: Defines `NarrativeChoice` and `NarrativeDisplayMode`
- **story-point.types.ts**: Defines `StoryPoint` and related types
- **decision.types.ts**: Defines decision-related interfaces
- **error.types.ts**: Defines error handling types
- **arc.types.ts**: Defines narrative arc and branch structures
- **progression.types.ts**: Defines story progression tracking
- **actions.types.ts**: Defines Redux action types
- **utils.ts**: Provides type guards and initial states

For example, from `error.types.ts`:

```typescript
export type NarrativeErrorType =
  | 'invalid_navigation'
  | 'invalid_choice'
  | 'arc_not_found'
  // Other error types...

export interface NarrativeErrorInfo {
  code: NarrativeErrorType;
  message: string;
  context?: Record<string, unknown>;  // Type-safe, no 'any'
  timestamp: number;
}
```

### 4. Helper Utilities

#### utils.ts
Type guards for runtime type checking:

```typescript
export const isStoryPoint = (obj: unknown): obj is StoryPoint => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof (obj as Record<string, unknown>).id === 'string' &&
    typeof (obj as Record<string, unknown>).title === 'string' &&
    typeof (obj as Record<string, unknown>).content === 'string' &&
    typeof (obj as Record<string, unknown>).type === 'string'
  );
};
```

#### narrativeHelpers.ts
Common helper functions for narrative operations:

```typescript
export const defaultNarrativeContext = (): NarrativeContext => ({
  tone: undefined,
  characterFocus: [],
  themes: [],
  worldContext: '',
  importantEvents: [],
  // ...other defaults
});

export const validateStoryPoint = (
  storyPointId: string,
  storyPoints: Record<string, StoryPoint>
): boolean => {
  return Boolean(storyPoints[storyPointId]);
};
```

## Error Handling System

The narrative architecture includes a robust error handling mechanism through the `error.types.ts` module:

```typescript
export type NarrativeErrorType =
  | 'invalid_navigation'
  | 'invalid_choice'
  | 'arc_not_found'
  | 'branch_not_found'
  | 'decision_not_found'
  | 'decision_mismatch'
  | 'validation_failed'
  | 'state_corruption'
  | 'system_error';

export interface NarrativeErrorInfo {
  code: NarrativeErrorType;
  message: string;
  context?: Record<string, unknown>;  // Type-safe, using 'unknown' instead of 'any'
  timestamp: number;
}
```

Errors are captured and stored in state, allowing components to properly handle and display them:

```typescript
if (error) {
  return {
    ...state,
    error: {
      code: 'invalid_choice',
      message: `Choice with ID "${action.payload}" is not available.`,
      context: { choiceId: action.payload },
      timestamp: Date.now()
    }
  };
}
```

## Decision Impact System

The decision impact system tracks how player choices affect the game world over time, defined in `arc.types.ts` and `context.types.ts`:

```typescript
export interface ImpactState {
  reputationImpacts: Record<string, number>;
  relationshipImpacts: Record<string, Record<string, number>>;
  worldStateImpacts: Record<string, WorldStateImpactValue>;
  storyArcImpacts: Record<string, number>;
  lastUpdated: number;
}
```

Impacts can:
- Affect character's reputation with different factions
- Modify relationships between characters
- Change world state variables
- Influence story arc progression

The system also handles impact evolution over time, with some impacts fading while others persist permanently.

## Integration with React Components

The narrative system integrates with React components through custom hooks defined in `hooks.types.ts`:

```typescript
export interface UseNarrativeChoiceResult {
  availableChoices: NarrativeChoice[];
  selectChoice: (choiceId: string) => void;
  canSelectChoice: (choiceId: string) => boolean;
}

// Usage in component:
function NarrativeChoices() {
  const { availableChoices, selectChoice, canSelectChoice } = useNarrativeChoices();
  
  return (
    <div className="choices">
      {availableChoices.map(choice => (
        <button
          key={choice.id}
          onClick={() => selectChoice(choice.id)}
          disabled={!canSelectChoice(choice.id)}
        >
          {choice.text}
        </button>
      ))}
    </div>
  );
}
```

## Import Patterns

The modularized type system supports two import patterns:

1. **Direct imports** from specific modules (preferred for new code):

```typescript
// Import specific types directly
import { StoryPoint } from '../types/narrative/story-point.types';
import { NarrativeAction } from '../types/narrative/actions.types';
```

2. **Compatibility imports** from the main file (for backward compatibility):

```typescript
// Import from main file (all types re-exported)
import { StoryPoint, NarrativeAction } from '../types/narrative.types';
```

## Testing Strategy

The architecture is designed for testability:

1. **Pure reducer functions**: Easy to test with simple input/output assertions
2. **Isolated action creators**: Can be tested independently of state
3. **Helper utility functions**: Pure functions with predictable behavior
4. **Type safety**: TypeScript prevents many common runtime errors
5. **Type guards**: Facilitate runtime type checking in tests

For testing complex state transitions, the `testNarrativeReducer` wrapper function handles nested state structures:

```typescript
export function testNarrativeReducer(
  state: NarrativeState | Partial<GameState> = initialNarrativeState,
  action: NarrativeAction
): NarrativeState | Partial<GameState> {
  // Handles both flat and nested state scenarios
}
```

## Performance Considerations

1. **Modular imports**: Allow for better tree-shaking
2. **Immutable updates**: All state updates use immutable patterns
3. **Selective rendering**: Components can select specific parts of state
4. **Memoization opportunities**: Pure functions can be memoized
5. **Serializable state**: State can be easily persisted or transferred
6. **Targeted updates**: Decision impacts only update affected state portions

## Related Documentation

- [[state-management|State Management]]
- [[../core-systems/narrative-system|Narrative System Overview]]
- [[../core-systems/player-decision-system|Player Decision System]]
- [[decision-service|Decision Service]]
