// /app/types/initialization.types.ts
import { GameEngineAction } from "./gameActions";
import { GameState } from "./gameState";

/**
 * Interface for initialization strategy functions
 * These functions handle different scenarios during game initialization
 */
export interface InitializationStrategy<T> {
  (param: T): Promise<GameState> | GameState;
}

/**
 * Interface for game initialization options
 */
export interface GameInitializationOptions {
  /**
   * Maximum time to wait for initialization before forcing completion
   */
  maxInitializationTime?: number;
  
  /**
   * Maximum number of attempts before using emergency state
   */
  maxAttempts?: number;
  
  /**
   * Whether to use client-side persistence
   */
  usePersistence?: boolean;
}

/**
 * Interface for initialization state
 */
export interface InitializationState {
  /**
   * Whether the game is currently initializing
   */
  isInitializing: boolean;
  
  /**
   * Whether the code is running on the client
   */
  isClient: boolean;
  
  /**
   * Number of initialization attempts
   */
  initializationAttempts: number;
  
  /**
   * Reference to the last saved timestamp
   */
  lastSavedTimestamp?: number;
  
  /**
   * Reference to whether initialization is currently processing
   */
  initProcessing: boolean;
  
  /**
   * Reference to whether initialization has completed
   */
  hasInitialized: boolean;
}

/**
 * Interface for campaign persistence methods
 */
export interface CampaignPersistence {
  /**
   * Save the current game state
   */
  saveGame: (state: GameState) => void;
  
  /**
   * Load the game state from persistence
   */
  loadGame: () => GameState | null;
  
  /**
   * Reference to the current state
   */
  stateRef: React.MutableRefObject<GameState | null>;
}

/**
 * Parameters for campaign persistence hook
 */
export interface CampaignPersistenceParams {
  /**
   * Whether initialization is in progress
   */
  isInitializing: boolean;
  
  /**
   * Reference tracking initialization status
   */
  isInitializedRef: React.MutableRefObject<boolean>;
  
  /**
   * Game state dispatch function
   */
  dispatch: React.Dispatch<GameEngineAction>;
}

/**
 * Type guard to check if a game state is valid for initialization
 * Useful for checking if state meets minimum requirements before processing
 * 
 * @param state - The state to check
 * @returns True if the state has minimum required properties
 */
export function isValidGameState(state: unknown): state is GameState {
  return (
    state !== null &&
    typeof state === 'object' &&
    // Check required top-level properties
    'narrative' in state &&
    'character' in state && // Ensures 'character' key exists
    'inventory' in state &&
    // Check character structure more safely
    (
      state.character === null || // Allow null character state
      (
        typeof state.character === 'object' && // Ensure character is a non-null object
        state.character !== null &&
        'player' in state.character && // Now safe to use 'in'
        (
          state.character.player === null || // Allow null player
          (
            typeof state.character.player === 'object' && // Ensure player is a non-null object
            state.character.player !== null &&
            'id' in state.character.player // Check for player id
          )
        )
      )
    )
  );
}

/**
 * Type guard to check if a state is in an error condition
 * Helps identify states that need recovery handling
 * 
 * @param state - The state to check
 * @returns True if the state indicates an error condition
 */
export function isErrorState(state: GameState): boolean {
  // Check for missing essential components
  if (!state.character || !state.narrative || !state.inventory) {
    return true;
  }
  
  // Check for corrupted narrative
  if (!state.narrative.currentStoryPoint && state.narrative.narrativeHistory?.length === 0) {
    return true;
  }
  
  // Check for player character issues
  if (!state.character.player || 
      !state.character.player.id || 
      !state.character.player.attributes) {
    return true;
  }
  
  return false;
}
