/**
 * Hook for presenting decisions to the player
 */
import { useCallback } from 'react';
import { PlayerDecision } from '../../types/narrative.types';
import { presentDecision, clearCurrentDecision } from '../../actions/narrativeActions';
import { EVENTS, triggerCustomEvent } from '../../utils/events';
import { NarrativeContextValue } from './types';

/**
 * Hook that provides functionality for presenting decisions to the player
 * 
 * @param context The narrative context
 * @returns Function for presenting decisions
 */
export function useDecisionPresentation(context: NarrativeContextValue) {
  const { dispatch } = context;

  /**
   * Present a decision to the player
   * 
   * This function dispatches a PRESENT_DECISION action and triggers
   * a DOM event to ensure UI components are updated.
   * 
   * @param decision - The decision object to present to the player
   */
  const presentPlayerDecision = useCallback((decision: PlayerDecision) => {
    dispatch(presentDecision(decision));
    
    // Trigger custom event for more reliable UI updates
    triggerCustomEvent(EVENTS.DECISION_READY, decision);
    
    // Force re-render via storage event (legacy support)
    window.dispatchEvent(new Event('storage'));
    
  }, [dispatch]);

  /**
   * Clear the current decision without recording it
   * 
   * This is useful for abandoning decisions or handling error cases.
   */
  const clearPlayerDecision = useCallback(() => {
    dispatch(clearCurrentDecision());
    
    // Trigger custom event for more reliable UI updates
    triggerCustomEvent(EVENTS.DECISION_CLEARED);
    
    // Force update to ensure UI components reflect the change
    triggerCustomEvent(EVENTS.UI_FORCE_UPDATE);
    window.dispatchEvent(new Event('storage'));
  }, [dispatch]);

  return {
    presentPlayerDecision,
    clearPlayerDecision
  };
}