/**
 * Reducer Utilities
 * 
 * Helper functions for state management and reducer operations.
 * Provides backward compatibility and utility functions for reducers.
 */

import { ActionTypes } from '../../types/actionTypes';

/**
 * Map legacy string action types to ActionTypes constants
 * Maintains backward compatibility with older code
 * 
 * @param type Original action type string
 * @returns Mapped action type from ActionTypes or original if not a legacy type
 */
export function mapLegacyActionType(type: string): string {
  // Map legacy action types to new constants
  switch (type) {
    // Game actions
    case 'SET_PLAYER': return ActionTypes.SET_PLAYER;
    case 'SET_CHARACTER': return ActionTypes.SET_CHARACTER;
    case 'SET_LOCATION': return ActionTypes.SET_LOCATION;
    case 'SET_NARRATIVE': return ActionTypes.ADD_NARRATIVE_HISTORY;
    case 'SET_GAME_PROGRESS': return ActionTypes.SET_GAME_PROGRESS;
    case 'UPDATE_JOURNAL': return ActionTypes.UPDATE_JOURNAL_GENERAL;
    case 'SET_COMBAT_ACTIVE': return ActionTypes.SET_COMBAT_ACTIVE;
    case 'SET_OPPONENT': return ActionTypes.SET_OPPONENT;
    case 'ADD_ITEM': return ActionTypes.ADD_ITEM;
    case 'REMOVE_ITEM': return ActionTypes.REMOVE_ITEM;
    case 'USE_ITEM': return ActionTypes.USE_ITEM;
    case 'UPDATE_ITEM_QUANTITY': return ActionTypes.UPDATE_ITEM_QUANTITY;
    case 'CLEAN_INVENTORY': return ActionTypes.CLEAN_INVENTORY;
    case 'SET_INVENTORY': return ActionTypes.SET_INVENTORY;
    case 'END_COMBAT': return ActionTypes.END_COMBAT;
    
    default:
      return type; // If not a legacy type, return as is
  }
}
