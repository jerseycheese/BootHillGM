# State Architecture v2

## Overview

This document outlines the refined state management architecture for BootHillGM. The architecture is designed to provide a more maintainable, performant, and type-safe approach to state management as the application grows in complexity.

## Key Concepts

### 1. Domain-Specific State Slices

The global state is divided into logical domain-specific slices:

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
  currentPlayer: string;
  npcs: string[];
  location: LocationType | null;
  quests: string[];
  gameProgress: number;
  suggestedActions: SuggestedAction[];
  savedTimestamp?: number;
  isClient?: boolean;
}
```

Each domain slice encapsulates data related to a specific aspect of the game:

- **character**: Player and opponent character data
- **combat**: Combat state, turns, and logs
- **inventory**: Items owned by the player
- **journal**: Log of game events and discoveries
- **narrative**: Story points, choices, and narrative flow
- **ui**: UI-specific state like active tabs and modals

### 2. Selector Hooks Pattern

Instead of directly accessing the state, components use selector hooks to get the specific data they need:

```typescript
// Before: Direct state access
function PlayerHealth() {
  const { state } = useGame();
  const health = calculateHealth(state.player);
  
  return <div>Health: {health}</div>;
}

// After: Using selector hook
function PlayerHealth() {
  const health = usePlayerHealth();
  
  return <div>Health: {health}</div>;
}
```

Benefits of selector hooks:
- **Performance**: Components only re-render when the specific data they use changes
- **Type safety**: Return types are explicitly defined
- **Encapsulation**: Business logic is moved from components to hooks
- **Reusability**: Common data access patterns can be reused

### 3. Custom Hook Factory

To avoid writing repetitive code, we use a custom factory function to create selector hooks:

```typescript
export function createStateHook<T, D extends unknown[]>(
  selector: (state: GameState) => T,
  getDependencies: (state: GameState) => D = (_state) => [] as unknown as D
) {
  return function useStateHook(): T {
    const { state } = useGame();
    const dependencies = getDependencies(state);
    
    return useMemo(() => selector(state), [
      state,
      ...dependencies.map(dep => 
        typeof dep === 'object' && dep !== null 
          ? JSON.stringify(dep) 
          : dep
      )
    ]);
  };
}
```

This factory automatically handles:
- Memoization with `useMemo`
- Dependency tracking to prevent unnecessary renders
- Access to the global state via `useGame` hook

### 4. Backward Compatibility

To ensure existing components continue to work, we've implemented adapters that bridge between the old and new state structure:

```typescript
export const adaptStateForTests = (state: GameState): GameState => {
  if (!state) return state;
  
  // Apply all adapters in sequence
  let adaptedState = state;
  adaptedState = characterAdapter.adaptForTests(adaptedState);
  adaptedState = inventoryAdapter.adaptForTests(adaptedState); 
  adaptedState = journalAdapter.adaptForTests(adaptedState);
  adaptedState = narrativeAdapter.adaptForTests(adaptedState);
  adaptedState = combatAdapter.adaptForTests(adaptedState);
  adaptedState = uiAdapter.adaptForTests(adaptedState);

  return adaptedState;
};
```

Legacy components can also use the `legacyGetters` object to access data in the legacy format:

```typescript
export const legacyGetters = {
  getPlayer: characterAdapter.getPlayer,
  getOpponent: characterAdapter.getOpponent,
  getItems: inventoryAdapter.getItems,
  getEntries: journalAdapter.getEntries,
  getNarrativeContext: narrativeAdapter.getNarrativeContext,
  isCombatActive: combatAdapter.isCombatActive
};
```

## Using the State Architecture

### Accessing State in Components

#### 1. Use Selector Hooks

```typescript
import { usePlayerHealth, usePlayerName } from '../hooks/selectors/useCharacterSelectors';
import { useInventoryItems } from '../hooks/selectors/useInventorySelectors';
import { useCombatActive } from '../hooks/selectors/useCombatSelectors';

function PlayerStatus() {
  // Use specific selector hooks
  const name = usePlayerName();
  const health = usePlayerHealth();
  const items = useInventoryItems();
  const isInCombat = useCombatActive();
  
  return (
    <div className="player-status">
      <h2>{name || 'Unknown'}</h2>
      <p>Health: {health}</p>
      <p>Items: {items.length}</p>
      {isInCombat && <p className="warning">⚔️ In Combat</p>}
    </div>
  );
}
```

#### 2. Create Custom Hooks for Complex Logic

```typescript
// Create a custom hook for complex business logic
function useCanUseWeapon(weaponId: string) {
  const playerAttributes = usePlayerAttributes();
  const weapon = useInventoryItemById(weaponId);
  const inCombat = useCombatActive();
  
  return useMemo(() => {
    if (!weapon || !inCombat) return false;
    
    // Check if player has required attribute level
    const requiredAttribute = weapon.requiredAttribute;
    const attributeValue = playerAttributes[requiredAttribute] || 0;
    
    return attributeValue >= (weapon.requiredLevel || 0);
  }, [weapon, playerAttributes, inCombat]);
}
```

#### 3. Transitioning Legacy Components

For components that are still using the old state structure, you can create a wrapper that adapts the state:

```typescript
import { useGame } from '../hooks/useGame';
import { migrationAdapter } from '../utils/stateAdapters';

function withLegacyState<P>(Component: React.ComponentType<P & { state: any }>) {
  return (props: P) => {
    const { state } = useGame();
    const legacyState = migrationAdapter.newToOld(state);
    
    return <Component {...props} state={legacyState} />;
  };
}

// Then use it like this:
const LegacyInventoryWithState = withLegacyState(LegacyInventory);
```

### Modifying State

The state modification pattern remains the same, using dispatched actions:

```typescript
import { useGame } from '../hooks/useGame';

function AddItemButton({ item }) {
  const { dispatch } = useGame();
  
  const handleAddItem = () => {
    dispatch({
      type: 'ADD_ITEM',
      payload: item
    });
  };
  
  return <button onClick={handleAddItem}>Add {item.name}</button>;
}
```

## Testing

### Testing with Selector Hooks

When testing components that use selector hooks, you can mock the hooks:

```typescript
import { usePlayerHealth } from '../hooks/selectors/useCharacterSelectors';

// Mock the hook
jest.mock('../hooks/selectors/useCharacterSelectors', () => ({
  usePlayerHealth: jest.fn()
}));

describe('HealthDisplay', () => {
  it('renders correctly', () => {
    // Set up the mock
    usePlayerHealth.mockReturnValue(75);
    
    // Render and test
    render(<HealthDisplay />);
    expect(screen.getByText('Health: 75')).toBeInTheDocument();
  });
});
```

### Testing State Changes

For testing state changes, use the test utilities:

```typescript
import { prepareStateForTesting, applyReducerForTesting } from '../test/utils/stateTestUtils';
import { inventoryReducer } from '../reducers/inventory/inventoryReducer';

describe('Inventory Reducer', () => {
  it('adds an item to inventory', () => {
    // Prepare test state
    const initialState = prepareStateForTesting({
      inventory: { items: [] }
    });
    
    // Define action
    const action = {
      type: 'ADD_ITEM',
      payload: { id: '1', name: 'Test Item', quantity: 1 }
    };
    
    // Apply reducer
    const newState = applyReducerForTesting(inventoryReducer, initialState, action);
    
    // Verify result
    expect(newState.inventory.items).toHaveLength(1);
    expect(newState.inventory.items[0].name).toBe('Test Item');
  });
});
```

## Best Practices

### 1. Minimize Component Dependencies

Components should only depend on the specific state they need:

```typescript
// Good - Only depends on name
function PlayerName() {
  const name = usePlayerName();
  return <h2>{name}</h2>;
}

// Good - Only depends on health
function PlayerHealthBar() {
  const health = usePlayerHealth();
  return <progress value={health} max={100} />;
}

// Bad - Depends on the entire player object
function PlayerStatus() {
  const player = usePlayerCharacter();
  
  if (!player) return null;
  
  return (
    <div>
      <h2>{player.name}</h2>
      <progress value={player.health} max={100} />
    </div>
  );
}
```

### 2. Prefer Composed Components Over Monolithic Ones

Break down large components into smaller ones, each with its own selector hooks:

```typescript
// Parent component composed of smaller, focused components
function CharacterSheet() {
  return (
    <div className="character-sheet">
      <PlayerHeader />
      <div className="two-column">
        <PlayerAttributes />
        <CombatStats />
      </div>
      <PlayerInventory />
      <PlayerJournal />
    </div>
  );
}
```

### 3. Create New Selector Hooks When Needed

If you find yourself calculating the same derived state in multiple components, create a new selector hook:

```typescript
// Before: Calculating in components
function WeaponsCount() {
  const items = useInventoryItems();
  const weaponsCount = items.filter(item => item.category === 'weapon').length;
  return <span>{weaponsCount} weapons</span>;
}

// After: Creating a new selector hook
export const useWeaponsCount = () => {
  const items = useInventoryItems();
  return useMemo(() => 
    items.filter(item => item.category === 'weapon').length,
    [items]
  );
};

function WeaponsCount() {
  const weaponsCount = useWeaponsCount();
  return <span>{weaponsCount} weapons</span>;
}
```

## Migration Path

As we continue to develop BootHillGM, we'll follow this migration path:

1. **Phase 1: State Architecture & Adapters** ✅
   - Implement domain-specific state slices
   - Create adapter layer for backward compatibility
   - Add selectors and hooks for state access

2. **Phase 2: Core Components Migration**
   - Update critical components to use selector hooks
   - Improve test coverage for state logic
   - Create migration helpers for component refactoring

3. **Phase 3: Complete Migration**
   - Migrate all components to use selector hooks
   - Remove legacy adapter code
   - Update documentation and examples

## Conclusion

The refined state architecture for BootHillGM provides a more maintainable, performant, and type-safe approach to state management. By using domain-specific state slices, selector hooks, and a custom hook factory, we can create components that are more focused and efficient. The backward compatibility layer ensures that existing components continue to work while we gradually migrate to the new architecture.
