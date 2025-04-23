# Action Types Migration Guide

## Overview

This guide outlines the process for migrating existing code to use our new standardized action types. This change is part of our ongoing effort to simplify the codebase and reduce complexity.

## Why We Standardized Action Types

Our state management previously used multiple formats for the same action types:

```typescript
// These three different strings all did the same thing
'ADD_ITEM'
'inventory/ADD_ITEM'
'ADD_ITEM_TO_INVENTORY'
```

This created several problems:
- Reducers needed complex logic to handle multiple action formats
- Hard to track where actions were being used
- Action type strings were prone to typos
- New developers struggled to determine which format to use

## The Solution

We've introduced a centralized `ActionTypes` object as a single source of truth:

```typescript
// app/types/actionTypes.ts
export const ActionTypes = {
  ADD_ITEM: 'inventory/ADD_ITEM',
  REMOVE_ITEM: 'inventory/REMOVE_ITEM',
  // ... more actions
};
```

## Migration Steps

Follow these steps to update your components and hooks:

### 1. Import the ActionTypes

```typescript
// Add this import to your file
import { ActionTypes } from '../types/actionTypes';
```

### 2. Update Action Dispatches

```typescript
// Before
dispatch({ type: 'inventory/ADD_ITEM', payload: item });
// or
dispatch({ type: 'ADD_ITEM', payload: item });

// After
dispatch({ type: ActionTypes.ADD_ITEM, payload: item });
```

### 3. Use Action Creators (Optional)

```typescript
// Before
dispatch({ type: 'inventory/ADD_ITEM', payload: item });

// After
import { addItem } from '../actions/inventoryActions';
dispatch(addItem(item));
```

### 4. For Reducer Authors

```typescript
// Before
if (action.type === 'inventory/ADD_ITEM' || action.type === 'ADD_ITEM') {
  // Handle action
}

// After - With helper function
if (isInventoryAction(action, INVENTORY_ACTION_TYPES.ADD_ITEM)) {
  // Handle action
}
```

## Testing Your Changes

1. After making changes, run the test suite: `npm test`
2. Pay special attention to reducer tests, which will verify action handling
3. Manually test any updated components to ensure they still work

## Backward Compatibility

During the transition period, all reducers will continue to support the old action types alongside the new ones. This allows us to migrate incrementally.

## Example Files

For reference, check these examples:
- `app/types/actionTypes.ts` - The central action types definition
- `app/reducers/rootReducer.ts` - Updated to use ActionTypes
- `app/reducers/inventoryReducer.ts` - Example of backward compatibility
- `app/hooks/useGameSession.ts` - Example of updated dispatches
- `app/actions/inventoryActions.ts` - Standard action creators

## Troubleshooting

If you encounter any issues during migration:

1. Ensure you're importing ActionTypes correctly
2. Check for typos in action type constants
3. Verify that the reducer is handling both old and new formats during transition
