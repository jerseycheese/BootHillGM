---
title: State Testing Utilities
aliases: [Test State Utils, State Test Helpers]
tags: [testing, state-management, utilities, test-helpers]
created: 2025-03-28
updated: 2025-03-29
---

# State Testing Utilities

## Overview

The State Testing Utilities provide tools for creating, manipulating, and validating state objects in test scenarios. These utilities help maintain backward compatibility with legacy state formats while ensuring proper state shape for testing reducers, selectors, and components.

## Component Structure

The state testing utilities have been organized into modular components:

```
/app/test/utils/stateTestUtils/
├── adapters.ts           # State conversion and format adaptation
├── baseMockState.ts      # Default empty state template
├── characterMockState.ts # Character-related mock state
├── combatMockState.ts    # Combat-related mock state
├── index.ts              # Core utilities and exports
├── inventoryMockState.ts # Inventory-related mock state
├── jestMatchers.ts       # Custom Jest matchers
├── journalMockState.ts   # Journal-related mock state 
├── mockStates.ts         # Central export for mock states
├── narrativeMockState.ts # Narrative-related mock state
├── stateMockFactory.ts   # Factory for creating mock states
└── types.ts              # Type definitions and interfaces
```

### Entry Point

The main entry point is `/app/test/utils/stateTestUtils.ts`, which re-exports everything from the module directory.

## Primary Utilities

### State Preparation

```typescript
// Prepare a state object for testing
const prepareStateForTesting = (state: Partial<GameState>): GameState
```

This utility normalizes a state object and applies adapters for test compatibility:
- Converts from legacy formats to the current state structure
- Applies backward compatibility adapters
- Ensures proper array indexing for inventory and journal items

### Reducer Testing

```typescript
// Apply a reducer with proper state adaptation
const applyReducerForTesting = (
  reducer: StateReducer,
  state: Partial<GameState>,
  action: GameEngineAction
): Partial<GameState>
```

This utility simplifies testing reducers by handling state format conversions:
- Adapts the input state based on the action type
- Applies special handling for inventory and journal reducers
- Applies the reducer with the prepared state
- Post-processes the result for test compatibility

### Test Reducer Creation

```typescript
// Create a wrapped reducer that handles adapters automatically
const createTestReducer = <T extends Partial<GameState>>(
  reducer: (state: T, action: GameEngineAction) => T
) => (state: T, action: GameEngineAction): T
```

This utility creates a wrapped reducer function that automatically:
- Ensures input state is in the new format
- Applies the original reducer
- Adapts the result for backward compatibility

## Mock States

The `mockStates` object provides factory functions for common test scenarios:

```typescript
mockStates.basic()          // Empty base state
mockStates.withCharacter()  // State with player character
mockStates.withCombat()     // Active combat state
mockStates.withInventory()  // State with inventory items 
mockStates.withJournal()    // State with journal entries
mockStates.withNarrative()  // State with narrative context
```

Each factory function creates a properly formatted state object with all required properties.

### Creating Custom Mock States

The modular structure makes it easy to create custom mock states:

```typescript
// Create a custom mock state in a new file
import { BaseMockState } from './types';
import { createBasicMockState } from './baseMockState';

export function createCustomMockState(): BaseMockState {
  const baseState = createBasicMockState();
  
  return {
    ...baseState,
    // Customize properties as needed
    currentPlayer: 'custom1',
    quests: ['quest1', 'quest2'],
    // Add other customizations
  };
}

// Then add it to mockStates.ts
import { createCustomMockState } from './customMockState';

export const mockStates = {
  // Existing mock states...
  
  /**
   * Custom mock state for specific testing scenarios
   */
  withCustomData: () => createMockState(createCustomMockState())
};
```

## Custom Jest Matchers

```typescript
expect(state).toHaveItems(3);           // Check inventory item count
expect(state).toHaveJournalEntries(2);  // Check journal entry count
expect(state).toHaveCombatActive();     // Check if combat is active
```

These custom matchers provide readable assertion syntax for state testing.

## Usage Examples

### Basic State Creation

```typescript
import { mockStates } from 'app/test/utils/stateTestUtils';

test('renders character name', () => {
  // Create a test state with a character
  const state = mockStates.withCharacter();
  
  // Use the state in your test
  render(<CharacterDisplay state={state} />);
  expect(screen.getByText('Test Character')).toBeInTheDocument();
});
```

### Testing a Reducer

```typescript
import { 
  applyReducerForTesting, 
  mockStates 
} from 'app/test/utils/stateTestUtils';
import { inventoryReducer } from 'app/reducers/inventoryReducer';

test('adds item to inventory', () => {
  // Create initial state
  const initialState = mockStates.withInventory();
  
  // Define test action
  const action = { 
    type: 'inventory/ADD_ITEM', 
    payload: { 
      id: 'item4', 
      name: 'Gold Nugget', 
      category: 'valuable', 
      quantity: 1 
    } 
  };
  
  // Apply the reducer with state adaptation
  const newState = applyReducerForTesting(inventoryReducer, initialState, action);
  
  // Assert using custom matcher
  expect(newState).toHaveItems(4);
});
```

### Creating a Test Reducer

```typescript
import { createTestReducer } from 'app/test/utils/stateTestUtils';
import { journalReducer } from 'app/reducers/journalReducer';

// Create a reducer that automatically handles state adapters
const testJournalReducer = createTestReducer(journalReducer);

test('adds journal entry', () => {
  const initialState = { journal: { entries: [] } };
  const action = { 
    type: 'journal/ADD_ENTRY', 
    payload: { content: 'Test entry', type: 'narrative' } 
  };
  
  // Use the wrapped reducer directly
  const newState = testJournalReducer(initialState, action);
  
  // The result includes legacy format compatibility
  expect(newState.journal.entries.length).toBe(1);
  expect(newState.entries.length).toBe(1); // Legacy format
});
```

## Related Documentation

- [[testing-guide|Testing Guide]] - General testing approach
- [[state-management|State Management System]] - State architecture overview
- [[testing-workflow|Testing Workflow]] - Recommended testing process

## Tags
#testing #state-management #utilities #test-helpers