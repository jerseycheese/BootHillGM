---
title: Test Organization
aliases: [Test Folder Structure, Test File Organization]
tags: [technical, testing, organization, structure, jest]
created: 2025-03-22
updated: 2025-04-04
---

# Test Organization

## Overview

This guide explains the folder structure and organization patterns for tests in the BootHillGM project. A well-organized test structure makes tests easier to find, maintain, and run.

## Test Folder Structure

The BootHillGM project follows a structured approach to organizing test files. Shared test utilities have been consolidated into `app/test/utils/`.

```
BootHillGMApp/
├── app/
│   ├── __tests__/                  # Main test directory for app-level tests
│   │   ├── components/             # Tests for components (e.g., Common/, Debug/)
│   │   │   └── __snapshots__/      # Snapshot files
│   │   ├── hooks/                  # Tests for custom hooks
│   │   ├── context/                # Tests for context providers
│   │   ├── services/               # Tests for services (e.g., ai/)
│   │   ├── reducers/               # Tests for reducers
│   │   # ├── utils/                # DEPRECATED - Utilities moved to app/test/utils
│   │   └── integration/            # Integration tests
│   │
│   ├── test/                       # NEW: Central location for shared test utilities
│   │   ├── utils/
│   │   │   ├── index.ts            # Exports all utilities
│   │   │   ├── gameStateTestUtils.ts # Utilities for GameState
│   │   │   ├── testWrappers.tsx    # Rendering wrappers (e.g., renderWithGameProvider)
│   │   │   ├── localStorageMock.ts # Mock localStorage
│   │   │   ├── narrativeProviderMock.tsx # Mock NarrativeProvider
│   │   │   └── ...                 # Other specific utilities
│   │
│   ├── components/                 # Component source files
│   │   ├── Common/                 # Shared components
│   │   │   ├── __tests__/          # Co-located tests (alternative approach)
│   │   │   └── ...                 # Component files
│   │   └── ...                     # Other component directories
│   ├── context/                    # Context providers
│   │   ├── __tests__/              # Co-located context tests
│   │   └── ...                     # Context files
│   └── ...                         # Other app directories
│
├── Docs/                           # Project documentation
├── ...                             # Other project root files/dirs

# Note: The root /test directory shown previously might be outdated or used for different purposes.
# The primary location for app-specific test utilities is now /app/test/utils/.
```

## Visual Test Structure

```mermaid
graph TD
    A[BootHillGMApp] --> B[app]
    
    B --> D[__tests__]
    B --> E[components]
    B --> F[context]
    B --> G[hooks]
    B --> H[services]
    B --> ATU[test/utils]  # New central utility location within app

    D --> I[components]
    D --> J[hooks]
    D --> K[context]
    D --> L[services]
    D --> M[reducers]
    # D --> N[utils] # Deprecated
    D --> O[integration]
    
    E --> P[Common]
    E --> Q[Debug]
    E --> R[...]
    
    P --> S[__tests__] # Co-located tests example
    
    ATU --> AA[index.ts]
    ATU --> AB[gameStateTestUtils.ts]
    ATU --> AC[testWrappers.tsx]
    ATU --> AD[...] # Other utilities

    I --> X[Common]
    I --> Y[Debug]
    I --> Z[__snapshots__]

    subgraph Legend
        direction LR
        LEG1(Source Code Dirs)
        LEG2(Test Dirs)
        LEG3(Utility Dirs)
    end
    
    style D fill:#f9f,stroke:#333,stroke-width:2px
    style I fill:#f9f,stroke:#333,stroke-width:1px
    style J fill:#f9f,stroke:#333,stroke-width:1px
    style K fill:#f9f,stroke:#333,stroke-width:1px
    style L fill:#f9f,stroke:#333,stroke-width:1px
    style M fill:#f9f,stroke:#333,stroke-width:1px
    style O fill:#f9f,stroke:#333,stroke-width:1px
    style S fill:#f9f,stroke:#333,stroke-width:1px
    style Z fill:#f9f,stroke:#333,stroke-width:1px
    
    style ATU fill:#ccf,stroke:#333,stroke-width:2px
    style AA fill:#ccf,stroke:#333,stroke-width:1px
    style AB fill:#ccf,stroke:#333,stroke-width:1px
    style AC fill:#ccf,stroke:#333,stroke-width:1px
    style AD fill:#ccf,stroke:#333,stroke-width:1px

```

## Naming Conventions

### Test File Naming

The BootHillGM project uses consistent naming patterns for test files:

1. **Component Tests**: `ComponentName.test.tsx`
2. **Hook Tests**: `useHookName.test.tsx` (note: using .tsx for component-based hook testing)
3. **Utility Tests**: `utilityName.test.ts`
4. **Integration Tests**: `FeatureName.test.tsx`
5. **Snapshot Tests**: `ComponentName.snap.test.tsx`

### Test Group Naming

Use descriptive group names in `describe` blocks:

```typescript
// Component test
describe('Button component', () => {
  // Tests...
});

// Hook test
describe('useCounter hook', () => {
  // Tests...
});

// Integration test
describe('Inventory and Equipment Integration', () => {
  // Tests...
});
```

### Test Case Naming

Test case names should clearly describe what they're testing:

```typescript
// ❌ Bad: Vague test names
it('works correctly', () => {});
it('handles the case', () => {});

// ✅ Good: Descriptive test names
it('renders with default props', () => {});
it('increments counter when plus button is clicked', () => {});
it('shows error message for invalid inputs', () => {});
```

## Test Organization Patterns

### 1. Group by Feature

When testing complex features, group related tests together:

```typescript
describe('Character Creation', () => {
  describe('Name Input', () => {
    it('accepts valid character names', () => {});
    it('shows error for names that are too short', () => {});
    it('shows error for reserved names', () => {});
  });
  
  describe('Attribute Allocation', () => {
    it('allows increasing attributes up to maximum points', () => {});
    it('prevents decreasing attributes below minimum value', () => {});
    it('calculates remaining points correctly', () => {});
  });
  
  describe('Form Submission', () => {
    it('requires all mandatory fields before submitting', () => {});
    it('sends character data in the correct format', () => {});
    it('shows success message after successful submission', () => {});
  });
});
```

### 2. Setup and Teardown

Use `beforeEach`, `afterEach`, `beforeAll`, and `afterAll` to organize test setup and cleanup:

```typescript
describe('GameProvider', () => {
  // Setup before all tests
  beforeAll(() => {
    jest.useFakeTimers();
  });
  
  // Setup before each test
  beforeEach(() => {
    // Reset mocks or state
    localStorage.clear();
    mockApi.reset();
  });
  
  // Cleanup after each test
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  // Cleanup after all tests
  afterAll(() => {
    jest.useRealTimers();
  });
  
  // Tests...
});
```

### 3. Test Fixtures

Store reusable test data in fixture files:

```typescript
// test/fixtures/characters.ts
export const mockCharacters = {
  gunslinger: {
    id: 'char1',
    name: 'Quick Draw McGraw',
    profession: 'Gunslinger',
    level: 5,
    health: 85,
    maxHealth: 100,
    attributes: {
      strength: 10,
      dexterity: 16,
      constitution: 12,
      intelligence: 8,
      wisdom: 10,
      charisma: 14
    },
    inventory: ['pistol', 'rifle', 'bandana']
  },
  // More character fixtures...
};

// Usage in test
import { mockCharacters } from '../../../test/fixtures/characters';

it('renders character details correctly', () => {
  render(<CharacterSheet character={mockCharacters.gunslinger} />);
  // Test assertions...
});
```

### 4. Component-Based Hook Testing

Rather than testing hooks directly, create a test component that uses the hook:

```typescript
// Creating a test component for hook testing
function TestComponent({ initialValue = 0 }) {
  const { count, increment } = useCounter(initialValue);
  
  return (
    <div data-testid="counter">
      <span data-testid="count">{count}</span>
      <button data-testid="increment" onClick={increment}>Increment</button>
    </div>
  );
}

test('useCounter increments count', () => {
  render(<TestComponent />);
  
  // Test the hook's behavior through the component
  expect(screen.getByTestId('count').textContent).toBe('0');
  fireEvent.click(screen.getByTestId('increment'));
  expect(screen.getByTestId('count').textContent).toBe('1');
});
```

### 5. Test Utilities

Create utility functions for common testing patterns:

```typescript
// app/test/utils/gameStateTestUtils.ts (Note the updated path)
import { GameState } from '../../types/gameState';
import { initialState } from '../../types/initialState';

/**
 * Creates a mock GameState object with default values that can be overridden
 * 
 * @param overrides - Partial GameState with values to override defaults
 * @returns Complete GameState object suitable for testing
 */
export const createMockGameState = (overrides: Partial<GameState> = {}): GameState => ({
  ...initialState,
  ...overrides
});

// Usage in test
import { gameStateUtils } from '../../test/utils'; // Import via index

it('renders player stats correctly', () => {
  const mockState = gameStateUtils.createMockGameState({ // Use namespaced utility
    character: {
      player: {
        id: 'test-player',
        name: 'Test Character',
        // Other required properties...
      },
      opponent: null
    }
  });
  
  gameStateUtils.renderWithGameProvider(<PlayerStats />, mockState); // Use namespaced utility
  expect(screen.getByText('Test Character')).toBeInTheDocument();
});
```

## Organizational Best Practices

### 1. Collocate Related Tests

Tests should be organized logically based on what they're testing:

```
components/Button/
├── Button.tsx
├── Button.module.css
└── __tests__/
    ├── Button.test.tsx
    └── Button.snap.test.tsx
```

### 2. Separate Test Types

Separate integration tests from unit tests:

```
__tests__/
├── components/    # Unit tests for components
├── hooks/         # Unit tests for hooks
# ├── utils/       # DEPRECATED - Utilities moved to app/test/utils
└── integration/   # Cross-component integration tests
```

### 3. Centralize Test Utilities

Keep shared test utilities centralized in `app/test/utils/` for reuse:

```
app/test/
└── utils/             # Shared test utilities
    ├── index.ts
    ├── gameStateTestUtils.ts
    ├── testWrappers.tsx
    └── ...
```
(Note: A root `/test` directory might exist for other purposes like fixtures or global setup, but app-specific utilities reside in `app/test/utils/`)

### 4. Group by Component Type

For larger applications, group tests by component type:

```
__tests__/
├── components/
│   ├── UI/          # Tests for UI components
│   ├── Forms/       # Tests for form components
│   └── Layout/      # Tests for layout components
├── pages/           # Tests for page components
└── features/        # Tests for feature components
```

## Jest Hoisting Pattern

To avoid issues with Jest hoisting, always declare mocks before using them:

```typescript
// Correct pattern
jest.mock('../../utils/gameStorage', () => ({
  getCharacter: jest.fn(),
  // other methods...
}));

// After mocking, then get a reference for use in tests
const mockGameStorage = GameStorage as jest.Mocked<typeof GameStorage>;

// Now configure mock implementations in your tests
beforeEach(() => {
  mockGameStorage.getCharacter.mockReturnValue({
    // return values...
  });
});
```

## Creating New Tests

When adding new tests to the BootHillGM project, follow these steps:

1. **Choose the Right Location**: Determine where the test file should go based on what it's testing
2. **Follow Naming Conventions**: Use consistent file and test case naming
3. **Reuse Test Utilities**: Import utilities from `app/test/utils/index.ts`
4. **Be Consistent**: Follow the patterns established in similar tests

### Example: Adding a New Component Test

```typescript
// app/__tests__/components/Dialog.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Dialog from '../../components/Dialog';

describe('Dialog component', () => {
  it('renders with title and content', () => {
    render(
      <Dialog 
        title="Confirmation" 
        isOpen={true}
        onClose={() => {}}
      >
        <p>Are you sure?</p>
      </Dialog>
    );
    
    expect(screen.getByText('Confirmation')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });
  
  it('calls onClose when close button is clicked', () => {
    const handleClose = jest.fn();
    render(
      <Dialog 
        title="Confirmation" 
        isOpen={true}
        onClose={handleClose}
      >
        <p>Are you sure?</p>
      </Dialog>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
  
  it('is not rendered when isOpen is false', () => {
    render(
      <Dialog 
        title="Confirmation" 
        isOpen={false}
        onClose={() => {}}
      >
        <p>Are you sure?</p>
      </Dialog>
    );
    
    expect(screen.queryByText('Confirmation')).not.toBeInTheDocument();
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
  });
});
```

### Example: Adding a New Hook Test

```typescript
// app/__tests__/hooks/useInventory.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useInventory } from '../../hooks/useInventory';

// Create a test component that uses the hook
function TestComponent({ initialItems = [] }) {
  const { items, addItem, removeItem } = useInventory(initialItems);
  
  return (
    <div data-testid="inventory">
      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.name}
            <button
              onClick={() => removeItem(item.id)}
              data-testid={`remove-${item.id}`}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={() => addItem({ id: 'test-item', name: 'Test Item' })}
        data-testid="add-item"
      >
        Add Item
      </button>
    </div>
  );
}

describe('useInventory hook', () => {
  it('initializes with provided items', () => {
    const initialItems = [
      { id: 'item-1', name: 'First Item' },
      { id: 'item-2', name: 'Second Item' }
    ];
    
    render(<TestComponent initialItems={initialItems} />);
    
    expect(screen.getByText('First Item')).toBeInTheDocument();
    expect(screen.getByText('Second Item')).toBeInTheDocument();
  });
  
  it('adds items correctly', () => {
    render(<TestComponent />);
    
    // Initially no items
    expect(screen.queryByText('Test Item')).not.toBeInTheDocument();
    
    // Add an item
    fireEvent.click(screen.getByTestId('add-item'));
    
    // Item should now be in the list
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });
  
  it('removes items correctly', () => {
    const initialItems = [
      { id: 'item-1', name: 'Item to Remove' }
    ];
    
    render(<TestComponent initialItems={initialItems} />);
    
    // Item should initially be in the list
    expect(screen.getByText('Item to Remove')).toBeInTheDocument();
    
    // Remove the item
    fireEvent.click(screen.getByTestId('remove-item-1'));
    
    // Item should no longer be in the list
    expect(screen.queryByText('Item to Remove')).not.toBeInTheDocument();
  });
});
```

## Running Tests Effectively

### Filtering Tests by Location

Run tests from specific directories:

```bash
# Run all component tests
npm test -- app/__tests__/components

# Run tests for a specific component type
npm test -- app/__tests__/components/Common
```

### Filtering Tests by Pattern

Run tests matching specific patterns:

```bash
# Run all Button tests
npm test -- Button

# Run tests with "renders" in the description
npm test -- -t "renders"
```

### Running Only Changed Tests

Run tests related to changed files:

```bash
# Run tests only for changed files
npm test -- --onlyChanged
```

## Test Organization Anti-Patterns

### Avoid These Common Mistakes

1. **Inconsistent naming**: Mixing different naming conventions makes tests harder to find
2. **Deeply nested tests**: Too much nesting can make test output hard to read and debug
3. **Duplicated test utilities**: Reusing code reduces maintenance burden
4. **Unrelated assertions**: Each test should focus on testing one specific behavior
5. **Missing TypeScript**: Using proper TypeScript types in tests helps catch errors early
6. **Improper Jest mocking**: Incorrect mock setup can lead to hoisting issues and test failures

## Related Documentation

- [[component-testing|Component Testing]]
- [[component-based-hook-testing|Component-Based Hook Testing]]
- [[hook-testing|Hook Testing]]
- [[integration-testing|Integration Testing]]
- [[snapshot-testing|Snapshot Testing]]
- [[testing-guide|Testing Guide Overview]]
