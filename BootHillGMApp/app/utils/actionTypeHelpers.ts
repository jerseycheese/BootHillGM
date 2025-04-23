/**
 * Action Type Helper Utilities
 * 
 * This file provides utility functions for working with action types
 * and maintaining backward compatibility during the transition to
 * standardized ActionTypes.
 */

import { ActionTypes } from '../types/actionTypes';

/**
 * Checks if an action is related to inventory
 * @param actionType - The action type to check
 * @returns boolean indicating if it's an inventory action
 */
export const isInventoryAction = (actionType: string): boolean => {
  return (
    actionType.startsWith('inventory/') || 
    actionType === ActionTypes.ADD_ITEM ||
    actionType === ActionTypes.REMOVE_ITEM ||
    actionType === ActionTypes.EQUIP_WEAPON ||
    actionType === ActionTypes.USE_ITEM ||
    actionType === ActionTypes.UPDATE_ITEM_QUANTITY ||
    actionType === ActionTypes.UNEQUIP_WEAPON ||
    actionType === ActionTypes.SET_INVENTORY ||
    actionType === ActionTypes.CLEAN_INVENTORY
  );
};

/**
 * Checks if an action is related to combat
 * @param actionType - The action type to check
 * @returns boolean indicating if it's a combat action
 */
export const isCombatAction = (actionType: string): boolean => {
  return (
    actionType.startsWith('combat/') ||
    actionType === ActionTypes.SET_COMBAT_ACTIVE ||
    actionType === ActionTypes.UPDATE_COMBAT_STATE ||
    actionType === ActionTypes.SET_COMBAT_TYPE ||
    actionType === ActionTypes.END_COMBAT ||
    actionType === ActionTypes.RESET_COMBAT
  );
};

/**
 * Checks if an action is related to character
 * @param actionType - The action type to check
 * @returns boolean indicating if it's a character action
 */
export const isCharacterAction = (actionType: string): boolean => {
  return (
    actionType.startsWith('character/') ||
    actionType === ActionTypes.SET_CHARACTER ||
    actionType === ActionTypes.UPDATE_CHARACTER ||
    actionType === ActionTypes.SET_OPPONENT
  );
};

/**
 * Checks if an action is related to narrative
 * @param actionType - The action type to check
 * @returns boolean indicating if it's a narrative action
 */
export const isNarrativeAction = (actionType: string): boolean => {
  return (
    actionType.startsWith('narrative/') ||
    actionType === ActionTypes.ADD_NARRATIVE_HISTORY ||
    actionType === ActionTypes.SET_NARRATIVE_CONTEXT ||
    actionType === ActionTypes.UPDATE_NARRATIVE ||
    actionType === ActionTypes.RESET_NARRATIVE
  );
};

/**
 * Checks if an action is related to UI
 * @param actionType - The action type to check
 * @returns boolean indicating if it's a UI action
 */
export const isUIAction = (actionType: string): boolean => {
  return (
    actionType.startsWith('ui/') ||
    actionType === ActionTypes.SET_ACTIVE_TAB ||
    actionType === ActionTypes.ADD_NOTIFICATION ||
    actionType === ActionTypes.REMOVE_NOTIFICATION ||
    actionType === ActionTypes.SET_LOADING ||
    actionType === ActionTypes.OPEN_MODAL ||
    actionType === ActionTypes.CLOSE_MODAL ||
    actionType === ActionTypes.CLEAR_NOTIFICATIONS
  );
};

/**
 * Checks if an action is related to journal
 * @param actionType - The action type to check
 * @returns boolean indicating if it's a journal action
 */
export const isJournalAction = (actionType: string): boolean => {
  return (
    actionType.startsWith('journal/') ||
    actionType === ActionTypes.ADD_ENTRY ||
    actionType === ActionTypes.REMOVE_ENTRY ||
    actionType === ActionTypes.UPDATE_JOURNAL ||
    actionType === ActionTypes.SET_ENTRIES ||
    actionType === ActionTypes.CLEAR_ENTRIES
  );
};

/**
 * Checks if an action is related to game state
 * @param actionType - The action type to check
 * @returns boolean indicating if it's a game state action
 */
export const isGameAction = (actionType: string): boolean => {
  return (
    actionType.startsWith('game/') ||
    actionType === ActionTypes.SET_PLAYER ||
    actionType === ActionTypes.ADD_NPC ||
    actionType === ActionTypes.SET_LOCATION ||
    actionType === ActionTypes.ADD_QUEST ||
    actionType === ActionTypes.SET_GAME_PROGRESS ||
    actionType === ActionTypes.SET_SAVED_TIMESTAMP ||
    actionType === ActionTypes.SET_SUGGESTED_ACTIONS
  );
};

/**
 * Checks if an action is a global state action
 * @param actionType - The action type to check
 * @returns boolean indicating if it's a global state action
 */
export const isGlobalAction = (actionType: string): boolean => {
  return (
    actionType.startsWith('global/') ||
    actionType === ActionTypes.SET_STATE ||
    actionType === ActionTypes.RESET_STATE
  );
};
