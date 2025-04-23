import React from 'react';
import NarrativeContext from '../../context/NarrativeContext';
import { NarrativeContextType } from '../../hooks/narrative/NarrativeProvider';
import { initialState } from '../../types/initialState';

// Create browser-compatible mock functions
interface MockFunction {
  (...args: any[]): any;
  calls: any[][];
  returnValue: any;
  mockReturnValue(value: any): MockFunction;
  mockImplementation(implementation: (...args: any[]) => any): MockFunction;
}

const createMockFn = (): MockFunction => {
  const fn = function(...args: any[]) {
    if (typeof fn.calls !== 'undefined') {
      fn.calls.push(args);
    }
    return fn.returnValue;
  };
  
  fn.calls = [] as any[][];
  fn.returnValue = undefined;
  
  fn.mockReturnValue = function(value: any) {
    fn.returnValue = value;
    return fn;
  };
  
  fn.mockImplementation = function(implementation: (...args: any[]) => any) {
    const originalFn = fn;
    const newFn = function(...args: any[]) {
      if (typeof newFn.calls !== 'undefined') {
        newFn.calls.push(args);
      }
      return implementation(...args);
    };
    newFn.calls = originalFn.calls;
    newFn.returnValue = originalFn.returnValue;
    newFn.mockReturnValue = originalFn.mockReturnValue;
    newFn.mockImplementation = originalFn.mockImplementation;
    return newFn;
  };
  
  return fn;
};

/**
 * Creates a mock NarrativeProvider to wrap components for testing
 * This allows components that use the narrative hooks to work in tests
 */
export const MockNarrativeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Create mock narrative hook functions
  const mockDispatch = createMockFn();
  
  // Create a compatible narrative state that matches NarrativeContextType
  const mockContextValue: NarrativeContextType = {
    state: {
      ...initialState.narrative,
      visitedPoints: [],
      availableChoices: [],
      displayMode: 'standard',
      context: '',
      narrativeHistory: [],
      currentStoryPoint: null,
      narrativeContext: {
        characterFocus: [],
        themes: [],
        worldContext: '',
        importantEvents: [],
        storyPoints: { /* Intentionally empty */ },
        narrativeArcs: { /* Intentionally empty */ },
        narrativeBranches: { /* Intentionally empty */ },
        impactState: { 
          reputationImpacts: { /* Intentionally empty */ }, 
          relationshipImpacts: { /* Intentionally empty */ }, 
          worldStateImpacts: { /* Intentionally empty */ }, 
          storyArcImpacts: { /* Intentionally empty */ }, 
          lastUpdated: Date.now() 
        },
        activeDecision: undefined,
        pendingDecisions: [],
        decisionHistory: []
      }
    },
    dispatch: mockDispatch
  };

  return (
    <NarrativeContext.Provider value={mockContextValue}>
      {children}
    </NarrativeContext.Provider>
  );
};

/**
 * Wrapper function that wraps a component in both CampaignStateContext and NarrativeContext
 * for testing components that need both contexts
 */
export const withNarrativeContext = (ui: React.ReactElement) => {
  return (
    <MockNarrativeProvider>
      {ui}
    </MockNarrativeProvider>
  );
};