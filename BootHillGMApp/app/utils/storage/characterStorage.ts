/**
 * Character Storage Module
 * 
 * Handles retrieval and parsing of character data from localStorage.
 * Provides fallback mechanisms for different character data formats.
 * Supports multiple storage sources with graceful degradation.
 */

import { Character } from '../../types/character';
import { CharacterState, initialCharacterState } from '../../types/state/characterState';

// Constants for module
const MODULE_NAME = 'GameStorage:Character';

// Storage keys for character-related data, in order of priority
const STORAGE_KEYS = {
  GAME_STATE: 'saved-game-state',
  CAMPAIGN_STATE: 'campaignState',
  CHARACTER_PROGRESS: 'character-creation-progress',
  COMPLETED_CHARACTER: 'completed-character',
  LAST_CHARACTER: 'lastCreatedCharacter'
};

/**
 * Helper to find player character in multiple storage sources.
 * Checks for direct character objects or nested character properties.
 * 
 * @param sources Array of storage keys to check
 * @returns Character object if found, null otherwise
 */
const findPlayerCharacterInSources = (sources: string[]): Character | null => {
  for (const source of sources) {
    const data = localStorage.getItem(source);
    if (!data) continue;
    
    try {
      const parsed = JSON.parse(data);
      
      // Character is directly in source
      if (source === STORAGE_KEYS.CHARACTER_PROGRESS || 
          source === STORAGE_KEYS.COMPLETED_CHARACTER ||
          source === STORAGE_KEYS.LAST_CHARACTER) {
        
        // Check if it has the expected Character structure
        if (parsed && 
            typeof parsed === 'object' && 
            'attributes' in parsed) {
          return parsed;
        }
      }
      // Character is inside a nested property
      else if (parsed.character && 
              typeof parsed.character === 'object' && 
              'attributes' in parsed.character) {
        return parsed.character;
      }
    } catch (e) {
      console.error(`${MODULE_NAME} - Error parsing ${source} for player character:`, e);
    }
  }
  
  return null;
};

/**
 * Get character data from any available source with type checking.
 * Tries sources in this priority order:
 * 1. GAME_STATE or CAMPAIGN_STATE (new format)
 * 2. CHARACTER_PROGRESS, COMPLETED_CHARACTER, or LAST_CHARACTER (legacy format)
 * 
 * @returns Character state with proper structure or initialized default
 */
const getCharacter = (): CharacterState => {
  if (typeof window === 'undefined') return initialCharacterState;
  
  // Try all possible sources for character data
  const sources = [
    STORAGE_KEYS.GAME_STATE,
    STORAGE_KEYS.CAMPAIGN_STATE,
    STORAGE_KEYS.CHARACTER_PROGRESS,
    STORAGE_KEYS.COMPLETED_CHARACTER,
    STORAGE_KEYS.LAST_CHARACTER
  ];
  
  // First, try to get character using the new CharacterState structure
  for (const source of sources) {
    const data = localStorage.getItem(source);
    if (!data) continue;
    
    try {
      const parsed = JSON.parse(data);
      
      // Look for character.player structure (new format)
      if (parsed.character && 
          typeof parsed.character === 'object' && 
          'player' in parsed.character &&
          parsed.character.player) {
        return {
          player: parsed.character.player,
          opponent: parsed.character.opponent
        };
      }
    } catch (e) {
      console.error(`${MODULE_NAME} - Error parsing ${source} for character state:`, e);
    }
  }
  
  // Second pass: look for direct character object
  const playerCharacter = findPlayerCharacterInSources(sources); // Now defined before call
  
  // If we found a player character, return proper CharacterState
  if (playerCharacter) {
    return {
      player: playerCharacter,
      opponent: null
    };
  }
  
  // Return default character if nothing found
  return initialCharacterState;
};


export const characterStorage = {
  getCharacter
};
