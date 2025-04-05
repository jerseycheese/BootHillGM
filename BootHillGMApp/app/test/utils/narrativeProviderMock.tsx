import React from 'react';
import { initialNarrativeState } from '../../types/narrative.types';
import NarrativeContext from '../../context/NarrativeContext';
import { GameState } from '../../types/gameState';
import { initialState } from '../../types/initialState';

/**
 * Creates a mock NarrativeProvider to wrap components for testing
 * This allows components that use the narrative hooks to work in tests
 */
export const MockNarrativeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Create mock narrative hook functions
  const mockDispatch = jest.fn();
  const mockSaveNarrativeState = jest.fn();
  const mockLoadNarrativeState = jest.fn().mockReturnValue(initialNarrativeState);
  const mockResetNarrativeState = jest.fn();
  
  // Create a minimal GameState with required properties
  const mockState: GameState = {
    ...initialState,
    narrative: {
      ...initialState.narrative,
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
    }
  };
  
  // Mock context value
  const contextValue = {
    state: mockState,
    dispatch: mockDispatch,
    saveNarrativeState: mockSaveNarrativeState,
    loadNarrativeState: mockLoadNarrativeState,
    resetNarrativeState: mockResetNarrativeState
  };

  return (
    <NarrativeContext.Provider value={contextValue}>
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
