/**
 * Validation utilities for game state consistency
 * 
 * This module provides functions for validating consistency across
 * different game state storage sources. It identifies mismatches
 * between character data, inventory, and other key state elements.
 */

import { ValidationResult } from './types';
import { InventoryItem } from '../../../types/item.types';

/**
 * Character inventory type
 * Represents the inventory structure within a character object
 */
interface CharacterInventory {
  /** Array of inventory items owned by the character */
  items: InventoryItem[];
}

/**
 * Character data interface
 * Represents the minimal character data needed for validation
 */
interface CharacterData {
  /** Character name */
  name: string;
  
  /** Character's inventory if available */
  inventory?: CharacterInventory;
}

/**
 * Gets character data from different storage sources
 * Attempts to retrieve and extract character data from all relevant
 * localStorage keys where character information might be stored.
 * 
 * @returns Object containing character data from each source, or null if not found/invalid
 */
function getCharactersFromSources() {
  let gameStateCharacter: CharacterData | null = null;
  let characterProgress: CharacterData | null = null;
  let completedCharacter: CharacterData | null = null;
  
  // Get character from game state
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
    // Continue to next source
  }
  
  // Get character from character creation progress
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
    // Continue to next source
  }
  
  // Get character from completed character
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
    // Continue to next source
  }
  
  return { gameStateCharacter, characterProgress, completedCharacter };
}

/**
 * Gets inventory data from different storage sources
 * Attempts to retrieve and extract inventory data from all relevant
 * localStorage keys where inventory information might be stored.
 * 
 * @returns Object containing inventory data from each source, or null if not found/invalid
 */
function getInventoryFromSources() {
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
    // Continue to next source
  }
  
  try {
    const inventoryJSON = localStorage.getItem('inventory-state');
    if (inventoryJSON) {
      inventoryState = JSON.parse(inventoryJSON);
    }
  } catch {
    // Continue to next source
  }
  
  return { gameStateInventory, inventoryState };
}

/**
 * Validates character consistency across different sources
 * Checks for name mismatches and missing inventory across different
 * character storage locations. Records issues in the validation result.
 * 
 * @param {Object} characterData - Character data from different sources
 * @param {ValidationResult} validation - Validation result to update with issues
 */
function validateCharacterConsistency(
  characterData: { 
    gameStateCharacter: CharacterData | null,
    characterProgress: CharacterData | null, 
    completedCharacter: CharacterData | null
  },
  validation: ValidationResult
): void {
  const { gameStateCharacter, characterProgress, completedCharacter } = characterData;
  
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
}

/**
 * Validates inventory consistency across different sources
 * Checks for inventory count mismatches across different
 * inventory storage locations. Records issues in the validation result.
 * 
 * @param {Object} inventoryData - Inventory data from different sources
 * @param {ValidationResult} validation - Validation result to update with issues
 */
function validateInventoryConsistency(
  inventoryData: {
    gameStateInventory: unknown[] | null,
    inventoryState: { items?: unknown[] } | unknown[] | null
  },
  validation: ValidationResult
): void {
  const { gameStateInventory, inventoryState } = inventoryData;
  
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
}

/**
 * Validates that game state is consistent across different storage sources
 * Performs a comprehensive check of character and inventory data
 * across multiple localStorage keys to ensure state consistency.
 * 
 * @returns {ValidationResult | null} Validation result with issues if any, or null if execution fails
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
    const characterData = getCharactersFromSources();
    validateCharacterConsistency(characterData, validation);
    
    // Check inventory consistency
    const inventoryData = getInventoryFromSources();
    validateInventoryConsistency(inventoryData, validation);
    
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