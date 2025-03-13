import React, { useState } from "react";
import { GameEngineAction } from "../../types/gameActions";
import { initializeTestCombat, resetGame } from "../../utils/debugActions";
import { useCampaignState } from "../CampaignStateManager";
import { GameState } from "../../types/gameState";
import { useNarrative } from "../../context/NarrativeContext";
import { DecisionImportance } from "../../types/narrative.types";
import { clearCurrentDecision } from "../../reducers/narrativeReducer";
import { createTestDecision } from "../../utils/testNarrativeWithDecision";

/**
 * DevTools panel for game debugging and testing.
 * Provides functionality to reset the game state and initialize test combat scenarios.
 * Displays the current game state for inspection.
 *
 * @param {GameState} gameState - The current game state.
 * @param {React.Dispatch<GameEngineAction>} dispatch - Dispatch function to trigger game actions.
 */
interface DevToolsPanelProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameEngineAction>;
  id?: string;
  "data-testid"?: string;
}

const DevToolsPanel: React.FC<DevToolsPanelProps> = ({
  gameState,
  dispatch,
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [decisionImportance, setDecisionImportance] = useState<DecisionImportance>("significant");
  // Force render counter
  const [renderCount, setRenderCount] = useState(0);
  // Decision debug state
  const [showDecisionHistory, setShowDecisionHistory] = useState(false);
  
  const { } = useCampaignState();
  
  // Get access to the narrative context
  const narrativeContext = useNarrative();

  const handleResetGame = () => {
    setLoading("reset");
    setError(null);
    try {
      dispatch(resetGame());
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(`Failed to reset game: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  const handleTestCombat = async () => {
    setLoading("combat");
    setError(null);
    try {
      dispatch(initializeTestCombat());
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(`Failed to initialize test combat: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  // Force a re-render of all components
  const forceRender = () => {
    setRenderCount(prev => prev + 1);
    // Dispatch a DOM event that our components are listening for
    window.dispatchEvent(new Event('storage'));
  };

  // Enhanced function to trigger a test decision with better debugging
  const handleTestDecision = () => {
    setLoading("decision");
    setError(null);
    try {
      // First, clear any existing decision to prevent conflicts
      if (narrativeContext.state.currentDecision) {
        narrativeContext.dispatch(clearCurrentDecision());
      }
      
      // Create a test decision using our utility function
      const testDecision = createTestDecision(decisionImportance);
      
      // Dispatch directly to context with a slight delay to ensure previous clear completed
      setTimeout(() => {
        // Dispatch to narrative context
        narrativeContext.dispatch({
          type: 'PRESENT_DECISION',
          payload: testDecision
        });
        
        // Force update - this is a workaround to ensure the UI updates
        setTimeout(() => {
          window.dispatchEvent(new Event('storage'));
        }, 50);
      }, 50);
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(`Failed to present test decision: ${error.message}`);
      console.error('BHGM Debug: Decision error:', err);
    } finally {
      setLoading(null);
    }
  };
  
  // Function to force a simpler test decision (emergency testing)
  const handleForceTestDecision = () => {
    setLoading("force-decision");
    try {
      // Clear any existing decision first
      narrativeContext.dispatch(clearCurrentDecision());
      
      // Wait a bit to ensure the clear completes
      setTimeout(() => {
        // Create a simpler test decision
        const simpleTestDecision = {
          id: `force-test-${Date.now()}`,
          prompt: 'TEST: Make a quick choice',
          timestamp: Date.now(),
          options: [
            { id: 'test1', text: 'Test Option 1', impact: 'Test impact.' },
            { id: 'test2', text: 'Test Option 2', impact: 'Test impact.' }
          ],
          context: 'This is a forced test decision bypass.',
          importance: 'moderate' as DecisionImportance,
          characters: ['Test'],
          aiGenerated: false
        };
        
        // Use direct state management
        narrativeContext.dispatch({
          type: 'PRESENT_DECISION',
          payload: simpleTestDecision
        });
        
        // Force component update (this is a direct DOM event to trigger rerendering)
        setTimeout(() => {
          window.dispatchEvent(new Event('storage'));
        }, 50);
        
        // Force re-render via the counter
        setRenderCount(prev => prev + 1);
      }, 50);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(`Failed to force test decision: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };
  
  // Function to clear the current decision (helps with debugging/testing)
  const handleClearDecision = () => {
    setLoading("clearing");
    try {
      // Directly dispatch the clear action for more reliable operation
      narrativeContext.dispatch(clearCurrentDecision());
      
      // Force update
      setTimeout(() => {
        window.dispatchEvent(new Event('storage'));
      }, 50);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(`Failed to clear decision: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };
  
  // Toggle decision history display
  const toggleDecisionHistory = () => {
    setShowDecisionHistory(!showDecisionHistory);
  };

  // Get decision history for display
  const decisionHistory = narrativeContext.state.narrativeContext?.decisionHistory || [];

  return (
    <div className="bg-gray-800 text-white p-4 mt-4">
      <h2 className="text-xl font-bold mb-2">DevTools</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleResetGame}
          disabled={loading === "reset"}
        >
          {loading === "reset" ? "Resetting..." : "Reset Game"}
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleTestCombat}
          disabled={loading === "combat"}
        >
          {loading === "combat" ? "Initializing..." : "Test Combat"}
        </button>
        
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
              onClick={toggleDecisionHistory}
            >
              {showDecisionHistory ? 'Hide History Debug' : 'Show History Debug'}
            </button>
          </div>
        </div>
        
        {/* Test Decision Section */}
        <div className="w-full mt-2 p-2 border border-gray-700 rounded">
          <h3 className="text-md font-semibold mb-2">Test Player Decision</h3>
          <div className="mb-2">
            <label className="block text-sm mb-1">Decision Importance:</label>
            <select 
              className="bg-gray-700 text-white p-1 rounded w-full"
              value={decisionImportance}
              onChange={(e) => setDecisionImportance(e.target.value as DecisionImportance)}
            >
              <option value="critical">Critical</option>
              <option value="significant">Significant</option>
              <option value="moderate">Moderate</option>
              <option value="minor">Minor</option>
            </select>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              className="bg-purple-600 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded"
              onClick={handleTestDecision}
              disabled={loading === "decision"}
            >
              {loading === "decision" ? "Triggering..." : "Trigger Test Decision"}
            </button>
            
            <button
              className="bg-yellow-600 hover:bg-yellow-800 text-white font-bold py-2 px-4 rounded"
              onClick={handleForceTestDecision}
              disabled={loading === "force-decision"}
            >
              {loading === "force-decision" ? "Forcing..." : "Force Simple Test"}
            </button>
            
            <button
              className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded"
              onClick={handleClearDecision}
              disabled={loading === "clearing"}
            >
              {loading === "clearing" ? "Clearing..." : "Clear Decision"}
            </button>
          </div>
        </div>
      </div>
      
      {/* Narrative Context Debug Panel */}
      <div className="mb-4 p-2 border border-gray-700 rounded">
        <h3 className="text-md font-semibold mb-2">Narrative Context Status</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="font-medium">Has Active Decision:</div>
          <div>{narrativeContext.state.currentDecision ? '✅ Yes' : '❌ No'}</div>
          
          <div className="font-medium">Decision Records:</div>
          <div className="flex items-center gap-2">
            {decisionHistory.length || 0}
            <span className="text-xs text-gray-400">{decisionHistory.length ? '(click Show History Debug)' : ''}</span>
          </div>
          
          <div className="font-medium">Narrative History:</div>
          <div>{narrativeContext.state.narrativeHistory.length} entries</div>
          
          <div className="font-medium">Re-render Count:</div>
          <div>{renderCount}</div>
          
          <div className="font-medium">Context State:</div>
          <div className="flex items-center gap-2">
            {narrativeContext.state.narrativeContext ? '✅ Initialized' : '❌ Missing'}
          </div>
        </div>
        
        {/* Decision History Debug */}
        {showDecisionHistory && decisionHistory.length > 0 && (
          <div className="mt-4 bg-gray-900 p-2 rounded">
            <h4 className="font-medium border-b border-gray-700 pb-1 mb-2">Decision History ({decisionHistory.length} records)</h4>
            {decisionHistory.map((record, index) => (
              <div key={record.decisionId} className="text-xs mb-3 pb-2 border-b border-gray-700 last:border-none">
                <div className="font-semibold">#{index + 1}: {record.decisionId.slice(0, 10)}...</div>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  <div className="text-gray-400">Option:</div>
                  <div className="col-span-2">{record.selectedOptionId}</div>
                  
                  <div className="text-gray-400">Impact:</div>
                  <div className="col-span-2">{record.impactDescription.slice(0, 40)}...</div>
                  
                  <div className="text-gray-400">Tags:</div>
                  <div className="col-span-2 flex flex-wrap gap-1">
                    {record.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="bg-gray-700 px-1 rounded-sm">{tag}</span>
                    ))}
                    {record.tags.length > 3 && <span className="text-gray-500">+{record.tags.length - 3} more</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Current Decision Info */}
        {narrativeContext.state.currentDecision && (
          <div className="mt-2 p-2 bg-gray-700 rounded">
            <h4 className="font-medium">Current Decision:</h4>
            <div className="text-xs mt-1">
              <div><span className="font-medium">ID:</span> {narrativeContext.state.currentDecision.id}</div>
              <div><span className="font-medium">Prompt:</span> {narrativeContext.state.currentDecision.prompt}</div>
              <div><span className="font-medium">Importance:</span> {narrativeContext.state.currentDecision.importance}</div>
              <div><span className="font-medium">Options:</span> {narrativeContext.state.currentDecision.options.length}</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Game State</h3>
        <ErrorBoundary>
          <pre className="text-xs">{JSON.stringify(gameState, null, 2)}</pre>
        </ErrorBoundary>
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error in state display:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <p className="text-red-500">Error displaying game state.</p>;
    }
    return this.props.children;
  }
}

export default DevToolsPanel;