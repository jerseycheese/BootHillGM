/**
 * Type definitions for debug actions
 * 
 * This module contains interfaces and types specific to debug functionality,
 * particularly those used for game reset operations and state extraction.
 */
import { Character } from "../types/character";

/**
 * Interface for game state with character data
 * Used to extract character data during reset operations
 * 
 * @property character Object containing player and opponent character data
 */
export interface GameStateWithCharacter {
  character: {
    player: Character | null;
    opponent: Character | null;
  } | null;
}
