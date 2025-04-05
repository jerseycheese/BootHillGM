/**
 * Game Elements Storage Module
 * 
 * Handles retrieval and parsing of game elements data from localStorage.
 * Includes suggested actions, journal entries, and inventory items.
 * Provides default values when stored data is unavailable.
 */

import { JournalEntry } from '../../types/journal';
import { SuggestedAction } from '../../types/campaign';
import { InventoryItem } from '../../types/item.types';

// Module constants
const MODULE_NAME = 'GameStorage:GameElements';

// Storage keys for game elements data
const STORAGE_KEYS = {
  GAME_STATE: 'saved-game-state',
  CAMPAIGN_STATE: 'campaignState'
};

/**
 * Get suggested actions from any available source.
 * Checks GAME_STATE and CAMPAIGN_STATE for valid action arrays.
 * Falls back to default actions if none found.
 * 
 * @returns Array of suggested actions
 */
const getSuggestedActions = (): SuggestedAction[] => {
  if (typeof window === 'undefined') return [];
  
  // Try all possible sources for suggested actions
  const sources = [
    STORAGE_KEYS.GAME_STATE,
    STORAGE_KEYS.CAMPAIGN_STATE
  ];
  
  for (const source of sources) {
    const data = localStorage.getItem(source);
    if (!data) continue;
    
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.suggestedActions && 
          Array.isArray(parsed.suggestedActions) && 
          parsed.suggestedActions.length > 0) {
        return parsed.suggestedActions;
      }
    } catch (e) {
      console.error(`${MODULE_NAME} - Error parsing ${source} for suggested actions:`, e);
    }
  }
  
  // Return default actions with a variety of types to test all styling
  return getDefaultSuggestedActions();
};

/**
 * Get journal entries from any available source.
 * Checks for journal arrays or journal.entries objects.
 * 
 * @returns Array of journal entries or empty array if none found
 */
const getJournalEntries = (): JournalEntry[] => {
  if (typeof window === 'undefined') return [];
  
  // Try all possible sources for journal entries
  const sources = [
    STORAGE_KEYS.GAME_STATE,
    STORAGE_KEYS.CAMPAIGN_STATE
  ];
  
  for (const source of sources) {
    const data = localStorage.getItem(source);
    if (!data) continue;
    
    try {
      const parsed = JSON.parse(data);
      
      // Check different journal structures
      if (parsed.journal) {
        if (Array.isArray(parsed.journal)) {
          return parsed.journal;
        }
        
        if (typeof parsed.journal === 'object' && 
            'entries' in parsed.journal && 
            Array.isArray(parsed.journal.entries)) {
          return parsed.journal.entries;
        }
      }
    } catch (e) {
      console.error(`${MODULE_NAME} - Error parsing ${source} for journal entries:`, e);
    }
  }
  
  // Return empty array if nothing found
  return [];
};

/**
 * Get default starting inventory items.
 * Creates items with unique IDs based on current timestamp.
 * 
 * @returns Array of default inventory items for new characters
 */
const getDefaultInventoryItems = (): InventoryItem[] => {
  return [
    {
      id: `item-${Date.now()}-1`,
      name: "Canteen",
      description: "A dented metal canteen for carrying water",
      quantity: 1,
      category: "general"
    },
    {
      id: `item-${Date.now()}-2`,
      name: "Bandana",
      description: "A faded red bandana",
      quantity: 1,
      category: "general"
    },
    {
      id: `item-${Date.now()}-3`,
      name: "Pocket Knife",
      description: "A small folding knife",
      quantity: 1,
      category: "general"
    }
  ];
};

/**
 * Get default suggested actions with varied types.
 * Provides a mix of action types to test button styling.
 * 
 * @returns Array of default suggested actions for new games
 */
const getDefaultSuggestedActions = (): SuggestedAction[] => {
  return [
    { 
      id: 'action-look-around', 
      title: 'Look around', 
      description: 'Examine your surroundings to get a better sense of where you are.', 
      type: 'basic'
    },
    { 
      id: 'action-check-inventory', 
      title: 'Check inventory', 
      description: 'Take stock of what you have with you.', 
      type: 'main'
    },
    { 
      id: 'action-talk-to-someone', 
      title: 'Find someone to talk to', 
      description: 'Look for another person to interact with.', 
      type: 'interaction'
    },
    { 
      id: 'action-explore', 
      title: 'Explore the area', 
      description: 'Move around to discover what\'s nearby.', 
      type: 'side'
    },
    { 
      id: 'action-challenge-stranger', 
      title: 'Challenge a stranger', 
      description: 'Pick a fight with someone you don\'t know.', 
      type: 'chaotic'
    }
  ];
};

export const gameElementsStorage = {
  getSuggestedActions,
  getJournalEntries,
  getDefaultInventoryItems,
  getDefaultSuggestedActions
};
