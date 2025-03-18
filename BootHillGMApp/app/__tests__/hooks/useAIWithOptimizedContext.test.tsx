// /app/__tests__/hooks/useAIWithOptimizedContext.test.tsx
// Import React first
import * as React from 'react';
const { useState } = React;
import { getAIResponse } from '../../../app/services/ai/gameService';

// Mock React hooks
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useState: jest.fn((initialValue) => [initialValue, jest.fn()]),
    useCallback: jest.fn((fn) => fn),
  };
});

// Mock dependencies before importing the module being tested
jest.mock('../../../app/context/NarrativeContext', () => ({
  useNarrative: jest.fn(() => ({
    state: {
      narrativeHistory: ['Event 1', 'Event 2', 'Event 3'],
      narrativeContext: {
        characterFocus: ['Character 1'],
        themes: ['Theme 1', 'Theme 2']
      }
    }
  }))
}));

jest.mock('../../../app/utils/narrative/narrativeContextIntegration', () => ({
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

// Use import instead of require
jest.mock('../../../app/services/ai/gameService', () => ({
  getAIResponse: jest.fn().mockImplementation(async (prompt, context) => ({
    narrative: `Response to: ${prompt} with context length: ${context.length}`,
    location: { type: 'indoor', name: 'Test Location' },
    acquiredItems: [],
    removedItems: [],
    suggestedActions: [
      { text: 'Action 1', type: 'move', context: 'action context' }
    ]
  }))
}));

jest.mock('../../../app/utils/narrative/narrativeCompression', () => ({
  estimateTokenCount: jest.fn((text) => text.length / 4)
}));

// Now import the component being tested
import { useAIWithOptimizedContext } from '../../../app/utils/narrative/useAIWithOptimizedContext';
import { InventoryItem } from '../../../app/types/item.types';

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
      
    // Call the hook
    const hook = useAIWithOptimizedContext();
    
    // Check expected API
    expect(hook).toHaveProperty('isLoading');
    expect(hook).toHaveProperty('error');
    expect(hook).toHaveProperty('makeAIRequest');
    expect(hook).toHaveProperty('makeAIRequestWithFocus');
    expect(hook).toHaveProperty('makeAIRequestWithCompactContext');
    
    expect(typeof hook.makeAIRequest).toBe('function');
    expect(typeof hook.makeAIRequestWithFocus).toBe('function');
    expect(typeof hook.makeAIRequestWithCompactContext).toBe('function');
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
    
    // Call the hook
    const { makeAIRequest } = useAIWithOptimizedContext();
    
    // Call the makeAIRequest function with test data
    const inventory: InventoryItem[] = [
      { id: 'item1', name: 'Test Item', description: 'A test item' } as InventoryItem
    ];
    
    // Make the request
    const response = await makeAIRequest('Test prompt', inventory);
    
    // Verify the game service was called
    expect(getAIResponse).toHaveBeenCalled();
    
    // Verify we got a response
    expect(response).toBeDefined();
    
    // Verify loading state was updated
    expect(setIsLoadingMock).toHaveBeenCalledWith(true);
    expect(setIsLoadingMock).toHaveBeenCalledWith(false);
  });
});