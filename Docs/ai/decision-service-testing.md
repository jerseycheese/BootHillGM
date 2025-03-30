---
title: Decision Service Testing
aliases: [AI Decision Testing, Decision Service Test Framework]
tags: [ai, decisions, testing, unit-tests, integration-tests]
created: 2025-03-29
updated: 2025-03-29
---

# Decision Service Testing Framework

## Overview

The Decision Service Test Framework provides comprehensive testing for the AI-driven contextual decision system. This framework includes utilities for mocking AI API responses, fixtures for common test scenarios, and patterns for testing different aspects of the decision service.

## Test Structure

The decision service tests are organized into three main categories:

1. **Context Refresh Tests** - Verify that decisions update based on narrative changes
2. **Decision History Tests** - Ensure previous decisions influence new ones
3. **Minimal Context Tests** - Test graceful handling of limited context

Each test category focuses on a specific aspect of the decision system's functionality, allowing for targeted testing and easier debugging.

## File Organization

```
app/
├── __tests__/services/ai/
│   ├── context-refresh.test.ts
│   ├── decision-history.test.ts
│   └── minimal-context.test.ts
└── test/services/ai/
    ├── fixtures/
    │   └── decisions-test-fixtures.ts
    └── utils/
        └── fetch-mock-utils.ts
```

## Mock Utilities

The `fetch-mock-utils.ts` file provides utilities for mocking API responses:

```typescript
// Set up global fetch mocks
setupFetchMocks();

// Reset mocks between tests
resetFetchMocks();

// Create a standard mock response
const response = createMockResponse({/* response data */});

// Create a request inspector
const inspector = createRequestInspector((url, options) => {
  // Inspect request details and return appropriate response
});
```

## Test Fixtures

The `decisions-test-fixtures.ts` file provides common test fixtures:

```typescript
// Create a test game state
const gameState = createTestGameState();

// Create a test decision service
const service = createTestDecisionService();

// Create scenario-specific responses
const sheriffResponse = createSheriffResponse();
const bartenderResponse = createBartenderResponse();
const genericResponse = createGenericResponse();
```

## Testing Patterns

### Context Awareness Testing

Tests that decisions update based on changes in the narrative:

```typescript
// Generate initial decision
const decision1 = await service.generateDecision(gameState.narrative, gameState.character);

// Update narrative context
gameState.narrative.narrativeHistory.push('Player: I enter the saloon and look for the sheriff.');

// Generate new decision
const decision2 = await service.generateDecision(gameState.narrative, gameState.character);

// Verify context awareness
expect(decision2.prompt.toLowerCase()).toContain('sheriff');
```

### Decision History Testing

Tests that previous decisions influence new ones:

```typescript
// Record a decision
service.recordDecision(
  decision1.decisionId,
  decision1.options[0].id,
  'You entered confidently and several patrons turned to look at you.'
);

// Add to decision history
gameState.narrative.narrativeContext.decisionHistory = [
  {
    decisionId: decision1.decisionId,
    selectedOptionId: decision1.options[0].id,
    timestamp: Date.now() - 30000,
    narrative: 'You entered confidently...',
    // Other properties...
  }
];

// Generate new decision
const decision2 = await service.generateDecision(gameState.narrative, gameState.character);

// Verify decision history influence
expect(decision2.prompt).toContain('tense saloon');
```

### Minimal Context Testing

Tests graceful handling of limited narrative context:

```typescript
// Strip out most context
gameState.narrative.currentStoryPoint = null;
gameState.narrative.narrativeHistory = ['You are in the town of Redemption.'];
gameState.narrative.narrativeContext = undefined;

// Should still work with minimal context
const decision = await service.generateDecision(gameState.narrative, gameState.character);

// Verify decision generation
expect(decision.decisionId).toBeDefined();
expect(decision.options.length).toBeGreaterThanOrEqual(2);
```

## Error Handling Testing

Tests ability to handle API errors and timeouts:

```typescript
// Mock an API error
(global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
  new Error('Network error')
);

// Should handle errors gracefully
try {
  const decision = await service.generateDecision(gameState.narrative, gameState.character);
  // Verify fallback behavior
} catch (error) {
  fail('Should not throw error');
}
```

## Related Documentation

- [[contextual-decision-system|Contextual Decision System]]
- [[../../development/workflows/testing-workflow|Testing Workflow]]
- [[../../technical-guides/ai-integration-testing|AI Integration Testing]]

## Related Issues

- [GitHub Issue #245](https://github.com/jerseycheese/BootHillGM/issues/245) - AI Decision Service Testing Framework
