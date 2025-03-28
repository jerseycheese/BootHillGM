/**
 * Character State Selector Hooks
 * 
 * This module provides selector hooks for accessing character state data.
 */

import { Character } from '../types/character';
import { CharacterState } from '../types/state/characterState';
import { createSelectorHook } from './createSelectorHook';

// Character state selectors

/**
 * Hook that returns the entire character state slice
 * Handle null state explicitly since GameState can have null character state
 */
export const useCharacterState = createSelectorHook<CharacterState | null>(
  (state) => state.character
);

/**
 * Hook that returns the player character
 */
export const usePlayerCharacter = createSelectorHook<Character | null>(
  (state) => state.character?.player || null
);

/**
 * Hook that returns the opponent character
 */
export const useOpponentCharacter = createSelectorHook<Character | null>(
  (state) => state.character?.opponent || null
);

/**
 * Hook that returns the player character's health
 * Note: In Boot Hill, strength is used as health
 */
export const usePlayerHealth = createSelectorHook<number>(
  (state) => state.character?.player?.attributes?.strength || 0
);

/**
 * Hook that returns the opponent character's health
 * Note: In Boot Hill, strength is used as health
 */
export const useOpponentHealth = createSelectorHook<number>(
  (state) => state.character?.opponent?.attributes?.strength || 0
);

/**
 * Hook that returns whether a player character exists
 */
export const useHasPlayerCharacter = createSelectorHook<boolean>(
  (state) => state.character?.player !== null && state.character?.player !== undefined
);

/**
 * Hook that returns a specific character attribute
 * @param attributeName The name of the attribute to retrieve
 */
export function createCharacterAttributeSelector(attributeName: keyof Character['attributes']) {
  return createSelectorHook<unknown>(
    (state) => state.character?.player?.attributes?.[attributeName]
  );
}
