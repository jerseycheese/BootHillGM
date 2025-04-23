/**
 * Combat Action Creators
 * 
 * This file contains action creators for the combat reducer.
 */

import { CombatState } from '../types/state/combatState';
import { ActionTypes } from '../types/actionTypes';

/**
 * Action creator for setting the combat active state
 * @param isActive - Whether combat is active
 * @returns Combat action object
 */
export const setCombatActive = (isActive: boolean) => ({
  type: ActionTypes.SET_COMBAT_ACTIVE,
  payload: isActive
});

/**
 * Action creator for updating the combat state
 * @param state - Partial combat state to update
 * @returns Combat action object
 */
export const updateCombatState = (state: Partial<CombatState>) => ({
  type: ActionTypes.UPDATE_COMBAT_STATE,
  payload: state
});

/**
 * Action creator for setting the combat type
 * @param combatType - Type of combat ('brawling', 'weapon', or null)
 * @returns Combat action object
 */
export const setCombatType = (combatType: 'brawling' | 'weapon' | null) => ({
  type: ActionTypes.SET_COMBAT_TYPE,
  payload: combatType
});

/**
 * Action creator for ending combat
 * @returns Combat action object
 */
export const endCombat = () => ({
  type: ActionTypes.END_COMBAT
});

/**
 * Action creator for resetting combat state
 * @returns Combat action object
 */
export const resetCombat = () => ({
  type: ActionTypes.RESET_COMBAT
});
