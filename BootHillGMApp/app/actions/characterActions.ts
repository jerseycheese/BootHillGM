/**
 * Character Action Creators
 * 
 * This file contains action creators for the character reducer.
 */

import { CharacterPayload, UpdateCharacterPayload, OpponentPayload } from '../reducers/characterReducer';
import { ActionTypes } from '../types/actionTypes';

/**
 * Action creator for setting the player character
 * @param character - Character data to set
 * @returns Character action object
 */
export const setCharacter = (character: CharacterPayload) => ({
  type: ActionTypes.SET_CHARACTER,
  payload: character
});

/**
 * Action creator for updating a character's attributes
 * @param id - ID of the character to update
 * @param updateData - Data to update
 * @returns Character action object
 */
export const updateCharacter = (id: string, updateData: Omit<UpdateCharacterPayload, 'id'>) => ({
  type: ActionTypes.UPDATE_CHARACTER,
  payload: {
    id,
    ...updateData
  }
});

/**
 * Action creator for setting the opponent character
 * @param opponent - Opponent data to set
 * @returns Character action object
 */
export const setOpponent = (opponent: OpponentPayload | null) => ({
  type: ActionTypes.SET_OPPONENT,
  payload: opponent
});
