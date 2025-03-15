// components/Debug/DecisionTestingSection.tsx
import React, { useState } from "react";
import { DecisionTestingSectionProps } from "../../types/debug.types";
import { DecisionImportance } from "../../types/narrative.types";
import { createTestDecision } from "../../utils/testNarrativeWithDecision";
import { clearCurrentDecision } from "../../reducers/narrativeReducer";
import { EVENTS, triggerCustomEvent } from "../../utils/events";

/**
 * Decision testing section for creating and managing test decisions
 */
const DecisionTestingSection: React.FC<DecisionTestingSectionProps> = ({
  narrativeContext,
  loading,
  setLoading,
  setError,
  forceRender,
  hasActiveDecision,
  handleClearDecision
}) => {
  const [decisionImportance, setDecisionImportance] = useState<DecisionImportance>("significant");

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

  return (
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
  );
};

export default DecisionTestingSection;