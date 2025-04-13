/**
 * GameStateStorage.ts
 * 
 * Handles saving and initializing game state data.
 * Provides functions to create a new game with proper defaults.
 * Ensures backward compatibility with legacy storage formats.
 * 
 * IMPROVED: Better character persistence during reset and initialization
 */

import { GameState } from '../../types/gameState';
import { CharacterState } from '../../types/state/characterState';
import { NarrativeState, NarrativeDisplayMode } from '../../types/narrative.types';

interface NarrativeEntry {
  content: string;
  title?: string;
}
import { SuggestedAction } from '../../types/campaign';
import { gameElementsStorage } from './gameElementsStorage';
import { Character } from '../../types/character';
import { InventoryItem, ItemCategory } from '../../types/item.types';

// Module constants
const MODULE_NAME = 'GameStorage:GameState';

// Storage keys for consistent access
const STORAGE_KEYS = {
  GAME_STATE: 'saved-game-state',
  CAMPAIGN_STATE: 'campaignState',
  CHARACTER_PROGRESS: 'character-creation-progress',
  COMPLETED_CHARACTER: 'completed-character',
  NARRATIVE_STATE: 'narrativeState',
  INITIAL_NARRATIVE: 'initial-narrative'
};

// Debug console function
const debug = (...args: Array<unknown>): void => {
  console.log('[DEBUG GameStateStorage]', ...args);
};

/**
 * Save the entire game state.
 * Saves to multiple locations for backward compatibility.
 *
 * @param {Record<string, unknown>} gameState - The game state to save
 */
const saveGameState = (gameState: Record<string, unknown>): void => {
  if (typeof window === 'undefined') return;
  
  try {
    debug('Saving complete game state');
    
    // Save the complete game state
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(gameState));
    
    // Also save to campaignState for backward compatibility
    localStorage.setItem(STORAGE_KEYS.CAMPAIGN_STATE, JSON.stringify(gameState));
    
    // Save individual components for backward compatibility
    saveBackwardsCompatibleData(gameState);
    
    debug('Game state saved to all storage locations');
  } catch (e) {
    console.error(`${MODULE_NAME} - Error saving game state:`, e);
  }
};

/**
 * Save individual components for backward compatibility with older versions.
 *
 * @param {Record<string, unknown>} gameState - The game state to extract components from
 */
const saveBackwardsCompatibleData = (gameState: Record<string, unknown>): void => {
  // Save character data if present
  if ('character' in gameState) {
    const characterData = gameState.character && typeof gameState.character === 'object' 
      ? (gameState.character as CharacterState).player 
      : gameState.character;
      
    if (characterData) {
      debug('Saving character data for backwards compatibility');
      
      localStorage.setItem(
        STORAGE_KEYS.CHARACTER_PROGRESS, 
        JSON.stringify({ character: characterData })
      );
      
      // Also save to COMPLETED_CHARACTER for more redundancy
      localStorage.setItem(
        STORAGE_KEYS.COMPLETED_CHARACTER,
        JSON.stringify(characterData)
      );
    }
  }
  
  // Save narrative history if present
  if ('narrative' in gameState && gameState.narrative && typeof gameState.narrative === 'object') {
    const narrativeHistory = 'narrativeHistory' in (gameState.narrative as NarrativeState) 
      ? (gameState.narrative as NarrativeState).narrativeHistory 
      : [];
      
    if (narrativeHistory && Array.isArray(narrativeHistory)) {
      debug('Saving narrative history for backwards compatibility');
      
      localStorage.setItem(
        STORAGE_KEYS.NARRATIVE_STATE, 
        JSON.stringify(narrativeHistory)
      );
    }
  }
  
  // Save inventory if present
  if (gameState.inventory && typeof gameState.inventory === 'object') {
    debug('Saving inventory for backwards compatibility');
    
    localStorage.setItem(
      'inventory-state',
      JSON.stringify(gameState.inventory)
    );
  }
};

/**
 * Create a properly typed character with default values.
 * Ensures all required fields are present in the character.
 */
const createDefaultCharacter = (): Character => {
  // Get default items and ensure they have all required properties
  const items: InventoryItem[] = gameElementsStorage.getDefaultInventoryItems().map(item => {
    return {
      ...item,
      description: item.description || `Basic ${item.name}`,
      category: item.category as ItemCategory || 'misc'
      // Weight, value, and durability are now optional in InventoryItem
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
 * @example
 * // Validate character loaded from localStorage
 * const character = ensureValidCharacter(loadedCharacterData);
 *
 * @param {Partial<Character> | null} characterData - Incomplete character data from storage or API
 * @returns {Character} Fully validated character with all required properties
 *
 * @throws Will not throw but will return default character if input is invalid
 * @see createDefaultCharacter For default values used when properties are missing
 * @see gameElementsStorage.getDefaultInventoryItems For default inventory items
 */
const ensureValidCharacter = (characterData: Partial<Character> | null): Character => {
  const defaultChar = createDefaultCharacter();
  
  if (!characterData) {
    return defaultChar;
  }
  
  // Ensure attributes object exists and has all required fields
  const attributes = {
    ...defaultChar.attributes,
    ...(characterData.attributes || {})
  };
  
  // Ensure minAttributes and maxAttributes exist
  const minAttributes = {
    ...defaultChar.minAttributes,
    ...(characterData.minAttributes || {})
  };
  
  const maxAttributes = {
    ...defaultChar.maxAttributes,
    ...(characterData.maxAttributes || {})
  };
  
  // Ensure inventory with properly typed items
  // FIXED: Always provide default items if inventory is empty
  let items: InventoryItem[] = defaultChar.inventory.items;
  
  if (characterData.inventory?.items && 
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
        ...(item.weight !== undefined ? { weight: item.weight } : {}),
        ...(item.value !== undefined ? { value: item.value } : {}),
        ...(item.durability !== undefined ? { durability: item.durability } : {})
      };
    });
  } else {
    // Use default inventory items if character has no items
    debug('Character had no inventory items, using defaults from gameElementsStorage');
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
 * Initialize a new game state with proper defaults.
 * Creates a complete game state with all required components.
 * Now improved to preserve character data from multiple sources.
 * 
 * @param existingCharacter Optional character object to use instead of creating a new one
interface NarrativeEntry {
  content: string;
  title?: string;
}

/**
 * @param savedNarrativeEntry Optional narrative entry to preserve
 * @returns Initialized game state with character, narrative, and actions
 */
const initializeNewGame = (
  existingCharacter: Partial<Character> | null = null,
  savedNarrativeEntry: NarrativeEntry | null = null
): Partial<GameState> => {
  if (typeof window === 'undefined') return {};
  
  try {
    debug('Initializing new game state');
    
    // Use provided character or look for existing character data first
    let characterData: Partial<Character> | null = existingCharacter;
    
    if (!characterData) {
      debug('No character provided, checking storage');
      
      // Try to get character from different sources
      const sources = [
        STORAGE_KEYS.CHARACTER_PROGRESS,
        STORAGE_KEYS.COMPLETED_CHARACTER,
        STORAGE_KEYS.GAME_STATE
      ];
      
      for (const source of sources) {
        try {
          const data = localStorage.getItem(source);
          if (!data) continue;
          
          const parsed = JSON.parse(data);
          
          if (source === STORAGE_KEYS.CHARACTER_PROGRESS && 
              parsed && parsed.character &&
              typeof parsed.character === 'object' &&
              'name' in parsed.character) {
            characterData = parsed.character as Partial<Character>;
            debug(`Found character in ${source}: ${characterData.name}`);
            break;
          }
          else if (source === STORAGE_KEYS.COMPLETED_CHARACTER &&
                  parsed && typeof parsed === 'object' && 'name' in parsed) {
            characterData = parsed as Partial<Character>;
            debug(`Found character in ${source}: ${characterData.name}`);
            break;
          }
          else if (source === STORAGE_KEYS.GAME_STATE &&
                  parsed && parsed.character && parsed.character.player && 
                  typeof parsed.character.player === 'object' &&
                  'name' in parsed.character.player) {
            characterData = parsed.character.player as Partial<Character>;
            debug(`Found character in ${source}: ${characterData.name}`);
            break;
          }
        } catch (e) {
          debug(`Error checking ${source} for character:`, e);
        }
      }
    } else {
      debug(`Using provided character: ${characterData.name}`);
    }
    
    // Convert to a fully valid Character
    const character: Character = ensureValidCharacter(characterData);
    debug(`Final character being used: ${character.name}`);
    
    // Create character state with our character
    const characterState: CharacterState = {
      player: character,
      opponent: null
    };
    
    // Create default narratives
    const narrativeState = createDefaultNarrativeState();
    
    // If we have a saved narrative entry, use it
    if (savedNarrativeEntry && savedNarrativeEntry.content) {
      if (narrativeState.narrativeHistory && narrativeState.narrativeHistory.length > 0) {
        narrativeState.narrativeHistory[0] = savedNarrativeEntry.content;
      }
      
      if (narrativeState.currentStoryPoint) {
        narrativeState.currentStoryPoint.content = savedNarrativeEntry.content;
      }
      
      debug('Using saved narrative entry:', savedNarrativeEntry.title || 'Untitled');
    }
    
    // Default suggested actions
    const suggestedActions: SuggestedAction[] = [
      { 
        id: `action-default-1-${Date.now()}`, 
        title: 'Look around', 
        description: 'Survey your surroundings', 
        type: 'optional' 
      },
      { 
        id: `action-default-2-${Date.now()}`, 
        title: 'Visit the saloon', 
        description: 'Step into the local drinking establishment', 
        type: 'optional' 
      },
      { 
        id: `action-default-3-${Date.now()}`, 
        title: 'Check your gear', 
        description: 'Examine what you brought with you', 
        type: 'optional' 
      }
    ];
    
    // Get inventory items - use character inventory
    const inventoryItems = character.inventory.items;
    
    // Create partial game state with all critical components
    const newGameState: Partial<GameState> = {
      character: characterState,
      narrative: narrativeState,
      suggestedActions: suggestedActions,
      inventory: { items: inventoryItems, equippedWeaponId: null },
      currentPlayer: character.name,
      isClient: true,
      savedTimestamp: Date.now(),
      // FIXED: Ensure location is properly set to Boot Hill
      location: {
        type: 'town',
        name: 'Boot Hill'
      }
    };
    
    // Save to all relevant localStorage locations
    debug('Saving new game state to all storage locations');
    
    // Save to main game state
    localStorage.setItem(
      STORAGE_KEYS.GAME_STATE,
      JSON.stringify(newGameState)
    );
    
    // Also save individual components for backward compatibility
    saveIndividualComponents(characterState, narrativeState, suggestedActions, inventoryItems);
    
    debug('New game state initialized and saved');
    return newGameState;
  } catch (e) {
    console.error(`${MODULE_NAME} - Error initializing new game:`, e);
    
    // Return an empty state on error
    return {};
  }
};

/**
 * Save individual game components to separate storage keys for backward compatibility.
 *
 * @param characterState Character state to save
 * @param narrativeState Narrative state to save
 * @param suggestedActions Suggested actions to save
 * @param inventoryItems Inventory items to save
 */
const saveIndividualComponents = (
  characterState: CharacterState, 
  narrativeState: NarrativeState,
  suggestedActions: unknown,
  inventoryItems: unknown
): void => {
  // Save character component
  if (characterState.player) {
    localStorage.setItem(
      STORAGE_KEYS.CHARACTER_PROGRESS, 
      JSON.stringify({ character: characterState.player })
    );
    
    // Also save to completed-character for redundancy
    localStorage.setItem(
      STORAGE_KEYS.COMPLETED_CHARACTER,
      JSON.stringify(characterState.player)
    );
    
    debug('Saved character to multiple storage locations');
  }
  
  // Save narrative component
  if (narrativeState.narrativeHistory && narrativeState.narrativeHistory.length > 0) {
    localStorage.setItem(
      STORAGE_KEYS.NARRATIVE_STATE, 
      JSON.stringify(narrativeState.narrativeHistory)
    );
    
    // Save first narrative entry for future resets
    localStorage.setItem(
      STORAGE_KEYS.INITIAL_NARRATIVE, 
      JSON.stringify({ narrative: narrativeState.narrativeHistory[0] })
    );
    
    debug('Saved narrative data to storage');
  }
  
  // Save inventory component
  if (inventoryItems) {
    localStorage.setItem(
      'inventory-state',
      JSON.stringify({ items: inventoryItems })
    );
    
    debug('Saved inventory items to storage');
  }
  
  // Save complete state for campaign
  localStorage.setItem(
    STORAGE_KEYS.CAMPAIGN_STATE,
    JSON.stringify({
      character: characterState,
      narrative: narrativeState,
      suggestedActions: suggestedActions,
      inventory: { items: inventoryItems, equippedWeaponId: null }
    })
  );
  
  debug('Saved complete state to campaign state');
};

/**
 * Create default narrative state for a new game.
 * Initializes narrative with default content and settings.
 * 
 * @returns Default narrative state for new games
 */
const createDefaultNarrativeState = (): NarrativeState => {
  // FIXED: Changed defaultNarrativeText to be empty instead of hardcoded text
  // This ensures no text shows before AI-generated content is ready
  const defaultNarrativeText = '';
  
  return {
    currentStoryPoint: {
      id: 'initial',
      type: 'exposition',
      title: 'New Adventure',
      content: defaultNarrativeText,
      choices: []
    },
    visitedPoints: ['initial'],
    narrativeHistory: defaultNarrativeText ? [defaultNarrativeText] : [],
    availableChoices: [],
    displayMode: 'full' as NarrativeDisplayMode,
    context: 'Starting your adventure'
  };
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
    // Try sources in order of reliability
    const sources = [
      { key: STORAGE_KEYS.CHARACTER_PROGRESS, path: 'character' },
      { key: STORAGE_KEYS.COMPLETED_CHARACTER, path: '' },
      { key: STORAGE_KEYS.GAME_STATE, path: 'character.player' }
    ];
    
    for (const source of sources) {
      try {
        const data = localStorage.getItem(source.key);
        if (!data) continue;
        
        const parsed = JSON.parse(data);
        
        // Navigate to the path using type-safe access
        let value: Record<string, unknown> | null = parsed;
        const pathParts = source.path.split('.');
        
        for (const part of pathParts) {
          if (part && value && typeof value === 'object') {
            value = value[part] as Record<string, unknown> || null;
          }
        }
        
        if (value && typeof value === 'object' && 'name' in value) {
          debug(`Found character in ${source.key}: ${value.name}`);
          return ensureValidCharacter(value as Partial<Character>);
        }
      } catch (e) {
        debug(`Error checking ${source.key} for character:`, e);
      }
    }
  } catch (e) {
    debug('Error getting existing character:', e);
  }
  
  // If no existing character, create a default one
  debug('No existing character found, creating default');
  return createDefaultCharacter();
};

/**
 * Get default inventory items for new characters.
 * 
 * @returns Array of default inventory items
 */
const getDefaultInventoryItems = (): InventoryItem[] => {
  // First try to get from gameElementsStorage
  const defaultItems = gameElementsStorage.getDefaultInventoryItems();
  
  // Ensure all items have required properties
  return defaultItems.map(item => {
    const inventoryItem: InventoryItem = {
      id: item.id || `item-${Date.now()}-${Math.random()}`,
      name: item.name || 'Unknown Item',
      description: item.description || `Basic ${item.name || 'item'}`,
      category: (item.category as ItemCategory) || 'misc',
      quantity: item.quantity || 1
    };
    
    // Add optional properties only if they already exist
    if ('weight' in item) {
      inventoryItem.weight = item.weight;
    }
    
    if ('value' in item) {
      inventoryItem.value = item.value;
    }
    
    if ('durability' in item) {
      inventoryItem.durability = item.durability;
    }
    
    return inventoryItem;
  });
};

/**
 * Get character data from storage.
 * Tries multiple sources for better reliability.
 * 
 * @returns Character data or null if not found
 */
const getCharacter = (): { player: Character | null, opponent: Character | null } => {
  if (typeof window === 'undefined') return { player: null, opponent: null };
  
  try {
    // Try to get from different sources in order of priority
    const sources = [
      { key: STORAGE_KEYS.CHARACTER_PROGRESS, path: 'character' },
      { key: STORAGE_KEYS.COMPLETED_CHARACTER, path: '' },
      { key: STORAGE_KEYS.GAME_STATE, path: 'character.player' }
    ];
    
    let playerCharacter: Character | null = null;
    
    for (const source of sources) {
      try {
        const data = localStorage.getItem(source.key);
        if (!data) continue;
        
        const parsed = JSON.parse(data);
        
        // Navigate to the path using type-safe access
        let value: Record<string, unknown> | null = parsed;
        const pathParts = source.path.split('.');
        
        for (const part of pathParts) {
          if (part && value && typeof value === 'object') {
            value = value[part] as Record<string, unknown> || null;
          }
        }
        
        if (value && typeof value === 'object' && 'name' in value) {
          debug(`Found character in ${source.key}: ${value.name}`);
          playerCharacter = ensureValidCharacter(value as Partial<Character>);
          break;
        }
      } catch (e) {
        debug(`Error checking ${source.key} for character:`, e);
      }
    }
    
    return { player: playerCharacter, opponent: null };
  } catch (e) {
    debug('Error getting character:', e);
    return { player: null, opponent: null };
  }
};

export const GameStorage = {
  saveGameState,
  initializeNewGame,
  getDefaultCharacter,
  getDefaultInventoryItems,
  getCharacter,
  keys: STORAGE_KEYS
};
