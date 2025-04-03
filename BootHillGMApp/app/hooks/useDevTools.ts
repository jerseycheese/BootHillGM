import { useState, useEffect, useCallback } from 'react';
import { useGameState } from '../context/GameStateProvider';
import { LocationType } from '../services/locationService';
import { EVENTS, triggerCustomEvent } from '../utils/events';
import { initializeBrowserDebugTools, updateDebugCurrentDecision } from '../utils/debugConsole';
import { generateEnhancedDecision } from '../utils/contextualDecisionGenerator.enhanced';
import { initializeDecisionDebugTools } from '../utils/decisionDebug';
import { clearCurrentDecision, addNarrativeHistory } from '../actions/narrativeActions';
import { createDecisionGameState } from '../utils/decisionStateUtils';
import { GameState } from '../types/gameState';

/**
 * Custom hook to manage DevTools state and functionality
 */
export function useDevTools(gameState: GameState) {
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
  // Use the correct state hook
  const { state, dispatch } = useGameState();
  // narrativeContext is no longer a separate object, access state directly

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
      // Use the dispatch from useGameState
      dispatch(clearCurrentDecision());
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
  }, [dispatch, forceRender]); // Update dependencies

  /**
   * Handles the generation and presentation of a contextual decision based on
   * the current game state and selected location type.
   */
  const handleContextualDecision = useCallback((locationType?: LocationType) => {
    setLoading("contextual-decision");
    setError(null);
    
    try {
      // First, notify the user that we're generating a decision
      // Use the dispatch from useGameState
      dispatch(addNarrativeHistory("\nGenerating a contextual decision based on current narrative context...\n"));
      
      // Clear any existing decision to prevent conflicts
      // Use the dispatch from useGameState
      dispatch(clearCurrentDecision());
      triggerCustomEvent(EVENTS.DECISION_CLEARED);
      
      // Add a slight delay to ensure the UI updates with our message
      setTimeout(async () => {
        try {
          // Use the location type parameter or fall back to selected state
          const locationToUse = locationType || selectedLocationType;
          
          // Make sure we're using the most up-to-date narrative state
          // Access narrative state directly from the main state object
          const currentNarrativeState = state.narrative;
          
          // Create a properly structured game state for decision generation
          // Ensure currentNarrativeState is not null before passing
          const decisionGameState = currentNarrativeState ? createDecisionGameState(gameState, currentNarrativeState) : null;
          
          // Generate a contextual decision using the AI-enhanced generator with current context
          // Pass narrativeContext from the state slice
          const contextualDecision = decisionGameState ? await generateEnhancedDecision(
            decisionGameState,
            currentNarrativeState?.narrativeContext,
            locationToUse,
            true // Force generation
          ) : null;
          
          // In case of generation failure
          if (!contextualDecision) {
            const errorMessage = `Failed to generate a decision for the current narrative context`;
            // Use the dispatch from useGameState
            dispatch(addNarrativeHistory(`\n${errorMessage}\n`));
            setError(errorMessage);
            setLoading(null);
            return;
          }
          
          // Update decision score display for the UI
          if (window.bhgmDebug?.decisions?.lastDetectionScore) {
            setDecisionScore(window.bhgmDebug.decisions.lastDetectionScore);
          }
          
          // Remove the generating message
          // Access narrativeHistory from the main state object
          const narrativeHistory = [...(state.narrative?.narrativeHistory || [])];
          narrativeHistory.pop(); // Remove the loading message
          
          // Use the dispatch from useGameState
          dispatch({
            type: 'UPDATE_NARRATIVE',
            payload: {
              narrativeHistory: narrativeHistory
            }
          });
          
          // Now present the new decision
          // Use the dispatch from useGameState
          dispatch({
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
  }, [gameState, state.narrative, dispatch, selectedLocationType, forceRender]); // Update dependencies

  /**
   * Toggles visibility of the entire DevTools panel
   */
  const toggleDevPanel = useCallback(() => {
    setIsPanelCollapsed(prev => !prev);
  }, []);

  // Initialize browser debug tools
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Create a safe getter function that will never return null
    const safeGameStateGetter = (): GameState => {
      // If state.narrative exists, create a decision game state, otherwise return gameState directly
      if (state.narrative) {
        const decisionState = createDecisionGameState(gameState, state.narrative);
        // Ensure we never return null by providing a fallback
        return decisionState || gameState;
      }
      return gameState;
    };

    initializeBrowserDebugTools(
      safeGameStateGetter,
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
  }, [gameState, handleClearDecision, handleContextualDecision, state.narrative]); // Update dependencies

  // Update the debug namespace with current decision
  useEffect(() => {
    // Access currentDecision from the main state object
    updateDebugCurrentDecision(state.narrative?.currentDecision || null);
    
    // Access currentDecision from the main state object
    if (state.narrative?.currentDecision) {
      triggerCustomEvent(EVENTS.UI_STATE_CHANGED, {
        type: 'decision',
        active: true,
        id: state.narrative.currentDecision.id
      });
    }
  }, [state.narrative?.currentDecision]); // Update dependencies

  // Get decision history for display
  // Access decisionHistory from the main state object
  const decisionHistory = state.narrative?.narrativeContext?.decisionHistory || [];
  
  // Check if there's currently an active decision
  // Access currentDecision from the main state object
  const hasActiveDecision = !!state.narrative?.currentDecision;

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
    // narrativeContext is no longer needed here, state is accessed directly
    decisionHistory,
    hasActiveDecision
  };
}
