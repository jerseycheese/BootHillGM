/**
 * Custom hook for interacting with narrative context and player decisions
 * 
 * This hook provides a comprehensive API for working with the player decision
 * system and narrative context from the consolidated GameState. The hook manages:
 * 
 * - Presenting decisions to the player
 * - Recording player choices
 * - Maintaining decision history
 * - Triggering decisions based on narrative context
 * - Processing decision impacts on the game state
 * 
 * @returns {UseNarrativeContextReturn} Object with decision state and functions
 * @throws {Error} If used outside of a GameStateProvider
 * 
 * @example
 * const {
 *   presentPlayerDecision,
 *   recordPlayerDecision,
 *   hasActiveDecision
 * } = useNarrativeContext();
 */
import { useEffect, useCallback } from 'react';
import { addNarrativeHistory } from '../../actions/narrativeActions';
import { useDecisionPresentation } from './useDecisionPresentation';
import { useNarrativeGeneration } from './useNarrativeGeneration';
import { useDecisionRecording } from './useDecisionRecording';
import { useDecisionTriggering } from './useDecisionTriggering';
import { UseNarrativeContextReturn, NarrativeGenerationDebug } from './types';
import { DecisionImportance } from '../../types/narrative.types';
import { useGameState } from '../../context/GameStateProvider';

export function useNarrativeContext(): UseNarrativeContextReturn {
  try {
    // Use the consolidated GameStateProvider instead of NarrativeContext
    const { state, dispatch } = useGameState();
    
    // Verify that the state exists and has the expected structure
    if (!state) {
      throw new Error('Game state is undefined. Make sure GameStateProvider is correctly set up.');
    }
    
    // Create a context-like object for compatibility with existing hooks
    // Pass only the narrative slice and dispatch for compatibility with child hooks
    const narrativeSlice = state.narrative || {};
    const context = { state: narrativeSlice, dispatch };
    
    // Extract functions from individual hook modules
    const { 
      generateNarrativeResponse, 
      isGeneratingNarrative, 
      setIsGeneratingNarrative 
    } = useNarrativeGeneration();
    
    const { 
      presentPlayerDecision, 
      clearPlayerDecision 
    } = useDecisionPresentation(context);
    
    const { 
      recordPlayerDecision, 
      getDecisionHistory 
    } = useDecisionRecording(context, generateNarrativeResponse, setIsGeneratingNarrative);
    
    const { 
      checkForDecisionTriggers, 
      triggerAIDecision: originalTriggerAIDecision, 
      ensureFreshState 
    } = useDecisionTriggering(context, presentPlayerDecision);
      
    /**
     * Wrapper for triggerAIDecision with proper typing
     * 
     * @param {string} [context] - Additional context for the decision
     * @param {string} [importance] - The importance level of the decision
     * @returns {Promise<boolean>} Whether the trigger was successful
     */
    const triggerAIDecision = useCallback((context?: string, importance?: string) => {
      // Convert the string importance to DecisionImportance type
      const typedImportance: DecisionImportance = 
        (importance as DecisionImportance) || 'moderate';
      
      return originalTriggerAIDecision(context, typedImportance);
    }, [originalTriggerAIDecision]);
    
    // When component is loaded, set up debug tools in development only
    useEffect(() => {
      // Create a debug flag to indicate if narrative generation is working
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        // Create the debug object with proper typing
        const debugObject: NarrativeGenerationDebug = {
          generateNarrativeResponse,
          addNarrativeHistory: (text: string) => dispatch(addNarrativeHistory(text))
        };
        
        // Set the debug property on window
        window.__debugNarrativeGeneration = debugObject;
      }
      
      // Clean up debug objects when component unmounts
      return () => {
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          delete window.__debugNarrativeGeneration;
        }
      };
    }, [generateNarrativeResponse, dispatch]);
  
    return {
      // Current decision state
      currentDecision: narrativeSlice.currentDecision,
      
      // Decision history
      decisionHistory: narrativeSlice.narrativeContext?.decisionHistory || [],
      
      // Decision functions
      presentPlayerDecision,
      recordPlayerDecision,
      clearPlayerDecision,
      getDecisionHistory,
      checkForDecisionTriggers,
      triggerAIDecision,
      ensureFreshState,
      
      // Decision state checks
      hasActiveDecision: Boolean(narrativeSlice.currentDecision),
      isGeneratingNarrative,
    };
  } catch (error) {
    // Provide informative error messages for common issues
    if (error instanceof Error) {
      console.error('Narrative context error:', error);
      throw new Error(`useNarrativeContext error: ${error.message}`);
    }
    throw new Error('useNarrativeContext encountered an unexpected error');
  }
}