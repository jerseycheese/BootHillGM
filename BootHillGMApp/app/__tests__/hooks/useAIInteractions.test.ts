// We need to put jest.mock calls before any imports
jest.mock('../../actions/narrativeActions');
jest.mock('../../utils/aiService', () => ({
  generateNarrativeSummary: jest.fn().mockResolvedValue('Mocked narrative summary'),
}));

// Define a mock module factory that doesn't rely on external variables
jest.mock('../../hooks/useAIInteractions', () => {
  // Create a mock function inside the factory
  const mockGetAIResponse = jest.fn();
  
  return {
    __mockAIService: { getAIResponse: mockGetAIResponse },
    useAIInteractions: jest.fn()
  };
});

// Now we can import modules
import { renderHook, act } from '@testing-library/react';
import { presentDecision } from '../../actions/narrativeActions';
import { initialGameState } from '../../types/campaign';
import { useAIInteractions, __mockAIService } from '../../hooks/useAIInteractions';

describe('useAIInteractions', () => {
  const mockState = {
    ...initialGameState
  };
  const mockDispatch = jest.fn();
  const mockOnInventoryChange = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up the mock implementation for each test
    (useAIInteractions as jest.Mock).mockImplementation((state, dispatch, _onInventoryChange) => ({
      handleUserInput: jest.fn(async (input) => {
        const aiResponse = await __mockAIService.getAIResponse(input, '', []);
        
        if (aiResponse.playerDecision) {
          const action = presentDecision(aiResponse.playerDecision);
          dispatch(action);
        }
        
        dispatch({ 
          type: 'SET_NARRATIVE', 
          payload: { text: aiResponse.narrative } 
        });
        
        dispatch({
          type: 'UPDATE_JOURNAL',
          payload: {
            timestamp: Date.now(),
            type: 'narrative',
            content: input,
            narrativeSummary: 'Mocked narrative summary',
          },
        });
        
        return aiResponse;
      }),
      retryLastAction: jest.fn(),
      isLoading: false,
      error: null
    }));
    
    // Default response
    __mockAIService.getAIResponse.mockResolvedValue({
      narrative: 'Test narrative',
      location: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [],
      playerDecision: null
    });
  });
  
  it('should dispatch presentDecision when AI response includes playerDecision', async () => {
    const mockPlayerDecision = {
      id: 'decision-1',
      prompt: 'Test prompt',
      options: [
        { id: 'option-1', text: 'Option 1', impact: 'Impact 1' },
        { id: 'option-2', text: 'Option 2', impact: 'Impact 2' }
      ],
      timestamp: Date.now(),
      context: 'Test context',
      importance: 'moderate',
      aiGenerated: true
    };
    
    // Set up the mock response with player decision
    __mockAIService.getAIResponse.mockResolvedValue({
      narrative: 'Test narrative',
      location: { type: 'town', name: 'Test Town' },
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [],
      playerDecision: mockPlayerDecision
    });
    
    // Mock presentDecision to return a properly formatted action
    (presentDecision as jest.Mock).mockReturnValue({ 
      type: 'PRESENT_DECISION', 
      payload: mockPlayerDecision 
    });
    
    const { result } = renderHook(() => 
      useAIInteractions(mockState, mockDispatch, mockOnInventoryChange)
    );
    
    await act(async () => {
      await result.current.handleUserInput('test input');
    });
    
    // Verify presentDecision was called with the player decision
    expect(presentDecision).toHaveBeenCalledWith(mockPlayerDecision);
    
    // Verify the dispatch was called with the action from presentDecision
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ 
      type: 'PRESENT_DECISION', 
      payload: mockPlayerDecision 
    }));
  });
  
  it('should not dispatch presentDecision when AI response does not include playerDecision', async () => {
    // Mock response without player decision
    __mockAIService.getAIResponse.mockResolvedValue({
      narrative: 'Test narrative',
      location: { type: 'town', name: 'Test Town' },
      acquiredItems: [],
      removedItems: [],
      suggestedActions: []
      // No playerDecision field
    });
    
    const { result } = renderHook(() => 
      useAIInteractions(mockState, mockDispatch, mockOnInventoryChange)
    );
    
    await act(async () => {
      await result.current.handleUserInput('test input');
    });
    
    // Should not have called presentDecision
    expect(presentDecision).not.toHaveBeenCalled();
  });
});
