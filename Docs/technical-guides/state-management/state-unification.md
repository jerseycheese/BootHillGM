# State Model Unification Guide

This guide explains the unified state model approach implemented in Issue #253.

## Overview

The BootHill GM App previously maintained two parallel state models:

1. **Legacy CampaignState**: A flatter structure with direct property access
2. **Domain-Specific GameState**: A more organized structure with domain-specific slices

This dual approach required complex translation logic, type guards, and special handling in selectors. Following a clean break approach, we've standardized on the **Domain-Specific GameState** model.

## Key Changes

### State Structure

The unified GameState model follows a slice-based pattern similar to Redux:

```typescript
interface GameState {
  // Domain slices
  character: CharacterState;
  combat: CombatState;
  inventory: InventoryState;
  journal: JournalState;
  narrative: NarrativeState;
  ui: UIState;
  
  // Top-level properties
  currentPlayer: string;
  npcs: string[];
  location: LocationType | null;
  quests: string[];
  gameProgress: number;
  savedTimestamp?: number;
  isClient?: boolean;
  suggestedActions: SuggestedAction[];
}
```

### Accessing State

State should now be accessed through its domain-specific slices:

```typescript
// ❌ OLD WAY (via adapters or direct root properties)
const items = state.inventory || [];
const journalEntries = state.entries || [];

// ✅ NEW WAY (via slices)
const items = state.inventory?.items || [];
const journalEntries = state.journal?.entries || [];
```

### Narrative Context Changes

The narrative state is now part of the unified GameState model, accessible via the `narrative` slice. A compatibility layer has been implemented through `NarrativeProvider` to ensure existing components can continue to function while the codebase transitions to the new pattern.

#### Accessing Narrative State

```typescript
// ❌ OLD WAY (direct properties)
const narrativeHistory = state.narrativeHistory || [];
const narrativeContext = state.narrativeContext;

// ✅ NEW WAY (via narrative slice)
const narrativeHistory = state.narrative?.narrativeHistory || [];
const narrativeContext = state.narrative?.narrativeContext;
```

#### Using Narrative Hooks

Several hooks are provided for working with narrative state:

1. **useNarrative**: Compatibility hook that works with both old and new components
2. **useNarrativeContext**: Provides decision-related functionality
3. **useNarrativeInitialization**: Handles initializing narrative state

Example usage:

```typescript
// Using the consolidated hook
import { useNarrative } from '../hooks/useNarrative';

const MyComponent = () => {
  const { state, dispatch, context, decisions } = useNarrative();
  
  // Access narrative data
  const narrativeHistory = context.narrativeHistory;
  
  // Use decision functions
  const presentDecision = () => {
    decisions.presentPlayerDecision({
      prompt: 'What will you do?',
      choices: ['Run', 'Fight', 'Hide']
    });
  };
  
  return (
    <div>
      {/* Component implementation */}
    </div>
  );
};
```

### Testing Hooks & Components

When testing hooks or components that interact with the state:

1.  **Use `renderHook` or `render`**: From `@testing-library/react`.
2.  **Provide Context**:
    *   For simple tests or hooks not needing deep state interaction, use `renderWithMockContext` (from `test/utils/testWrappers.tsx`) to provide a basic `GameState` and mock `dispatch`.
    *   For tests requiring reducer logic or complex state interactions, wrap the component/hook with `<GameStateProvider>` using `renderWithGameProvider` (from `test/utils/testWrappers.tsx`).
3.  **Create `GameState` Fixtures**: Use the slice structure (`character`, `inventory`, etc.) when creating mock state objects. Use initial state exports (e.g., `initialCombatState`) as a base.
4.  **Mock Dependencies**: Use `jest.mock` or `jest.spyOn` to mock external services (like AI) or utility functions.
5.  **Assert State Changes**: If testing reducer interactions, check the resulting state slices for expected changes.
6.  **Assert Dispatch Calls**: Use `expect(mockDispatch).toHaveBeenCalledWith(...)` to verify actions were dispatched correctly. Use `expect.objectContaining` for resilient payload checks.

```typescript
// Example using renderWithMockContext
import { renderWithMockContext } from '../test/utils/testWrappers';
import { Inventory } from '../components/Inventory';
import { createMockGameState } from '../test/utils/inventoryTestUtils';

test('renders inventory items', () => {
  const mockState = createMockGameState({
    inventory: { items: [{ id: '1', name: 'Potion', ... }] }
  });
  renderWithMockContext(<Inventory />, mockState);
  // ... assertions ...
});
```

## Best Practices

### State Creation

Use initial state objects from their respective slice files:

```typescript
import { initialCharacterState } from '../types/state/characterState';
import { initialCombatState } from '../types/state/combatState';

const mockState: GameState = {
  character: initialCharacterState,
  combat: initialCombatState,
  // ... other slices
}
```

### Resilient Tests

Write assertions that are resilient to implementation changes:

```typescript
// Resilient assertion using partial matching
expect(mockDispatch).toHaveBeenCalledWith(
  expect.objectContaining({
    type: 'SET_NARRATIVE',
    payload: expect.objectContaining({
      text: expect.stringContaining('expected text')
    })
  })
);
```

## Refactoring Checklist (Summary of Changes Made)

- [x] Replaced state adapter imports/usage with direct slice access.
- [x] Updated type definitions to use the unified `GameState`.
- [x] Updated component prop types (`CombatSystemProps`, `GameSessionProps`) and hook signatures.
- [x] Updated selectors (`useInventoryItems`, etc.) to access state via slices.
- [x] Removed state translation/adapter code (`stateAdapters.ts`, `migrationAdapter.ts`, etc.).
- [x] Updated tests to use `GameState` structure and appropriate test wrappers (`renderWithMockContext`).
- [x] Standardized action types (using namespaced versions where applicable).
- [x] Fixed type errors and build failures resulting from the refactor.
- [x] Added compatibility layers for narrative context to support existing components.
