/**
 * GameStateStorage.ts
 * 
 * Handles saving and initializing game state data.
 * Provides functions to create a new game with proper defaults.
 * Ensures backward compatibility with legacy storage formats.
 */

import { GameState } from '../../types/gameState';
import { CharacterState } from '../../types/state/characterState';
import { NarrativeState } from '../../types/narrative.types';
import { SuggestedAction } from '../../types/campaign';
import { Character } from '../../types/character';
import { gameElementsStorage } from './gameElementsStorage';
import { storageKeys } from './storageKeys';
import { characterUtils } from '../character/characterUtils';
import { narrativeUtils } from '../narrative/narrativeUtils';

// Module constants
const MODULE_NAME = 'GameStorage:GameState';

/**
 * Debug console function for internal logging
 */
const debug = (...args: Array<unknown>): void => {
  console.log('[DEBUG GameStateStorage]', ...args);
};

/**
 * Interface for narrative entry with optional title.
 * Used when initializing a new game with saved narrative.
 */
interface NarrativeEntry {
  content: string;
  title?: string;
}

/**
 * Save the entire game state with backward compatibility.
 * Handles saving to multiple locations for legacy systems.
 * 
 * @param gameState - The complete game state to save
 */
const saveGameState = (gameState: Record<string, unknown>): void => {
  if (typeof window === 'undefined') return;
  
  try {
    debug('Saving complete game state');
    
    // Save the complete game state to primary and legacy locations
    localStorage.setItem(storageKeys.GAME_STATE, JSON.stringify(gameState));
    localStorage.setItem(storageKeys.CAMPAIGN_STATE, JSON.stringify(gameState));
    
    // Save individual components for backward compatibility
    saveBackwardsCompatibleData(gameState);
    
    debug('Game state saved to all storage locations');
  } catch (e) {
    console.error(`${MODULE_NAME} - Error saving game state:`, e);
  }
};

/**
 * Save individual components for backward compatibility with older versions.
 * Extracts and saves specific game components to their dedicated storage keys.
 * 
 * @param gameState - The game state to extract components from
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
        storageKeys.CHARACTER_PROGRESS, 
        JSON.stringify({ character: characterData })
      );
      
      localStorage.setItem(
        storageKeys.COMPLETED_CHARACTER,
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
        storageKeys.NARRATIVE_STATE, 
        JSON.stringify(narrativeHistory)
      );
    }
  }
  
  // Save inventory if present
  if (gameState.inventory && typeof gameState.inventory === 'object') {
    debug('Saving inventory for backwards compatibility');
    
    localStorage.setItem(
      storageKeys.INVENTORY_STATE,
      JSON.stringify(gameState.inventory)
    );
  }
};

/**
 * Initialize a new game state with proper defaults.
 * Creates a complete game state with all required components.
 * 
 * @param existingCharacter - Optional character object to use instead of creating a new one
 * @param savedNarrativeEntry - Optional narrative entry to preserve
 * @returns Initialized game state with character, narrative, and actions
 */
const initializeNewGame = (
  existingCharacter: Partial<Character> | null = null,
  savedNarrativeEntry: NarrativeEntry | null = null
): Partial<GameState> => {
  if (typeof window === 'undefined') return {};
  
  try {
    debug('Initializing new game state');
    
    // Get or create a character
    const character = characterUtils.getValidCharacter(existingCharacter);
    
    // Create character state with our character
    const characterState: CharacterState = {
      player: character,
      opponent: null
    };
    
    // Create default narratives
    const narrativeState = narrativeUtils.createDefaultNarrativeState();
    
    // Update narrative if saved one provided
    if (savedNarrativeEntry?.content) {
      narrativeUtils.updateNarrativeContent(narrativeState, savedNarrativeEntry.content);
      debug('Using saved narrative entry:', savedNarrativeEntry.title || 'Untitled');
    }
    
    // Get default suggested actions
    const suggestedActions = gameElementsStorage.getDefaultSuggestedActions();
    
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
      location: {
        type: 'town',
        name: 'Boot Hill'
      }
    };
    
    // Save to main game state
    localStorage.setItem(
      storageKeys.GAME_STATE,
      JSON.stringify(newGameState)
    );
    
    // Also save individual components for backward compatibility
    saveIndividualComponents(characterState, narrativeState, suggestedActions, inventoryItems);
    
    debug('New game state initialized and saved');
    return newGameState;
  } catch (e) {
    console.error(`${MODULE_NAME} - Error initializing new game:`, e);
    return {};
  }
};

/**
 * Save individual game components to separate storage keys for backward compatibility.
 * Ensures all components are properly stored in their dedicated locations.
 * 
 * @param characterState - Character state to save
 * @param narrativeState - Narrative state to save
 * @param suggestedActions - Suggested actions to save
 * @param inventoryItems - Inventory items to save
 */
const saveIndividualComponents = (
  characterState: CharacterState, 
  narrativeState: NarrativeState,
  suggestedActions: SuggestedAction[],
  inventoryItems: unknown
): void => {
  // Save character component
  if (characterState.player) {
    localStorage.setItem(
      storageKeys.CHARACTER_PROGRESS, 
      JSON.stringify({ character: characterState.player })
    );
    
    localStorage.setItem(
      storageKeys.COMPLETED_CHARACTER,
      JSON.stringify(characterState.player)
    );
    
    debug('Saved character to multiple storage locations');
  }
  
  // Save narrative component
  if (narrativeState.narrativeHistory?.length > 0) {
    localStorage.setItem(
      storageKeys.NARRATIVE_STATE, 
      JSON.stringify(narrativeState.narrativeHistory)
    );
    
    // Save first narrative entry for future resets
    localStorage.setItem(
      storageKeys.INITIAL_NARRATIVE, 
      JSON.stringify({ narrative: narrativeState.narrativeHistory[0] })
    );
    
    debug('Saved narrative data to storage');
  }
  
  // Save inventory component
  if (inventoryItems) {
    localStorage.setItem(
      storageKeys.INVENTORY_STATE,
      JSON.stringify({ items: inventoryItems })
    );
    
    debug('Saved inventory items to storage');
  }
  
  // Save complete state for campaign
  localStorage.setItem(
    storageKeys.CAMPAIGN_STATE,
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
 * Get character data from storage.
 * Tries multiple sources for better reliability.
 * 
 * @returns Character data or null if not found
 */
const getCharacter = (): { player: Character | null, opponent: Character | null } => {
  if (typeof window === 'undefined') return { player: null, opponent: null };
  
  try {
    const playerCharacter = characterUtils.findExistingCharacter();
    return { 
      player: playerCharacter ? characterUtils.ensureValidCharacter(playerCharacter) : null, 
      opponent: null 
    };
  } catch (e) {
    debug('Error getting character:', e);
    return { player: null, opponent: null };
  }
};

/**
 * Public API for game state storage functionality.
 * Maintains backward compatibility with original interface.
 */
export const GameStorage = {
  saveGameState,
  initializeNewGame,
  getDefaultCharacter: characterUtils.getDefaultCharacter,
  getDefaultInventoryItems: gameElementsStorage.getDefaultInventoryItems,
  getCharacter,
  keys: storageKeys
};
