# Player Decision Impact System

## Overview
The Player Decision Impact System is a three-phase feature that enables player choices to have meaningful, persistent effects on the game world. Phase 1 (Decision Tracking) and Phase 2 (Decision Extraction) have been completed, establishing the foundation for recording decisions and extracting them from AI responses. This document focuses on Phase 3: Decision Impact Processing, which enables these decisions to affect the game world in a persistent and meaningful way.

## Architecture

### Core Components

#### 1. Impact Data Structure
The system introduces several new types to the narrative system:
- `DecisionImpactType`: Categorizes impacts (reputation, relationship, world-state, story-arc, etc.)
- `ImpactSeverity`: Defines impact significance (minor, moderate, major)
- `DecisionImpact`: Represents a specific impact of a decision
- `PlayerDecisionRecordWithImpact`: Extends decision records with impact data
- `ImpactState`: Tracks accumulated impacts across the game world

#### 2. Impact Processing Pipeline
The system processes decision impacts through a series of steps:
1. **Creation**: Analyze selected decision options to generate impact objects
2. **Recording**: Attach impacts to decision records
3. **Processing**: Apply impacts to update the game world state
4. **Evolution**: Allow impacts to change over time (decay, expire, etc.)
5. **Reconciliation**: Resolve conflicting impacts affecting the same target
6. **Formatting**: Present relevant impacts to the AI for context generation

### Integration Points

#### Narrative State
The narrative state includes a new `impactState` property in the `NarrativeContext`, which tracks various categories of impacts:
- `reputationImpacts`: How characters/factions view the player
- `relationshipImpacts`: How characters relate to each other
- `worldStateImpacts`: Effects on locations and the broader world
- `storyArcImpacts`: Progress on various storylines

#### Reducer Actions
New actions have been added to the narrative reducer:
- `PROCESS_DECISION_IMPACTS`: Applies a decision's impacts to the impact state
- `UPDATE_IMPACT_STATE`: Directly updates impact values
- `EVOLVE_IMPACTS`: Updates impact values based on time passing

## Implementation Details

### Utility Functions

#### Impact Creation
The `createDecisionImpacts` function analyzes decision options to identify potential impacts based on text analysis. It extracts impact types, targets, severity, and values from the decision context.

```typescript
function createDecisionImpacts(
  decision: PlayerDecision,
  selectedOptionId: string
): DecisionImpact[]
```

#### Impact Processing
The `processDecisionImpacts` function updates the impact state based on a specific decision record:

```typescript
function processDecisionImpacts(
  impactState: ImpactState,
  decisionRecord: PlayerDecisionRecordWithImpact
): ImpactState
```

#### Impact Evolution
The `evolveImpactsOverTime` function adjusts impact values based on time passing:

```typescript
function evolveImpactsOverTime(
  impactState: ImpactState,
  decisionRecords: PlayerDecisionRecordWithImpact[],
  currentTimestamp: number
): ImpactState
```

#### Conflict Resolution
The `reconcileConflictingImpacts` function resolves conflicts when multiple impacts affect the same target:

```typescript
function reconcileConflictingImpacts(
  impacts: DecisionImpact[]
): DecisionImpact[]
```

#### AI Context Generation
The `formatImpactsForAIContext` function creates a concise summary of relevant impacts for inclusion in AI prompts:

```typescript
function formatImpactsForAIContext(
  impactState: ImpactState,
  maxEntries: number = 5
): string
```

### Impact Calculation

Impacts are calculated based on several factors:
1. **Decision importance**: Critical decisions have major impacts, minor decisions have smaller impacts
2. **Text analysis**: The system analyzes decision option text to identify impact types and sentiment
3. **Context**: Decision context, such as location and involved characters, influences impact targets

### Persistence and Evolution

Impacts can be:
- **Permanent**: Major impacts that persist indefinitely
- **Temporary**: Minor impacts that decay over time
- **Conditional**: Impacts that depend on certain game state conditions

The system automatically evolves impacts by:
- Reducing the intensity of temporary impacts over time
- Removing expired impacts based on their duration
- Updating impact values in response to new, related decisions

## Integration with AI

The impact system integrates with the AI by:
1. Providing relevant impact information as context for AI responses
2. Ensuring AI-generated narrative reflects established impacts
3. Enabling the AI to reference past decisions and their consequences

For example, if a player's decision caused their reputation to decrease in a town, the AI will receive context that looks like:

```
Character Reputation:
- Dustwater: moderate negative reputation (-5)

Relationships:
- player is somewhat hostile toward Sheriff Williams (-4)

World State:
- Dustwater Saloon has worsened (-3)

Story Progression:
- Outlaw Revenge: making progress (30%)
```

## Testing Strategy

The implementation includes comprehensive tests for:
- Unit tests for impact utility functions
- Integration tests for the full impact processing pipeline
- Scenario tests for specific impact types and interactions

## Future Enhancements

Potential future enhancements include:
- Impact visualization for players
- More sophisticated impact evolution algorithms
- Enhanced AI integration for more nuanced narrative responses
- Impact chain tracking for sequences of related decisions
