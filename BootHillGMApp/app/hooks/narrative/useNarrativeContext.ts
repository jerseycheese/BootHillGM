/**
 * Custom hook for interacting with narrative context and player decisions
 * 
 * This hook provides a comprehensive API for working with the player decision
 * system. The hook manages:
 * 
 * - Presenting decisions to the player
 * - Recording player choices
 * - Maintaining decision history
 * - Triggering decisions based on narrative context
 * - Processing decision impacts on the game state
 * 
 * @returns Object with decision state and functions
 */
import { useContext, useEffect, useCallback } from 'react';
import NarrativeContext from '../../context/NarrativeContext';
import { addNarrativeHistory } from '../../actions/narrativeActions';
import { useDecisionPresentation } from './useDecisionPresentation';
import { useNarrativeGeneration } from './useNarrativeGeneration';
import { useDecisionRecording } from './useDecisionRecording';
import { useDecisionTriggering } from './useDecisionTriggering';
import { UseNarrativeContextReturn, NarrativeGenerationDebug } from './types';
import { DecisionImportance } from '../../types/narrative.types';

export function useNarrativeContext(): UseNarrativeContextReturn {
  const context = useContext(NarrativeContext);
  
  if (!context) {
    throw new Error('useNarrativeContext must be used within a NarrativeProvider');
  }
  
  // Extract functions from individual hook modules
  const { generateNarrativeResponse, isGeneratingNarrative, setIsGeneratingNarrative } = 
    useNarrativeGeneration(context);
  
  const { presentPlayerDecision, clearPlayerDecision } = 
    useDecisionPresentation(context);
  
  const { recordPlayerDecision, getDecisionHistory } = 
    useDecisionRecording(context, generateNarrativeResponse, setIsGeneratingNarrative);
  
  const { checkForDecisionTriggers, triggerAIDecision: originalTriggerAIDecision, ensureFreshState } = 
    useDecisionTriggering(context, presentPlayerDecision);
    
  // Create a properly typed wrapper for triggerAIDecision
  const triggerAIDecision = useCallback((context?: string, importance?: string) => {
    // Convert the string importance to DecisionImportance type
    const typedImportance: DecisionImportance = 
      (importance as DecisionImportance) || 'moderate';
    
    return originalTriggerAIDecision(context, typedImportance);
  }, [originalTriggerAIDecision]);
  
  // When component is loaded, verify that generateNarrativeResponse is properly set up
  // This helps diagnose issues with narrative responses not being added
  useEffect(() => {
    // Create a debug flag to indicate if narrative generation is working
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      // Create the debug object with proper typing
      const debugObject: NarrativeGenerationDebug = {
        generateNarrativeResponse,
        addNarrativeHistory: (text: string) => context.dispatch(addNarrativeHistory(text))
      };
      
      // Set the debug property on window
      window.__debugNarrativeGeneration = debugObject;
      
      console.debug('Narrative generation debug helpers attached to window.__debugNarrativeGeneration');
    }
  }, [generateNarrativeResponse, context, context.dispatch]);

  return {
    // Current decision state
    currentDecision: context.state.currentDecision,
    
    // Decision history
    decisionHistory: context.state.narrativeContext?.decisionHistory || [],
    
    // Decision functions
    presentPlayerDecision,
    recordPlayerDecision,
    clearPlayerDecision,
    getDecisionHistory,
    checkForDecisionTriggers,
    triggerAIDecision,
    ensureFreshState,
    
    // Decision state checks
    hasActiveDecision: Boolean(context.state.currentDecision),
    isGeneratingNarrative,
  };
}