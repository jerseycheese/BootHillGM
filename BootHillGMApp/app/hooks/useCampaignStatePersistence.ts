import { useCallback, useRef } from 'react';
import { GameState } from '../types/gameState';
// Removed unused imports: InventoryItem, Character, JournalEntry, CombatState, ExtendedGameState
import { initialState as initialGameState } from '../types/initialState';
import { GameEngineAction } from '../types/gameActions';

/**
 * Hook for managing campaign state persistence to localStorage.
 * Handles saving and loading game state with proper normalization and migration.
 * 
 * @param {boolean} isInitializing - Flag indicating if character creation is in progress
 * @param {React.MutableRefObject<boolean>} isInitializedRef - Ref tracking initialization status
 * @param {React.Dispatch<GameEngineAction>} dispatch - Game state dispatch function
 * @returns {Object} Object containing saveGame and loadGame functions and stateRef
 */
export const useCampaignStatePersistence = (
  isInitializing: boolean,
  isInitializedRef: React.MutableRefObject<boolean>,
  dispatch: React.Dispatch<GameEngineAction>
) => {
  const lastSavedRef = useRef<number>(0);
  const stateRef = useRef<GameState | null>(null);

  /**
   * Saves the current game state to localStorage.
   * Prevents rapid consecutive saves and handles proper normalization.
   * 
   * @param {GameState} stateToSave - The game state to save
   */
  const saveGame = useCallback((stateToSave: GameState) => {
    try {
      const timestamp = Date.now();
      
      // Prevent rapid consecutive saves and saves during initialization
      if (timestamp - lastSavedRef.current < 1000 || isInitializing || !isInitializedRef.current) {
        return;
      }

      stateRef.current = stateToSave;

      // Ensure state is in the new format before saving
      // State is already in the new GameState format
      const normalizedState = stateToSave;

      // State is already normalized (GameState), just add timestamp and client flag
      const stateToStore = {
        ...normalizedState,
        savedTimestamp: timestamp,
        isClient: true,
      };

      localStorage.setItem('campaignState', JSON.stringify(stateToStore));
      lastSavedRef.current = timestamp;
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  }, [isInitializing, isInitializedRef]);

  /**
   * Loads game state from localStorage.
   * Handles state migration, normalization, and type validation.
   * 
   * @returns {GameState | null} The loaded game state or null if loading failed
   */
  const loadGame = useCallback((): GameState | null => {
    try {
      const serializedState = localStorage.getItem('campaignState');
      if (!serializedState) {
        return null;
      }

      let loadedState;
      try {
        loadedState = JSON.parse(serializedState);
      } catch (error) {
        console.error('Error parsing saved game state:', error);
        return null;
      }

      if (!loadedState || !loadedState.savedTimestamp) {
        return null;
      }

      // Migrate the loaded state to handle potential missing narrative data and schema changes
      // Migration is no longer needed with the clean break approach
      
      // Ensure state is in the new format
      // State from localStorage should conform to GameState (or be handled if not)
      const normalizedState = loadedState;

      // Assuming normalizedState is the parsed GameState from localStorage
      // Merge with initialGameState to ensure all properties exist,
      // giving precedence to loaded values.
      const restoredState: GameState = {
        ...initialGameState,
        ...normalizedState,
        // Explicitly ensure nested slices are merged correctly if needed,
        // although the spread operator often handles this sufficiently.
        // Example:
        character: {
          ...initialGameState.character,
          ...(normalizedState.character || {}),
        },
        combat: {
          ...initialGameState.combat,
          ...(normalizedState.combat || {}),
        },
        inventory: {
          ...initialGameState.inventory,
          ...(normalizedState.inventory || {}),
        },
        journal: {
          ...initialGameState.journal,
          ...(normalizedState.journal || {}),
        },
        narrative: {
          ...initialGameState.narrative,
          ...(normalizedState.narrative || {}),
        },
        ui: {
          ...initialGameState.ui,
          ...(normalizedState.ui || {}),
        },
        // Ensure isClient is true after loading
        isClient: true,
        // Ensure savedTimestamp is updated from loadedState
        savedTimestamp: loadedState.savedTimestamp,
      };

      // Dispatch the fully formed GameState
      dispatch({ type: 'SET_STATE', payload: restoredState });
      stateRef.current = restoredState; // Update the ref
      return restoredState;
    } catch (error) {
      console.error('Error loading game state:', error);
      return null;
    }
   }, [dispatch]);

  return {
    saveGame,
    loadGame,
    stateRef
  };
};
