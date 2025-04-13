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
import { GameStorage as gameStateStorage } from './storage/gameStateStorage';

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
    LAST_CHARACTER: 'lastCreatedCharacter',
    CHARACTER_NAME: 'character-name',
    RESET_FLAG: '_boothillgm_reset_flag',
    FORCE_GENERATION: '_boothillgm_force_generation'
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
  initializeNewGame: gameStateStorage.initializeNewGame,

  /**
   * Get character name from local storage or use default
   * @returns Character name string
   */
  getCharacterName: () => {
    if (typeof window === 'undefined') return 'Sheriff Wilson';
    
    // Try to get from local storage
    const storedName = localStorage.getItem(GameStorage.keys.CHARACTER_NAME);
    if (storedName) return storedName;
    
    // Try alternate storage locations
    try {
      // Check CHARACTER_PROGRESS
      const characterProgress = localStorage.getItem(GameStorage.keys.CHARACTER_PROGRESS);
      if (characterProgress) {
        const progressData = JSON.parse(characterProgress);
        if (progressData?.character?.name) {
          return progressData.character.name;
        }
      }
      
      // Check COMPLETED_CHARACTER
      const completedCharacter = localStorage.getItem(GameStorage.keys.COMPLETED_CHARACTER);
      if (completedCharacter) {
        const characterData = JSON.parse(completedCharacter);
        if (characterData?.name) {
          return characterData.name;
        }
      }
      
      // Check GAME_STATE
      const gameState = localStorage.getItem(GameStorage.keys.GAME_STATE);
      if (gameState) {
        const stateData = JSON.parse(gameState);
        if (stateData?.character?.player?.name) {
          return stateData.character.player.name;
        }
        if (stateData?.character?.name) {
          return stateData.character.name;
        }
      }
    } catch (e) {
      console.error('Error retrieving character name:', e);
    }
    
    // Default name if nothing else found
    return 'Sheriff Wilson';
  },

  /**
   * Get default character with proper name
   * @returns A basic default character object
   */
  getDefaultCharacter: () => {
    // Try to get from localStorage first
    const savedCharacter = localStorage.getItem(GameStorage.keys.COMPLETED_CHARACTER);
    if (savedCharacter) {
      try {
        const parsedChar = JSON.parse(savedCharacter);
        if (parsedChar && parsedChar.name) {
          return parsedChar;
        }
      } catch (error) {
        console.error('Error parsing saved character:', error);
      }
    }
    
    // Get the character name
    const characterName = GameStorage.getCharacterName();
    
    // Fallback to a default character
    return {
      id: `character_${Date.now()}`,
      name: characterName,
      isPlayer: true,
      isNPC: false,
      attributes: {
        speed: 6,
        gunAccuracy: 7,
        throwingAccuracy: 5,
        strength: 8,
        baseStrength: 8,
        bravery: 7,
        experience: 6
      },
      wounds: [],
      isUnconscious: false,
      inventory: { 
        items: gameElementsStorage.getDefaultInventoryItems() 
      },
      strengthHistory: {
        baseStrength: 8,
        changes: []
      }
    };
  }
};

export { GameStorage };
export default GameStorage;