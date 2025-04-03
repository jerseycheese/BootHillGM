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

import { useState, useCallback } from 'react';
import { useGameState } from '../context/GameStateProvider';
import { Character } from '../types/character';
import { buildNarrativeContext } from '../utils/narrative/narrativeContextBuilder';
import { DEFAULT_NARRATIVE_CONTEXT } from '../utils/narrative/narrativeContextDefaults';
import { StoryPoint } from '../types/narrative.types';

export const useNarrativeInitialization = () => {
  const { state, dispatch } = useGameState();
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Initialize the narrative state with character data
   * 
   * @param {Character} characterData - The character data to use for initialization
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  const initializeNarrative = useCallback(async (characterData: Character): Promise<boolean> => {
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
      
      // Create an initial StoryPoint object for intro
      const introStoryPoint: StoryPoint = {
        id: 'introduction',
        type: 'exposition',
        title: 'Welcome to Boot Hill',
        content: `${characterData.name} begins their adventure in the Wild West.`
      };
      
      // Build the initial narrative context
      // We use the result only for reference but don't store it directly
      // This is just setting up the initial context structure
      const _ = buildNarrativeContext(
        { 
          narrativeContext: initialNarrativeContext, 
          narrativeHistory: [],
          currentStoryPoint: introStoryPoint,
          visitedPoints: ['introduction'],
          availableChoices: [],
          displayMode: 'standard',
          context: 'initial'
        }, 
        { maxTokens: 1000 }
      );
      
      // Dispatch action to update narrative state
      dispatch({
        type: 'UPDATE_NARRATIVE_CONTEXT',
        payload: initialNarrativeContext
      });
      
      // Initialize narrative history
      dispatch({
        type: 'ADD_NARRATIVE_HISTORY',
        payload: `Welcome to Boot Hill! ${characterData.name} is ready for adventure.`
      });
      
      // Set initial story point
      dispatch({
        type: 'NAVIGATE_TO_POINT',
        payload: 'introduction'
      });
      
      setIsInitializing(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize narrative';
      console.error('Narrative initialization error:', errorMessage);
      setError(err instanceof Error ? err : new Error(errorMessage));
      setIsInitializing(false);
      return false;
    }
  }, [dispatch]);

  return {
    initializeNarrative,
    isInitializing,
    error,
    // Expose current narrative state for components that need it
    narrativeState: state.narrative
  };
};

export default useNarrativeInitialization;
