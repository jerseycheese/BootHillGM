---
title: Test Utilities
aliases: [Test Utils, Test Components]
tags: [development, testing, utilities, components]
created: 2025-04-05
updated: 2025-04-05
---

# Test Utilities

This directory contains reusable test utilities, mocks, and components that can be used across the Boot Hill GM test suite.

## Directory Structure

- `/components` - Reusable test components for testing React components and hooks
- `/utils` - Testing utilities, mocks, and helper functions

## Available Utilities

### Mock Local Storage

The `mockLocalStorage.ts` file provides a complete mock implementation of the browser's localStorage API for testing.

```typescript
import { setupLocalStorageMock, resetLocalStorageMock } from '../test/utils/mockLocalStorage';

// In your test setup
beforeAll(() => {
  setupLocalStorageMock();
});

beforeEach(() => {
  resetLocalStorageMock();
});

// In your tests
test('saves to localStorage', () => {
  // Your test...
  expect(mockLocalStorage.setItem).toHaveBeenCalledWith('key', 'value');
});
```

### Narrative Provider Mocks

The `narrativeProviderMocks.ts` file provides mocks for testing components that use the NarrativeProvider.

```typescript
import { 
  mockUseNarrative, 
  setupNarrativeProviderMocks,
  createMockNarrativeContext
} from '../test/utils/narrativeProviderMocks';

// Setup mocks once before all tests
setupNarrativeProviderMocks();

// Configure the mock for a specific test
test('handles narrative state', () => {
  mockUseNarrative.mockReturnValue({
    state: {
      narrative: {
        narrativeHistory: ['Test history item'],
        error: null
      }
    },
    dispatch: jest.fn()
  });
  
  // Your test...
});
```

### Narrative Test Components

The `narrativeTestComponents.tsx` file provides reusable components for testing the NarrativeProvider.

```typescript
import { NarrativeTestComponent, ErrorTestComponent } from '../test/components/narrativeTestComponents';

test('dispatches actions', () => {
  render(
    <NarrativeProvider>
      <NarrativeTestComponent 
        actionType="ADD_NARRATIVE_HISTORY"
        actionPayload="Test narrative"
      />
    </NarrativeProvider>
  );
  
  // Click the action button
  act(() => {
    screen.getByTestId('action-button').click();
  });
  
  // Assert that the dispatch was called with the correct action
});
```

## Best Practices

1. **Reset Between Tests** - Always reset mocks between tests to ensure test isolation
2. **Minimal Setup** - Use the minimal mock setup necessary for your test
3. **Type Safety** - Take advantage of the provided types and interfaces
4. **Consistent Patterns** - Use these utilities consistently to create a standard testing pattern

## Related Documents
- [[coding-naming-conventions|Coding Naming Conventions]]
- [[testing-strategy|Testing Strategy]]
