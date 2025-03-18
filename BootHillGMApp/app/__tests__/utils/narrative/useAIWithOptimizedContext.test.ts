/**
 * Tests for useAIWithOptimizedContext hook
 * 
 * These tests verify the hook's ability to:
 * 1. Properly transform AI responses with various opponent structures
 * 2. Handle error scenarios gracefully
 * 3. Integrate with the narrative context synchronization
 * 4. Apply proper context optimization
 */

import { renderHook, act } from '@testing-library/react';
import { useAIWithOptimizedContext } from '../../../utils/narrative/useAIWithOptimizedContext';
import { useNarrative } from '../../../context/NarrativeContext';
import { getAIResponse } from '../../../services/ai/gameService';
import { useOptimizedNarrativeContext, useNarrativeContextSynchronization } from '../../../utils/narrative/narrativeContextIntegration';
import { estimateTokenCount } from '../../../utils/narrative/narrativeCompression';
import { MockOptimizedNarrativeContext, MockNarrativeContextSynchronization } from '../../../types/test.types';

// Mock dependencies
jest.mock('../../../context/NarrativeContext');
jest.mock('../../../services/ai/gameService');
jest.mock('../../../utils/narrative/narrativeContextIntegration');
jest.mock('../../../utils/narrative/narrativeCompression');

// Setup mocks
const mockGetAIResponse = getAIResponse as jest.MockedFunction<typeof getAIResponse>;
const mockUseNarrative = useNarrative as jest.MockedFunction<typeof useNarrative>;
const mockUseOptimizedNarrativeContext = useOptimizedNarrativeContext as jest.MockedFunction<() => MockOptimizedNarrativeContext>;
const mockUseNarrativeContextSynchronization = useNarrativeContextSynchronization as jest.MockedFunction<() => MockNarrativeContextSynchronization>;
const mockEstimateTokenCount = estimateTokenCount as jest.MockedFunction<typeof estimateTokenCount>;

// Test constants
const MOCK_PROMPT = "What should I do next?";
const MOCK_INVENTORY = [{ name: "Revolver", quantity: 1, description: "A reliable six-shooter" }];
const MOCK_CONTEXT = "Recent events: You arrived in Tombstone.";

describe('useAIWithOptimizedContext', () => {
  // Setup before each test
  beforeEach(() => {
    jest.resetAllMocks();
    
    // Mock useNarrative hook
    mockUseNarrative.mockReturnValue({
      state: {
        narrativeHistory: ["You entered Tombstone.", "You met the sheriff."],
        narrativeContext: {
          tone: 'serious',
          characterFocus: ['Sheriff'],
          themes: ['justice'],
          decisionHistory: []
        }
      },
      dispatch: jest.fn()
    });
    
    // Mock useOptimizedNarrativeContext hook
    mockUseOptimizedNarrativeContext.mockReturnValue({
      buildOptimizedContext: jest.fn().mockReturnValue(MOCK_CONTEXT),
      getDefaultContext: jest.fn().mockReturnValue(MOCK_CONTEXT),
      getFocusedContext: jest.fn().mockReturnValue(MOCK_CONTEXT),
      getCompactContext: jest.fn().mockReturnValue(MOCK_CONTEXT)
    });
    
    // Mock useNarrativeContextSynchronization hook
    mockUseNarrativeContextSynchronization.mockReturnValue({
      ensureFreshContext: jest.fn().mockResolvedValue(null)
    });
    
    // Mock estimateTokenCount function
    mockEstimateTokenCount.mockReturnValue(100);
    
    // Set process.env for tests
    process.env.NODE_ENV = 'test';
  });
  
  afterEach(() => {
    jest.resetModules();
  });
  
  it('should make an AI request with default context', async () => {
    // Mock AI response with basic structure
    const mockAIResponse = {
      narrative: "You see the sheriff approaching.",
      location: { type: 'town', name: 'Tombstone' },
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: []
    };
    mockGetAIResponse.mockResolvedValue(mockAIResponse);
    
    // Render the hook
    const { result } = renderHook(() => useAIWithOptimizedContext());
    
    // Execute the hook's makeAIRequest function
    let response;
    await act(async () => {
      response = await result.current.makeAIRequest(MOCK_PROMPT, MOCK_INVENTORY);
    });
    
    // Verify the results
    expect(mockUseNarrativeContextSynchronization().ensureFreshContext).toHaveBeenCalled();
    expect(mockUseOptimizedNarrativeContext().getDefaultContext).toHaveBeenCalled();
    expect(mockGetAIResponse).toHaveBeenCalledWith(
      MOCK_PROMPT,
      MOCK_CONTEXT,
      MOCK_INVENTORY,
      undefined,
      expect.anything()
    );
    
    expect(response).toEqual({
      ...mockAIResponse,
      opponent: undefined,
      storyProgression: undefined,
      contextQuality: {
        optimized: true,
        compressionLevel: 'medium',
        tokensUsed: 100,
        buildTimeMs: expect.any(Number)
      }
    });
  });
  
  it('should handle an opponent with direct health property', async () => {
    // Mock AI response with opponent having direct health property
    const mockAIResponse = {
      narrative: "A bandit approaches, ready to fight!",
      location: { type: 'wilderness' },
      combatInitiated: true,
      opponent: {
        name: "Bandit Joe",
        health: 85, // Direct health property
        attributes: {
          strength: 70,
          speed: 8,
          gunAccuracy: 7,
          throwingAccuracy: 6,
          baseStrength: 80,
          bravery: 6,
          experience: 5
        }
      },
      acquiredItems: [],
      removedItems: [],
      suggestedActions: []
    };
    mockGetAIResponse.mockResolvedValue(mockAIResponse);
    
    // Render the hook
    const { result } = renderHook(() => useAIWithOptimizedContext());
    
    // Execute the hook's makeAIRequest function
    let response;
    await act(async () => {
      response = await result.current.makeAIRequest(MOCK_PROMPT, MOCK_INVENTORY);
    });
    
    // Verify it used the direct health property
    expect(response.opponent).toEqual({
      name: "Bandit Joe",
      strength: 70,
      health: 85 // Should use direct health property
    });
  });
  
  it('should handle an opponent with health in attributes', async () => {
    // Mock AI response with opponent having health in attributes
    const mockAIResponse = {
      narrative: "The sheriff challenges you to a duel!",
      location: { type: 'town', name: 'Tombstone' },
      combatInitiated: true,
      opponent: {
        name: "Sheriff Williams",
        attributes: {
          strength: 85,
          health: 90, // Health in attributes object
          speed: 7,
          gunAccuracy: 9,
          throwingAccuracy: 6,
          baseStrength: 85,
          bravery: 8,
          experience: 7
        }
      },
      acquiredItems: [],
      removedItems: [],
      suggestedActions: []
    };
    mockGetAIResponse.mockResolvedValue(mockAIResponse);
    
    // Render the hook
    const { result } = renderHook(() => useAIWithOptimizedContext());
    
    // Execute the hook's makeAIRequest function
    let response;
    await act(async () => {
      response = await result.current.makeAIRequest(MOCK_PROMPT, MOCK_INVENTORY);
    });
    
    // Verify it extracted health from attributes
    expect(response.opponent).toEqual({
      name: "Sheriff Williams",
      strength: 85,
      health: 90 // Should use health from attributes
    });
  });
  
  it('should fall back to strength when health is missing', async () => {
    // Mock AI response with opponent having only strength
    const mockAIResponse = {
      narrative: "An outlaw appears!",
      location: { type: 'wilderness' },
      combatInitiated: true,
      opponent: {
        name: "Outlaw Pete",
        attributes: {
          strength: 75, // Only strength, no health
          speed: 8,
          gunAccuracy: 6,
          throwingAccuracy: 5,
          baseStrength: 75,
          bravery: 7,
          experience: 4
        }
      },
      acquiredItems: [],
      removedItems: [],
      suggestedActions: []
    };
    mockGetAIResponse.mockResolvedValue(mockAIResponse);
    
    // Render the hook
    const { result } = renderHook(() => useAIWithOptimizedContext());
    
    // Execute the hook's makeAIRequest function
    let response;
    await act(async () => {
      response = await result.current.makeAIRequest(MOCK_PROMPT, MOCK_INVENTORY);
    });
    
    // Verify it falls back to strength
    expect(response.opponent).toEqual({
      name: "Outlaw Pete",
      strength: 75,
      health: 75 // Should fall back to strength
    });
  });
  
  it('should use default health value when neither health nor strength available', async () => {
    // Mock AI response with opponent missing health and strength
    const mockAIResponse = {
      narrative: "A stranger approaches.",
      location: { type: 'town', name: 'Tombstone' },
      combatInitiated: true,
      opponent: {
        name: "Mysterious Stranger",
        // No attributes at all
      },
      acquiredItems: [],
      removedItems: [],
      suggestedActions: []
    };
    mockGetAIResponse.mockResolvedValue(mockAIResponse);
    
    // Render the hook
    const { result } = renderHook(() => useAIWithOptimizedContext());
    
    // Execute the hook's makeAIRequest function
    let response;
    await act(async () => {
      response = await result.current.makeAIRequest(MOCK_PROMPT, MOCK_INVENTORY);
    });
    
    // Verify it uses default value
    expect(response.opponent).toEqual({
      name: "Mysterious Stranger",
      strength: undefined,
      health: 100 // Should use default value
    });
  });
  
  it('should handle errors gracefully', async () => {
    // Mock an error in the AI response
    const mockError = new Error('AI service error');
    mockGetAIResponse.mockRejectedValue(mockError);
    
    // Render the hook
    const { result } = renderHook(() => useAIWithOptimizedContext());
    
    // Execute and expect an error
    await act(async () => {
      await expect(result.current.makeAIRequest(MOCK_PROMPT, MOCK_INVENTORY))
        .rejects.toThrow('AI service error');
    });
    
    // Check that error state is set correctly
    expect(result.current.error).toEqual(mockError);
    expect(result.current.isLoading).toBe(false);
  });
  
  it('should use custom context options when provided', async () => {
    // Mock AI response
    mockGetAIResponse.mockResolvedValue({
      narrative: "You look around the town.",
      location: { type: 'town', name: 'Tombstone' },
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: []
    });
    
    // Custom context options
    const customOptions = {
      compressionLevel: 'high' as const,
      maxTokens: 1000,
      prioritizeRecentEvents: true
    };
    
    // Render the hook
    const { result } = renderHook(() => useAIWithOptimizedContext());
    
    // Execute with custom options
    await act(async () => {
      await result.current.makeAIRequest(MOCK_PROMPT, MOCK_INVENTORY, customOptions);
    });
    
    // Verify it used the custom options
    expect(mockUseOptimizedNarrativeContext().buildOptimizedContext)
      .toHaveBeenCalledWith(customOptions);
  });
  
  it('should include storyProgression with non-nullable description', async () => {
    // Mock AI response with storyProgression
    const mockAIResponse = {
      narrative: "The sheriff reveals a secret.",
      location: { type: 'town', name: 'Tombstone' },
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [],
      storyProgression: {
        title: "Sheriff's Secret",
        description: null, // Null description should be converted to empty string
        importance: 'significant'
      }
    };
    mockGetAIResponse.mockResolvedValue(mockAIResponse);
    
    // Render the hook
    const { result } = renderHook(() => useAIWithOptimizedContext());
    
    // Execute the hook's makeAIRequest function
    let response;
    await act(async () => {
      response = await result.current.makeAIRequest(MOCK_PROMPT, MOCK_INVENTORY);
    });
    
    // Verify storyProgression has non-null description
    expect(response.storyProgression).toEqual({
      title: "Sheriff's Secret",
      description: '', // Should be converted to empty string
      importance: 'significant'
    });
  });
  
  it('should correctly handle makeAIRequestWithFocus', async () => {
    // Mock AI response
    mockGetAIResponse.mockResolvedValue({
      narrative: "You focus on the wanted poster.",
      location: { type: 'town', name: 'Tombstone' },
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: []
    });
    
    // Render the hook
    const { result } = renderHook(() => useAIWithOptimizedContext());
    
    // Execute the focused request
    await act(async () => {
      await result.current.makeAIRequestWithFocus(MOCK_PROMPT, MOCK_INVENTORY, ['sheriff', 'bounty']);
    });
    
    // Verify it used the right context options for focus
    expect(mockUseOptimizedNarrativeContext().buildOptimizedContext)
      .toHaveBeenCalledWith(expect.objectContaining({
        compressionLevel: 'medium',
        maxTokens: 1500,
        prioritizeRecentEvents: true,
        relevanceThreshold: 6
      }));
  });
  
  it('should correctly handle makeAIRequestWithCompactContext', async () => {
    // Mock AI response
    mockGetAIResponse.mockResolvedValue({
      narrative: "Quick response in compact form.",
      location: { type: 'town', name: 'Tombstone' },
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: []
    });
    
    // Render the hook
    const { result } = renderHook(() => useAIWithOptimizedContext());
    
    // Execute the compact request
    await act(async () => {
      await result.current.makeAIRequestWithCompactContext(MOCK_PROMPT, MOCK_INVENTORY);
    });
    
    // Verify it used compact context options
    expect(mockUseOptimizedNarrativeContext().buildOptimizedContext)
      .toHaveBeenCalledWith(expect.objectContaining({
        compressionLevel: 'high',
        maxTokens: 1000,
        maxHistoryEntries: 5,
        maxDecisionHistory: 3
      }));
  });
  
  // Test the debug logging in development environment
  it('should log debug response in development environment', async () => {
    // Save original console.debug and mock it
    const originalConsoleDebug = console.debug;
    console.debug = jest.fn();
    
    // Set environment to development
    process.env.NODE_ENV = 'development';
    
    // Mock AI response
    const mockAIResponse = {
      narrative: "A very long narrative that should be truncated in logs.".repeat(10),
      location: { type: 'town', name: 'Tombstone' },
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: []
    };
    mockGetAIResponse.mockResolvedValue(mockAIResponse);
    
    // Render the hook
    const { result } = renderHook(() => useAIWithOptimizedContext());
    
    // Execute the request
    await act(async () => {
      await result.current.makeAIRequest(MOCK_PROMPT, MOCK_INVENTORY);
    });
    
    // Verify debug log was called with truncated narrative
    expect(console.debug).toHaveBeenCalled();
    expect(console.debug).toHaveBeenCalledWith(
      'AI Response (debug):',
      expect.objectContaining({
        narrative: expect.stringContaining('A very long narrative')
      })
    );
    
    // Verify the narrative was truncated
    const debugCall = (console.debug as jest.Mock).mock.calls[0][1];
    expect(debugCall.narrative.endsWith('...')).toBe(true);
    expect(debugCall.narrative.length).toBeLessThanOrEqual(103); // 100 chars + '...'
    
    // Restore console.debug
    console.debug = originalConsoleDebug;
  });
});
