/**
 * GameStorage utility
 * 
 * Centralized utility for accessing game-related data from localStorage
 * with fallback and resilience mechanisms.
 * 
 * This utility helps ensure that components can retrieve critical game data
 * even when state initialization is incomplete or fragmented by trying
 * multiple storage sources and providing reliable defaults.
 */

import { characterStorage } from './storage/characterStorage';
import { narrativeStorage } from './storage/narrativeStorage';
import { gameElementsStorage } from './storage/gameElementsStorage';
import { gameStateStorage } from './storage/gameStateStorage';

// Export keys and functions as a single object
const GameStorage = {
  // Key mappings for all game-related localStorage entries
  keys: {
    GAME_STATE: 'saved-game-state',
    CAMPAIGN_STATE: 'campaignState',
    NARRATIVE_STATE: 'narrativeState',
    CHARACTER_PROGRESS: 'character-creation-progress',
    INITIAL_NARRATIVE: 'initial-narrative',
    COMPLETED_CHARACTER: 'completed-character',
    LAST_CHARACTER: 'lastCreatedCharacter'
  },
  
  // Character-related functions
  getCharacter: characterStorage.getCharacter,
  
  // Narrative-related functions
  getNarrativeText: narrativeStorage.getNarrativeText,
  
  // Game elements functions
  getSuggestedActions: gameElementsStorage.getSuggestedActions,
  getJournalEntries: gameElementsStorage.getJournalEntries,
  getDefaultInventoryItems: gameElementsStorage.getDefaultInventoryItems,
  
  // Game state functions
  saveGameState: gameStateStorage.saveGameState,
  initializeNewGame: gameStateStorage.initializeNewGame
};

export { GameStorage };
export default GameStorage;
