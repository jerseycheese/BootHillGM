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
        Types[Narrative Types] --> |Defines structure for| State
        Types --> |Provides types for| ActionCreators
        Types --> |Validates data in| Reducers
        Types --> |Enforces structure in| Helpers
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
│   └── narrative.types.ts     # Type definitions
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

#### narrative.types.ts
Comprehensive type definitions for the narrative system:

```typescript
export interface NarrativeState {
  currentStoryPoint: StoryPoint | null;
  visitedPoints: string[];
  availableChoices: NarrativeChoice[];
  narrativeHistory: string[];
  displayMode: NarrativeDisplayMode;
  narrativeContext?: NarrativeContext;
  selectedChoice?: string;
  storyProgression?: StoryProgressionState;
  currentDecision?: PlayerDecision;
  error?: NarrativeErrorInfo | null;
}
```

### 4. Helper Utilities

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

The narrative architecture includes a robust error handling mechanism:

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
  context?: Record<string, any>;
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

The decision impact system tracks how player choices affect the game world over time:

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

The narrative system integrates with React components through:

```typescript
function NarrativeView() {
  const dispatch = useDispatch();
  const { 
    currentStoryPoint, 
    availableChoices, 
    narrativeHistory,
    error
  } = useSelector(state => state.narrative);
  
  const handleChoice = (choiceId) => {
    dispatch(selectChoice(choiceId));
    
    // Get destination from choice
    const choice = availableChoices.find(c => c.id === choiceId);
    if (choice) {
      dispatch(navigateToPoint(choice.leadsTo));
    }
  };
  
  // Handle errors
  if (error) {
    return <ErrorDisplay error={error} onDismiss={() => dispatch(clearError())} />;
  }
  
  return (
    <div className="narrative-container">
      <div className="narrative-text">
        <h2>{currentStoryPoint?.title}</h2>
        <p>{currentStoryPoint?.content}</p>
      </div>
      
      {availableChoices.length > 0 && (
        <div className="choices">
          {availableChoices.map(choice => (
            <button
              key={choice.id}
              onClick={() => handleChoice(choice.id)}
            >
              {choice.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Testing Strategy

The architecture is designed for testability:

1. **Pure reducer functions**: Easy to test with simple input/output assertions
2. **Isolated action creators**: Can be tested independently of state
3. **Helper utility functions**: Pure functions with predictable behavior
4. **Type safety**: TypeScript prevents many common runtime errors

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

1. **Immutable updates**: All state updates use immutable patterns
2. **Selective rendering**: Components can select specific parts of state
3. **Memoization opportunities**: Pure functions can be memoized
4. **Serializable state**: State can be easily persisted or transferred
5. **Targeted updates**: Decision impacts only update affected state portions

## Related Documentation

- [[state-management|State Management]]
- [[../core-systems/narrative-system|Narrative System Overview]]
- [[../core-systems/player-decision-system|Player Decision System]]
- [[decision-service|Decision Service]]
