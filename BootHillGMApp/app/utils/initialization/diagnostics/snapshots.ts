/**
 * State snapshot utilities for diagnostics
 * 
 * This module provides functions for capturing the current state
 * of the game storage for diagnostic purposes. Snapshots help identify
 * inconsistencies and track state changes over time.
 */

import { StateSnapshot, KeyDiagnosticData } from './types';

/**
 * Gets diagnostic data for a specific localStorage key
 * Analyzes the key's value, attempts to parse JSON content,
 * and extracts useful metadata for diagnostics.
 * 
 * @param {string} key - The localStorage key to analyze
 * @returns {KeyDiagnosticData} Diagnostic data for the key
 */
function getKeyDiagnosticData(key: string): KeyDiagnosticData {
  const value = localStorage.getItem(key);
  const keyData: KeyDiagnosticData = {
    exists: !!value,
    size: value ? value.length : 0,
  };
  
  // For character data, add name if available
  if (key === 'character-creation-progress' && value) {
    try {
      const parsed = JSON.parse(value);
      if (parsed?.character?.name) {
        keyData.characterName = parsed.character.name;
      }
    } catch {
      keyData.parseError = true;
    }
  }
  
  // For game state, add relevant info
  if (key === 'saved-game-state' && value) {
    try {
      const parsed = JSON.parse(value);
      if (parsed?.character?.player) {
        keyData.hasCharacter = true;
        keyData.characterName = parsed.character.player.name || 'Unknown';
      }
      
      // Track inventory item count for diagnosis
      if (parsed?.inventory?.items && Array.isArray(parsed.inventory.items)) {
        keyData.hasInventory = true;
        keyData.inventoryCount = parsed.inventory.items.length;
      }
      
      // Also check character's inventory directly
      if (parsed?.character?.player?.inventory?.items && 
          Array.isArray(parsed.character.player.inventory.items)) {
        // Character inventory may be different from main inventory
        const characterInventoryCount = parsed.character.player.inventory.items.length;
        keyData.characterInventoryCount = characterInventoryCount;
      }
    } catch {
      keyData.parseError = true;
    }
  }
  
  return keyData;
}

/**
 * Captures current state in localStorage for diagnostic purposes
 * Creates a comprehensive snapshot of important game state keys
 * and their metadata for analysis and debugging.
 * 
 * @returns {StateSnapshot | null} Snapshot object with diagnostic information or null if execution fails
 */
export const captureStateSnapshot = (): StateSnapshot | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Get all localStorage keys
    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        allKeys.push(key);
      }
    }
    
    // Track important game state related keys
    const importantKeys = [
      'saved-game-state',
      'character-creation-progress',
      'completed-character',
      'inventory-state',
      'narrative-state',
      '_boothillgm_reset_flag'
    ];
    
    // Create snapshot of current state
    const snapshot: StateSnapshot = {
      timestamp: Date.now(),
      totalKeys: allKeys.length,
      gameStateKeys: {}
    };
    
    // Add info for each important key
    importantKeys.forEach(key => {
      snapshot.gameStateKeys[key] = getKeyDiagnosticData(key); // Now defined before call
    });
    
    return snapshot;
  } catch {
    return null;
  }
};