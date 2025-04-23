import { Character } from '../character';
import { Wound } from '../combat';
import { ActionTypes } from '../actionTypes'; // Import ActionTypes

/**
 * Update character payload type
 */
export interface UpdateCharacterPayload {
  id: string;
  attributes?: Partial<Character["attributes"]>;
  wounds?: Wound[];
  strengthHistory?: {
    baseStrength: number;
    changes: {
      previousValue: number;
      newValue: number;
      reason: string;
      timestamp: Date;
    }[];
  };
  damageInflicted?: number;
  isUnconscious?: boolean;
}

/**
 * Character action interfaces using ActionTypes
 */
export interface SetCharacterAction {
  type: typeof ActionTypes.SET_CHARACTER; // Use ActionTypes
  payload: Character | null;
}

export interface UpdateCharacterAction {
  type: typeof ActionTypes.UPDATE_CHARACTER; // Use ActionTypes
  payload: UpdateCharacterPayload;
}

export interface SetOpponentAction {
  type: typeof ActionTypes.SET_OPPONENT; // Use ActionTypes
  payload: Character | null;
}

export interface UpdateOpponentAction {
  type: typeof ActionTypes.UPDATE_OPPONENT; // Use ActionTypes
  payload: UpdateCharacterPayload;
}

/**
 * Combined character actions type
 */
export type CharacterAction =
  | SetCharacterAction
  | UpdateCharacterAction
  | SetOpponentAction
  | UpdateOpponentAction;
