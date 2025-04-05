# BootHill GM Testing Guide

This directory contains tests for the BootHill GM application. The tests are organized by component, hook, or utility function to maintain a clear structure and improve maintainability.

## Test Organization

Tests are organized into subdirectories based on the type of module being tested:

```
/app/__tests__/
  /components/       # Tests for React components
  /hooks/            # Tests for React hooks
  # /utils/          # DEPRECATED: Utilities moved to /app/test/utils
  /context/          # Tests for React context providers
  /reducers/         # Tests for Redux reducers
  /integration/      # Integration tests that span multiple components

/app/test/utils/     # Central location for shared test utilities
  index.ts           # Exports all utilities
  ...                # Specific utility files
```

Each test file should follow the naming convention of `[moduleName].test.tsx` for React components and `.test.ts` for non-React modules.

## Testing Patterns

### Component Testing

Components are tested using React Testing Library with a focus on user interactions and component behavior rather than implementation details. This is similar to how in Drupal you would test that a theme renders the expected markup rather than testing the preprocessing functions directly.

```tsx
// Example component test
import { render, screen } from '@testing-library/react';
import { Button } from '../../components/Button';

describe('Button Component', () => {
  test('renders with correct text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });
});
```

### Hook Testing

Hooks are tested using a component-based approach rather than directly testing the hook. This ensures the hook is tested in the same environment in which it will be used.

```tsx
// Example hook test
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
  expect(screen.getByTestId('count').textContent).toBe('0');
  fireEvent.click(screen.getByTestId('increment'));
  expect(screen.getByTestId('count').textContent).toBe('1');
});
```

### Mock Patterns

We use proper TypeScript typing for our mocks to ensure type safety:

```tsx
// Bad: Untyped mocks
(GameStorage.getCharacter as jest.Mock).mockImplementation();

// Good: Properly typed mocks
(GameStorage as jest.Mocked<typeof GameStorage>).getCharacter.mockImplementation();
```

### Jest Hoisting Pattern

To avoid issues with Jest hoisting, always declare mocks before using them:

```tsx
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

## Test Utilities

We provide several utility functions to help with testing:

### Game State Test Utilities (Located in `/app/test/utils/`)

The `gameStateTestUtils.ts` file (exported via `/app/test/utils/index.ts`) contains utilities for testing with game state:

- `createMockGameState()`: Creates a complete game state object with optional overrides
- `createMockCharacterState()`: Creates a game state with a mock character
- `setupGameStorageMocks()`: Configures standard mock implementations for GameStorage
- `renderWithGameProvider()`: Renders components within the GameStateProvider

### Testing with Providers

When testing components that rely on context providers, use the `renderWithGameProvider` utility:

```tsx
import { gameStateUtils } from '../../test/utils'; // Import via index

// Or direct import: import { renderWithGameProvider } from '../../test/utils/gameStateTestUtils';

test('component renders with state', () => {
  const mockState = createMockGameState({
    // state overrides...
  });
  
  gameStateUtils.renderWithGameProvider(<YourComponent />, mockState);
  
  // assertions...
});
```

## Best Practices

1. **Test behavior, not implementation**: Focus on testing what the component does, not how it does it.

2. **Use data-testid attributes**: Prefer using `data-testid` over other selectors for more resilient tests.

3. **Make tests readable**: Write tests that clearly describe the behavior being tested.

4. **Isolate tests**: Each test should be independent of others, with proper setup and teardown.

5. **Mock external dependencies**: Use Jest's mocking capabilities to isolate the code being tested.

6. **Test edge cases**: Include tests for null values, empty arrays, error conditions, etc.

7. **Use proper typing**: Always use TypeScript interfaces and type assertions for mocks.

## Quick Reference

### Setup/Teardown Pattern

```tsx
describe('YourComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });
  
  afterEach(() => {
    // Clean up if needed
  });
  
  test('your test case', () => {
    // Your test
  });
});
```

### Common Assertions

```tsx
// Checking for elements
expect(screen.getByText('Hello')).toBeInTheDocument();
expect(screen.getByRole('button')).toBeDisabled();

// Checking for calls
expect(mockFunction).toHaveBeenCalled();
expect(mockFunction).toHaveBeenCalledWith('argument');

// Checking for state
expect(result.current.value).toBe('expected value');
```

## Contributing

When adding new tests, please follow these patterns to maintain consistency across the test suite. If you find yourself writing duplicate test setup code, consider extracting it to a shared utility function in `/app/test/utils/`.
