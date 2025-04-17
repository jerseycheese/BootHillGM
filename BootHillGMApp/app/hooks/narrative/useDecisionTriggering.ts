/**
 * Hook for checking narrative text for decision triggers and generating AI decisions
 */
import { useCallback, useRef } from 'react';
import { DecisionImportance, PlayerDecision } from '../../types/narrative.types';
import { NarrativeContextValue } from './types';
import { useDecisionGeneration } from './useDecisionGeneration';
import { useStateManagement } from './useStateManagement';
import { 
  detectPlayerNameFromText, 
  isPlayerAction, 
  hasDecisionTriggers 
} from '../../utils/narrativeUtils';

// Number of player actions before automatically triggering a decision
const ACTIONS_BEFORE_DECISION = 3;

/**
 * Hook that provides functionality for checking narrative for decision triggers
 * and generating AI decisions.
 * 
 * @param context The narrative context
 * @param presentPlayerDecision Function to present decisions to the player
 * @returns Functions for checking and triggering decisions
 */
export function useDecisionTriggering(
  context: NarrativeContextValue,
  presentPlayerDecision: (decision: PlayerDecision) => void
) {
  const { state } = context;
  
  // Keep track of player actions since last decision
  const actionCountRef = useRef(0);
  
  // Keep track of the player character name
  const playerNameRef = useRef<string | null>(null);
  
  // Flag for whether we should skip narrative response for the current action
  const skipNarrativeResponseRef = useRef(false);

  // State management functionality
  const { 
    ensureFreshState,
    addContextToHistory
  } = useStateManagement(context);

  // Decision generation functionality
  const { 
    generateContextualDecision,
    generateEnhancedDecision,
    verifyDecisionContext
  } = useDecisionGeneration(state, playerNameRef);

  /**
   * Flag to skip narrative response for current action
   */
  const markSkipNarrativeResponse = useCallback(() => {
    skipNarrativeResponseRef.current = true;
  }, []);

  /**
   * Check if we should skip narrative response
   */
  const shouldSkipNarrativeResponse = useCallback((): boolean => {
    const shouldSkip = skipNarrativeResponseRef.current;
    skipNarrativeResponseRef.current = false;  // Reset for next action
    return shouldSkip;
  }, []);

  /**
   * Wrapper for presenting decisions that ensures context relevance
   */
  const safelyPresentDecision = useCallback((decision: PlayerDecision) => {
    // Reset the action counter when presenting a decision
    actionCountRef.current = 0;
    
    // Mark that narrative response should be skipped for this action
    markSkipNarrativeResponse();
    
    // Verify the decision matches current narrative context before presenting
    if (verifyDecisionContext(decision)) {
      presentPlayerDecision(decision);
    } else {
      // If decision doesn't match context, generate a contextual fallback
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Decision rejected - generating contextual fallback');
      }
      const fallbackDecision = generateContextualDecision();
      presentPlayerDecision(fallbackDecision);
    }
  }, [
    verifyDecisionContext, 
    generateContextualDecision, 
    presentPlayerDecision, 
    markSkipNarrativeResponse
  ]);

  /**
   * Check if we should automatically trigger a decision based on action count
   */
  const checkAutoDecisionTrigger = useCallback(async (): Promise<boolean> => {
    // Don't trigger if already showing a decision
    if (state.currentDecision) {
      return false;
    }
    
    // Get recent narrative entries
    const recentEntries = state.narrativeHistory?.slice(-10) || [];
    
    // Count player actions in the recent history
    const playerActionCount = recentEntries.filter(isPlayerAction).length;
    
    // If we've had enough actions, queue a decision presentation
    if (playerActionCount >= ACTIONS_BEFORE_DECISION && actionCountRef.current >= ACTIONS_BEFORE_DECISION) {
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`Auto-triggering decision after ${playerActionCount} player actions`);
      }
      
      // Create and present a contextual decision
      const decision = generateContextualDecision();
      safelyPresentDecision(decision);
      
      // Reset the action counter
      actionCountRef.current = 0;
      
      return true;
    }
    
    return false;
  }, [
    state.currentDecision, 
    state.narrativeHistory, 
    generateContextualDecision,
    safelyPresentDecision
  ]);

  /**
   * Check if the narrative contains triggers for decisions
   */
  const checkForDecisionTriggers = useCallback(async (narrativeText: string) => {
    // If there's already a decision active, don't trigger a new one
    if (state.currentDecision) {
      return false;
    }
    
    // Check for player name in the narrative text
    const playerNameFromText = detectPlayerNameFromText(narrativeText);
    if (playerNameFromText && !playerNameRef.current) {
      playerNameRef.current = playerNameFromText;
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`Detected player name: ${playerNameFromText}`);
      }
    }
    
    // Check if this is a player action and increment counter if so
    if (isPlayerAction(narrativeText)) {
      actionCountRef.current += 1;
      
      // If we've reached the threshold, trigger a decision
      if (actionCountRef.current >= ACTIONS_BEFORE_DECISION) {
        return await checkAutoDecisionTrigger();
      }
    }
    
    // Check for keywords that explicitly indicate a decision point
    if (hasDecisionTriggers(narrativeText)) {
      try {
        // Ensure we have fresh state
        await ensureFreshState();
        
        // Try to generate an enhanced decision
        const decision = await generateEnhancedDecision();
        
        // If we got a decision, verify and present it
        if (decision) {
          safelyPresentDecision(decision);
          return true;
        }
        
        // If AI generation fails, use our contextual generator
        const fallbackDecision = generateContextualDecision();
        safelyPresentDecision(fallbackDecision);
        return true;
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error generating contextual decision:', error);
        }
        return false;
      }
    }
    
    return false;
  }, [
    state, 
    ensureFreshState, 
    safelyPresentDecision, 
    checkAutoDecisionTrigger, 
    generateContextualDecision,
    generateEnhancedDecision
  ]);

  /**
   * Trigger an AI-generated decision with specific context
   */
  const triggerAIDecision = useCallback(async (
    context?: string, 
    importance: DecisionImportance = 'moderate'
  ) => {
    if (state.currentDecision) {
      return false;
    }
    
    try {
      // First, ensure we have fresh state (fix for issue #210)
      await ensureFreshState();
      
      // If additional context was provided, add it to the narrative
      if (context) {
        addContextToHistory(context);
        
        // Refresh state again after adding context
        await ensureFreshState();
      }
      
      // Try to generate a decision using the AI generator
      const decision = await generateEnhancedDecision(context, importance);
      
      // If we got a decision, verify and present it
      if (decision) {
        safelyPresentDecision(decision);
        return true;
      }
      
      // If AI generation fails, use our contextual generator
      const fallbackDecision = generateContextualDecision();
      fallbackDecision.importance = importance;
      safelyPresentDecision(fallbackDecision);
      return true;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error generating AI decision:', error);
      }
      const fallbackDecision = generateContextualDecision();
      fallbackDecision.importance = importance;
      safelyPresentDecision(fallbackDecision);
      return true;
    }
  }, [
    state, 
    ensureFreshState, 
    safelyPresentDecision, 
    generateContextualDecision,
    generateEnhancedDecision,
    addContextToHistory
  ]);

  return {
    checkForDecisionTriggers,
    triggerAIDecision,
    ensureFreshState,
    shouldSkipNarrativeResponse
  };
}
