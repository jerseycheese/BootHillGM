# AI Services Module

This module contains AI-powered services for the Boot Hill GM application, including decision generation, character services, and other AI-driven features.

## Main Components

### AI Decision Service

The AI Decision Service enhances the game with AI-driven contextual decisions that analyze narrative content and game state to present decisions at appropriate moments.

#### File Structure

```
/services/ai/
├── aiDecisionService.ts         - Main service class
├── types/
│   └── aiDecisionTypes.ts       - Type definitions
├── utils/
│   ├── aiDecisionConstants.ts   - Constants
│   ├── aiDecisionDetector.ts    - Decision detection logic
│   └── aiDecisionGenerator.ts   - Decision generation logic
└── clients/
    └── aiServiceClient.ts       - External API communication
```

#### Responsibilities

- **aiDecisionService.ts**: Main service class that orchestrates the decision generation process
- **aiDecisionTypes.ts**: Type definitions for the decision service
- **aiDecisionConstants.ts**: Constants used by the decision service
- **aiDecisionDetector.ts**: Logic for detecting when to present decisions
- **aiDecisionGenerator.ts**: Logic for generating decision content
- **aiServiceClient.ts**: Communication with external AI services

## Usage Example

```typescript
import AIDecisionService from './services/ai/aiDecisionService';

// Initialize the service
const decisionService = new AIDecisionService({
  relevanceThreshold: 0.7,  // Adjust how often decisions appear
  maxOptionsPerDecision: 3, // Set maximum options per decision
});

// Check if we should present a decision
const detectionResult = decisionService.detectDecisionPoint(
  narrativeState,
  playerCharacter,
  gameState
);

if (detectionResult.shouldPresent) {
  // Generate a decision
  const decision = await decisionService.generateDecision(
    narrativeState,
    playerCharacter,
    gameState
  );
  
  // Present the decision to the player...
  
  // Record the player's choice
  decisionService.recordDecision(
    decision.id,
    selectedOptionId,
    resultingOutcome
  );
}
```

## Environment Variables

The service uses these environment variables:

- `AI_SERVICE_API_KEY`: API key for the external AI service
- `AI_SERVICE_ENDPOINT`: Endpoint URL for the external AI service
- `AI_SERVICE_MODEL`: Model name to use (default: 'gpt-4')
