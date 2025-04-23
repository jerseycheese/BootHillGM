# Action Types Quick Reference

This document provides a quick reference for all standardized action types used in the BootHillGM application. Always import and use these constants from `/app/types/actionTypes.ts`.

## Available Action Types

### Global Actions
```typescript
ActionTypes.SET_STATE          // 'global/SET_STATE'
ActionTypes.RESET_STATE        // 'global/RESET_STATE'
ActionTypes.SAVE_GAME          // 'global/SAVE_GAME'
ActionTypes.LOAD_GAME          // 'global/LOAD_GAME'
```

### Character Actions
```typescript
ActionTypes.SET_CHARACTER      // 'character/SET_CHARACTER'
ActionTypes.UPDATE_CHARACTER   // 'character/UPDATE_CHARACTER'
ActionTypes.SET_OPPONENT       // 'character/SET_OPPONENT'
ActionTypes.UPDATE_OPPONENT    // 'character/UPDATE_OPPONENT'
```

### Combat Actions
```typescript
ActionTypes.SET_COMBAT_ACTIVE    // 'combat/SET_COMBAT_ACTIVE'
ActionTypes.UPDATE_COMBAT_STATE  // 'combat/UPDATE_STATE'
ActionTypes.SET_COMBAT_TYPE      // 'combat/SET_COMBAT_TYPE'
ActionTypes.END_COMBAT           // 'combat/END_COMBAT'
ActionTypes.RESET_COMBAT         // 'combat/RESET_COMBAT'
ActionTypes.SET_COMBATANTS       // 'combat/SET_COMBATANTS'
ActionTypes.ADD_LOG_ENTRY        // 'combat/ADD_LOG_ENTRY'
ActionTypes.NEXT_ROUND           // 'combat/NEXT_ROUND'
ActionTypes.TOGGLE_TURN          // 'combat/TOGGLE_TURN'
ActionTypes.UPDATE_MODIFIERS     // 'combat/UPDATE_MODIFIERS'
```

### Inventory Actions
```typescript
ActionTypes.ADD_ITEM             // 'inventory/ADD_ITEM'
ActionTypes.REMOVE_ITEM          // 'inventory/REMOVE_ITEM'
ActionTypes.EQUIP_WEAPON         // 'inventory/EQUIP_WEAPON'
ActionTypes.USE_ITEM             // 'inventory/USE_ITEM'
ActionTypes.UPDATE_ITEM_QUANTITY // 'inventory/UPDATE_ITEM_QUANTITY'
ActionTypes.UNEQUIP_WEAPON       // 'inventory/UNEQUIP_WEAPON'
ActionTypes.SET_INVENTORY        // 'inventory/SET_INVENTORY'
ActionTypes.CLEAN_INVENTORY      // 'inventory/CLEAN_INVENTORY'
```

### Journal Actions
```typescript
ActionTypes.ADD_ENTRY            // 'journal/ADD_ENTRY'
ActionTypes.REMOVE_ENTRY         // 'journal/REMOVE_ENTRY'
ActionTypes.UPDATE_JOURNAL       // 'journal/UPDATE_ENTRY' (For specific entry updates)
ActionTypes.SET_ENTRIES          // 'journal/SET_ENTRIES'
ActionTypes.CLEAR_ENTRIES        // 'journal/CLEAR_ENTRIES'
ActionTypes.UPDATE_JOURNAL_GENERAL // 'journal/UPDATE_JOURNAL' (For general/new entry updates)
```

### Narrative Actions
```typescript
ActionTypes.ADD_NARRATIVE_HISTORY  // 'narrative/ADD_NARRATIVE_HISTORY'
ActionTypes.SET_NARRATIVE_CONTEXT  // 'narrative/SET_NARRATIVE_CONTEXT'
ActionTypes.UPDATE_NARRATIVE       // 'narrative/UPDATE_NARRATIVE'
ActionTypes.RESET_NARRATIVE        // 'narrative/RESET_NARRATIVE'
ActionTypes.NAVIGATE_TO_POINT      // 'narrative/NAVIGATE_TO_POINT'
ActionTypes.SELECT_CHOICE          // 'narrative/SELECT_CHOICE'
ActionTypes.SET_DISPLAY_MODE       // 'narrative/SET_DISPLAY_MODE'
ActionTypes.START_NARRATIVE_ARC    // 'narrative/START_NARRATIVE_ARC'
ActionTypes.COMPLETE_NARRATIVE_ARC // 'narrative/COMPLETE_NARRATIVE_ARC'
ActionTypes.ACTIVATE_BRANCH        // 'narrative/ACTIVATE_BRANCH'
ActionTypes.COMPLETE_BRANCH        // 'narrative/COMPLETE_BRANCH'
```

### Decision Actions
```typescript
ActionTypes.PRESENT_DECISION         // 'decision/PRESENT_DECISION'
ActionTypes.RECORD_DECISION          // 'decision/RECORD_DECISION'
ActionTypes.CLEAR_CURRENT_DECISION   // 'decision/CLEAR_CURRENT_DECISION'
ActionTypes.PROCESS_DECISION_IMPACTS // 'decision/PROCESS_DECISION_IMPACTS'
ActionTypes.UPDATE_IMPACT_STATE      // 'decision/UPDATE_IMPACT_STATE'
ActionTypes.EVOLVE_IMPACTS           // 'decision/EVOLVE_IMPACTS'
```

### Story Progression Actions
```typescript
ActionTypes.ADD_STORY_POINT            // 'story/ADD_STORY_POINT'
ActionTypes.UPDATE_CURRENT_POINT       // 'story/UPDATE_CURRENT_POINT'
ActionTypes.MARK_BRANCHING_POINT_TAKEN // 'story/MARK_BRANCHING_POINT_TAKEN'
ActionTypes.RESET_STORY_PROGRESSION    // 'story/RESET_STORY_PROGRESSION'
```

### UI Actions
```typescript
ActionTypes.SET_ACTIVE_TAB       // 'ui/SET_ACTIVE_TAB'
ActionTypes.ADD_NOTIFICATION     // 'ui/ADD_NOTIFICATION'
ActionTypes.REMOVE_NOTIFICATION  // 'ui/REMOVE_NOTIFICATION'
ActionTypes.SET_LOADING          // 'ui/SET_LOADING'
ActionTypes.OPEN_MODAL           // 'ui/OPEN_MODAL'
ActionTypes.CLOSE_MODAL          // 'ui/CLOSE_MODAL'
ActionTypes.CLEAR_NOTIFICATIONS  // 'ui/CLEAR_NOTIFICATIONS'
ActionTypes.SET_SOUND_ENABLED    // 'ui/SET_SOUND_ENABLED'
ActionTypes.SET_MUSIC_ENABLED    // 'ui/SET_MUSIC_ENABLED'
ActionTypes.SET_TEXT_SPEED       // 'ui/SET_TEXT_SPEED'
ActionTypes.SET_FONT_SIZE        // 'ui/SET_FONT_SIZE'
ActionTypes.SET_THEME            // 'ui/SET_THEME'
```

### Game State Actions
```typescript
ActionTypes.SET_PLAYER           // 'game/SET_PLAYER'
ActionTypes.ADD_NPC              // 'game/ADD_NPC'
ActionTypes.SET_LOCATION         // 'game/SET_LOCATION'
ActionTypes.ADD_QUEST            // 'game/ADD_QUEST'
ActionTypes.SET_GAME_PROGRESS    // 'game/SET_GAME_PROGRESS'
ActionTypes.SET_SAVED_TIMESTAMP  // 'game/SET_SAVED_TIMESTAMP'
ActionTypes.SET_SUGGESTED_ACTIONS // 'game/SET_SUGGESTED_ACTIONS'
```

### Lore Actions
```typescript
ActionTypes.ADD_LORE_FACT          // 'lore/ADD_LORE_FACT'
ActionTypes.UPDATE_LORE_FACT       // 'lore/UPDATE_LORE_FACT'
ActionTypes.INVALIDATE_LORE_FACT   // 'lore/INVALIDATE_LORE_FACT'
ActionTypes.VALIDATE_LORE_FACT     // 'lore/VALIDATE_LORE_FACT'
ActionTypes.ADD_RELATED_FACTS      // 'lore/ADD_RELATED_FACTS'
ActionTypes.REMOVE_RELATED_FACTS   // 'lore/REMOVE_RELATED_FACTS'
ActionTypes.ADD_FACT_TAGS          // 'lore/ADD_FACT_TAGS'
ActionTypes.REMOVE_FACT_TAGS       // 'lore/REMOVE_FACT_TAGS'
ActionTypes.PROCESS_LORE_EXTRACTION // 'lore/PROCESS_LORE_EXTRACTION'
```

### Error Actions
```typescript
ActionTypes.NARRATIVE_ERROR      // 'error/NARRATIVE_ERROR'
ActionTypes.CLEAR_ERROR          // 'error/CLEAR_ERROR'
```

## Usage Examples

### Using with dispatch
```typescript
import { ActionTypes } from '../types/actionTypes';

dispatch({ type: ActionTypes.ADD_ITEM, payload: newItem });
```

### Using action creators
```typescript
import { addItem } from '../actions/inventoryActions';

dispatch(addItem(newItem));
```

### In reducers
```typescript
import { ActionTypes } from '../types/actionTypes';

// Example using a switch statement (recommended)
function inventoryReducer(state, action) {
  switch (action.type) {
    case ActionTypes.ADD_ITEM:
      // Handle add item action
      return { ...state, items: [...state.items, action.payload] };
    case ActionTypes.REMOVE_ITEM:
      // Handle remove item action
      return { ...state, items: state.items.filter(item => item.id !== action.payload.id) };
    // ... other cases
    default:
      return state;
  }
}

// Example using a helper function (if preferred for complex checks)
const isActionType = (action, typeConstant) => action.type === typeConstant;

if (isActionType(action, ActionTypes.ADD_ITEM)) {
  // Handle add item action
}
