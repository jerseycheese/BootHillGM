/**
 * Test helpers for narrative-related hooks and utilities, specifically
 * focusing on AI context optimization tests.
 */
import React from 'react'; // Import React for types like ReactNode
import { useNarrative } from '../../context/NarrativeContext'; 
import { getAIResponse } from '../../services/ai/gameService';
import { useOptimizedNarrativeContext, useNarrativeContextSynchronization } from '../../utils/narrative/narrativeContextIntegration';
import { estimateTokenCount } from '../../utils/narrative';
import { MockOptimizedNarrativeContext, MockNarrativeContextSynchronization } from '../../types/test.types';
import { NarrativeState, NarrativeAction } from '../../types/narrative.types'; 


export const mockUseNarrative = useNarrative as jest.MockedFunction<typeof useNarrative>;
export const mockGetAIResponse = getAIResponse as jest.MockedFunction<typeof getAIResponse>;
export const mockUseOptimizedNarrativeContext = useOptimizedNarrativeContext as jest.MockedFunction<() => MockOptimizedNarrativeContext>;
export const mockUseNarrativeContextSynchronization = useNarrativeContextSynchronization as jest.MockedFunction<() => MockNarrativeContextSynchronization>;
export const mockEstimateTokenCount = estimateTokenCount as jest.MockedFunction<typeof estimateTokenCount>;


const mockNarrativeState: NarrativeState = {
  currentStoryPoint: null, visitedPoints: [], availableChoices: [], displayMode: 'standard',
  narrativeHistory: ["You entered Tombstone.", "You met the sheriff."],
  narrativeContext: {
    tone: 'serious', characterFocus: ['Sheriff'], themes: ['justice'], decisionHistory: [],
    worldContext: "Wild West setting in the 1880s", importantEvents: ["Gunfight at the O.K. Corral"],
    storyPoints: { 'sheriff-outlaws': { id: 'sheriff-outlaws', content: 'Sheriff needs help with outlaws', type: 'action', title: 'Sheriff Needs Help' } },
    narrativeArcs: { 'justice-frontier': { id: 'justice-frontier', title: 'Justice in the frontier', description: 'An arc about bringing justice.', branches: [], startingBranch: '', isCompleted: false } },
    impactState: { reputationImpacts: {}, relationshipImpacts: {}, worldStateImpacts: {}, storyArcImpacts: {}, lastUpdated: Date.now() },
    narrativeBranches: {}, pendingDecisions: []
  },
  context: "" // Add missing context property
};

const mockNarrativeContextValue: {
  state: NarrativeState; dispatch: React.Dispatch<NarrativeAction>;
  saveNarrativeState: jest.Mock; loadNarrativeState: jest.Mock<NarrativeState | null>; resetNarrativeState: jest.Mock;
} = {
  state: mockNarrativeState, dispatch: jest.fn(), saveNarrativeState: jest.fn(),
  loadNarrativeState: jest.fn().mockReturnValue(null), resetNarrativeState: jest.fn()
};

const MOCK_OPTIMIZED_CONTEXT = "Recent events: You arrived in Tombstone.";

/**
 * Sets up the default return values for mocks. Call this in beforeEach.
 * Assumes jest.mock() calls are done in the test file itself.
 */
export const setupAIContextMocks = () => {
  // Reset mock function calls and implementations
  mockUseNarrative.mockReset();
  mockGetAIResponse.mockReset();
  mockUseOptimizedNarrativeContext.mockReset();
  mockUseNarrativeContextSynchronization.mockReset();
  mockEstimateTokenCount.mockReset();

  // Set default return values
  mockUseNarrative.mockReturnValue(mockNarrativeContextValue);

  mockUseOptimizedNarrativeContext.mockReturnValue({
    buildOptimizedContext: jest.fn().mockReturnValue(MOCK_OPTIMIZED_CONTEXT),
    getDefaultContext: jest.fn().mockReturnValue(MOCK_OPTIMIZED_CONTEXT),
    getFocusedContext: jest.fn().mockReturnValue(MOCK_OPTIMIZED_CONTEXT),
    getCompactContext: jest.fn().mockReturnValue(MOCK_OPTIMIZED_CONTEXT)
  });

  mockUseNarrativeContextSynchronization.mockReturnValue({
    ensureFreshContext: jest.fn().mockResolvedValue(null)
  });

  mockEstimateTokenCount.mockReturnValue(100);
};
