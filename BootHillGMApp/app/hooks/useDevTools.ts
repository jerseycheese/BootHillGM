import { useState, useEffect, useCallback, Dispatch } from 'react';
import { LocationType } from '../services/locationService';
import { EVENTS, triggerCustomEvent } from '../utils/events';
import { initializeBrowserDebugTools, updateDebugCurrentDecision } from '../utils/debugConsole';
import { generateEnhancedDecision } from '../utils/contextualDecisionGenerator';
import { initializeDecisionDebugTools } from '../utils/decisionDebug';
import { clearCurrentDecision, addNarrativeHistory, updateNarrative, presentDecision } from '../actions/narrativeActions';
import { createDecisionGameState } from '../utils/decisionStateUtils';
import { GameState } from '../types/gameState';
import { GameAction } from '../types/actions';
import { narrativeDispatchWrapper } from '../utils/narrativeDispatchWrapper';

/**
 * Custom hook to manage DevTools state and functionality.
 * 
 * This hook can be used in two ways:
 * 1. With a gameState parameter (from GameStateProvider context)
 * 2. With both gameState and dispatch parameters for direct use without context
 * 
 * @param gameState - Current game state from GameStateProvider
 * @param externalDispatch - Optional dispatch function, if not using GameStateProvider context
 * @returns Collection of utility functions and state values for DevTools components
 */
export function useDevTools(gameState: GameState, externalDispatch?: Dispatch<GameAction>) {
  // Core state
  const [loading, setLoading] = useState<string | null>(null);
  const [loadingIndicator, setLoadingIndicator] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [renderCount, setRenderCount] = useState(0);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  
  // Decision testing state
  const [showDecisionHistory, setShowDecisionHistory] = useState(false);
  const [selectedLocationType, setSelectedLocationType] = useState<LocationType>({ type: 'town', name: 'Starting Town' });
  const [decisionScore, setDecisionScore] = useState<number | undefined>(undefined);

  // Create a wrapped dispatch that handles NarrativeAction types
  // Use the provided dispatch or the one from GameStateProvider
  const dispatch = externalDispatch;
  
  // Ensure we have a dispatch function
  if (!dispatch) {
    console.warn('useDevTools: No dispatch function provided');
  }

  // Create a wrapped dispatch that handles NarrativeAction types
  const narrativeDispatch = narrativeDispatchWrapper(dispatch!);
  
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
    if (!dispatch) return;
    
    setLoading("clearing");
    try {
      // Use the wrapper to dispatch NarrativeAction
      narrativeDispatch(clearCurrentDecision());
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
  }, [narrativeDispatch, forceRender, dispatch]);

  /**
   * Handles the generation and presentation of a contextual decision based on
   * the current game state and selected location type.
   * 
   * @param locationType - Optional location type to use for decision generation
   */
  const handleContextualDecision = useCallback((locationType?: LocationType) => {
    if (!dispatch) return;
    
    setLoading("contextual-decision");
    setError(null);
    
    try {
      // First, notify the user that we're generating a decision
      narrativeDispatch(addNarrativeHistory("\nGenerating a contextual decision based on current narrative context...\n"));
      
      // Clear any existing decision to prevent conflicts
      narrativeDispatch(clearCurrentDecision());
      triggerCustomEvent(EVENTS.DECISION_CLEARED);
      
      // Add a slight delay to ensure the UI updates with our message
      setTimeout(async () => {
        try {
          // Use the location type parameter or fall back to selected state
          const locationToUse = locationType || selectedLocationType;
          
          // Make sure we're using the most up-to-date narrative state
          const currentNarrativeState = gameState.narrative;
          
          // Create a properly structured game state for decision generation
          const decisionGameState = currentNarrativeState ? createDecisionGameState(gameState, currentNarrativeState) : null;
          
          // Generate a contextual decision using the AI-enhanced generator with current context
          const contextualDecision = decisionGameState ? await generateEnhancedDecision(
            decisionGameState,
            currentNarrativeState?.narrativeContext,
            locationToUse,
            true // Force generation
          ) : null;
          
          // In case of generation failure
          if (!contextualDecision) {
            const errorMessage = `Failed to generate a decision for the current narrative context`;
            narrativeDispatch(addNarrativeHistory(`\n${errorMessage}\n`));
            setError(errorMessage);
            setLoading(null);
            return;
          }
          
          // Update decision score display for the UI
          if (window.bhgmDebug?.decisions?.lastDetectionScore) {
            setDecisionScore(window.bhgmDebug.decisions.lastDetectionScore);
          }
          
          // Remove the generating message
          const narrativeHistory = [...(gameState.narrative?.narrativeHistory || [])];
          narrativeHistory.pop(); // Remove the loading message
          
          // Update narrative with action creator
          narrativeDispatch(updateNarrative({
            narrativeHistory: narrativeHistory
          }));
          
          // Now present the new decision
          narrativeDispatch(presentDecision(contextualDecision));
          
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
          setLoading(null);
        }
      }, 300); // Short delay for UI updates
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(`Failed to generate contextual decision: ${error.message}`);
      setLoading(null);
    }
  }, [gameState, narrativeDispatch, selectedLocationType, forceRender, dispatch]);

  /**
   * Toggles visibility of the entire DevTools panel
   */
  const toggleDevPanel = useCallback(() => {
    setIsPanelCollapsed(prev => !prev);
  }, []);

  // Initialize browser debug tools
  useEffect(() => {
    if (typeof window === 'undefined' || !dispatch) return;

    // Create a safe getter function that will never return null
    const safeGameStateGetter = (): GameState => {
      // If gameState.narrative exists, create a decision game state, otherwise return gameState directly
      if (gameState.narrative) {
        const decisionState = createDecisionGameState(gameState, gameState.narrative);
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
  }, [gameState, handleClearDecision, handleContextualDecision, dispatch]);

  // Update the debug namespace with current decision
  useEffect(() => {
    updateDebugCurrentDecision(gameState.narrative?.currentDecision || null);
    
    if (gameState.narrative?.currentDecision) {
      triggerCustomEvent(EVENTS.UI_STATE_CHANGED, {
        type: 'decision',
        active: true,
        id: gameState.narrative.currentDecision.id
      });
    }
  }, [gameState.narrative?.currentDecision]);

  // Get decision history for display
  const decisionHistory = gameState.narrative?.narrativeContext?.decisionHistory || [];
  
  // Check if there's currently an active decision
  const hasActiveDecision = !!gameState.narrative?.currentDecision;

  return {
    // State
    loading,
    error,
    loadingIndicator,
    renderCount,
    isPanelCollapsed,
    showDecisionHistory,
    selectedLocationType,
    decisionScore,
    
    // Methods
    setLoading,
    setLoadingIndicator,
    setError,
    setShowDecisionHistory,
    setSelectedLocationType,
    handleContextualDecision,
    handleClearDecision,
    forceRender,
    toggleDevPanel,
    
    // Narrative info
    decisionHistory,
    hasActiveDecision
  };
}

// TypeScript definitions for browser debug namespace
declare global {
  interface Window {
    bhgmDebug?: {
      gameState?: () => GameState;
      triggerDecision?: (locationType?: LocationType) => Promise<void>;
      decisions?: {
        lastDetectionScore?: number;
      };
    }
  }
}