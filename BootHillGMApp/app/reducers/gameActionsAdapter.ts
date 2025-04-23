/**
 * Game Actions Adapter
 * 
 * This module provides utilities for adapting between different action formats
 * to support the slice-based architecture while maintaining backward compatibility.
 */

import { GameAction } from '../types/actions';
import { GameEngineAction } from '../types/gameActions';
import { isNonNullObject, isString } from './utils/typeGuards';
import { ActionTypes } from '../types/actionTypes';

/**
 * Maps old action types to new domain-prefixed types
 */
const ACTION_TYPE_MAP: Record<string, string> = {
  // Character actions
  'SET_CHARACTER': 'character/SET_CHARACTER',
  'UPDATE_CHARACTER': 'character/UPDATE_CHARACTER',
  'SET_OPPONENT': 'character/SET_OPPONENT',
  
  // Inventory actions
  'ADD_ITEM': 'inventory/ADD_ITEM',
  'REMOVE_ITEM': 'inventory/REMOVE_ITEM',
  'USE_ITEM': 'inventory/USE_ITEM',
  'UPDATE_ITEM_QUANTITY': 'inventory/UPDATE_ITEM_QUANTITY',
  'CLEAN_INVENTORY': 'inventory/CLEAN_INVENTORY',
  'SET_INVENTORY': 'inventory/SET_INVENTORY',
  'EQUIP_WEAPON': 'inventory/EQUIP_WEAPON',
  'UNEQUIP_WEAPON': 'inventory/UNEQUIP_WEAPON',
  
  // Journal actions
  'UPDATE_JOURNAL': 'journal/UPDATE_JOURNAL',
  
  // Combat actions
  'SET_COMBAT_ACTIVE': 'combat/SET_ACTIVE',
  'UPDATE_COMBAT_STATE': 'combat/UPDATE_STATE',
  'SET_COMBAT_TYPE': 'combat/SET_COMBAT_TYPE',
  'END_COMBAT': 'combat/END_COMBAT',
  
  // UI actions
  'SET_UI_LOADING': 'ui/SET_LOADING',
  'SET_UI_MODAL': 'ui/SET_MODAL',
  'SET_UI_ACTIVE_TAB': 'ui/SET_ACTIVE_TAB',
  
  // Narrative actions
  'SET_NARRATIVE': 'narrative/ADD_HISTORY',
  'ADD_NARRATIVE_HISTORY': 'narrative/ADD_HISTORY',
  'SET_NARRATIVE_CONTEXT': 'narrative/SET_CONTEXT',
  'NAVIGATE_TO_POINT': 'narrative/NAVIGATE_TO_POINT',
  'SELECT_CHOICE': 'narrative/SELECT_CHOICE',
  'SET_DISPLAY_MODE': 'narrative/SET_DISPLAY_MODE',
  
  // Global state actions
  'SET_GAME_PROGRESS': 'game/SET_PROGRESS',
  'SET_SUGGESTED_ACTIONS': 'game/SET_SUGGESTED_ACTIONS'
};

/**
 * Type guard to check if an action is a GameEngineAction
 */
export function isGameEngineAction(action: GameAction | GameEngineAction): action is GameEngineAction {
  return (
    isNonNullObject(action) && 
    'type' in action && 
    isString(action.type) && 
    (Object.keys(ACTION_TYPE_MAP).includes(action.type) || 
     // Add special handling for non-mapped actions that should be recognized
     action.type === ActionTypes.UPDATE_COMBAT_STATE || // Use ActionTypes constant
     action.type === 'UPDATE_JOURNAL' ||
     action.type === ActionTypes.UPDATE_CHARACTER || // Use ActionTypes constant
     action.type === 'SET_NARRATIVE' ||
     action.type === 'SET_GAME_PROGRESS' ||
     action.type === 'SET_SUGGESTED_ACTIONS')
  );
}

/**
 * Adapts a GameEngineAction to a GameAction
 */
export function adaptEngineAction(action: GameEngineAction): GameAction {
  // If it's not a valid GameEngineAction, return as is
  if (!isGameEngineAction(action)) {
    return action as unknown as GameAction;
  }
  
  // Map action type from legacy to domain-prefixed format
  const newType = ACTION_TYPE_MAP[action.type] || action.type;
  
  // Return adapted action
  return {
    type: newType,
    payload: 'payload' in action ? action.payload : undefined // Conditional check for payload
  } as GameAction;
}

/**
 * Creates a dispatch function that accepts both GameAction and GameEngineAction
 */
export function createCompatibleDispatch(originalDispatch: React.Dispatch<GameAction>) {
  return (action: GameAction | GameEngineAction) => {
    // Handle both action types
    if (isGameEngineAction(action)) {
      // Convert GameEngineAction to GameAction and dispatch
      originalDispatch(adaptEngineAction(action));
    } else {
      // For regular GameAction, dispatch as is
      originalDispatch(action);
    }
  };
}

/**
 * Determines which domain an action belongs to based on its type
 */
export function getDomainFromActionType(actionType: string): string | null {
  // New format: 'domain/ACTION_TYPE'
  const parts = actionType.split('/');
  if (parts.length > 1) {
    return parts[0];
  }
  
  // Legacy format: Handle based on naming conventions
  if (actionType.includes('CHARACTER')) return 'character';
  if (actionType.includes('COMBAT')) return 'combat';
  if (actionType.includes('INVENTORY')) return 'inventory';
  if (actionType.includes('JOURNAL')) return 'journal';
  if (actionType.includes('NARRATIVE')) return 'narrative';
  if (actionType.includes('UI')) return 'ui';
  
  // Special cases
  if (actionType === 'UPDATE_JOURNAL') return 'journal';
  if (actionType === ActionTypes.UPDATE_CHARACTER) return 'character';
  if (actionType === 'SET_NARRATIVE') return 'narrative';
  if (actionType === 'SET_GAME_PROGRESS') return 'game';
  if (actionType === 'SET_SUGGESTED_ACTIONS') return 'game';
  
  // No specific domain
  return null;
}

const gameActionsAdapter = { // Assign object to a variable
  isGameEngineAction,
  adaptEngineAction,
  createCompatibleDispatch,
  getDomainFromActionType
};

// Export default for compatibility with existing imports
export default gameActionsAdapter; // Export the variable
