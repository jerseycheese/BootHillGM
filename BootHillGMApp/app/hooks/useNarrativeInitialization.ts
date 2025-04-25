/**
 * useNarrativeInitialization Hook
 * 
 * This hook handles the initialization of narrative state when starting a new game
 * or loading an existing game. It ensures that all required narrative data is properly
 * loaded and available to the rest of the application.
 * 
 * It works with the consolidated GameState structure, accessing the narrative slice
 * and ensuring proper error handling during initialization.
 * 
 * @returns {Object} Initialization utilities and state
 * @property {Function} initializeNarrative - Function to initialize narrative state
 * @property {boolean} isInitializing - Whether narrative is currently initializing
 * @property {Error|null} error - Any error that occurred during initialization
 * 
 * @example
 * const { initializeNarrative, isInitializing, error } = useNarrativeInitialization();
 * 
 * // Initialize the narrative when starting a new game
 * useEffect(() => {
 *   if (isNewGame) {
 *     initializeNarrative(characterData);
 *   }
 * }, [isNewGame, characterData, initializeNarrative]);
 */

import { useState, useCallback, useRef } from 'react';
import { useGameState } from '../context/GameStateProvider';
import { Character } from '../types/character';
import { DEFAULT_NARRATIVE_CONTEXT } from '../utils/narrative/narrativeContextDefaults';
import { 
  updateNarrativeContext, 
  addNarrativeHistory, 
  navigateToPoint 
} from '../actions/narrativeActions';
import { narrativeDispatchWrapper } from '../utils/narrativeDispatchWrapper';

/**
 * Narrative initialization hook
 * This is a proper React hook that should be called at the top level
 * and returns functions that can be called during rendering
 */
export const useNarrativeInitialization = () => {
  const { state, dispatch } = useGameState();
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Ref to track initialization and prevent duplicate attempts
  const hasInitialized = useRef(false);

  // Create a wrapped dispatch function that handles NarrativeAction conversion
  const narrativeDispatch = narrativeDispatchWrapper(dispatch);

  /**
   * Initialize the narrative state with character data
   * 
   * @param {Character} characterData - The character data to use for initialization
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  const initializeNarrative = useCallback(async (characterData: Character): Promise<boolean> => {
    // Skip if already initialized or initializing
    if (hasInitialized.current || isInitializing) {
      return true;
    }
    
    setIsInitializing(true);
    setError(null);
    
    try {
      // Create a basic narrative state based on the character
      const initialNarrativeContext = {
        ...DEFAULT_NARRATIVE_CONTEXT,
        characterFocus: [characterData.name],
        // Use default western themes since traits may not be available
        themes: ['adventure', 'western'],
        decisionHistory: []
      };
      
      // Use the wrapped dispatch function that handles type conversion
      narrativeDispatch(updateNarrativeContext(initialNarrativeContext));
      narrativeDispatch(addNarrativeHistory(`Welcome to Boot Hill! ${characterData.name} is ready for adventure.`));
      narrativeDispatch(navigateToPoint('introduction'));
      
      // Mark as initialized
      hasInitialized.current = true;
      
      setIsInitializing(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize narrative';
      setError(err instanceof Error ? err : new Error(errorMessage));
      setIsInitializing(false);
      return false;
    }
  }, [narrativeDispatch, isInitializing]);

  return {
    initializeNarrative,
    isInitializing,
    error,
    // Expose current narrative state for components that need it
    narrativeState: state.narrative
  };
};

export default useNarrativeInitialization;