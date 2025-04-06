/**
 * Game State Storage Module
 * 
 * Handles saving and initializing game state data.
 * Provides functions to create a new game with proper defaults.
 * Ensures backward compatibility with legacy storage formats.
 */

import { GameState } from '../../types/gameState';
import { CharacterState } from '../../types/state/characterState';
import { NarrativeState } from '../../types/narrative.types';
import { SuggestedAction } from '../../types/campaign';
import { gameElementsStorage } from './gameElementsStorage';

// Module constants
const MODULE_NAME = 'GameStorage:GameState';

// Storage keys for game state data
const STORAGE_KEYS = {
  GAME_STATE: 'saved-game-state',
  CAMPAIGN_STATE: 'campaignState',
  CHARACTER_PROGRESS: 'character-creation-progress',
  NARRATIVE_STATE: 'narrativeState',
  INITIAL_NARRATIVE: 'initial-narrative'
};

/**
 * Save the entire game state.
 * Saves to multiple locations for backward compatibility.
 * 
 * @param gameState The complete game state to save
 */
const saveGameState = (gameState: Record<string, unknown>): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Save the complete game state
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(gameState));
    
    // Also save campaign state for backward compatibility
    localStorage.setItem(STORAGE_KEYS.CAMPAIGN_STATE, JSON.stringify(gameState));
    
    // Save individual components for backward compatibility
    saveBackwardsCompatibleData(gameState);
  } catch (e) {
    console.error(`${MODULE_NAME} - Error saving game state:`, e);
  }
};

/**
 * Helper to save individual components for backward compatibility.
 * Extracts and saves character and narrative data separately.
 * 
 * @param gameState The game state to extract components from
 */
const saveBackwardsCompatibleData = (gameState: Record<string, unknown>): void => {
  // Save character data
  if (gameState.character) {
    const characterData = 'player' in (gameState.character as Record<string, unknown>)
      ? (gameState.character as Record<string, unknown>).player
      : gameState.character;
      
    if (characterData) {
      localStorage.setItem(
        STORAGE_KEYS.CHARACTER_PROGRESS, 
        JSON.stringify({ character: characterData })
      );
    }
  }
  
  // Save narrative state if present
  if (gameState.narrative && typeof gameState.narrative === 'object') {
    const narrativeObj = gameState.narrative as Record<string, unknown>;
    const narrativeHistory = 'narrativeHistory' in narrativeObj
      ? narrativeObj.narrativeHistory
      : [];
      
    if (narrativeHistory && Array.isArray(narrativeHistory)) {
      localStorage.setItem(
        STORAGE_KEYS.NARRATIVE_STATE, 
        JSON.stringify(narrativeHistory)
      );
    }
  }
};

/**
 * Initialize a new game state with proper defaults.
 * Creates a complete game state with all required components.
 * 
 * @returns Initialized game state with character, narrative, and actions
 */
const initializeNewGame = (): Partial<GameState> => {
  if (typeof window === 'undefined') return {};
  
  try {
    // Create default character structure with starting inventory items
    const characterState = createDefaultCharacterState();
    
    // Create default narratives
    const narrativeState = createDefaultNarrativeState();
    
    // Default suggested actions - using the correct function
    const suggestedActions: SuggestedAction[] = []; // Initialize as empty array
    
    // Create partial game state with all critical components
    const newGameState: Partial<GameState> = {
      character: characterState,
      narrative: narrativeState,
      suggestedActions: suggestedActions,
      currentPlayer: characterState.player?.name || 'New Character',
      isClient: true,
      savedTimestamp: Date.now()
    };
    
    // Save to localStorage
    localStorage.setItem(
      STORAGE_KEYS.GAME_STATE,
      JSON.stringify(newGameState)
    );
    
    // Also save individual components for backward compatibility
    saveIndividualComponents(characterState, narrativeState, suggestedActions);
    
    return newGameState;
  } catch (e) {
    console.error(`${MODULE_NAME} - Error initializing new game:`, e);
    return {};
  }
};

/**
 * Save individual components for backward compatibility.
 * Ensures all legacy formats are properly supported.
 * 
 * @param characterState Character state to save
 * @param narrativeState Narrative state to save
 * @param suggestedActions Suggested actions to save
 */
const saveIndividualComponents = (
  characterState: CharacterState, 
  narrativeState: NarrativeState,
  suggestedActions: unknown
): void => {
  // Save character component
  if (characterState.player) {
    localStorage.setItem(
      STORAGE_KEYS.CHARACTER_PROGRESS, 
      JSON.stringify({ character: characterState.player })
    );
  }
  
  // Save narrative component
  if (narrativeState.narrativeHistory && narrativeState.narrativeHistory.length > 0) {
    localStorage.setItem(
      STORAGE_KEYS.NARRATIVE_STATE, 
      JSON.stringify(narrativeState.narrativeHistory)
    );
    
    localStorage.setItem(
      STORAGE_KEYS.INITIAL_NARRATIVE, 
      JSON.stringify({ narrative: narrativeState.narrativeHistory[0] })
    );
  }
  
  // Save complete state for campaign
  localStorage.setItem(
    STORAGE_KEYS.CAMPAIGN_STATE, 
    JSON.stringify({
      character: characterState,
      narrative: narrativeState,
      suggestedActions: suggestedActions
    })
  );
};

/**
 * Create default character state for a new game.
 * Initializes character with standard attributes and inventory.
 * 
 * @returns Default character state for new games
 */
const createDefaultCharacterState = (): CharacterState => {
  return {
    player: {
      isNPC: false,
      isPlayer: true,
      id: `player-${Date.now()}`,
      name: 'New Character',
      inventory: { 
        items: gameElementsStorage.getDefaultInventoryItems()
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
    },
    opponent: null
  };
};

/**
 * Create default narrative state for a new game.
 * Initializes narrative with boot hill intro text.
 * 
 * @returns Default narrative state for new games
 */
const createDefaultNarrativeState = (): NarrativeState => {
  return {
    currentStoryPoint: null,
    visitedPoints: [],
    availableChoices: [],
    narrativeHistory: [], // Initialize as empty array
    displayMode: 'standard',
    context: '',
    needsInitialGeneration: true,
    lore: undefined,
    storyProgression: undefined,
    currentDecision: undefined,
    error: null,
    selectedChoice: undefined,
    narrativeContext: undefined,
  };
};

export const gameStateStorage = {
  saveGameState,
  initializeNewGame
};
