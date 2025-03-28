import { Character } from '../character';
import { Wound } from '../combat';

/**
 * Character action types
 * Using string literals to avoid template literal type issues
 */
export type CharacterActionType = 
  | 'character/SET_CHARACTER'
  | 'character/UPDATE_CHARACTER'
  | 'character/SET_OPPONENT'
  | 'character/UPDATE_OPPONENT';

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
  [key: string]: unknown;
}

/**
 * Character action interfaces with string literal types
 */
export interface SetCharacterAction {
  type: 'character/SET_CHARACTER';
  payload: Character | null;
}

export interface UpdateCharacterAction {
  type: 'character/UPDATE_CHARACTER';
  payload: UpdateCharacterPayload;
}

export interface SetOpponentAction {
  type: 'character/SET_OPPONENT';
  payload: Character | null;
}

export interface UpdateOpponentAction {
  type: 'character/UPDATE_OPPONENT';
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
