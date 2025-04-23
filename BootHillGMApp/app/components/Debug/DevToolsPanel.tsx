// DevToolsPanel.tsx
import React, { useEffect, Dispatch } from "react"; // Combine imports
import { DevToolsPanelProps } from "../../types/debug.types";
// import { Dispatch } from 'react'; // Remove duplicate
import { NarrativeAction } from "../../types/narrative/actions.types";

// Import components
import GameControlSection from "./GameControlSection";
import DecisionTestingSection from "./DecisionTestingSection";
import ContextualDecisionSection from "./ContextualDecisionSection";
import NarrativeDebugPanel from "./NarrativeDebugPanel";
import AIDecisionControls from './AIDecisionControls';
import GameStateDisplay from "./GameStateDisplay";
import DevToolsHeader from "./DevToolsHeader";
import RenderingDebugTools from "./RenderingDebugTools";

// Import custom hook for DevTools functionality
import { useDevTools } from "../../hooks/useDevTools";

// Import content monitor for debug purposes
import { attachContentMonitorToWindow, analyzeContent } from "../../utils/debug";

// Import initial state for fallback
import { initialNarrativeState } from "../../types/state/narrativeState";

/**
 * DevTools panel for game debugging and testing.
 * Provides functionality to reset the game state, initialize test combat scenarios,
 * test decision flows, and view game state.
 */
const DevToolsPanel: React.FC<DevToolsPanelProps> = ({ gameState, dispatch }) => {
  // Use our custom hook to handle all DevTools functionality
  const {
    loading,
    error,
    setLoadingIndicator,
    renderCount,
    isPanelCollapsed,
    showDecisionHistory,
    selectedLocationType,
    decisionScore,
    
    setLoading,
    setError,
    setShowDecisionHistory,
    setSelectedLocationType,
    handleContextualDecision,
    handleClearDecision,
    forceRender,
    toggleDevPanel,
    
    decisionHistory,
    hasActiveDecision
  } = useDevTools(gameState);

  // Initialize content monitor in development mode
  useEffect(() => {
    // Only initialize in development mode
    if (process.env.NODE_ENV === 'development') {
      // Attach content monitor to window for console access
      attachContentMonitorToWindow();
      
      // Run initial content analysis
      analyzeContent();
    }
  }, []);

  // Ensure we always have a valid narrative state by providing a fallback
  const narrativeState = gameState.narrative || initialNarrativeState;
  
  // Cast dispatch to the expected NarrativeAction type for the narrative-specific components
  const narrativeDispatch = dispatch as Dispatch<NarrativeAction>;

  return (
    <div className="bg-gray-800 text-white p-4 mt-4 rounded-md border border-gray-700">
      <DevToolsHeader 
        isPanelCollapsed={isPanelCollapsed}
        toggleDevPanel={toggleDevPanel}
      />
      
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
              setLoadingIndicator={setLoadingIndicator}
              gameState={gameState}
            />
            
            {/* Debug Tools */}
            <RenderingDebugTools
              renderCount={renderCount}
              forceRender={forceRender}
              showDecisionHistory={showDecisionHistory}
              setShowDecisionHistory={setShowDecisionHistory}
            />
            
            {/* Decision Testing Section */}
            <DecisionTestingSection 
              narrativeContext={{ state: narrativeState, dispatch: narrativeDispatch }}
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
            
            {/* Content Monitor Controls (Dev Mode Only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="flex flex-col p-2 border border-gray-700 rounded">
                <h3 className="text-sm font-bold mb-2">Content Monitor</h3>
                <div className="flex gap-2">
                  <button
                    className="px-2 py-1 text-xs bg-yellow-600 rounded hover:bg-yellow-500"
                    onClick={() => {
                      if (window.contentMonitor) {
                        window.contentMonitor.analyze();
                      }
                    }}
                  >
                    Analyze Content
                  </button>
                  <button
                    className="px-2 py-1 text-xs bg-indigo-600 rounded hover:bg-indigo-500"
                    onClick={() => {
                      if (window.contentMonitor) {
                        window.contentMonitor.startMonitoring();
                      }
                    }}
                  >
                    Monitor Changes
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Narrative Context Debug Panel */}
          <NarrativeDebugPanel 
            narrativeContext={{ state: narrativeState, dispatch: narrativeDispatch }}
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

// Add TypeScript typings for window extension
declare global {
  interface Window {
    contentMonitor?: {
      analyze: () => void;
      startMonitoring: () => () => void;
      checkHardcoded: () => boolean;
    };
  }
}

export default DevToolsPanel;