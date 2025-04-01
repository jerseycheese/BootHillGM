/**
 * State Adapters
 * 
 * Provides backward compatibility for legacy state adapters
 * that have been consolidated as part of the state model refactoring.
 */

import { GameState } from '../types/gameState';
import { ExtendedGameState } from '../types/extendedState';
import { JournalEntry } from '../types/journal';
import { NarrativeContext } from '../types/narrative/context.types';
import { Character } from '../types/character';
import { InventoryItem } from '../types/item.types';

/**
 * Empty adapter for backward compatibility
 * This function does nothing and simply returns the state as-is,
 * since we've consolidated the state model and no longer need adapters.
 */
export const adaptStateForTests = (state: GameState): GameState => {
  return state;
};

/**
 * Empty adapter for backward compatibility
 * This function does nothing and simply returns the state as-is,
 * since we've consolidated the state model and no longer need adapters.
 */
export const adaptExtendedState = (state: ExtendedGameState): ExtendedGameState => {
  return state;
};

/**
 * Empty adapter for backward compatibility
 * This is a no-op function that simply returns the input state.
 */
export const convertToSliceState = (state: GameState): GameState => {
  return state;
};

/**
 * Empty adapter for backward compatibility
 * This is a no-op function that simply returns the input state.
 */
export const convertFromSliceState = (state: GameState): GameState => {
  return state;
};

/**
 * Legacy getters for backward compatibility with older components
 */
export const legacyGetters = {
  /**
   * Gets the player character from game state
   */
  getPlayer: (state: GameState): Character | null => {
    return state?.character?.player || null;
  },

  /**
   * Gets the opponent character from game state
   */
  getOpponent: (state: GameState): Character | null => {
    return state?.character?.opponent || null;
  },

  /**
   * Gets inventory items from game state
   */
  getItems: (state: GameState): InventoryItem[] => {
    return state?.inventory?.items || [];
  },

  /**
   * Gets journal entries from game state
   */
  getEntries: (state: GameState): JournalEntry[] => {
    return state?.journal?.entries || [];
  },

  /**
   * Checks if combat is active in game state
   */
  isCombatActive: (state: GameState): boolean => {
    return state?.combat?.isActive || false;
  },

  /**
   * Gets narrative context from game state
   */
  getNarrativeContext: (state: GameState): NarrativeContext | undefined => {
    return state?.narrative?.narrativeContext;
  }
};
