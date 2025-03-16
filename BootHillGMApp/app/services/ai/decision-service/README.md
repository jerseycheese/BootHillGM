# Decision Service

## Overview

The Decision Service generates contextually appropriate decisions for players based on their character, narrative state, and game world. It uses AI to create meaningful choices that impact the game's story progression.

## Architecture

The service follows a modular architecture with the following components:

- **index.ts**: Main orchestrator and public API
- **decision-detector.ts**: Determines when decisions should be presented
- **decision-generator.ts**: Creates AI-driven decisions
- **decision-history.ts**: Manages the history of player decisions
- **ai-client.ts**: Handles communication with AI services

## Usage

```typescript
import { DecisionService } from '../services/ai/decision-service';

// Create an instance with default configuration
const decisionService = new DecisionService();

// Or with custom configuration
const customService = new DecisionService({
  minDecisionInterval: 60000, // 1 minute
  relevanceThreshold: 0.7,
  maxOptionsPerDecision: 3,
  apiConfig: {
    // Custom API configuration
  }
});

// Detect if a decision should be presented
const detectionResult = decisionService.detectDecisionPoint(narrativeState, character);

if (detectionResult.shouldPresent) {
  // Generate a decision
  const decision = await decisionService.generateDecision(narrativeState, character);
  
  // Convert to player decision format
  const playerDecision = decisionService.toPlayerDecision(decision, location);
  
  // Present to the player...
  
  // Record player's choice
  decisionService.recordDecision(decisionId, optionId, outcome);
}
```

## Dependencies

- Environment variables for AI API credentials
- Narrative state and character information
- Type definitions in `/types/decision-service/decision-service.types.ts`
- Constants in `/constants/decision-service.constants.ts`

## Extending

Each component implements an interface that can be extended or replaced:

- `DecisionDetector` for detection logic
- `DecisionGenerator` for generation logic
- `DecisionHistoryManager` for history tracking
- `AIClient` for API communication

See the [Decision Service Architecture](../../../../Docs/architecture/decision-service.md) document for more details.
