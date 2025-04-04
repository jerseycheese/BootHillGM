/**
 * Type definitions for game context related to AI services
 */

import { GameState } from '../../../types/gameState';

/**
 * GameContext provides the AI with information about the current game state
 */
export interface GameContext {
  /**
   * Recent narrative entries to provide context for AI responses
   */
  recentEntries: string[];
  
  /**
   * Current location information
   */
  currentLocation?: {
    name: string;
    type: string;
  };
  
  /**
   * Current game state snapshot
   */
  gameState?: GameState;
  
  /**
   * Current character information
   */
  character?: {
    name: string;
    traits?: string[];
  };
}
