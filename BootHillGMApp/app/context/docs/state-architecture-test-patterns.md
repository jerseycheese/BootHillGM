# State Architecture Test Patterns

This document outlines the test patterns and best practices for working with the new state architecture in tests.

## Overview

The new state architecture uses domain-specific slices, which requires some adjustments to how we write tests. This document provides patterns and examples for testing with the new state structure.

## Key Test Utilities

The following utilities help with testing components and functions that use the state:

1. `prepareStateForTesting`: Prepares a partial state object for testing by adding missing slices and adapting it for backward compatibility
2. `applyReducerForTesting`: Applies a reducer to a state object and adapts the result for testing
3. `mockStates`: A collection of pre-configured state objects for common test scenarios
4. `adaptStateForTests`: Adapts a state object for backward compatibility in tests

## Test Patterns

### Pattern 1: Property Extraction for State Comparison

When testing state transformations, extract only the relevant properties for comparison:

```typescript
test('should apply migration to narrative state', () => {
  const migratedState = migrateGameState(oldState);
  
  // Extract only the expected properties for comparison
  const actualNarrativeState = {
    currentStoryPoint: migratedState.narrative.currentStoryPoint,
    visitedPoints: migratedState.narrative.visitedPoints,
    availableChoices: migratedState.narrative.availableChoices,
    narrativeHistory: migratedState.narrative.narrativeHistory,
    displayMode: migratedState.narrative.displayMode,
    error: migratedState.narrative.error
  };
  
  expect(actualNarrativeState).toEqual(expectedNarrativeState);
});
```

### Pattern 2: Using State Utilities for Test Setup

Use the provided test utilities to prepare state objects:

```typescript
test('should add item to inventory', () => {
  // Create a test state with inventory items
  const testState = prepareStateForTesting({
    inventory: {
      items: [
        { id: '1', name: 'Revolver', description: 'Test weapon', quantity: 1, category: 'weapon' }
      ]
    }
  });
  
  // Create action to add an item
  const action = {
    type: 'ADD_ITEM',
    payload: {
      id: '2',
      name: 'Bandage',
      description: 'Medical item',
      quantity: 1,
      category: 'medical'
    }
  };
  
  // Apply reducer
  const newState = applyReducerForTesting(inventoryReducer, testState, action);
  
  // Test the result
  expect(newState.inventory.items.length).toBe(2);
  expect(newState.inventory.items[1].name).toBe('Bandage');
});
```

### Pattern 3: Using Mock States for Common Scenarios

Use pre-configured mock states for common test scenarios:

```typescript
test('should handle combat actions', () => {
  // Use a mock state with combat already set up
  const mockState = mockStates.withCombat();
  
  // Test combat-related functionality
  expect(mockState.combat.isActive).toBe(true);
  expect(mockState.isCombatActive).toBe(true); // Legacy property also works
});
```

### Pattern 4: Testing State Adapters

Test that state adapters properly handle both old and new state formats:

```typescript
test('should adapt state for backward compatibility', () => {
  // New format - inventory is an object with items array
  const newState = {
    inventory: {
      items: [
        { id: '1', name: 'Pistol' }
      ]
    }
  };
  
  // Adapt the state
  const adaptedState = adaptStateForTests(newState);
  
  // Test both access patterns
  expect(adaptedState.inventory.items.length).toBe(1); // New access pattern
  expect(adaptedState.inventory.length).toBe(1); // Legacy array-like access
  expect(adaptedState.inventory[0].name).toBe('Pistol'); // Legacy array indexing
});
```

### Pattern 5: Testing Selector Hooks

Tests for selector hooks use React Testing Library's `renderHook`:

```typescript
test('usePlayerHealth should return player health', () => {
  // Mock the game context with test state
  jest.spyOn(GameContext, 'useGame').mockReturnValue({
    state: prepareStateForTesting({
      character: {
        player: {
          id: 'player1',
          name: 'Test Player',
          health: 75
        }
      }
    }),
    dispatch: jest.fn()
  });
  
  // Render the hook
  const { result } = renderHook(() => usePlayerHealth());
  
  // Test the result
  expect(result.current).toBe(75);
});
```

## Common Test Scenarios

### Testing Reducers

```typescript
test('reducer should update state correctly', () => {
  // Setup initial state
  const initialState = prepareStateForTesting({
    inventory: {
      items: [
        { id: '1', name: 'Revolver', quantity: 1 }
      ]
    }
  });
  
  // Create action
  const action = {
    type: 'UPDATE_ITEM_QUANTITY',
    payload: {
      id: '1',
      quantity: 2
    }
  };
  
  // Apply reducer
  const newState = applyReducerForTesting(inventoryReducer, initialState, action);
  
  // Test the result
  expect(newState.inventory.items[0].quantity).toBe(2);
});
```

### Testing Components with State

```typescript
test('component should render based on state', () => {
  // Mock the game context
  jest.spyOn(GameContext, 'useGame').mockReturnValue({
    state: prepareStateForTesting({
      combat: {
        isActive: true,
        rounds: 3
      }
    }),
    dispatch: jest.fn()
  });
  
  // Render the component
  render(<CombatStatus />);
  
  // Test the rendering
  expect(screen.getByText('Round: 3')).toBeInTheDocument();
  expect(screen.getByText('Combat Active')).toBeInTheDocument();
});
```

### Testing State Migration

```typescript
test('should migrate state from old to new format', () => {
  // Old state format
  const oldState = {
    player: {
      id: 'player1',
      name: 'Old Player'
    },
    inventory: [
      { id: '1', name: 'Old Item' }
    ],
    isCombatActive: true
  };
  
  // Apply migration
  const migratedState = migrateGameState(oldState);
  
  // Test the result with detailed property checks
  expect(migratedState.character.player.id).toBe('player1');
  expect(migratedState.inventory.items[0].name).toBe('Old Item');
  expect(migratedState.combat.isActive).toBe(true);
  
  // Legacy properties still work
  expect(migratedState.player.id).toBe('player1');
  expect(migratedState.inventory[0].name).toBe('Old Item');
  expect(migratedState.isCombatActive).toBe(true);
});
```

## Best Practices

1. **Focus on behavior, not implementation**: Test what the state does, not how it's structured
2. **Use property extraction**: Compare only relevant properties instead of entire state objects
3. **Test both access patterns**: Ensure both new and legacy access patterns work
4. **Be explicit about types**: Use proper TypeScript types in tests
5. **Use test utilities**: Take advantage of the provided test utilities for common scenarios
6. **Mock at the right level**: Mock the game context, not individual hooks
7. **Test edge cases**: Test with null or missing values to ensure robustness

## Conclusion

Following these test patterns will ensure that your tests work correctly with the new state architecture while maintaining backward compatibility with existing code.
