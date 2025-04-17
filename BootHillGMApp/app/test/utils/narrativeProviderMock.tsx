import React from 'react';
import NarrativeContext from '../../context/NarrativeContext';
import { NarrativeContextType } from '../../hooks/narrative/NarrativeProvider';
import { initialState } from '../../types/initialState';

/**
 * Creates a mock NarrativeProvider to wrap components for testing
 * This allows components that use the narrative hooks to work in tests
 */
export const MockNarrativeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Create mock narrative hook functions
  const mockDispatch = jest.fn();
  
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
        storyPoints: {},
        narrativeArcs: {},
        narrativeBranches: {},
        impactState: { 
          reputationImpacts: {}, 
          relationshipImpacts: {}, 
          worldStateImpacts: {}, 
          storyArcImpacts: {}, 
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
 * A test to satisfy Jest requirements for having at least one test in a file
 */
describe('MockNarrativeProvider', () => {
  it('exists', () => {
    expect(MockNarrativeProvider).toBeDefined();
  });
});

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