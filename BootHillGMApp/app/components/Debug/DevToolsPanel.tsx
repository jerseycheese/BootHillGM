// DevToolsPanel.tsx
import React from "react";
import { useCampaignState } from "../CampaignStateManager";
import { DevToolsPanelProps } from "../../types/debug.types";

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

/**
 * DevTools panel for game debugging and testing.
 * Provides functionality to reset the game state, initialize test combat scenarios,
 * test decision flows, and view game state.
 */
const DevToolsPanel: React.FC<DevToolsPanelProps> = ({ gameState, dispatch }) => {
  // Use the campaign state hook (potential future usage)
  useCampaignState();
  
  // Use our custom hook to handle all DevTools functionality
  const {
    loading,
    error,
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
    
    narrativeContext,
    decisionHistory,
    hasActiveDecision
  } = useDevTools(gameState);

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