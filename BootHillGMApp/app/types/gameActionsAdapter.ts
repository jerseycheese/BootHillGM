/**
 * GameActionsAdapter
 * 
 * This file provides adapters and type mappings between the new GameAction type
 * and the legacy GameEngineAction type to ensure backward compatibility.
 */

import { GameAction } from './actions';
import { GameEngineAction } from './gameActions';
import { Dispatch } from 'react';

/**
 * Maps GameEngineAction types to their corresponding GameAction types
 */
export const engineToActionType = (type: string): string => {
  // Map from legacy action types to domain-prefixed ones
  const actionTypeMap: Record<string, string> = {
    'ADD_ITEM': 'inventory/ADD_ITEM',
    'REMOVE_ITEM': 'inventory/REMOVE_ITEM',
    'USE_ITEM': 'inventory/USE_ITEM',
    'UPDATE_ITEM_QUANTITY': 'inventory/UPDATE_ITEM_QUANTITY',
    'CLEAN_INVENTORY': 'inventory/CLEAN_INVENTORY',
    'SET_INVENTORY': 'inventory/SET_INVENTORY',
    'EQUIP_WEAPON': 'inventory/EQUIP_WEAPON',
    'UNEQUIP_WEAPON': 'inventory/UNEQUIP_WEAPON',
    'SET_CHARACTER': 'character/SET_CHARACTER',
    'UPDATE_CHARACTER': 'character/UPDATE_CHARACTER',
    'SET_OPPONENT': 'character/SET_OPPONENT',
    'UPDATE_OPPONENT': 'character/UPDATE_OPPONENT',
    'SET_COMBAT_ACTIVE': 'combat/SET_ACTIVE',
    'SET_COMBAT_TYPE': 'combat/SET_COMBAT_TYPE',
    'UPDATE_COMBAT_STATE': 'combat/UPDATE_STATE',
    'END_COMBAT': 'combat/END',
    'UPDATE_JOURNAL': 'journal/UPDATE',
    'SET_NARRATIVE': 'narrative/SET',
    'UPDATE_NARRATIVE': 'narrative/UPDATE',
    // Add more mappings as needed
  };
  
  return actionTypeMap[type] || type;
};

/**
 * Maps GameAction types to their corresponding GameEngineAction types
 */
export const actionToEngineType = (type: string): string => {
  // Extract the action name without the domain prefix
  const parts = type.split('/');
  if (parts.length > 1) {
    return parts[1];
  }
  return type;
};

/**
 * Adapter function to convert GameEngineAction to GameAction
 */
export const adaptEngineAction = (action: GameEngineAction): GameAction => {
  // Handle action type conversion
  const convertedType = engineToActionType(action.type);
  
  // Return adapted action with converted type
  return {
    ...action,
    type: convertedType as GameAction['type'],
  } as GameAction;
};

/**
 * Adapter function to convert GameAction to GameEngineAction
 */
export const adaptAction = (action: GameAction): GameEngineAction => {
  // Extract the action name without the domain prefix
  const convertedType = actionToEngineType(action.type as string);
  
  return {
    ...action,
    type: convertedType as GameEngineAction['type'],
  } as GameEngineAction;
};

/**
 * Type guard to check if an action is a GameEngineAction
 */
export const isGameEngineAction = (action: GameAction | GameEngineAction): action is GameEngineAction => {
  return !String(action.type).includes('/');
};

/**
 * Compatible dispatch function that accepts both action types
 */
export const createCompatibleDispatch = (
  dispatch: Dispatch<GameAction>
): (action: GameAction | GameEngineAction) => void => {
  return (action: GameAction | GameEngineAction) => {
    if (isGameEngineAction(action)) {
      dispatch(adaptEngineAction(action));
    } else {
      dispatch(action as GameAction);
    }
  };
};
