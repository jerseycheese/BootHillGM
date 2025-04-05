# Component-Based Hook Testing

This guide explains the component-based approach to testing React hooks in the BootHill GM application.

## Overview

React hooks can be challenging to test in isolation because they're designed to work within the React component lifecycle. Instead of testing hooks directly, we use a component-based testing approach that:

1. Creates a simple test component that uses the hook
2. Renders the test component using React Testing Library
3. Asserts on the behavior and output of the hook through the component

This is conceptually similar to how in Drupal you might test a preprocess function by rendering a template and checking the output, rather than testing the function directly.

## Basic Implementation

### Step 1: Create a Test Component

```tsx
// Example for testing useCampaignStateRestoration hook
function TestComponent({ 
  isInitializing = false, 
  savedStateJSON = null 
}: TestComponentProps) {
  const result = useCampaignStateRestoration({
    isInitializing,
    savedStateJSON
  });
  
  // Render the result as a data attribute so we can check it
  return (
    <div data-testid="test-component" data-result={JSON.stringify(result)}>
      {result.isClient ? 'Client Ready' : 'Not Ready'}
    </div>
  );
}
```

### Step 2: Test the Hook Through the Component

```tsx
test('initializes new game state correctly', () => {
  const { getByTestId } = render(<TestComponent isInitializing={true} />);
  const element = getByTestId('test-component');
  const result = JSON.parse(element.getAttribute('data-result') || '{}') as GameState;
  
  expect(result.isClient).toBe(true);
  expect(result.character).toBeDefined();
  // More assertions...
});
```

## Advantages

1. **Real Component Lifecycle**: Tests hook behavior in the same environment it will be used
2. **Complete Testing**: Tests both the hook's state management and its effects
3. **Type Safety**: Maintains TypeScript typing throughout the test
4. **Edge Case Testing**: Easy to test different input parameters and conditions

## When to Use This Pattern

Use component-based hook testing when:

- The hook manages complex state
- The hook has side effects like API calls or localStorage access
- The hook interacts with other React features (context, refs, etc.)
- You need to test how the hook behaves during component lifecycle events

## Example: Testing State Restoration Hook

```tsx
describe('useCampaignStateRestoration Hook', () => {
  test('restores from savedStateJSON when available', () => {
    const mockSavedState = {
      character: {
        player: {
          id: 'saved-player',
          name: 'Saved Character',
          // Other properties...
        },
        opponent: null
      },
      narrative: {
        narrativeHistory: ['Saved narrative text']
      }
    };
    
    const { getByTestId } = render(
      <TestComponent savedStateJSON={JSON.stringify(mockSavedState)} />
    );
    const element = getByTestId('test-component');
    const result = JSON.parse(element.getAttribute('data-result') || '{}') as GameState;
    
    expect(result.character?.player?.name).toBe('Saved Character');
    expect(result.narrative.narrativeHistory[0]).toBe('Saved narrative text');
  });
  
  test('recovers from corrupted savedStateJSON', () => {
    // Test hook's error handling with invalid JSON
    const { getByTestId } = render(
      <TestComponent savedStateJSON="invalid json{{" />
    );
    const element = getByTestId('test-component');
    const result = JSON.parse(element.getAttribute('data-result') || '{}') as GameState;
    
    expect(result.isClient).toBe(true);
    // Verify fallback behavior was used
  });
});
```

## Comparison to renderHook

React Testing Library provides a `renderHook` utility, but our component-based approach offers some advantages:

1. It's closer to how the hook will actually be used in the application
2. It makes it easier to test complex hook interactions with components
3. It allows testing hooks that rely on being within a component context

For very simple hooks, you can use `renderHook`, but for hooks that manage game state or interact with the application context, the component-based approach is recommended.

## Best Practices

1. Keep test components simple and focused only on the hook being tested
2. Use data attributes to expose hook state for testing
3. Test all reasonable input combinations and edge cases
4. Mock external dependencies like API calls or localStorage
5. Test error handling and recovery paths

By using this component-based testing approach, we ensure our hooks are thoroughly tested in an environment that closely mirrors their actual usage.
