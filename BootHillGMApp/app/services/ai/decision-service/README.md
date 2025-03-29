# AI Decision Service

## Overview

The AI Decision Service generates contextually appropriate decisions for players based on narrative context, character traits, and game state. It uses AI to create meaningful, relevant choices that impact the game's story progression and player experience.

## Architecture

The service follows a modular architecture with the following components:

- **decision-service.ts**: Main orchestrator that coordinates decision detection, generation, and tracking
- **narrative-decision-detector.ts**: Analyzes narrative state to determine when decisions should be presented
- **decision-generator.ts**: Creates AI-driven decisions with context-aware options
- **decision-history-service.ts**: Manages the history of player decisions for continuity
- **ai-service-client.ts**: Handles communication with external AI services
- **utils/**: Utility functions for context extraction and relationship handling
- **constants/**: Configuration constants and string templates

## Key Features

- **Contextual Decision Detection**: Intelligently determines when to present decisions based on narrative flow
- **Enhanced Context Extraction**: Builds comprehensive context from narrative state, character traits, and history
- **Relationship Awareness**: Incorporates character relationships into decision generation
- **Error Handling**: Robust error handling with standardized error objects
- **Rate Limiting**: Enforces API rate limits and provides graceful degradation
- **Test Support**: Special handling for test scenarios ensures testability

## Usage Examples

### Basic Usage

```typescript
import DecisionService from '../services/ai/decision-service';

// Create an instance with default configuration
const decisionService = new DecisionService();

// Process narrative state to potentially generate a decision
const decision = await decisionService.processNarrativeState(narrativeState, playerCharacter);

if (decision) {
  // Convert to player-facing format
  const playerDecision = decisionService.toPlayerDecision(decision, currentLocation);
  
  // Present to the player...
  
  // Later, record the player's choice
  decisionService.recordDecision(decision.decisionId, selectedOptionId, resultingNarrative);
}
```

### Custom Configuration

```typescript
const customService = new DecisionService({
  minDecisionInterval: 60000, // 1 minute between decisions
  relevanceThreshold: 0.7,    // Higher threshold for decision generation
  maxOptionsPerDecision: 3,   // Limit to 3 options per decision
  apiConfig: {
    apiKey: process.env.CUSTOM_AI_API_KEY,
    endpoint: 'https://api.example.com/v2/decisions',
    modelName: 'decision-model-v2',
    maxRetries: 2,
    timeout: 15000,
    rateLimit: 100
  }
});
```

### Manual Decision Detection

```typescript
// Manually check if a decision should be presented
const detectionResult = decisionService.detectDecisionPoint(narrativeState, character);

console.log(`Should present decision: ${detectionResult.shouldPresent}`);
console.log(`Decision score: ${detectionResult.score}`);
console.log(`Reason: ${detectionResult.reason}`);

if (detectionResult.shouldPresent) {
  // Generate a decision if appropriate
  const decision = await decisionService.generateDecision(narrativeState, character);
  // Handle the decision...
}
```

### Decision History Management

```typescript
// Record a decision
decisionService.recordDecision(
  'decision-123',          // Decision ID
  'option-approach-direct', // Selected option ID
  'You approach the sheriff directly. He nods respectfully.' // Outcome
);

// Get decision history
const history = decisionService.getDecisionHistory();
console.log(`Player has made ${history.length} decisions`);
```

## API Reference

### DecisionService

#### Constructor
```typescript
constructor(config?: Partial<DecisionServiceConfig>)
```

Initializes the service with optional custom configuration.

#### Methods

##### processNarrativeState
```typescript
async processNarrativeState(
  narrativeState: NarrativeState,
  character: Character
): Promise<DecisionResponse | null>
```

Processes the narrative state to potentially generate a decision. Returns null if no decision should be presented.

##### detectDecisionPoint
```typescript
detectDecisionPoint(
  narrativeState: NarrativeState,
  character: Character
): DecisionDetectionResult
```

Analyzes the narrative state to determine if a decision point should be presented.

##### generateDecision
```typescript
async generateDecision(
  narrativeState: NarrativeState,
  character: Character
): Promise<DecisionResponse>
```

Generates a decision based on the narrative state and character.

##### toPlayerDecision
```typescript
toPlayerDecision(
  decision: DecisionResponse,
  location: string
): PlayerDecision
```

Converts an AI decision to the player decision format for UI consumption.

##### recordDecision
```typescript
recordDecision(
  decisionId: string,
  optionId: string,
  outcome: string
): void
```

Records a decision that was made by the player.

##### getDecisionHistory
```typescript
getDecisionHistory(): DecisionHistoryEntry[]
```

Gets the decision history.

## Error Handling

The service uses standardized error objects with the following error codes:

- `AI_SERVICE_ERROR`: Errors related to the AI service
- `RATE_LIMITED`: Rate limit exceeded
- `VALIDATION_ERROR`: Invalid decision format
- `UNKNOWN_ERROR`: Unexpected errors

Example of handling errors:

```typescript
try {
  const decision = await decisionService.generateDecision(narrativeState, character);
  // Process decision...
} catch (error) {
  if (error.code === 'AI_SERVICE_ERROR') {
    console.error('AI service error:', error.message);
    if (error.retryable) {
      // Can retry after a delay
    }
  } else if (error.code === 'RATE_LIMITED') {
    console.error('Rate limited:', error.message);
    // Wait until the rate limit resets
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Testing

The service includes special handling for test scenarios. In test environments:

- Mock API responses can be provided via Jest mocks
- Special test scenarios are handled via content pattern matching
- Error conditions can be simulated

For more details, see the test files in `__tests__/` directory.

## Related Documentation

For more details, see:
- [Contextual Decision System](/Users/jackhaas/Projects/BootHillGM/Docs/ai/contextual-decision-system.md)
- [Decision Generator Design](/Users/jackhaas/Projects/BootHillGM/Docs/ai/decision-generator.md)
- [Narrative Context Management](/Users/jackhaas/Projects/BootHillGM/Docs/ai/context-management.md)
