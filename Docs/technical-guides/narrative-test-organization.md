---
title: Narrative Test Organization
aliases: [Narrative Testing Structure, Narrative Reducer Tests]
tags: [technical, testing, organization, narrative, reducer]
created: 2025-03-28
updated: 2025-03-28
---

# Narrative Test Organization

## Overview

This document explains the organization and structure of tests for the Narrative subsystem in the BootHillGM project, with a focus on the narrative reducer tests. The narrative system is a complex component with multiple action types and state transformations, so we've organized its tests in a modular, focused way.

## File Structure

The narrative tests follow a modular structure, breaking down the large test file into focused, single-responsibility test modules:

```
app/
├── __tests__/
│   ├── narrativeReducer.test.ts          # Main entry point
│   └── narrativeReducer/                 # Test modules
│       ├── navigation-tests.ts           # Navigation actions
│       ├── narrative-arc-tests.ts        # Arc & branch actions
│       ├── narrative-context-tests.ts    # Context update actions
│       ├── error-handling-tests.ts       # Error handling
│       └── decision-tests.ts             # Decision tracking actions
├── test/
│   └── utils/
│       └── narrativeUtils.ts             # Shared test utilities
└── reducers/
    └── narrativeReducer.ts               # Component under test
```

## Main Entry Point

The `narrativeReducer.test.ts` file serves as the main entry point for all narrative reducer tests. It imports all the specialized test modules but doesn't contain any test cases of its own:

```typescript
/**
 * Narrative Reducer Tests
 * 
 * This file serves as the main entry point for narrative reducer tests.
 * It imports and runs all the test suites for the narrative reducer.
 */

// Import all test suites
import './narrativeReducer/navigation-tests';
import './narrativeReducer/narrative-arc-tests';
import './narrativeReducer/narrative-context-tests';
import './narrativeReducer/error-handling-tests';
import './narrativeReducer/decision-tests';
```

This pattern allows us to run all narrative tests with a single command while keeping the individual test files focused and manageable.

## Test Modules

Each test module focuses on testing a specific group of related actions:

### 1. Navigation Tests

The `navigation-tests.ts` file contains tests for:
- Story point navigation
- Choice selection
- Narrative history management
- Display mode changes

### 2. Narrative Arc Tests

The `narrative-arc-tests.ts` file contains tests for:
- Starting narrative arcs
- Completing narrative arcs
- Activating branches
- Completing branches

### 3. Narrative Context Tests

The `narrative-context-tests.ts` file contains tests for:
- Updating narrative context properties
- Resetting narrative state

### 4. Error Handling Tests

The `error-handling-tests.ts` file contains tests for:
- Error state generation
- Error clearing

### 5. Decision Tests

The `decision-tests.ts` file contains tests for:
- Presenting decisions to the player
- Recording decision selections
- Clearing current decisions

## Test Utilities

The `narrativeUtils.ts` file contains shared utilities for narrative tests:

### 1. State Extraction

```typescript
/**
 * Extract narrative state from either GameState or NarrativeState
 */
export const getNarrativeState = (state: NarrativeState | Partial<GameState>): NarrativeState => {
  return 'narrative' in state ? state.narrative as NarrativeState : state as NarrativeState;
};
```

This utility handles both the nested state object used in GameState and the direct NarrativeState object, allowing tests to work with either.

### 2. Mock Data Creation

```typescript
/**
 * Creates a mock decision for testing
 */
export const createMockDecision = (id: string = 'decision1'): PlayerDecision => ({
  id,
  prompt: 'Test prompt',
  timestamp: Date.now(),
  options: [
    { id: 'option1', text: 'Option 1', impact: 'Impact 1' },
    { id: 'option2', text: 'Option 2', impact: 'Impact 2' }
  ],
  context: 'Test context',
  importance: 'moderate' as DecisionImportance,
  aiGenerated: true
});

/**
 * Returns mock story points for testing
 */
export const getMockStoryPoints = (): Record<string, StoryPoint> => ({
  // Story point definitions...
});
```

These utilities create consistent mock data for tests, avoiding duplication.

### 3. Test State Initialization

```typescript
/**
 * Creates a test state with narrative context.
 * Leverages the existing mock state utilities.
 */
export const createNarrativeTestState = (): Partial<GameState> => {
  const baseState = mockStates.withNarrative();
  
  // Customizations for tests...
  return {
    ...baseState,
    narrative: {
      // Custom configuration...
    }
  };
};
```

This function builds on the project's existing test state utilities but adds specific customizations needed for narrative tests.

## Test Patterns

### 1. Initial State Setup

Each test module sets up its initial state in a `beforeEach` block:

```typescript
describe('Navigation Actions', () => {
  let initialState: ReturnType<typeof createNarrativeTestState>;

  beforeEach(() => {
    initialState = createNarrativeTestState();
  });

  // Tests...
});
```

This ensures each test starts with a clean, consistent state.

### 2. Action Testing

Tests follow a consistent pattern for testing reducer actions:

```typescript
it('should navigate to a valid story point', () => {
  const action = navigateToPoint('point1');
  const newState = narrativeReducer(initialState, action);
  const narrativeState = getNarrativeState(newState);

  expect(narrativeState?.currentStoryPoint?.id).toBe('point1');
  expect(narrativeState?.availableChoices).toHaveLength(2);
  expect(narrativeState?.visitedPoints).toContain('point1');
});
```

1. Create the action to dispatch
2. Pass it to the reducer with the initial state
3. Extract the narrative state
4. Assert the expected changes

### 3. Sequential Actions

Some tests verify the effect of multiple sequential actions:

```typescript
it('should select a valid choice', () => {
  // First navigate to a point with choices
  let state = narrativeReducer(initialState, navigateToPoint('point1'));

  // Then select a choice
  const action = selectChoice('choice1');
  state = narrativeReducer(state, action);
  const narrativeState = getNarrativeState(state);
  expect(narrativeState?.selectedChoice).toBe('choice1');
});
```

### 4. Error State Testing

Tests verify both the error flagging and error content:

```typescript
it('should not navigate to an invalid story point', () => {
  const action = navigateToPoint('non-existent-point');
  const newState = narrativeReducer(initialState, action);
  const narrativeState = getNarrativeState(newState);
  
  // With our new error handling, we expect an error object to be set
  expect(narrativeState.error).toBeDefined();
  expect(narrativeState.error?.code).toBe('invalid_navigation');
  expect(narrativeState.error?.context?.storyPointId).toBe('non-existent-point');
  
  // Core state should remain unchanged
  expect(narrativeState.currentStoryPoint).toEqual(initialState.narrative?.currentStoryPoint);
  expect(narrativeState.availableChoices).toEqual(initialState.narrative?.availableChoices);
});
```

## Running Narrative Tests

### Running All Narrative Tests

To run all narrative reducer tests:

```bash
npm test -- app/__tests__/narrativeReducer.test.ts
```

### Running Specific Test Groups

To run specific test groups:

```bash
# Run only navigation tests
npm test -- app/__tests__/narrativeReducer/navigation-tests.ts

# Run only error handling tests
npm test -- app/__tests__/narrativeReducer/error-handling-tests.ts
```

### Running Tests by Pattern

To run tests matching a pattern:

```bash
# Run all tests related to decisions
npm test -- -t "Decision"

# Run all tests related to error handling
npm test -- -t "error"
```

## Integration with Project Test Strategy

The narrative test organization follows the project's overall [[test-organization|Test Organization]] guidelines while providing specific patterns tailored to the complexity of the narrative reducer.

The modular approach used for narrative tests can serve as a model for organizing other complex reducer tests, such as combat or character creation.

## See Also

- [[test-organization|Test Organization]]
- [[narrative-hook-testing|Narrative Hook Testing]]
- [[testing-guide|Testing Guide]]
- [[state-test-utils|State Test Utilities]]
