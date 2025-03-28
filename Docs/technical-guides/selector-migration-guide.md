# Component Migration Guide: Using Selector Hooks

This guide provides step-by-step instructions for migrating components from direct state access to using the new selector hooks pattern.

## Why Migrate to Selector Hooks?

Before diving into how to migrate, let's understand why this is worth the effort:

1. **Performance**: Components using selector hooks only re-render when their specific data dependencies change
2. **Readability**: Components become more focused on UI logic rather than data access
3. **Maintainability**: Business logic is centralized in hooks, making it easier to update and test
4. **Type Safety**: Explicit typing improves editor autocomplete and error checking

These selector hooks help create a cleaner separation of concerns between data logic and presentation components, similar to established architectural patterns in modern frontend frameworks.

## Migration Process

### Step 1: Identify State Dependencies

Review your component and list all state properties it uses directly:

```tsx
// Before migration
function InventoryList() {
  const { state } = useGame();
  
  // State dependencies:
  // - state.inventory (array of items)
  // - state.player?.attributes?.strength (for weight capacity)
  
  const totalWeight = state.inventory.reduce((sum, item) => sum + (item.weight || 0), 0);
  const maxWeight = (state.player?.attributes?.strength || 0) * 2;
  
  return (
    <div>
      <h2>Inventory ({state.inventory.length} items)</h2>
      <p>Weight: {totalWeight}/{maxWeight}</p>
      <ul>
        {state.inventory.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Step 2: Find or Create Selector Hooks

Check if selector hooks already exist for the state you need:

| State Path | Selector Hook |
|------------|---------------|
| `state.inventory` | `useInventoryItems()` |
| `state.player` | `usePlayerCharacter()` |
| `state.player.attributes.strength` | `usePlayerAttribute('strength')` or `usePlayerStrength()` |
| `state.combat.isActive` | `useCombatActive()` |

If a hook doesn't exist, you can create it (see "Creating New Selector Hooks" below).

### Step 3: Replace Direct State Access

Replace direct state access with selector hooks one piece at a time:

```tsx
// After migration
import { useInventoryItems } from '../hooks/selectors/useInventorySelectors';
import { usePlayerAttribute } from '../hooks/selectors/useCharacterSelectors';

function InventoryList() {
  // Replace direct state access with selector hooks
  const items = useInventoryItems();
  const strength = usePlayerAttribute('strength');
  
  // Calculate derived state
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0), 0);
  const maxWeight = strength * 2;
  
  return (
    <div>
      <h2>Inventory ({items.length} items)</h2>
      <p>Weight: {totalWeight}/{maxWeight}</p>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Step 4: Extract Complex Logic to Custom Hooks

If your component has complex state derivation logic, consider moving it to a custom hook:

```tsx
// Create a custom hook for complex logic
function useInventoryWeight() {
  const items = useInventoryItems();
  const strength = usePlayerAttribute('strength');
  
  // Calculate derived state
  const totalWeight = useMemo(() => 
    items.reduce((sum, item) => sum + (item.weight || 0), 0),
    [items]
  );
  
  const maxWeight = useMemo(() => strength * 2, [strength]);
  
  return { totalWeight, maxWeight, isOverweight: totalWeight > maxWeight };
}

// Use the custom hook in your component
function InventoryList() {
  const items = useInventoryItems();
  const { totalWeight, maxWeight, isOverweight } = useInventoryWeight();
  
  return (
    <div>
      <h2>Inventory ({items.length} items)</h2>
      <p className={isOverweight ? 'text-red-500' : ''}>
        Weight: {totalWeight}/{maxWeight}
      </p>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Step 5: Split Large Components

Large components can be broken down into smaller, more focused ones:

```tsx
// Before: One large component
function InventoryView() {
  const { state } = useGame();
  // ... lots of state access and logic
}

// After: Split into smaller components
function InventoryHeader() {
  const count = useInventoryItemCount();
  const { totalWeight, maxWeight } = useInventoryWeight();
  
  return (
    <div className="inventory-header">
      <h2>Inventory ({count} items)</h2>
      <p>Weight: {totalWeight}/{maxWeight}</p>
    </div>
  );
}

function InventoryFilters() {
  // Filter-specific state and logic
}

function InventoryList() {
  // List-specific state and logic
}

// Parent component just composes the smaller ones
function InventoryView() {
  return (
    <div className="inventory-view">
      <InventoryHeader />
      <InventoryFilters />
      <InventoryList />
    </div>
  );
}
```

This pattern of breaking down complex components into smaller, specialized ones is a foundational practice in modern React development.

## Creating New Selector Hooks

If you need a selector hook that doesn't exist yet, create one using the `createStateHook` factory:

```tsx
// In /hooks/selectors/useInventorySelectors.ts or a new file

import { createStateHook } from '../createStateHook';
import { InventoryItem } from '../../types/item.types';

/**
 * Hook to get inventory items by category
 * 
 * @param category Category to filter by (e.g. 'weapon', 'medical')
 * @returns Array of inventory items of the specified category
 */
export const useInventoryItemsByCategory = (category: string) => {
  const items = useInventoryItems();
  
  return useMemo(() => 
    items.filter(item => item.category === category),
    [items, category]
  );
};

/**
 * Hook to get the total weight of all inventory items
 * 
 * @returns Total weight of all inventory items
 */
export const useInventoryTotalWeight = createStateHook<number, unknown[]>(
  state => {
    const items = state.inventory?.items || [];
    return items.reduce((sum, item) => sum + ((item as InventoryItem).weight || 0), 0);
  },
  // Specify dependencies explicitly for better performance
  state => [state.inventory?.items]
);
```

## Gradual Migration Strategy

You don't need to migrate all components at once. You can follow this gradual approach:

1. **Start with leaf components**: Components with no children are easier to migrate
2. **Prioritize frequently-rendered components**: Components that render often benefit most from optimization
3. **Use the adapter pattern for complex components**: Big components can use both approaches during transition

```tsx
// Hybrid approach during transition
function ComplexComponent() {
  // New approach for frequently changing state
  const health = usePlayerHealth();
  const isInCombat = useCombatActive();
  
  // Legacy approach for less critical state
  const { state } = useGame();
  const questLog = state.quests;
  
  // ...component logic
}
```

This incremental migration approach allows you to migrate the most important parts first while allowing legacy code to coexist temporarily.

## Testing Components

Update your tests when migrating components:

```tsx
// Before: Testing with direct state access
it('shows inventory count', () => {
  // Mock the state context
  const mockState = {
    inventory: [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' }
    ]
  };
  
  jest.spyOn(GameContext, 'useContext').mockReturnValue({
    state: mockState,
    dispatch: jest.fn()
  });
  
  render(<InventoryHeader />);
  expect(screen.getByText('Inventory (2 items)')).toBeInTheDocument();
});

// After: Testing with selector hooks
it('shows inventory count', () => {
  // Mock the selector hook
  jest.mock('../hooks/selectors/useInventorySelectors', () => ({
    useInventoryItemCount: jest.fn().mockReturnValue(2)
  }));
  
  render(<InventoryHeader />);
  expect(screen.getByText('Inventory (2 items)')).toBeInTheDocument();
});
```

## Troubleshooting Common Issues

### 1. Component re-renders too often

**Symptom**: Component still re-renders when unrelated state changes

**Solutions**:
- Check if dependencies array is correct in your selector hooks
- Use React DevTools Profiler to identify what's causing re-renders
- Make sure you're not spreading state objects in your component

```tsx
// Bad: will re-render on any state change
const { state } = useGame();
const { items } = state.inventory; // Deconstructing creates new references

// Good: only re-renders when items change
const items = useInventoryItems();
```

### 2. TypeScript errors

**Symptom**: TypeScript complains about undefined properties

**Solutions**:
- Add proper type guards
- Use optional chaining and nullish coalescing
- Make sure your selector hook has proper return types

```tsx
// Example with proper typing
export const usePlayerHealth = createStateHook<number, unknown[]>(
  state => {
    const player = state.character?.player;
    if (!player || !player.attributes) return 0;
    
    const baseHealth = player.attributes.strength || 0;
    const wounds = player.wounds || [];
    const woundPenalty = wounds.reduce((total, wound) => total + (wound.strengthReduction || 0), 0);
    
    return Math.max(0, baseHealth - woundPenalty);
  },
  state => [state.character?.player?.attributes?.strength, state.character?.player?.wounds]
);
```

### 3. Circular dependencies

**Symptom**: Error about circular imports when creating selector hooks

**Solution**: Organize your selector hooks into domain-specific files and import only what you need

```typescript
// Good organization
- /hooks
  - /selectors
    - useCharacterSelectors.ts
    - useInventorySelectors.ts
    - useCombatSelectors.ts
    - useJournalSelectors.ts
    - useNarrativeSelectors.ts
    - useUISelectors.ts
```

## Example: Full Component Migration

### Before

```tsx
function CombatControls() {
  const { state, dispatch } = useGame();
  
  // Get data from state
  const player = state.player;
  const opponent = state.opponent;
  const inCombat = state.isCombatActive;
  const playerTurn = state.combat?.playerTurn || false;
  
  // Derived data
  const hasWeapon = state.inventory.some(item => item.category === 'weapon');
  const canAttack = inCombat && playerTurn && player && opponent;
  
  // Event handlers
  const handleAttack = () => {
    dispatch({ type: 'ATTACK', payload: { weaponUsed: hasWeapon } });
  };
  
  const handleRetreat = () => {
    dispatch({ type: 'RETREAT' });
  };
  
  // Render logic
  if (!inCombat) return null;
  
  return (
    <div className="combat-controls">
      <div className="combat-status">
        <h3>Combat</h3>
        <p>{playerTurn ? 'Your turn' : 'Opponent turn'}</p>
      </div>
      
      <button 
        disabled={!canAttack} 
        onClick={handleAttack}
      >
        Attack {hasWeapon ? 'with weapon' : 'with fists'}
      </button>
      
      <button onClick={handleRetreat}>
        Retreat
      </button>
    </div>
  );
}
```

### After

```tsx
import { usePlayerCharacter, useOpponentCharacter } from '../hooks/selectors/useCharacterSelectors';
import { useCombatActive, useIsPlayerTurn } from '../hooks/selectors/useCombatSelectors';
import { useHasItemsByCategory } from '../hooks/selectors/useInventorySelectors';

function CombatControls() {
  const { dispatch } = useGame();
  
  // Use selector hooks
  const player = usePlayerCharacter();
  const opponent = useOpponentCharacter();
  const inCombat = useCombatActive();
  const playerTurn = useIsPlayerTurn();
  const hasWeapon = useHasItemsByCategory('weapon');
  
  // Derived data with useMemo
  const canAttack = useMemo(() => 
    inCombat && playerTurn && player && opponent,
    [inCombat, playerTurn, player, opponent]
  );
  
  // Event handlers
  const handleAttack = useCallback(() => {
    dispatch({ type: 'ATTACK', payload: { weaponUsed: hasWeapon } });
  }, [dispatch, hasWeapon]);
  
  const handleRetreat = useCallback(() => {
    dispatch({ type: 'RETREAT' });
  }, [dispatch]);
  
  // Render logic
  if (!inCombat) return null;
  
  return (
    <div className="combat-controls">
      <CombatStatus />
      
      <button 
        disabled={!canAttack} 
        onClick={handleAttack}
      >
        Attack {hasWeapon ? 'with weapon' : 'with fists'}
      </button>
      
      <button onClick={handleRetreat}>
        Retreat
      </button>
    </div>
  );
}

// Split into smaller component
function CombatStatus() {
  const playerTurn = useIsPlayerTurn();
  
  return (
    <div className="combat-status">
      <h3>Combat</h3>
      <p>{playerTurn ? 'Your turn' : 'Opponent turn'}</p>
    </div>
  );
}
```

## Conclusion

Migrating to selector hooks brings major benefits to your components:

- They become more focused and easier to maintain
- Performance improves as components only re-render when needed
- Business logic is centralized and easier to test
- TypeScript provides better autocompletion and error checking

This pattern follows the principle of "separation of concerns" that's fundamental in modern frontend architecture, where presentation logic is kept separate from data management.

The migration process can be done gradually, so start with smaller components and work your way up to more complex ones. With each component you migrate, you'll gain more experience with the pattern and see the benefits of this approach.
