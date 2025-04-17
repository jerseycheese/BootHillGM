/**
 * useNarrative Hook
 * 
 * This is a convenience hook that consolidates access to all narrative-related
 * functionality in one place. It brings together the various narrative hooks
 * into a unified API for components to use.
 * 
 * It's built to work with the consolidated state management approach while
 * maintaining backward compatibility with components that expect the old
 * narrative context structure.
 * 
 * @returns {Object} Consolidated narrative API
 * @property {Object} state - The complete game state
 * @property {Function} dispatch - Dispatch function for sending actions
 * @property {Object} context - Narrative context utilities and state
 * @property {Object} decisions - Decision-related utilities and state
 * 
 * @example
 * const { state, dispatch, context, decisions } = useNarrative();
 * 
 * // Access narrative history
 * const narrativeHistory = state.narrativeHistory || [];
 * 
 * // Present a decision to the player
 * decisions.presentPlayerDecision({
 *   prompt: 'What will you do?',
 *   choices: ['Run', 'Fight', 'Hide']
 * });
 */

import { useNarrative as useNarrativeFromProvider } from '../hooks/narrative/NarrativeProvider';
import { useNarrativeContext } from '../hooks/narrative/useNarrativeContext';
import { useNarrativeInitialization } from './useNarrativeInitialization';

export const useNarrative = () => {
  try {
    // Get state and dispatch from the compatibility layer
    const { state, dispatch } = useNarrativeFromProvider();
    
    // Get narrative context functions
    const narrativeContext = useNarrativeContext();
    
    // Get narrative initialization utilities
    const { 
      initializeNarrative, 
      isInitializing, 
      error: initError 
    } = useNarrativeInitialization();
    
    return {
      // Full state and dispatch access
      state,
      dispatch,
      
      // Narrative context and history
      context: {
        narrativeContext: state.narrativeContext,
        narrativeHistory: state.narrativeHistory || [],
        currentStoryPoint: state.currentStoryPoint,
        
        // Initialization
        initializeNarrative,
        isInitializing,
        initializationError: initError,
      },
      
      // Decision utilities
      decisions: {
        ...narrativeContext,
      }
    };
  } catch (error) {
    // Provide more informative error messages
    if (error instanceof Error) {
      console.error('Narrative hook error:', error);
      throw new Error(`useNarrative error: ${error.message}`);
    }
    throw new Error('useNarrative encountered an unexpected error');
  }
};

export default useNarrative;
