/**
 * Test file for useAIWithOptimizedContext hook
 * 
 * This file tests the AI context optimization hook that provides
 * different context generation strategies for AI requests.
 */

// Import React first for mocking
import * as React from 'react';
const { useState } = React;
import { renderHook, act } from '@testing-library/react';
import { getAIResponse } from '../../services/ai/gameService';
import { TestWrapper } from '../../test/utils/testWrappers';

// Mock React hooks - must be before other imports that use React
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useState: jest.fn((initialValue) => [initialValue, jest.fn()]),
    useCallback: jest.fn((fn) => fn),
  };
});

// Mock dependencies
jest.mock('../../hooks/narrative/NarrativeProvider', () => ({
  NarrativeProvider: ({ children }: { children: React.ReactNode }) => children,
  useNarrative: jest.fn(() => ({
    state: {
      narrative: {
        narrativeHistory: ['Event 1', 'Event 2', 'Event 3'],
        narrativeContext: {
          characterFocus: ['Character 1'],
          themes: ['Theme 1', 'Theme 2']
        }
      }
    }
  }))
}));

jest.mock('../../utils/narrative/narrativeContextIntegration', () => ({
  useNarrativeContextSynchronization: jest.fn(() => ({
    ensureFreshContext: jest.fn().mockResolvedValue(true)
  })),
  useOptimizedNarrativeContext: jest.fn(() => ({
    buildOptimizedContext: jest.fn(() => 'Custom optimized context'),
    getDefaultContext: jest.fn(() => 'Default optimized context'),
    getFocusedContext: jest.fn(() => 'Focused context'),
    getCompactContext: jest.fn(() => 'Compact context')
  }))
}));

jest.mock('../../services/ai/gameService', () => ({
  getAIResponse: jest.fn().mockImplementation(async (prompt, context) => ({
    narrative: `Response to: ${prompt} with context length: ${context?.length || 0}`,
    location: { type: 'indoor', name: 'Test Location' },
    acquiredItems: [],
    removedItems: [],
    suggestedActions: [
      { text: 'Action 1', type: 'move', context: 'action context' }
    ]
  }))
}));

jest.mock('../../utils/narrative/narrativeCompression', () => ({
  estimateTokenCount: jest.fn((text) => (text?.length || 0) / 4)
}));

// Now import the component being tested
import { useAIWithOptimizedContext } from '../../utils/narrative/useAIWithOptimizedContext';
import { InventoryItem } from '../../types/item.types';

describe('useAIWithOptimizedContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset useState mock to return the expected values
    (useState as jest.Mock).mockImplementation((initialValue) => [initialValue, jest.fn()]);
  });

  // Just test the structure of the returned object
  it('should expose the expected API', () => {
    // Set up specific mock returns for this test
    const setIsLoadingMock = jest.fn();
    const setErrorMock = jest.fn();
    
    // Mock useState to return different values for each call
    (useState as jest.Mock)
      .mockImplementationOnce((initialValue) => [initialValue, setIsLoadingMock])  // For isLoading
      .mockImplementationOnce((initialValue) => [initialValue, setErrorMock]);     // For error
      
    // Call the hook with the TestWrapper
    const { result } = renderHook(() => useAIWithOptimizedContext(), { 
      wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>
    });
    
    // Check expected API
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('makeAIRequest');
    expect(result.current).toHaveProperty('makeAIRequestWithFocus');
    expect(result.current).toHaveProperty('makeAIRequestWithCompactContext');
    
    expect(typeof result.current.makeAIRequest).toBe('function');
    expect(typeof result.current.makeAIRequestWithFocus).toBe('function');
    expect(typeof result.current.makeAIRequestWithCompactContext).toBe('function');
  });
  
  it('should make AI requests and update state', async () => {
    // Set mock values for useState
    const setIsLoadingMock = jest.fn();
    const setErrorMock = jest.fn();
    
    // Mock useState for this test
    (useState as jest.Mock)
      .mockImplementationOnce(() => [false, setIsLoadingMock]) // For isLoading
      .mockImplementationOnce(() => [null, setErrorMock]);     // For error
    
    // Mock a successful response
    (getAIResponse as jest.Mock).mockResolvedValueOnce({
      narrative: "Test response",
      location: { type: 'indoor', name: 'Test Location' },
      acquiredItems: [],
      removedItems: [],
      suggestedActions: []
    });
    
    // Call the hook with renderHook using TestWrapper properly
    const { result } = renderHook(() => useAIWithOptimizedContext(), { 
      wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>
    });
    
    // Call the makeAIRequest function with test data
    const inventory: InventoryItem[] = [
      { id: 'item1', name: 'Test Item', description: 'A test item', category: 'general', quantity: 1 }
    ];
    
    // Make the request
    await act(async () => {
      await result.current.makeAIRequest('Test prompt', inventory);
    });
    
    // Verify the game service was called
    expect(getAIResponse).toHaveBeenCalled();
    
    // Verify loading state was updated
    expect(setIsLoadingMock).toHaveBeenCalledWith(true);
    expect(setIsLoadingMock).toHaveBeenCalledWith(false);
  });
  
  it('should handle errors during AI requests', async () => {
    // Set mock values for useState
    const setIsLoadingMock = jest.fn();
    const setErrorMock = jest.fn();
    
    // Mock useState for this test
    (useState as jest.Mock)
      .mockImplementationOnce(() => [false, setIsLoadingMock]) // For isLoading
      .mockImplementationOnce(() => [null, setErrorMock]);     // For error
    
    // Mock an error response
    const testError = new Error('AI service failed');
    (getAIResponse as jest.Mock).mockRejectedValueOnce(testError);
    
    // Call the hook with renderHook using TestWrapper properly
    const { result } = renderHook(() => useAIWithOptimizedContext(), { 
      wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>
    });
    
    // Make the request that will fail
    await act(async () => {
      try {
        await result.current.makeAIRequest('Test prompt', []);
      } catch {
        // Error should be caught inside the hook
      }
    });
    
    // Verify the service was called
    expect(getAIResponse).toHaveBeenCalled();
    
    // Verify error state was updated
    expect(setErrorMock).toHaveBeenCalledWith(testError);
    
    // Verify loading state was updated (set to true then back to false)
    expect(setIsLoadingMock).toHaveBeenCalledWith(true);
    expect(setIsLoadingMock).toHaveBeenCalledWith(false);
  });
});
