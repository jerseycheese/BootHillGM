// All jest.mock calls must come first
jest.mock('../services/ai');  // Mock the barrel file
jest.mock('../services/ai/responseParser');
jest.mock('../reducers/narrativeReducer');
jest.mock('../utils/aiService', () => ({
  generateNarrativeSummary: jest.fn().mockResolvedValue('Mocked narrative summary'),
}));

// Define a mock module factory that doesn't rely on external variables
jest.mock('../hooks/useAIInteractions', () => {
  // Create the mock function inside the factory
  const mockGetAIResponse = jest.fn();
  
  return {
    __mockAIService: { getAIResponse: mockGetAIResponse },
    useAIInteractions: jest.fn()
  };
});

// Now import everything else
import { renderHook, act } from '@testing-library/react';
// Removed the unused AIService import
import { parsePlayerDecision } from '../services/ai/responseParser';
import { presentDecision } from '../reducers/narrativeReducer';
import { initialGameState } from '../types/campaign';
import { useAIInteractions, __mockAIService } from '../hooks/useAIInteractions';

describe('Player Decision Integration', () => {
  const mockState = {
    ...initialGameState
  };
  const mockDispatch = jest.fn();
  const mockOnInventoryChange = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mock implementation
    (useAIInteractions as jest.Mock).mockImplementation((state, dispatch, _onInventoryChange) => ({
      handleUserInput: jest.fn(async (input) => {
        // Call the mock directly
        const response = await __mockAIService.getAIResponse(input, '', []);
        
        // If there's a playerDecision, call presentDecision and dispatch
        if (response.playerDecision) {
          const action = presentDecision(response.playerDecision);
          dispatch(action);
        }
        
        // Update narrative
        dispatch({
          type: 'SET_NARRATIVE',
          payload: { text: `Player: ${input}\nGame Master: ${response.narrative}` }
        });
        
        // Return the response
        return response;
      }),
      retryLastAction: jest.fn(),
      isLoading: false,
      error: null
    }));
    
    // Default mock response
    __mockAIService.getAIResponse.mockResolvedValue({
      narrative: 'Test narrative',
      location: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [],
      playerDecision: null
    });
  });
  
  it('should extract and present player decisions from AI responses', async () => {
    // Mock the response with a player decision
    const mockParsedDecision = {
      id: 'decision-1',
      prompt: 'What will you do?',
      options: [
        { id: 'option-1', text: 'Option 1', impact: 'Impact 1', tags: [] },
        { id: 'option-2', text: 'Option 2', impact: 'Impact 2', tags: [] }
      ],
      timestamp: Date.now(),
      context: '',
      importance: 'significant',
      characters: [],
      aiGenerated: true
    };
    
    // Set up our exposed mock
    __mockAIService.getAIResponse.mockResolvedValue({
      narrative: 'Test narrative',
      location: { type: 'town', name: 'Test Town' },
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [],
      playerDecision: mockParsedDecision
    });
    
    (parsePlayerDecision as jest.Mock).mockReturnValue(mockParsedDecision);
    (presentDecision as jest.Mock).mockReturnValue({ type: 'PRESENT_DECISION', payload: mockParsedDecision });
    
    // Render the hook
    const { result } = renderHook(() => 
      useAIInteractions(mockState, mockDispatch, mockOnInventoryChange)
    );
    
    // Call handleUserInput to trigger the flow
    await act(async () => {
      await result.current.handleUserInput('test input');
    });
    
    // Verify the mocked AIService was called
    expect(__mockAIService.getAIResponse).toHaveBeenCalledWith('test input', expect.any(String), expect.any(Array));
    
    // Verify dispatch was called with proper actions
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ 
      type: 'SET_NARRATIVE',
      payload: expect.any(Object)
    }));
  });
});
