import { useState, useEffect, useCallback } from 'react';
import { useNarrative } from '../context/NarrativeContext';
import { LocationType } from '../services/locationService';
import { EVENTS, triggerCustomEvent } from '../utils/events';
import { initializeBrowserDebugTools, updateDebugCurrentDecision } from '../utils/debugConsole';
import { generateEnhancedDecision } from '../utils/contextualDecisionGenerator.enhanced';
import { initializeDecisionDebugTools } from '../utils/decisionDebug';
import { clearCurrentDecision, addNarrativeHistory } from '../actions/narrativeActions';
import { createDecisionGameState } from '../utils/decisionStateUtils';

/**
 * Custom hook to manage DevTools state and functionality
 */
export function useDevTools(gameState: unknown) {
  // Core state
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [renderCount, setRenderCount] = useState(0);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  
  // Decision testing state
  const [showDecisionHistory, setShowDecisionHistory] = useState(false);
  const [selectedLocationType, setSelectedLocationType] = useState<LocationType>({ type: 'town', name: 'Starting Town' });
  const [decisionScore, setDecisionScore] = useState<number | undefined>(undefined);

  // Narrative context
  const narrativeContext = useNarrative();

  /**
   * Forces a re-render of all components via a custom event system.
   */
  const forceRender = useCallback(() => {
    setRenderCount(prev => prev + 1);
    window.dispatchEvent(new Event('storage'));
    triggerCustomEvent(EVENTS.UI_FORCE_UPDATE);
  }, []);

  /**
   * Clears the current decision from the narrative context.
   */
  const handleClearDecision = useCallback(() => {
    setLoading("clearing");
    try {
      narrativeContext.dispatch(clearCurrentDecision());
      triggerCustomEvent(EVENTS.DECISION_CLEARED);
      forceRender();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(`Failed to clear decision: ${error.message}`);
    } finally {
      setTimeout(() => {
        setLoading(null);
      }, 100);
    }
  }, [narrativeContext, forceRender]);

  /**
   * Handles the generation and presentation of a contextual decision based on
   * the current game state and selected location type.
   */
  const handleContextualDecision = useCallback((locationType?: LocationType) => {
    setLoading("contextual-decision");
    setError(null);
    
    try {
      // First, notify the user that we're generating a decision
      narrativeContext.dispatch(addNarrativeHistory("\nGenerating a contextual decision based on current narrative context...\n"));
      
      // Clear any existing decision to prevent conflicts
      narrativeContext.dispatch(clearCurrentDecision());
      triggerCustomEvent(EVENTS.DECISION_CLEARED);
      
      // Add a slight delay to ensure the UI updates with our message
      setTimeout(async () => {
        try {
          // Use the location type parameter or fall back to selected state
          const locationToUse = locationType || selectedLocationType;
          
          // Make sure we're using the most up-to-date narrative state
          const currentNarrativeState = narrativeContext.state;
          
          // Create a properly structured game state for decision generation
          const decisionGameState = createDecisionGameState(gameState, currentNarrativeState);
          
          // Generate a contextual decision using the AI-enhanced generator with current context
          const contextualDecision = await generateEnhancedDecision(
            decisionGameState,
            currentNarrativeState.narrativeContext,
            locationToUse,
            true // Force generation
          );
          
          // In case of generation failure
          if (!contextualDecision) {
            const errorMessage = `Failed to generate a decision for the current narrative context`;
            narrativeContext.dispatch(addNarrativeHistory(`\n${errorMessage}\n`));
            setError(errorMessage);
            setLoading(null);
            return;
          }
          
          // Update decision score display for the UI
          if (window.bhgmDebug?.decisions?.lastDetectionScore) {
            setDecisionScore(window.bhgmDebug.decisions.lastDetectionScore);
          }
          
          // Remove the generating message
          const narrativeHistory = [...narrativeContext.state.narrativeHistory];
          narrativeHistory.pop(); // Remove the loading message
          
          narrativeContext.dispatch({
            type: 'UPDATE_NARRATIVE',
            payload: {
              narrativeHistory: narrativeHistory
            }
          });
          
          // Now present the new decision
          narrativeContext.dispatch({
            type: 'PRESENT_DECISION',
            payload: contextualDecision
          });
          
          // Notify all components that a new decision is ready
          triggerCustomEvent(EVENTS.DECISION_READY, contextualDecision);
          
          // Also trigger a UI update
          forceRender();
          
          // Set loading to null after a short delay for UI feedback
          setTimeout(() => {
            setLoading(null);
          }, 300);
        } catch (innerError) {
          const error = innerError instanceof Error ? innerError : new Error('Unknown error occurred');
          setError(`Failed to generate contextual decision: ${error.message}`);
          console.error('BHGM Debug: Contextual decision error:', innerError);
          setLoading(null);
        }
      }, 300); // Short delay for UI updates
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(`Failed to generate contextual decision: ${error.message}`);
      console.error('BHGM Debug: Contextual decision error:', err);
      setLoading(null);
    }
  }, [gameState, narrativeContext, selectedLocationType, forceRender]);

  /**
   * Toggles visibility of the entire DevTools panel
   */
  const toggleDevPanel = useCallback(() => {
    setIsPanelCollapsed(prev => !prev);
  }, []);

  // Initialize browser debug tools
  useEffect(() => {
    if (typeof window === 'undefined') return;

    initializeBrowserDebugTools(
      () => createDecisionGameState(gameState, narrativeContext.state),
      (locationType?: LocationType) => handleContextualDecision(locationType),
      () => handleClearDecision()
    );
    
    initializeDecisionDebugTools();
    
    if (!window.bhgmDebug) {
      console.warn('BHGM Debug namespace not initialized properly');
      return;
    }
    
    window.bhgmDebug.triggerDecision = async (locationType?: LocationType) => {
      try {
        handleContextualDecision(locationType);
      } catch (error) {
        console.error('Failed to trigger AI decision:', error);
      }
    };
  }, [gameState, handleClearDecision, handleContextualDecision, narrativeContext.state]);

  // Update the debug namespace with current decision
  useEffect(() => {
    updateDebugCurrentDecision(narrativeContext.state.currentDecision || null);
    
    if (narrativeContext.state.currentDecision) {
      triggerCustomEvent(EVENTS.UI_STATE_CHANGED, { 
        type: 'decision',
        active: true,
        id: narrativeContext.state.currentDecision.id
      });
    }
  }, [narrativeContext.state.currentDecision]);

  // Get decision history for display
  const decisionHistory = narrativeContext.state.narrativeContext?.decisionHistory || [];
  
  // Check if there's currently an active decision
  const hasActiveDecision = !!narrativeContext.state.currentDecision;

  return {
    // State
    loading,
    error,
    renderCount,
    isPanelCollapsed,
    showDecisionHistory,
    selectedLocationType,
    decisionScore,
    
    // Methods
    setLoading,
    setError,
    setShowDecisionHistory,
    setSelectedLocationType,
    handleContextualDecision,
    handleClearDecision,
    forceRender,
    toggleDevPanel,
    
    // Narrative info
    narrativeContext,
    decisionHistory,
    hasActiveDecision
  };
}