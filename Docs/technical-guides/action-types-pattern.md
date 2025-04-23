# Action Types Pattern Documentation

## Overview

This document describes the standardized approach to Redux action types in BootHillGM. The primary goal is to create a single source of truth for action type constants, reducing complexity and improving maintainability.

## Key Components

1. **Centralized ActionTypes Definition**
   - Location: `/app/types/actionTypes.ts`
   - Contains all application action types organized by domain
   - Uses namespaced format for clarity: `domain/ACTION_NAME`

2. **Action Creator Format**
   - Follow standard pattern with typed parameters
   - Import ActionTypes from the central definition
   - Example:
     ```typescript
     import { ActionTypes } from '../types/actionTypes';
     
     export const addItem = (item: InventoryItem) => ({
       type: ActionTypes.ADD_ITEM,
       payload: item
     });
     ```

3. **Component Usage**
   - Components should import ActionTypes directly
   - Dispatch should use the ActionTypes constants
   - Example:
     ```typescript
     import { ActionTypes } from '../types/actionTypes';
     
     // In component
     dispatch({
       type: ActionTypes.ADD_ITEM,
       payload: newItem
     });
     ```

4. **Reducer Implementation**
   - Reducers should use ActionTypes for case statements
   - Support both standard and legacy action types during transition
   - Example:
     ```typescript
     import { ActionTypes } from '../types/actionTypes';
     
     function inventoryReducer(state, action) {
       switch (action.type) {
         case ActionTypes.ADD_ITEM:
         case 'inventory/ADD_ITEM': // Legacy support
           return {
             ...state,
             items: [...state.items, action.payload]
           };
         // ...more cases
       }
     }
     ```

## Best Practices

1. **Always use ActionTypes constants** instead of string literals
2. **Import ActionTypes directly** from the central file
3. **Don't create duplicate action type definitions** in component files
4. **Use ESLint rule** to enforce proper usage
5. **Update tests** to use standardized action types

## Backward Compatibility

During the transition phase, reducers support both the new standardized types and legacy string literals. Helper functions like `isInventoryAction()` check for multiple action type formats to maintain compatibility.

## Future Plans

1. **Phase out legacy action types** after all components are updated
2. **Add type safety** for action payloads 
3. **Merge compatibility helpers** into shared utilities
4. **Add ESLint rules** for enforcing proper action type usage

## Example

```typescript
// Before
dispatch({ 
  type: 'inventory/ADD_ITEM', 
  payload: newItem 
});

// After
import { ActionTypes } from '../types/actionTypes';

dispatch({ 
  type: ActionTypes.ADD_ITEM, 
  payload: newItem 
});
```

This pattern creates a more maintainable and standardized approach to action types throughout the application.
