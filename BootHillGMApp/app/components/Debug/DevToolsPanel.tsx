// DevToolsPanel.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useCampaignState } from "../CampaignStateManager";
import { useNarrative } from "../../context/NarrativeContext";
import { initializeBrowserDebugTools, updateDebugCurrentDecision } from "../../utils/debugConsole";
import { EVENTS, triggerCustomEvent } from "../../utils/events";
import { DevToolsPanelProps } from "../../types/debug.types";
import { LocationType } from "../../services/locationService";

// Import extracted components
import GameControlSection from "./GameControlSection";
import DecisionTestingSection from "./DecisionTestingSection";
import ContextualDecisionSection from "./ContextualDecisionSection";
import NarrativeDebugPanel from "./NarrativeDebugPanel";
import AIDecisionControls from './AIDecisionControls';
import GameStateDisplay from "./GameStateDisplay";

// Import decision-related utilities
import { 
  initializeDecisionDebugTools,
  generateEnhancedDecision 
} from '../../utils/contextualDecisionGenerator.enhanced';
import { clearCurrentDecision, addNarrativeHistory } from "../../reducers/narrativeReducer";

/**
 * DevTools panel for game debugging and testing.
 * Provides functionality to reset the game state, initialize test combat scenarios,
 * test decision flows, and view game state.
 */
const DevToolsPanel: React.FC<DevToolsPanelProps> = ({ gameState, dispatch }) => {
  // Core state
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [renderCount, setRenderCount] = useState(0);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  
  // Decision testing state
  const [showDecisionHistory, setShowDecisionHistory] = useState(false);
  const [selectedLocationType, setSelectedLocationType] = useState<LocationType>({ type: 'town', name: 'Starting Town' });
  const [decisionScore, setDecisionScore] = useState<number | undefined>(undefined);

  // Context hooks
  const { } = useCampaignState();
  const narrativeContext = useNarrative();

  /**
   * Handles the generation and presentation of a contextual decision based on
   * the current game state and selected location type.
   */
  const handleContextualDecision = useCallback((locationType?: LocationType) => {
    setLoading("contextual-decision");
    setError(null);
    
    try {
      // First, notify the user that we're generating a decision
      narrativeContext.dispatch(addNarrativeHistory("\nGenerating a contextual decision based on the current situation...\n"));
      
      // Clear any existing decision to prevent conflicts
      narrativeContext.dispatch(clearCurrentDecision());
      triggerCustomEvent(EVENTS.DECISION_CLEARED);
      
      // Add a slight delay to ensure the UI updates with our message
      setTimeout(async () => {
        try {
          // Use the location type parameter or fall back to selected state
          const locationToUse = locationType || selectedLocationType;
          
          // Generate a contextual decision using the AI-enhanced generator
          const contextualDecision = await generateEnhancedDecision(
            gameState,
            narrativeContext.state.narrativeContext,
            locationToUse,
            true // Force generation
          );
          
          // In case of generation failure
          if (!contextualDecision) {
            const errorMessage = `Failed to generate a decision for location type: ${locationToUse.type}`;
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
  }, [gameState, narrativeContext, selectedLocationType]);

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
  }, [narrativeContext]);

  // Initialize browser debug tools
  useEffect(() => {
    if (typeof window === 'undefined') return;

    initializeBrowserDebugTools(
      () => gameState,
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
  }, [gameState, handleClearDecision, handleContextualDecision]);

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

  /**
   * Forces a re-render of all components via a custom event system.
   */
  const forceRender = () => {
    setRenderCount(prev => prev + 1);
    window.dispatchEvent(new Event('storage'));
    triggerCustomEvent(EVENTS.UI_FORCE_UPDATE);
  };

  /**
   * Toggles visibility of the entire DevTools panel
   */
  const toggleDevPanel = () => {
    setIsPanelCollapsed(!isPanelCollapsed);
  };

  // Get decision history for display
  const decisionHistory = narrativeContext.state.narrativeContext?.decisionHistory || [];
  
  // Check if there's currently an active decision
  const hasActiveDecision = !!narrativeContext.state.currentDecision;

  return (
    <div className="bg-gray-800 text-white p-4 mt-4 rounded-md border border-gray-700">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">DevTools</h2>
        <button 
          onClick={toggleDevPanel} 
          className="p-1 rounded hover:bg-gray-700"
          aria-label="Toggle DevTools Panel"
        >
          {isPanelCollapsed ? 
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg> : 
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          }
        </button>
      </div>
      
      {!isPanelCollapsed && (
        <>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Game Controls Section */}
            <GameControlSection 
              dispatch={dispatch}
              loading={loading}
              setLoading={setLoading}
              setError={setError}
            />
            
            {/* Debug Tools */}
            <div className="w-full mt-2 p-2 border border-gray-600 rounded bg-gray-900">
              <h3 className="text-md font-semibold mb-2">Rendering Debug</h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  className="bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded"
                  onClick={forceRender}
                >
                  Force Re-render (#{renderCount})
                </button>
                
                <button
                  className={`${showDecisionHistory ? 'bg-yellow-500' : 'bg-gray-500'} hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded`}
                  onClick={() => setShowDecisionHistory(!showDecisionHistory)}
                >
                  {showDecisionHistory ? 'Hide History Debug' : 'Show History Debug'}
                </button>
              </div>
            </div>
            
            {/* Decision Testing Section */}
            <DecisionTestingSection 
              narrativeContext={narrativeContext}
              loading={loading}
              setLoading={setLoading}
              setError={setError}
              forceRender={forceRender}
              hasActiveDecision={hasActiveDecision}
              handleClearDecision={handleClearDecision}
            />
            
            {/* Contextual Decision Testing Section */}
            <ContextualDecisionSection 
              selectedLocationType={selectedLocationType}
              setSelectedLocationType={setSelectedLocationType}
              loading={loading}
              hasActiveDecision={hasActiveDecision}
              handleContextualDecision={handleContextualDecision}
            />

            {/* AI Decision Controls */}
            <AIDecisionControls 
              onGenerateDecision={() => handleContextualDecision()}
              isGenerating={loading === "contextual-decision"}
              detectionScore={decisionScore}
            />
          </div>

          {/* Narrative Context Debug Panel */}
          <NarrativeDebugPanel 
            narrativeContext={narrativeContext}
            renderCount={renderCount}
            showDecisionHistory={showDecisionHistory}
            decisionHistory={decisionHistory}
          />

          {/* Game State Display */}
          <GameStateDisplay gameState={gameState} />
        </>
      )}
    </div>
  );
};

export default DevToolsPanel;