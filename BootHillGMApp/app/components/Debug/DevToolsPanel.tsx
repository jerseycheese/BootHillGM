import React, { useState, useEffect, useCallback } from "react";
import { GameEngineAction } from "../../types/gameActions";
import { initializeTestCombat, resetGame } from "../../utils/debugActions";
import { useCampaignState } from "../CampaignStateManager";
import { GameState } from "../../types/gameState";
import { useNarrative } from "../../context/NarrativeContext";
import { DecisionImportance } from "../../types/narrative.types";
import { clearCurrentDecision, addNarrativeHistory } from "../../reducers/narrativeReducer";
import { createTestDecision } from "../../utils/testNarrativeWithDecision";
import { LocationType } from "../../services/locationService";
import { initializeBrowserDebugTools, updateDebugCurrentDecision } from "../../utils/debugConsole";
import { EVENTS, triggerCustomEvent } from "../../utils/events";
import AIDecisionControls from './AIDecisionControls';
import { 
  generateEnhancedDecision, 
  initializeDecisionDebugTools 
} from '../../utils/contextualDecisionGenerator.enhanced';

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
  // New state for contextual decision testing
  const [selectedLocationType, setSelectedLocationType] = useState<LocationType>({ type: 'town', name: 'Starting Town' });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  // State for AI decision detection score
  const [decisionScore, setDecisionScore] = useState<number | undefined>(undefined);

  const { } = useCampaignState();

  // Get access to the narrative context
  const narrativeContext = useNarrative();

  /**
   * Handles the generation and presentation of a contextual decision based on
   * the current game state and selected location type. Clears any existing
   * decisions first, then generates and presents a new one.
   * 
   * @param locationType - Optional location type to override the selected one
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
   * Useful for debugging and testing the decision flow.
   */
  const handleClearDecision = useCallback(() => {
    setLoading("clearing");
    try {
      // Directly dispatch the clear action for more reliable operation
      narrativeContext.dispatch(clearCurrentDecision());
      
      // Notify components that a decision has been cleared
      triggerCustomEvent(EVENTS.DECISION_CLEARED);
      
      // Force update
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
    // Only run in client-side environment
    if (typeof window === 'undefined') return;

    // Initialize standard debug tools
    initializeBrowserDebugTools(
      // Game state getter
      () => gameState,
      // Decision trigger function
      (locationType?: LocationType) => handleContextualDecision(locationType),
      // Decision clear function
      () => handleClearDecision()
    );
    
    // Initialize enhanced decision debug tools
    initializeDecisionDebugTools();
    
    // Instead of creating a complete object, just set the trigger decision function
    // This avoids TypeScript errors from property mismatches
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

    // Cleanup function is intentionally empty - browser will handle cleanup
  }, [gameState, handleClearDecision, handleContextualDecision]);

  // Update the debug namespace with current decision
  useEffect(() => {
    // Update debug namespace with current decision
    updateDebugCurrentDecision(narrativeContext.state.currentDecision || null);
    
    // If the decision state changed, also trigger a UI state change event
    if (narrativeContext.state.currentDecision) {
      triggerCustomEvent(EVENTS.UI_STATE_CHANGED, { 
        type: 'decision',
        active: true,
        id: narrativeContext.state.currentDecision.id
      });
    }
  }, [narrativeContext.state.currentDecision]);

  /**
   * Handles the game reset action
   */
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

  /**
   * Initializes a test combat scenario
   */
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

  /**
   * Forces a re-render of all components via a custom event system.
   * Uses both the storage event (backward compatibility) and custom events.
   */
  const forceRender = () => {
    setRenderCount(prev => prev + 1);
    
    // Use both storage event (old method) and custom event (new method)
    // This ensures backward compatibility
    window.dispatchEvent(new Event('storage'));
    
    // Also trigger our custom UI update event
    triggerCustomEvent(EVENTS.UI_FORCE_UPDATE);
  };

  /**
   * Generates and presents a test decision with the specified importance.
   * First clears any existing decision to prevent conflicts.
   */
  const handleTestDecision = () => {
    setLoading("decision");
    setError(null);
    try {
      // First, clear any existing decision to prevent conflicts
      narrativeContext.dispatch(clearCurrentDecision());
      
      // Notify components that a decision has been cleared
      triggerCustomEvent(EVENTS.DECISION_CLEARED);
      
      // Create a test decision using our utility function
      const testDecision = createTestDecision(decisionImportance);
      
      // Dispatch directly to context with a slight delay to ensure previous clear completed
      setTimeout(() => {
        // Dispatch to narrative context
        narrativeContext.dispatch({
          type: 'PRESENT_DECISION',
          payload: testDecision
        });
        
        // Notify all components that a new decision is ready
        triggerCustomEvent(EVENTS.DECISION_READY, testDecision);
        
        // Also force a UI update
        forceRender();
      }, 100);
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(`Failed to present test decision: ${error.message}`);
      console.error('BHGM Debug: Decision error:', err);
    } finally {
      setTimeout(() => {
        setLoading(null);
      }, 200);
    }
  };
  
  /**
   * Generates and presents a simpler test decision for emergency testing.
   * Useful for bypassing the normal decision generation flow.
   */
  const handleForceTestDecision = () => {
    setLoading("force-decision");
    try {
      // Clear any existing decision first
      narrativeContext.dispatch(clearCurrentDecision());
      
      // Notify components that a decision has been cleared
      triggerCustomEvent(EVENTS.DECISION_CLEARED);
      
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
        
        // Notify all components that a new decision is ready
        triggerCustomEvent(EVENTS.DECISION_READY, simpleTestDecision);
        
        // Also force a UI update
        forceRender();
      }, 100);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(`Failed to force test decision: ${error.message}`);
    } finally {
      setTimeout(() => {
        setLoading(null);
      }, 200);
    }
  };

  /**
   * Toggles the display of decision history for debugging
   */
  const toggleDecisionHistory = () => {
    setShowDecisionHistory(!showDecisionHistory);
  };

  /**
   * Toggles visibility of the contextual decision testing panel
   */
  const toggleContextualPanel = () => {
    setIsCollapsed(!isCollapsed);
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
                  disabled={loading === "decision" || hasActiveDecision}
                >
                  {loading === "decision" ? "Triggering..." : "Trigger Test Decision"}
                </button>
                
                <button
                  className="bg-yellow-600 hover:bg-yellow-800 text-white font-bold py-2 px-4 rounded"
                  onClick={handleForceTestDecision}
                  disabled={loading === "force-decision" || hasActiveDecision}
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
            
            {/* Contextual Decision Testing Section */}
            <div className="w-full mt-2 p-2 border border-gray-700 rounded bg-gray-900">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-semibold">Contextual Decision Testing</h3>
                <button
                  onClick={toggleContextualPanel}
                  className="p-1 rounded hover:bg-gray-700"
                  aria-label="Toggle Decision Testing Panel"
                >
                  {isCollapsed ? 
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg> : 
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                  }
                </button>
              </div>
              
              {!isCollapsed && (
                <>
                  <div className="mb-3">
                    <label className="block text-sm mb-1" htmlFor="location-type">Location Type:</label>
                    <select
                      id="location-type"
                      className="bg-gray-700 text-white p-1 rounded w-full"
                      value={selectedLocationType.type}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        let newLocation: LocationType;
                        switch (selectedValue) {
                          case 'town':
                            newLocation = { type: 'town', name: 'Some Town' }; // Placeholder name
                            break;
                          case 'wilderness':
                            newLocation = { type: 'wilderness', description: 'Some Wilderness' }; // Placeholder
                            break;
                          case 'ranch':
                            newLocation = { type: 'landmark', name: 'Some Ranch' }; // Placeholder
                            break;
                          case 'mine':
                            newLocation = { type: 'landmark', name: 'Some Mine' }; // Placeholder
                            break;
                          case 'camp':
                            newLocation = { type: 'landmark', name: 'Some Camp' }; // Placeholder
                            break;
                          default:
                            newLocation = { type: 'unknown' };
                        }
                        setSelectedLocationType(newLocation);
                      }}
                      aria-label="Location Type:"
                    >
                      <option value="town">Town</option>
                      <option value="wilderness">Wilderness</option>
                      <option value="ranch">Ranch</option>
                      <option value="mine">Mine</option>
                      <option value="camp">Camp</option>
                    </select>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      className="bg-teal-600 hover:bg-teal-800 text-white font-bold py-2 px-4 rounded relative"
                      onClick={() => handleContextualDecision()}
                      disabled={loading === "contextual-decision" || hasActiveDecision}
                    >
                      <span className={loading === "contextual-decision" ? "opacity-0" : ""}>
                        Trigger Contextual Decision
                      </span>
                      {loading === "contextual-decision" && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="inline-block w-5 h-5 border-t-2 border-white rounded-full animate-spin"></span>
                          <span className="ml-2">Generating...</span>
                        </span>
                      )}
                    </button>

                    <div className="text-xs text-gray-400 mt-2">
                      This generates decisions based on current game state and narrative context.
                      Console command: <code>window.bhgmDebug.triggerDecision(&apos;town&apos;)</code>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* AI Decision Controls */}
            <AIDecisionControls 
              onGenerateDecision={() => handleContextualDecision()}
              isGenerating={loading === "contextual-decision"}
              detectionScore={decisionScore}
            />
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
        </>
      )}
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