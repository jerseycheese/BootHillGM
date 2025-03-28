# Selector Hook Migration Guide

This guide provides instructions for migrating components from direct state access to using selector hooks with the new state architecture.

## Overview

The new state architecture uses domain-specific slices and selector hooks to provide more efficient and type-safe access to state data. This guide will help you understand how to migrate existing components to use the new pattern.

## Benefits of Selector Hooks

1. **Performance**: Components only re-render when the specific data they use changes
2. **Encapsulation**: Components don't need to know about the global state structure
3. **Type Safety**: Full TypeScript support with proper type inference
4. **Code Organization**: Cleaner component code with logical data access
5. **Testability**: Easier to mock and test components in isolation

## Migration Steps

### Step 1: Import Selector Hooks

Replace direct `useGame` imports with specific selector hooks:

```typescript
// Before
import { useGame } from '../context/GameContext';

// After
import { usePlayerHealth, useInventoryItems, useCombatActive } from '../hooks/stateHooks';
```

### Step 2: Replace Direct State Access

Replace direct state property access with selector hooks:

```typescript
// Before
function PlayerStatusCard() {
  const { state } = useGame();
  const health = state.player?.health || 0;
  const items = state.inventory || [];
  const isInCombat = state.isCombatActive || false;
  
  return (
    <div className="status-card">
      <h3>Player Status</h3>
      <p>Health: {health}</p>
      <p>Items: {items.length}</p>
      {isInCombat && <p className="warning">⚔️ In Combat</p>}
    </div>
  );
}

// After
function PlayerStatusCard() {
  const health = usePlayerHealth();
  const items = useInventoryItems();
  const isInCombat = useCombatActive();
  
  return (
    <div className="status-card">
      <h3>Player Status</h3>
      <p>Health: {health}</p>
      <p>Items: {items.length}</p>
      {isInCombat && <p className="warning">⚔️ In Combat</p>}
    </div>
  );
}
```

### Step 3: Use Specific Selector Hooks for Complex Data Access

For more complex data access patterns, use the appropriate specialized hooks:

```typescript
// Before
function WeaponList() {
  const { state } = useGame();
  const weapons = state.inventory.filter(item => item.category === 'weapon');
  
  return (
    <ul>
      {weapons.map(weapon => (
        <li key={weapon.id}>{weapon.name}</li>
      ))}
    </ul>
  );
}

// After
function WeaponList() {
  const weapons = useItemsByCategory('weapon');
  
  return (
    <ul>
      {weapons.map(weapon => (
        <li key={weapon.id}>{weapon.name}</li>
      ))}
    </ul>
  );
}
```

### Step 4: Create Custom Selector Hooks for Specialized Needs

If you need to access state data in a way that isn't covered by the existing selector hooks, create a custom hook:

```typescript
// Define a custom selector hook
import { createSelectorHook } from '../hooks/stateHooks';

export const useActiveQuestCount = createSelectorHook(
  (state) => state.quests.filter(quest => quest.status === 'active').length
);

// Use it in a component
function QuestTracker() {
  const activeQuestCount = useActiveQuestCount();
  
  return (
    <div>Active Quests: {activeQuestCount}</div>
  );
}
```

## Backward Compatibility

For components that haven't been migrated yet, the legacy state access pattern continues to work through our adapter layer:

```typescript
// Legacy components still work
function LegacyComponent() {
  const { state } = useGame();
  
  // Legacy state properties are still accessible
  const playerName = state.player?.name;
  const itemCount = state.inventory?.length;
  
  return <div>{playerName} has {itemCount} items</div>;
}
```

## Available Selector Hooks

Here's a list of the most commonly used selector hooks:

### Character State Hooks
- `usePlayerCharacter`: Returns the player character
- `useOpponentCharacter`: Returns the opponent character
- `usePlayerHealth`: Returns the player's health
- `useHasPlayerCharacter`: Checks if a player character exists

### Inventory State Hooks
- `useInventoryItems`: Returns all inventory items
- `useInventoryItemCount`: Returns the count of inventory items
- `useItemsByCategory`: Returns items of a specific category
- `useItemById`: Returns a specific item by ID

### Combat State Hooks
- `useCombatActive`: Checks if combat is active
- `useCombatType`: Returns the current combat type
- `useCombatRound`: Returns the current combat round
- `useIsPlayerTurn`: Checks if it's the player's turn
- `useCombatLog`: Returns the combat log entries

### Journal State Hooks
- `useJournalEntries`: Returns all journal entries
- `useJournalEntryCount`: Returns the count of journal entries
- `useEntriesByType`: Returns entries of a specific type
- `useRecentEntries`: Returns the most recent journal entries

### Narrative State Hooks
- `useCurrentStoryPoint`: Returns the current story point
- `useAvailableChoices`: Returns available narrative choices
- `useNarrativeHistory`: Returns the narrative history
- `useCurrentDecision`: Returns the current player decision

### UI State Hooks
- `useIsLoading`: Checks if the UI is in a loading state
- `useModalOpen`: Returns the currently open modal ID
- `useNotifications`: Returns all active notifications
- `useIsModalOpen`: Checks if a specific modal is open

## Testing with Selector Hooks

The selector pattern makes testing components much easier:

```typescript
// Mock the selector hooks
jest.mock('../hooks/stateHooks', () => ({
  usePlayerHealth: jest.fn().mockReturnValue(75),
  useInventoryItems: jest.fn().mockReturnValue([
    { id: '1', name: 'Test Item' }
  ]),
  useCombatActive: jest.fn().mockReturnValue(false)
}));

// Test the component
test('renders player status correctly', () => {
  render(<PlayerStatusCard />);
  
  expect(screen.getByText('Health: 75')).toBeInTheDocument();
  expect(screen.getByText('Items: 1')).toBeInTheDocument();
  expect(screen.queryByText('⚔️ In Combat')).not.toBeInTheDocument();
});
```

## Migration Timeline

You can gradually migrate components to use selector hooks. There's no need to update everything at once. The adapter layer ensures that both old and new patterns work side by side.

## Need Help?

If you have any questions about migrating to selector hooks or need help with specific components, reach out to the development team.
