/**
 * Character Utilities
 * 
 * Functions for creating, validating, and retrieving character data.
 * Ensures type safety and handles default values.
 */

import { Character } from '../../types/character';
import { InventoryItem, ItemCategory } from '../../types/item.types';
import { gameElementsStorage } from '../storage/gameElementsStorage';
import { storageKeys } from '../storage/storageKeys';
import { storageUtils } from '../storage/storageUtils';

/**
 * Debug console function for internal logging
 */
const debug = (...args: Array<unknown>): void => {
  console.log('[DEBUG CharacterUtils]', ...args);
};

/**
 * Create a properly typed character with default values.
 * Ensures all required fields are present in the character.
 * 
 * @returns A new character with default values
 */
const createDefaultCharacter = (): Character => {
  // Get default items and ensure they have all required properties
  const items: InventoryItem[] = gameElementsStorage.getDefaultInventoryItems().map(item => {
    return {
      ...item,
      description: item.description || `Basic ${item.name}`,
      category: item.category as ItemCategory || 'misc'
    };
  });

  return {
    isNPC: false,
    isPlayer: true,
    id: `player-${Date.now()}`,
    name: 'New Character',
    inventory: { 
      items
    },
    attributes: {
      speed: 12,
      gunAccuracy: 12,
      throwingAccuracy: 12,
      strength: 12,
      baseStrength: 12,
      bravery: 12,
      experience: 0
    },
    minAttributes: {
      speed: 1,
      gunAccuracy: 1,
      throwingAccuracy: 1,
      strength: 8,
      baseStrength: 8,
      bravery: 1,
      experience: 0
    },
    maxAttributes: {
      speed: 20,
      gunAccuracy: 20,
      throwingAccuracy: 20,
      strength: 20,
      baseStrength: 20,
      bravery: 20,
      experience: 11
    },
    wounds: [],
    isUnconscious: false
  };
};

/**
 * Validates and completes character data to ensure a fully functional Character object.
 *
 * This function:
 * 1. Merges partial character data with default values
 * 2. Ensures all required attributes have valid values
 * 3. Provides default inventory if missing
 * 4. Maintains type safety throughout
 *
 * @param characterData - Potentially incomplete character data
 * @returns - Fully validated character with all required properties
 */
const ensureValidCharacter = (characterData: Partial<Character> | null): Character => {
  const defaultChar = createDefaultCharacter();
  
  if (!characterData) {
    return defaultChar;
  }
  
  // Ensure attributes object exists and has all required fields
  const attributes = {
    ...defaultChar.attributes,
    ...(characterData.attributes || { /* Intentionally empty */ })
  };
  
  // Ensure minAttributes and maxAttributes exist
  const minAttributes = {
    ...defaultChar.minAttributes,
    ...(characterData.minAttributes || { /* Intentionally empty */ })
  };
  
  const maxAttributes = {
    ...defaultChar.maxAttributes,
    ...(characterData.maxAttributes || { /* Intentionally empty */ })
  };
  
  // Ensure inventory with properly typed items
  let items: InventoryItem[] = defaultChar.inventory.items;
  
  if (characterData.inventory &&
      characterData.inventory.items && 
      Array.isArray(characterData.inventory.items) && 
      characterData.inventory.items.length > 0) {
    // Use existing inventory items if present
    items = characterData.inventory.items.map(partialItem => {
      const item = partialItem as Partial<InventoryItem>;
      // Ensure item has all required fields
      return {
        id: item.id || `item-${Date.now()}-${Math.random()}`,
        name: item.name || 'Unknown Item',
        description: item.description || 'No description',
        category: (item.category as ItemCategory) || 'misc',
        quantity: item.quantity || 1,
        // Only add optional properties if they exist in the original
        ...(item.weight !== undefined ? { weight: item.weight } : { /* Intentionally empty */ }),
        ...(item.value !== undefined ? { value: item.value } : { /* Intentionally empty */ }),
        ...(item.durability !== undefined ? { durability: item.durability } : { /* Intentionally empty */ })
      };
    });
  } else {
    // Use default inventory items if character has no items
    debug('Character had no inventory items, using defaults');
    items = gameElementsStorage.getDefaultInventoryItems();
  }
  
  // Define a type-safe function to get or default properties
  const getOrDefault = <T, K extends keyof T>(obj: Partial<T> | null | undefined, key: K, defaultValue: T[K]): T[K] => {
    if (!obj) return defaultValue;
    return (obj[key] !== undefined ? obj[key] : defaultValue) as T[K];
  };
  
  // Combine default and provided values
  return {
    isNPC: getOrDefault(characterData, 'isNPC', defaultChar.isNPC),
    isPlayer: getOrDefault(characterData, 'isPlayer', defaultChar.isPlayer),
    id: getOrDefault(characterData, 'id', defaultChar.id),
    name: getOrDefault(characterData, 'name', defaultChar.name),
    inventory: { 
      items: items  // This ensures character always has items
    },
    attributes: attributes,
    minAttributes: minAttributes,
    maxAttributes: maxAttributes,
    wounds: getOrDefault(characterData, 'wounds', defaultChar.wounds),
    isUnconscious: getOrDefault(characterData, 'isUnconscious', defaultChar.isUnconscious),
    weapon: getOrDefault(characterData, 'weapon', defaultChar.weapon),
    equippedWeapon: getOrDefault(characterData, 'equippedWeapon', defaultChar.equippedWeapon),
    strengthHistory: getOrDefault(characterData, 'strengthHistory', defaultChar.strengthHistory)
  };
};

/**
 * Find an existing character from various storage sources.
 * Checks multiple storage locations for character data with fallbacks.
 * 
 * @param existingCharacter - Optional character to use instead of storage
 * @returns - Found character or null
 */
const findExistingCharacter = (existingCharacter: Partial<Character> | null = null): Partial<Character> | null => {
  // Use provided character if available
  if (existingCharacter) {
    debug(`Using provided character: ${existingCharacter.name}`);
    return existingCharacter;
  }
  
  if (typeof window === 'undefined') return null;
  
  debug('No character provided, checking storage');
  
  // Try to get character from different sources
  const sources = [
    { key: storageKeys.CHARACTER_PROGRESS, path: 'character' },
    { key: storageKeys.COMPLETED_CHARACTER, path: '' },
    { key: storageKeys.GAME_STATE, path: 'character.player' }
  ];
  
  for (const source of sources) {
    try {
      const data = localStorage.getItem(source.key);
      if (!data) continue;
      
      const parsed = JSON.parse(data);
      const value = storageUtils.getNestedProperty<Partial<Character>>(parsed, source.path);
      
      if (value && typeof value === 'object' && 'name' in value) {
        debug(`Found character in ${source.key}: ${value.name}`);
        return value;
      }
    } catch (e) {
      debug(`Error checking ${source.key} for character:`, e);
    }
  }
  
  return null;
};

/**
 * Get a valid character from input or storage.
 * First tries to use provided character, then checks storage, finally creates default.
 * 
 * @param existingCharacter - Optional character data to use
 * @returns - Validated character
 */
const getValidCharacter = (existingCharacter: Partial<Character> | null = null): Character => {
  const characterData = findExistingCharacter(existingCharacter);
  const character = ensureValidCharacter(characterData);
  debug(`Final character being used: ${character.name}`);
  return character;
};

/**
 * Get the default character for new games.
 * Prioritizes existing character data from storage if available.
 * 
 * @returns Default character for new games
 */
const getDefaultCharacter = (): Character => {
  // Check if there's an existing character first
  try {
    const foundCharacter = findExistingCharacter();
    if (foundCharacter) {
      return ensureValidCharacter(foundCharacter);
    }
  } catch (e) {
    debug('Error getting existing character:', e);
  }
  
  // If no existing character, create a default one
  debug('No existing character found, creating default');
  return createDefaultCharacter();
};

/**
 * Public API for character utility functions.
 */
export const characterUtils = {
  createDefaultCharacter,
  ensureValidCharacter,
  findExistingCharacter,
  getValidCharacter,
  getDefaultCharacter
};
