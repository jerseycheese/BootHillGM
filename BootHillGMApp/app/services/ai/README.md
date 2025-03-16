# Contextual Decision Service

This directory contains the Contextual Decision Service implementation for BootHillGM. The service analyzes narrative context to intelligently generate contextually appropriate decision points for players, replacing keyword-based approaches with sophisticated AI analysis.

## File Structure

The service is split into several modular components:

- `contextualDecisionService.ts` - Main service class and singleton implementation
- `contextualDecision.types.ts` - Type definitions and interfaces
- `decisionDetector.ts` - Logic for detecting appropriate decision points
- `decisionResponseProcessor.ts` - Processing AI responses into structured decisions
- `fallbackDecisionGenerator.ts` - Generating fallback decisions when AI fails

## Usage

The service is accessed through a singleton pattern:

```typescript
import { getContextualDecisionService } from './services/ai/contextualDecisionService';

// Get the service instance with default config
const decisionService = getContextualDecisionService();

// Use the service
const detectionResult = decisionService.detectDecisionPoint(narrativeState, character);
if (detectionResult.shouldPresent) {
  const decision = await decisionService.generateDecision(narrativeState, character);
  // Present decision to player
}
```

## Configuration

You can configure the service by passing a config object when getting the instance:

```typescript
const decisionService = getContextualDecisionService({
  minDecisionInterval: 60 * 1000, // 1 minute minimum between decisions
  relevanceThreshold: 0.75,       // Higher threshold for presenting decisions
  maxOptionsPerDecision: 3,        // Maximum options per decision
  useFeedbackSystem: true          // Whether to use feedback enhancement
});
```

## Testing

Tests for the service are located in `app/__tests__/services/ai/contextualDecisionService.test.ts`. Run tests with:

```bash
npm test
```

## Refactoring Notes

This service was refactored from a monolithic implementation into separate modules following the Single Responsibility Principle. Each file now focuses on a specific aspect of the decision generation process, improving maintainability and testability.
