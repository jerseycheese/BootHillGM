/**
 * State repair utilities
 * 
 * This module provides functions for automatically repairing inconsistencies
 * in game state across different storage locations. It identifies the most
 * reliable character data and propagates it to all relevant storage keys.
 */

import { PartialCharacter, RepairResult } from './types';
import { validateStateConsistency } from './validation';

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
    
    // Find the most reliable character and repair
    const bestCharacter = await findBestCharacter();
    
    if (bestCharacter) {
      result.repairsAttempted++;
      result.actions.push(`Found reliable character in: ${bestCharacter.name}`);
      
      // Ensure character has inventory
      await ensureCharacterInventory(bestCharacter, result);
      
      // Propagate character to all storage locations
      const repairSuccess = await propagateCharacterToStorageLocations(bestCharacter, result);
      
      if (repairSuccess) {
        result.repairsSucceeded++;
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

/**
 * Finds the most reliable character data from available sources
 * Tries multiple storage locations in order of reliability to find
 * a character object with minimum required fields.
 * 
 * @returns {Promise<PartialCharacter | null>} The most reliable character object found, or null if none available
 */
async function findBestCharacter(): Promise<PartialCharacter | null> {
  let bestCharacter: PartialCharacter | null = null;
  
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
        break;
      }
    } catch {
      continue;
    }
  }
  
  return bestCharacter;
}

/**
 * Ensures character has a valid inventory
 * Checks if the character has an inventory with items array,
 * and adds default inventory if missing.
 * 
 * @param {PartialCharacter} character - Character object to check/repair
 * @param {RepairResult} result - Repair result to update with actions
 * @returns {Promise<void>}
 */
async function ensureCharacterInventory(
  character: PartialCharacter, 
  result: RepairResult
): Promise<void> {
  // Check if character has inventory
  const hasInventory = !!(character.inventory &&
                         typeof character.inventory === 'object' &&
                         'items' in character.inventory &&
                         Array.isArray(character.inventory.items));
                       
  // Get default inventory if needed
  if (!hasInventory) {
    try {
      // Try to dynamically import startingInventory module
      const { getStartingInventory } = await import('../../startingInventory');
      if (typeof getStartingInventory === 'function') {
        const defaultInventory = getStartingInventory();
        character.inventory = { items: defaultInventory };
        result.actions.push('Added default inventory to character');
      }
    } catch {
      result.actions.push('Failed to load default inventory items module');
    }
  }
}

/**
 * Propagates fixed character data to all storage locations
 * Updates the character in all relevant localStorage keys
 * to ensure consistency across storage.
 * 
 * @param {PartialCharacter} character - Character object to propagate
 * @param {RepairResult} result - Repair result to update with actions
 * @returns {Promise<boolean>} Whether at least one storage location was successfully updated
 */
async function propagateCharacterToStorageLocations(
  character: PartialCharacter,
  result: RepairResult
): Promise<boolean> {
  let successCount = 0;
  
  // Update character-creation-progress
  try {
    localStorage.setItem('character-creation-progress', 
      JSON.stringify({ character }));
    result.actions.push('Updated character-creation-progress');
    successCount++;
  } catch {
    result.actions.push('Failed to update character-creation-progress');
  }
  
  // Update completed-character
  try {
    localStorage.setItem('completed-character', 
      JSON.stringify(character));
    result.actions.push('Updated completed-character');
    successCount++;
  } catch {
    result.actions.push('Failed to update completed-character');
  }
  
  // Try to update the game state with the correct character
  try {
    const gameStateJSON = localStorage.getItem('saved-game-state');
    if (gameStateJSON) {
      const gameState = JSON.parse(gameStateJSON);
      if (!gameState.character) {
        gameState.character = { player: character, opponent: null };
      } else {
        gameState.character.player = character;
      }
      
      localStorage.setItem('saved-game-state', JSON.stringify(gameState));
      result.actions.push('Updated character in saved-game-state');
      successCount++;
    }
  } catch {
    result.actions.push('Failed to update character in saved-game-state');
  }
  
  return successCount > 0;
}