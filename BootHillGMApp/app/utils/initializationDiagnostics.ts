/**
 * Initialization Diagnostics
 * 
 * Utilities for diagnosing and repairing state inconsistencies during initialization and reset.
 * Helps ensure proper character persistence and state structure after reset operations.
 */

import { Character } from '../types/character';
import { InventoryItem } from '../types/item.types';

// Type for partial character with unknown properties
interface PartialCharacter extends Partial<Character> {
  [key: string]: unknown;
}

// Interface for key data in diagnostic snapshot
interface KeyDiagnosticData {
  exists: boolean;
  size: number;
  characterName?: string;
  parseError?: boolean;
  hasCharacter?: boolean;
  hasInventory?: boolean;
  inventoryCount?: number;
  characterInventoryCount?: number;
}

// Interface for the state snapshot
interface StateSnapshot {
  timestamp: number;
  totalKeys: number;
  gameStateKeys: Record<string, KeyDiagnosticData>;
}

/**
 * Logs diagnostic information during game operations
 * 
 * @param category Diagnostic category
 * @param message Diagnostic message
 * @param data Optional data to log
 */
export const logDiagnostic = (category: string, message: string, data?: Record<string, unknown>): void => {
  if (typeof window === 'undefined') return;
  
  const timestamp = new Date().toISOString();
  
  // Store in diagnostics history if needed
  try {
    const diagHistory = JSON.parse(localStorage.getItem('diagnostic-history') || '[]');
    diagHistory.push({
      category,
      timestamp,
      message,
      data
    });
    
    // Keep only the last 100 entries
    if (diagHistory.length > 100) {
      diagHistory.shift();
    }
    
    localStorage.setItem('diagnostic-history', JSON.stringify(diagHistory));
  } catch {
    // Silently fail if storage is unavailable
  }
};

/**
 * Captures current state in localStorage for diagnostic purposes
 * @returns an object with diagnostic information
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
      
      snapshot.gameStateKeys[key] = keyData;
    });
    
    return snapshot;
  } catch {
    return null;
  }
};

// Interface for validation result
interface ValidationResult {
  timestamp: number;
  isConsistent: boolean;
  issues: string[];
  error?: string;
}

/**
 * Validates that game state is consistent across different storage sources
 * @returns Validation result with issues if any
 */
export const validateStateConsistency = (): ValidationResult | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const validation: ValidationResult = {
      timestamp: Date.now(),
      isConsistent: true,
      issues: []
    };
    
    // Check character consistency
    let gameStateCharacter: { name: string, inventory?: { items: InventoryItem[] } } | null = null;
    let characterProgress: { name: string, inventory?: { items: InventoryItem[] } } | null = null;
    let completedCharacter: { name: string, inventory?: { items: InventoryItem[] } } | null = null;
    
    // Get character from different sources
    try {
      const gameStateJSON = localStorage.getItem('saved-game-state');
      if (gameStateJSON) {
        const gameState = JSON.parse(gameStateJSON);
        if (gameState?.character?.player?.name) {
          gameStateCharacter = {
            name: gameState.character.player.name,
            inventory: gameState.character.player.inventory
          };
        }
      }
    } catch {
      validation.issues.push('Cannot parse saved-game-state');
    }
    
    try {
      const charProgressJSON = localStorage.getItem('character-creation-progress');
      if (charProgressJSON) {
        const charProgress = JSON.parse(charProgressJSON);
        if (charProgress?.character?.name) {
          characterProgress = {
            name: charProgress.character.name,
            inventory: charProgress.character.inventory
          };
        }
      }
    } catch {
      validation.issues.push('Cannot parse character-creation-progress');
    }
    
    try {
      const completedCharJSON = localStorage.getItem('completed-character');
      if (completedCharJSON) {
        const completedChar = JSON.parse(completedCharJSON);
        if (completedChar?.name) {
          completedCharacter = {
            name: completedChar.name,
            inventory: completedChar.inventory
          };
        }
      }
    } catch {
      validation.issues.push('Cannot parse completed-character');
    }
    
    // Check if character names match across sources
    if (gameStateCharacter && characterProgress) {
      if (gameStateCharacter.name !== characterProgress.name) {
        validation.isConsistent = false;
        validation.issues.push('Character name mismatch between gameState and characterProgress');
      }
    }
    
    if (gameStateCharacter && completedCharacter) {
      if (gameStateCharacter.name !== completedCharacter.name) {
        validation.isConsistent = false;
        validation.issues.push('Character name mismatch between gameState and completedCharacter');
      }
    }
    
    // Check if inventory exists in character
    if (gameStateCharacter && (!gameStateCharacter.inventory || !gameStateCharacter.inventory.items)) {
      validation.issues.push('Character in gameState missing inventory items');
    }
    
    if (characterProgress && (!characterProgress.inventory || !characterProgress.inventory.items)) {
      validation.issues.push('Character in characterProgress missing inventory items');
    }
    
    if (completedCharacter && (!completedCharacter.inventory || !completedCharacter.inventory.items)) {
      validation.issues.push('Character in completedCharacter missing inventory items');
    }
    
    // Check inventory consistency
    let gameStateInventory: unknown[] | null = null;
    let inventoryState: { items?: unknown[] } | unknown[] | null = null;
    
    try {
      const gameStateJSON = localStorage.getItem('saved-game-state');
      if (gameStateJSON) {
        const gameState = JSON.parse(gameStateJSON);
        if (gameState?.inventory?.items) {
          gameStateInventory = gameState.inventory.items;
        }
      }
    } catch {
      validation.issues.push('Cannot parse saved-game-state for inventory');
    }
    
    try {
      const inventoryJSON = localStorage.getItem('inventory-state');
      if (inventoryJSON) {
        inventoryState = JSON.parse(inventoryJSON);
      }
    } catch {
      validation.issues.push('Cannot parse inventory-state');
    }
    
    // Check if inventory counts match
    if (gameStateInventory && inventoryState) {
      const gameStateCount = gameStateInventory.length;
      const inventoryStateCount = Array.isArray(inventoryState) ? 
                               inventoryState.length : 
                               (Array.isArray((inventoryState as { items?: unknown[] }).items) ? 
                                (inventoryState as { items: unknown[] }).items.length : 0);
      
      if (gameStateCount !== inventoryStateCount) {
        validation.isConsistent = false;
        validation.issues.push('Inventory count mismatch between gameState and inventoryState');
      }
    }
    
    return validation;
  } catch (error) {
    return { 
      timestamp: Date.now(),
      isConsistent: false, 
      error: String(error),
      issues: ['Exception during validation'] 
    };
  }
};

// Interface for repair result
interface RepairResult {
  timestamp: number;
  repairsAttempted: number;
  repairsSucceeded: number;
  actions: string[];
  error?: string;
}

/**
 * Automatically repairs common game state inconsistencies across localStorage.
 *
 * This function:
 * 1. Validates state consistency across all storage locations
 * 2. Identifies the most reliable character data source
 * 3. Ensures character has valid inventory (adding defaults if missing)
 * 4. Propagates fixes to all relevant storage locations
 *
 * @example
 * // Run state repair and log results
 * const repairResult = await repairStateConsistency();
 * console.log('Repairs attempted:', repairResult.repairsAttempted);
 *
 * @returns {Promise<RepairResult>} Repair operation result containing:
 *   - timestamp: When repair was performed
 *   - repairsAttempted: Number of repair operations attempted
 *   - repairsSucceeded: Number of successful repairs
 *   - actions: Array of actions taken during repair
 *   - error: Error message if repair failed (optional)
 *
 * @throws Will not throw but returns error in result object if repair fails
 * @see validateStateConsistency For validation logic
 * @see captureStateSnapshot For diagnostic information
 */
export const repairStateConsistency = async (): Promise<RepairResult> => {
  if (typeof window === 'undefined') {
    return {
      timestamp: Date.now(),
      repairsAttempted: 0,
      repairsSucceeded: 0,
      actions: ['Cannot run in SSR environment']
    };
  }
  
  try {
    const result: RepairResult = {
      timestamp: Date.now(),
      repairsAttempted: 0,
      repairsSucceeded: 0,
      actions: []
    };
    
    // Validate state first
    const validation = validateStateConsistency();
    if (validation?.isConsistent) {
      result.actions.push('No repairs needed, state is consistent');
      return result;
    }
    
    // 1. Find the most reliable character
    let bestCharacter: PartialCharacter | null = null;
    let bestCharacterSource = '';
    
    // Try sources in order of reliability
    const sources = [
      { key: 'character-creation-progress', path: 'character' },
      { key: 'completed-character', path: '' },
      { key: 'saved-game-state', path: 'character.player' }
    ];
    
    for (const source of sources) {
      try {
        const data = localStorage.getItem(source.key);
        if (!data) continue;
        
        const parsed = JSON.parse(data);
        
        // Navigate to the path
        let value: PartialCharacter | null = parsed;
        const pathParts = source.path.split('.');
        for (const part of pathParts) {
          if (part && value && typeof value === 'object') {
            value = value[part] as PartialCharacter || null;
          }
        }
        
        if (value && typeof value.name === 'string' && value.attributes) {
          bestCharacter = value;
          bestCharacterSource = source.key;
          break;
        }
      } catch {
        continue;
      }
    }
    
    // If we found a reliable character, use it to repair
    if (bestCharacter) {
      result.repairsAttempted++;
      result.actions.push(`Found reliable character in ${bestCharacterSource}: ${bestCharacter.name}`);
      
      // Check if character has inventory
      const hasInventory = !!(bestCharacter.inventory &&
                             typeof bestCharacter.inventory === 'object' &&
                             'items' in bestCharacter.inventory &&
                             Array.isArray(bestCharacter.inventory.items));
                           
      // Get default inventory
      let defaultInventory = null;
      try {
        // Try to dynamically import startingInventory module
        const { getStartingInventory } = await import('./startingInventory');
        if (typeof getStartingInventory === 'function') {
          defaultInventory = getStartingInventory();
          result.actions.push('Successfully loaded default inventory items');
        }
      } catch {
        result.actions.push('Failed to load default inventory items module');
      }
      
      // If character has no inventory but we have default items, add them
      if (!hasInventory && defaultInventory) {
        bestCharacter.inventory = { items: defaultInventory };
        result.actions.push('Added default inventory to character');
      }
      
      // Update character-creation-progress
      try {
        localStorage.setItem('character-creation-progress', 
          JSON.stringify({ character: bestCharacter }));
        result.actions.push('Updated character-creation-progress');
        result.repairsSucceeded++;
      } catch {
        result.actions.push('Failed to update character-creation-progress');
      }
      
      // Update completed-character
      try {
        localStorage.setItem('completed-character', 
          JSON.stringify(bestCharacter));
        result.actions.push('Updated completed-character');
        result.repairsSucceeded++;
      } catch {
        result.actions.push('Failed to update completed-character');
      }
      
      // Try to update the game state with the correct character
      try {
        const gameStateJSON = localStorage.getItem('saved-game-state');
        if (gameStateJSON) {
          const gameState = JSON.parse(gameStateJSON);
          if (!gameState.character) {
            gameState.character = { player: bestCharacter, opponent: null };
          } else {
            gameState.character.player = bestCharacter;
          }
          
          localStorage.setItem('saved-game-state', JSON.stringify(gameState));
          result.actions.push('Updated character in saved-game-state');
          result.repairsSucceeded++;
        }
      } catch {
        result.actions.push('Failed to update character in saved-game-state');
      }
    } else {
      result.actions.push('Could not find a reliable character to use for repairs');
    }
    
    return result;
  } catch (error) {
    return { 
      timestamp: Date.now(),
      repairsAttempted: 0,
      repairsSucceeded: 0,
      error: String(error),
      actions: ['Exception during repair operation'] 
    };
  }
};

const diagnosticsUtil = {
  captureStateSnapshot,
  validateStateConsistency,
  repairStateConsistency,
  logDiagnostic
};

export default diagnosticsUtil;