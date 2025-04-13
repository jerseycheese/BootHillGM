# State Format Compatibility

## Overview

Boot Hill GM is currently undergoing a transition between two state management approaches:

1. **Legacy Campaign State**: A flatter structure with direct properties
2. **Domain-Specific State Slices**: A more organized structure with domain-specific slices

During this transition period, the codebase needs to support both formats to ensure backward compatibility. This guide explains how to write code that works with both state formats.

## Key State Formats

### Inventory State

Inventory data can exist in two formats:

```typescript
// Legacy format - direct array
inventory: InventoryItem[]

// New format - domain slice with items property
inventory: {
  items: InventoryItem[]
}
```

### Character State

Character data can exist in two formats:

```typescript
// Legacy format - direct Character object
character: Character

// New format - domain slice with player property
character: {
  player: Character,
  opponent: Character | null
}
```

### Location State

Location data can exist in multiple formats:

```typescript
// String format (very old)
location: "town"

// Direct LocationType object
location: { type: "town", name: "Boot Hill" }

// Full LocationState object
location: {
  currentLocation: { type: "town", name: "Boot Hill" },
  history: [ /* previous locations */ ]
}
```

## Using Type Guards

To safely access state properties regardless of format, use the type guards provided in `hooks/selectors/typeGuards.ts`:

```typescript
// For inventory items
const items = getItemsFromInventory(state.inventory);

// For journal entries
const entries = getEntriesFromJournal(state.journal);

// For player character
const player = getPlayerFromState(state);
```

## Writing Format-Compatible Selectors

When creating new selectors, always handle both formats:

```typescript
export const useMySelector = (): MyData[] => {
  const { state } = useCampaignState();
  
  return useMemo(() => {
    // Check for empty state
    if (!state) return [];
    
    // Handle legacy array format
    if (Array.isArray(state.myData)) {
      return state.myData;
    }
    
    // Handle domain slice format
    if (state.myData && 'items' in state.myData) {
      return state.myData.items || [];
    }
    
    return []; // Default empty array
  }, [state]);
};
```

## Dispatching Actions

When dispatching actions that modify state, ensure you're using the correct action type for the current state format:

```typescript
// For inventory actions
dispatch({ 
  type: 'ADD_ITEM', 
  payload: newItem 
});

// For domain-specific actions (preferred for new code)
dispatch({ 
  type: 'inventory/ADD_ITEM', 
  payload: newItem 
});
```

## Testing Compatibility

Use the `TestCampaignStateProvider` from `__tests__/utils/testWrappers.tsx` to test components with both formats. This provider automatically creates a compatible state structure.

```typescript
const { result } = renderHook(() => useMyHook(), {
  wrapper: ({ children }) => (
    <TestCampaignStateProvider initialState={testState}>
      {children}
    </TestCampaignStateProvider>
  )
});