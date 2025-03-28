First, fetch with MCP tools and review: https://github.com/jerseycheese/BootHillGM/issues/230

A summary of what we've done so far:

# State Management Architecture Refactoring

## Overview

This implements a refined state management architecture for BootHillGM (Issue #230). It migrates from a flat state structure to a domain-based slice architecture with memoized selector hooks, allowing for more efficient state access and better code organization.

## Key Features

- Domain-specific state slices (character, inventory, journal, combat, narrative, UI)
- Memoized selector hooks for efficient and type-safe state access
- Adapter layer for backward compatibility with existing components
- Comprehensive documentation and migration guides
- Fixed tests and improved test patterns

## Implementation Details

### State Slice Structure

The new state structure organizes data into logical domain-specific slices:

```typescript
export interface GameState {
  // Domain-specific slices
  character: CharacterState;
  combat: CombatState;
  inventory: InventoryState;
  journal: JournalState;
  narrative: NarrativeState;
  ui: UIState;
  
  // Top-level state
  savedTimestamp?: number;
  isClient?: boolean;
}
```

### Selector Hooks

Memoized hooks provide efficient, component-specific state access:

```typescript
// Example component using selectors
function PlayerStatusCard() {
  // Only re-renders when these specific values change
  const health = useCharacterHealth();
  const inventory = useInventoryItems();
  const isInCombat = useCombatActive();
  
  return (
    <div className="status-card">
      <h3>Player Status</h3>
      <p>Health: {health}</p>
      <p>Items: {inventory.length}</p>
      {isInCombat && <p className="warning">⚔️ In Combat</p>}
    </div>
  );
}
```

### Backward Compatibility

An adapter layer ensures existing components continue to work:

```typescript
// Legacy component (still works)
function LegacyInventoryList() {
  const { state } = useGame();
  
  // Legacy pattern - accessing inventory directly
  const items = state.inventory;
  
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

// New component (using selectors)
function NewInventoryList() {
  const items = useInventoryItems();
  
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

## Test Strategy

Tests have been updated to support the new architecture:

1. **Property Extraction Pattern**: For comparing states with different shapes
2. **Array-Like Behavior**: For inventory and journal collections
3. **Improved Test Utilities**: Helper functions for state preparation

Example of the property extraction pattern for test comparisons:

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

## Documentation

- `state-architecture-v2.md`: Architecture overview
- `selector-migration-guide.md`: Guide for updating components
- `state-architecture-test-patterns.md`: Test patterns and best practices
- `state-migration-completed.md`: Summary of implementation

## Migration Strategy

This implements the new architecture while maintaining backward compatibility:

1. New components use selector hooks directly
2. Existing components continue to work with the adapter layer
3. Components can be gradually migrated over time

## Performance Benefits

The new architecture should provide performance improvements by:

1. Reducing unnecessary re-renders through memoized selectors
2. Enabling more efficient state updates with domain-specific reducers
3. Providing better TypeScript type safety and code completion

Don't do anything yet but MCP tool read_file files you think would be important for context for fixing issues going forward.