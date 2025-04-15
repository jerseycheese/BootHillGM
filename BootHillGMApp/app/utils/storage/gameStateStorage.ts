/**
 * GameStateStorage.ts
 * 
 * Handles saving and initializing game state data.
 * Provides functions to create a new game with proper defaults.
 * Ensures backward compatibility with legacy storage formats.
 * 
 * @module GameStateStorage
 */

import { GameState } from '../../types/gameState';
import { CharacterState } from '../../types/state/characterState';
import { SuggestedAction } from '../../types/campaign';
import { Character } from '../../types/character';
import { NarrativeJournalEntry } from '../../types/journal';
import { LocationType } from '../../services/locationService';
import { gameElementsStorage } from './gameElementsStorage';
import { storageKeys } from './storageKeys';
import { storageUtils } from './storageUtils';
import { characterUtils } from '../character/characterUtils';
import { narrativeUtils } from '../narrative/narrativeUtils';
import { gameInitializer } from './gameInitializer';
import { backwardCompatibility } from './backwardCompatibility';

// Module constants
const MODULE_NAME = 'GameStorage:GameState';

/**
 * Debug console function for internal logging.
 * Only outputs when in development environment.
 * 
 * @param args - Arguments to log to console
 */
const debug = (...args: Array<unknown>): void => {
  console.log('[DEBUG GameStateStorage]', ...args);
};

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
    storageUtils.setItem(storageKeys.GAME_STATE, gameState);
    storageUtils.setItem(storageKeys.CAMPAIGN_STATE, gameState);
    
    // Save individual components for backward compatibility
    backwardCompatibility.saveBackwardsCompatibleData(gameState);
    
    debug('Game state saved to all storage locations');
  } catch (e) {
    console.error(`${MODULE_NAME} - Error saving game state:`, e);
  }
};

/**
 * Save state to localStorage for initialization scenarios.
 * Used by initialization code paths to store initial game state.
 * 
 * @param character - Character object to save
 * @param narrative - Narrative content to save
 * @param journalEntry - Optional journal entry to save
 * @param actions - Suggested actions to save
 * @param location - Optional location data, defaults to Boot Hill town
 * @returns The saved state object
 */
const saveInitialGameState = (
  character: Character,
  narrative: string, 
  journalEntry: NarrativeJournalEntry | null, 
  actions: SuggestedAction[],
  location: LocationType = { type: 'town', name: 'Boot Hill' }
): Record<string, unknown> => {
  const defaultItems = character.inventory?.items || [];
  
  // Save state to localStorage
  const stateToSave = {
    character: { player: character, opponent: null },
    inventory: { items: defaultItems, equippedWeaponId: null },
    journal: { entries: journalEntry ? [journalEntry] : [] },
    narrative: { narrativeHistory: narrative ? [narrative] : [] },
    suggestedActions: actions,
    location: location
  };
  
  storageUtils.setItem(storageKeys.GAME_STATE, stateToSave);
  
  return stateToSave;
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
  savedNarrativeEntry: NarrativeJournalEntry | null = null
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
    storageUtils.setItem(storageKeys.GAME_STATE, newGameState);
    
    // Also save individual components for backward compatibility
    backwardCompatibility.saveIndividualComponents(
      characterState, 
      narrativeState, 
      suggestedActions, 
      inventoryItems
    );
    
    debug('New game state initialized and saved');
    return newGameState;
  } catch (e) {
    console.error(`${MODULE_NAME} - Error initializing new game:`, e);
    return {};
  }
};

/**
 * Get character data from storage.
 * Tries multiple sources for better reliability.
 * 
 * @returns Object containing player and opponent character data or null if not found
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
 * Get default inventory items for a new character.
 * 
 * @returns Array of default inventory items
 */
const getDefaultInventoryItems = (): unknown => {
  return gameElementsStorage.getDefaultInventoryItems();
};

/**
 * Public API for game state storage functionality.
 * Maintains backward compatibility with original interface.
 */
export const GameStorage = {
  saveGameState,
  saveInitialGameState,
  initializeNewGame,
  initializeGameState: gameInitializer.initializeGameState,
  dispatchNarrativeContent: gameInitializer.dispatchNarrativeContent,
  dispatchSuggestedActions: gameInitializer.dispatchSuggestedActions,
  saveContentToLocalStorage: gameInitializer.saveContentToLocalStorage,
  getDefaultCharacter: characterUtils.getDefaultCharacter,
  getDefaultInventoryItems,
  getCharacter,
  keys: storageKeys
};