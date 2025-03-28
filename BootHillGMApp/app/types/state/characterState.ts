import { Character } from '../character';

/**
 * Character state slice that manages player and opponent character data
 */
export interface CharacterState {
  player: Character | null;
  opponent: Character | null;
}

/**
 * Initial state for the character slice
 */
export const initialCharacterState: CharacterState = {
  player: null,
  opponent: null
};
