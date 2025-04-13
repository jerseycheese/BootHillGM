/**
 * Storage Keys Constants
 * 
 * Central repository of all localStorage key names used throughout the app.
 * Enables consistent access and prevents typos.
 */

/**
 * Storage keys for accessing localStorage data.
 * Used by storage utilities to ensure consistent key references.
 */
export const storageKeys = {
  // Main game state storage keys
  GAME_STATE: 'saved-game-state',
  CAMPAIGN_STATE: 'campaignState',
  
  // Character storage keys
  CHARACTER_PROGRESS: 'character-creation-progress',
  COMPLETED_CHARACTER: 'completed-character',
  
  // Narrative storage keys
  NARRATIVE_STATE: 'narrativeState',
  INITIAL_NARRATIVE: 'initial-narrative',
  
  // Inventory storage keys
  INVENTORY_STATE: 'inventory-state'
};
