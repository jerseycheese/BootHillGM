/**
 * Tests for useAIWithOptimizedContext hook
 */
import React from 'react'; // Add React back for type usage
import { renderHook, act } from '@testing-library/react';

// Mock dependencies first without custom implementations
jest.mock('../../../hooks/narrative/NarrativeProvider');
jest.mock('../../../utils/narrative/narrativeContextIntegration');
jest.mock('../../../utils/narrative/narrativeCompression');
jest.mock('../../../services/ai/gameService');

// Import the mocked modules
import { useNarrative } from '../../../hooks/narrative/NarrativeProvider';
import { 
  useNarrativeContextSynchronization, 
  useOptimizedNarrativeContext 
} from '../../../utils/narrative/narrativeContextIntegration';
import { estimateTokenCount } from '../../../utils/narrative/narrativeCompression';
import { getAIResponse } from '../../../services/ai/gameService';
import { useAIWithOptimizedContext } from '../../../utils/narrative/useAIWithOptimizedContext';
import { InventoryItem } from '../../../types/item.types';
import { NarrativeContextOptions } from '../../../types/narrative/context.types';
import { AIRequestResult } from '../../../types/ai.types'; // Import correct type

// Set up mock implementations AFTER importing
const mockEnsureFreshContext = jest.fn().mockResolvedValue(true);
const mockGetDefaultContext = jest.fn().mockReturnValue('Default optimized context');
const mockBuildOptimizedContext = jest.fn().mockReturnValue('Custom optimized context');

// Mock the useNarrative hook
(useNarrative as jest.Mock).mockReturnValue({
  state: {
    narrative: {
      narrativeHistory: ['Event 1', 'Event 2'],
      narrativeContext: { themes: ['Theme 1'] }
    }
  }
});

// Mock the narrative context integration hooks
(useNarrativeContextSynchronization as jest.Mock).mockReturnValue({
  ensureFreshContext: mockEnsureFreshContext
});

(useOptimizedNarrativeContext as jest.Mock).mockReturnValue({
  buildOptimizedContext: mockBuildOptimizedContext,
  getDefaultContext: mockGetDefaultContext
});

// Mock the estimateTokenCount function
(estimateTokenCount as jest.Mock).mockReturnValue(100);

// Test constants
const MOCK_PROMPT = "What should I do next?";
const MOCK_INVENTORY = [
  { id: 'item-revolver', name: "Revolver", quantity: 1, description: "A reliable six-shooter", category: 'weapon' }
] as InventoryItem[];

// Mock response data
const MOCK_RESPONSE = {
  narrative: "You see the sheriff approaching.",
  opponent: undefined,
  location: { type: 'indoor' },
  acquiredItems: [],
  removedItems: [],
  storyProgression: undefined,
  combatInitiated: false
};

// Simple wrapper for the hook
const Wrapper = ({ children }: { children: React.ReactNode }) => children;

describe('useAIWithOptimizedContext', () => {
  beforeEach(() => {
    // Reset all mocks between tests
    jest.clearAllMocks();
    
    // Set up default mock response
    (getAIResponse as jest.Mock).mockResolvedValue(MOCK_RESPONSE);
  });
  
  it.skip('should make an AI request with default context', async () => {
    // Call the hook
    const { result } = renderHook(() => useAIWithOptimizedContext(), { wrapper: Wrapper });
    
    // Make the request
    await act(async () => {
      await result.current.makeAIRequest(MOCK_PROMPT, MOCK_INVENTORY);
    });
    
    // Verify our mocks were called
    expect(mockEnsureFreshContext).toHaveBeenCalled();
    expect(mockGetDefaultContext).toHaveBeenCalled();
    expect(getAIResponse).toHaveBeenCalledWith(
      MOCK_PROMPT,
      'Default optimized context', // Mock return value
      MOCK_INVENTORY,
      undefined,
      expect.anything() // Options object
    );
  });
  
  it('should use custom context options when provided', async () => {
    // Call the hook
    const { result } = renderHook(() => useAIWithOptimizedContext(), { wrapper: Wrapper });
    
    // Custom options for the test
    const customOptions: NarrativeContextOptions = {
      compressionLevel: 'high',
      maxTokens: 1000,
      prioritizeRecentEvents: true
    };
    
    // Make the request with custom options
    await act(async () => {
      await result.current.makeAIRequest(MOCK_PROMPT, MOCK_INVENTORY, customOptions);
    });
    
    // Verify our mock was called with the custom options
    expect(mockBuildOptimizedContext).toHaveBeenCalledWith(customOptions);
  });
  
  it('should correctly handle makeAIRequestWithFocus', async () => {
    // Call the hook
    const { result } = renderHook(() => useAIWithOptimizedContext(), { wrapper: Wrapper });
    
    // Make the focus request
    await act(async () => {
      await result.current.makeAIRequestWithFocus(MOCK_PROMPT, MOCK_INVENTORY, ['sheriff', 'bounty']);
    });
    
    // Verify our mock was called with the expected options
    expect(mockBuildOptimizedContext).toHaveBeenCalledWith(expect.objectContaining({
      compressionLevel: 'medium',
      maxTokens: 1500,
      prioritizeRecentEvents: true,
      relevanceThreshold: 6
    }));
  });
  
  it('should correctly handle makeAIRequestWithCompactContext', async () => {
    // Call the hook
    const { result } = renderHook(() => useAIWithOptimizedContext(), { wrapper: Wrapper });
    
    // Make the compact context request
    await act(async () => {
      await result.current.makeAIRequestWithCompactContext(MOCK_PROMPT, MOCK_INVENTORY);
    });
    
    // Verify our mock was called with the expected options
    expect(mockBuildOptimizedContext).toHaveBeenCalledWith(expect.objectContaining({
      compressionLevel: 'high',
      maxTokens: 1000,
      maxHistoryEntries: 5,
      maxDecisionHistory: 3
    }));
  });

  it('should include storyProgression with non-nullable description', async () => {
    // Create a response with null description in storyProgression
    const responseWithNullDesc = {
      ...MOCK_RESPONSE,
      storyProgression: {
        title: "Sheriff's Secret",
        description: null as unknown as string, // Intentionally null
        significance: 'major' 
      }
    };
    
    // Set up mock to return this response
    (getAIResponse as jest.Mock).mockResolvedValue(responseWithNullDesc);
    
    // Call the hook
    const { result } = renderHook(() => useAIWithOptimizedContext(), { wrapper: Wrapper });
    
    // Make the request
    let response: AIRequestResult | undefined; // Use correct type annotation
    await act(async () => {
      response = await result.current.makeAIRequest(MOCK_PROMPT, MOCK_INVENTORY);
    });
    
    // Verify the response has the description normalized to empty string
    expect(response).toBeDefined(); // Check if response is defined
    if (response) {
      expect(response.storyProgression).toEqual({
        title: "Sheriff's Secret",
        description: '', // Should be empty string instead of null
        significance: 'major'
      });
    }
  });
});
