# Testing Patterns in Boot Hill GM

This document outlines the testing patterns and best practices used in Boot Hill GM, particularly for React hooks and game logic components.

## Table of Contents

- [Test Organization](#test-organization)
- [Mocking Approach](#mocking-approach)
- [Testing React Hooks](#testing-react-hooks)
- [Error Testing](#error-testing)
- [Test Utilities](#test-utilities)

## Test Organization

We follow a modular approach to test organization, similar to how React components are structured:

### Directory Structure

```
__tests__/
├── hooks/
│   └── [feature]/
│       ├── __mocks__/         # Mock data and utilities
│       ├── helpers/           # Test helper functions
│       ├── [feature].test.ts  # Main test file
│       └── sub-tests/         # Component test files
└── ...
```

### Master Test File

Each feature has a master test file that serves as an entry point and configures the test environment. This is similar to how you might have a main template file in Drupal that imports other components.

```typescript
/**
 * Master test file for [feature] functionality
 */
import { setupMocks } from '../../setup/mockSetup';
import './test-setup'; // Configure shared mocks

describe('[Feature] Tests', () => {
  // Basic test to ensure the file is recognized
  it('should load test environment', () => {
    expect(true).toBe(true);
  });
});

// Each test file runs independently to avoid interdependencies
```

### Component Test Files

Each aspect of functionality gets its own test file, focusing on a specific behavior:

- `combatFlow.test.ts` - Tests basic flow
- `multipleRounds.test.ts` - Tests handling multiple rounds
- `knockout.test.ts` - Tests knockout scenarios
- `errorHandling.test.ts` - Tests error handling

## Mocking Approach

We use Jest's module mocking system to create controlled test environments:

### Centralized Mock Setup

Create a `test-setup.ts` file that configures all required mocks:

```typescript
// Configure mocks for all test files
jest.mock('../../../hooks/combat/useBrawlingActions');
jest.mock('../../../utils/brawlingSystem');

// Export mocked modules for consistent access
export const mocks = {
  useBrawlingActions: useBrawlingActions as jest.Mock,
  resolveBrawlingRound: resolveBrawlingRound as jest.Mock
};
```

### Mock Implementation

When testing hooks, provide controlled implementations:

```typescript
// Mock a React hook
jest.mock('../../../hooks/useBrawlingCombat', () => ({
  useBrawlingCombat: (props) => ({
    processRound: jest.fn(),
    brawlingState: { ... },
    isProcessing: false
  })
}));
```

This is similar to how you might mock Drupal's theme functions or JavaScript libraries in a Twig template.

## Testing React Hooks

Testing hooks follows these patterns:

### Rendering and Acting

```typescript
const { result } = renderHook(() =>
  useBrawlingCombat({
    playerCharacter: mockPlayerCharacter,
    opponent: mockNPC,
    onCombatEnd: mockOnCombatEnd,
    dispatch: mockDispatch,
    initialCombatState: getDefaultState()
  })
);

// Trigger actions wrapped in act()
await act(async () => {
  await result.current.processRound(true, true);
});
```

### State Assertions

```typescript
// Check state changes
expect(result.current.brawlingState.round).toBe(2);
expect(mockRoundLog[0].type).toBe('hit');
```

## Error Testing

Testing error handling requires special patterns:

### Synchronous Errors

```typescript
// For synchronous errors
try {
  result.current.processRound(true, true);
  expect(true).toBe(false); // Force test failure if no error
} catch (error) {
  expect(error.message).toBe('Expected error message');
}
```

### Asynchronous Errors

```typescript
// For async errors
result.current.processRound.mockRejectedValueOnce(
  new Error('Expected error message')
);

await act(async () => {
  try {
    await result.current.processRound(true, true);
    throw new Error("Expected rejection didn't occur");
  } catch (error) {
    expect(error.message).toBe('Expected error message');
  }
});
```

## Test Utilities

We provide common utilities to reduce duplication:

### Mock Creation

```typescript
// Create standard mock objects
export const createLogEntry = (
  text: string, 
  type: 'hit' | 'miss' | 'info' = 'hit',
  timestamp = Date.now()
): CombatLogEntry => ({
  text, type, timestamp
});
```

### Test Helpers

```typescript
// Create repeatable test behaviors
export const addMockLogEntries = (
  mockDispatch: jest.Mock,
  mockRoundLog: CombatLogEntry[]
) => {
  // Implementation...
};
```

These utilities help create consistent test patterns across the codebase, similar to how Drupal's theme hooks provide consistent rendering patterns.
