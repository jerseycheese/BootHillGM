// BootHillGMApp/app/utils/characterUtils.ts (Reordered)
import { Character, STORAGE_KEYS } from "../types/character";
import { getStartingInventory } from "./startingInventory";
import { logDiagnostic } from "./initializationDiagnostics";
import { GameStateWithCharacter } from "./debugActionTypes";
import { GameState } from "../types/gameState";

/**
 * Extracts player character from the game state
 * This is a simplified helper that works with the unified GameState
 * 
 * @param state Current game state from GameStateProvider
 * @returns The player character or null if not found
 */
export const getPlayerCharacter = (state: GameState): Character | null => {
  if (!state || !state.character || !state.character.player) {
    return null;
  }
  
  return state.character.player;
};

/**
 * Creates a base character with required attributes and inventory
 *
 * @param id Unique identifier for the character
 * @param name Character's display name
 * @returns A fully initialized Character object with default attributes and inventory
 */
export const createBaseCharacter = (id: string, name: string): Character => {
  const defaultItems = getStartingInventory().map(item => ({
    ...item,
    description: item.description || `Basic ${item.name}`
  }));

  return {
    id,
    name,
    isNPC: false,
    isPlayer: true,
    attributes: {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 10,
      baseStrength: 10,
      bravery: 10,
      experience: 5
    },
    minAttributes: {
      speed: 1,
      gunAccuracy: 1,
      throwingAccuracy: 1,
      strength: 1,
      baseStrength: 1,
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
      experience: 10
    },
    inventory: { items: defaultItems },
    wounds: [],
    isUnconscious: false
  };
};

/**
 * Extracts character data from localStorage
 * Serves as a fallback if game state extraction fails
 *
 * @returns The extracted character data or null if not found
 */
export const extractCharacterFromStorage = (): Character | null => {
  try {
    logDiagnostic('EXTRACT', 'Falling back to extracting character data from storage');

    // Check completed-character first (most reliable)
    const completedChar = localStorage.getItem(STORAGE_KEYS.COMPLETED_CHARACTER);
    if (completedChar) {
      try {
        const character = JSON.parse(completedChar);
        if (character && character.name && character.attributes) {
          // Ensure character has inventory
          if (!character.inventory || !character.inventory.items) {
            character.inventory = { items: getStartingInventory() };
          } else if (Array.isArray(character.inventory.items) && character.inventory.items.length === 0) {
            character.inventory.items = getStartingInventory();
          }

          logDiagnostic('EXTRACT', 'Found character in COMPLETED_CHARACTER', {
            name: character.name,
            hasInventory: !!character.inventory?.items,
            inventoryCount: character.inventory?.items?.length || 0
          });
          return character;
        }
      } catch (err) {
        logDiagnostic('EXTRACT', 'Error parsing COMPLETED_CHARACTER', { error: String(err) });
      }
    }

    // Check character-creation-progress if completed character not found
    const charProgress = localStorage.getItem(STORAGE_KEYS.CHARACTER_CREATION);
    if (charProgress) {
      try {
        const parsed = JSON.parse(charProgress);
        if (parsed && parsed.character && parsed.character.name && parsed.character.attributes) {
          // Ensure character has inventory
          if (!parsed.character.inventory || !parsed.character.inventory.items) {
            parsed.character.inventory = { items: getStartingInventory() };
          } else if (Array.isArray(parsed.character.inventory.items) && parsed.character.inventory.items.length === 0) {
            parsed.character.inventory.items = getStartingInventory();
          }

          logDiagnostic('EXTRACT', 'Found character in CHARACTER_CREATION', {
            name: parsed.character.name,
            hasInventory: !!parsed.character.inventory?.items,
            inventoryCount: parsed.character.inventory?.items?.length || 0
          });
          return parsed.character;
        }
      } catch (err) {
        logDiagnostic('EXTRACT', 'Error parsing CHARACTER_CREATION', { error: String(err) });
      }
    }

    // Check saved-game-state as a last resort
    const savedState = localStorage.getItem('saved-game-state');
    if (savedState) {
      try {
        const gameState = JSON.parse(savedState);
        if (gameState && gameState.character && gameState.character.player &&
            gameState.character.player.name && gameState.character.player.attributes) {

          // Ensure character has inventory
          if (!gameState.character.player.inventory || !gameState.character.player.inventory.items) {
            gameState.character.player.inventory = { items: getStartingInventory() };
          } else if (Array.isArray(gameState.character.player.inventory.items) &&
                    gameState.character.player.inventory.items.length === 0) {
            gameState.character.player.inventory.items = getStartingInventory();
          }

          logDiagnostic('EXTRACT', 'Found character in saved-game-state', {
            name: gameState.character.player.name,
            hasInventory: !!gameState.character.player.inventory?.items,
            inventoryCount: gameState.character.player.inventory?.items?.length || 0
          });
          return gameState.character.player;
        }
      } catch (err) {
        logDiagnostic('EXTRACT', 'Error parsing saved-game-state', { error: String(err) });
      }
    }

    // Check characterData key which may be set by the reset handler
    const characterData = localStorage.getItem('characterData');
    if (characterData) {
      try {
        const character = JSON.parse(characterData);
        if (character && character.name && character.attributes) {
          // Ensure character has inventory
          if (!character.inventory || !character.inventory.items) {
            character.inventory = { items: getStartingInventory() };
          } else if (Array.isArray(character.inventory.items) && character.inventory.items.length === 0) {
            character.inventory.items = getStartingInventory();
          }

          logDiagnostic('EXTRACT', 'Found character in characterData', {
            name: character.name,
            hasInventory: !!character.inventory?.items,
            inventoryCount: character.inventory?.items?.length || 0
          });
          return character;
        }
      } catch (err) {
        logDiagnostic('EXTRACT', 'Error parsing characterData', { error: String(err) });
      }
    }

    logDiagnostic('EXTRACT', 'No valid character data found in any storage location');
    return null;
  } catch (err) {
    logDiagnostic('EXTRACT', 'Error in extractCharacterFromStorage', { error: String(err) });
    return null;
  }
};


/**
 * Extract character data from game state
 * This is used to preserve character data during reset
 *
 * @param gameState The current game state
 * @returns The extracted character data or null if not found
 */
export const extractCharacterData = (gameState: GameStateWithCharacter) => {
  try {
    logDiagnostic('EXTRACT', 'Extracting character data from game state');

    // Check if game state has character data
    if (!gameState || !gameState.character || !gameState.character.player) {
      logDiagnostic('EXTRACT', 'No character data found in game state');
      return extractCharacterFromStorage(); // Now defined above
    }

    const character = gameState.character.player;

    // Validate character has required attributes
    if (!character.name || !character.attributes) {
      logDiagnostic('EXTRACT', 'Character data in game state is incomplete');
      return extractCharacterFromStorage(); // Now defined above
    }

    // Ensure character has inventory
    if (!character.inventory || !character.inventory.items) {
      character.inventory = { items: getStartingInventory() };
      logDiagnostic('EXTRACT', 'Added default inventory to character', {
        inventoryItems: character.inventory.items.length
      });
    }

    // Extract only the fields we want to preserve
    const preservedData = {
      id: character.id || `character_${Date.now()}`,
      name: character.name,
      attributes: character.attributes,
      minAttributes: character.minAttributes,
      maxAttributes: character.maxAttributes,
      inventory: character.inventory,
      wounds: character.wounds || [],
      isNPC: character.isNPC || false,
      isPlayer: character.isPlayer || true,
      isUnconscious: character.isUnconscious || false
    };

    logDiagnostic('EXTRACT', 'Character data extracted from game state', {
      name: preservedData.name,
      attributeCount: Object.keys(preservedData.attributes || { /* Intentionally empty */ }).length,
      inventoryCount: preservedData.inventory?.items?.length || 0
    });

    return preservedData;
  } catch (err) {
    logDiagnostic('EXTRACT', 'Error extracting character from game state', { error: String(err) });
    return extractCharacterFromStorage(); // Now defined above
  }
};
