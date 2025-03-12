import { renderHook, act } from '@testing-library/react';
import { useAIInteractions } from '../hooks/useAIInteractions';
import { AIService } from '../services/ai/aiService';
import { parsePlayerDecision } from '../services/ai/responseParser';
import { presentDecision } from '../reducers/narrativeReducer';
import { initialGameState } from '../types/campaign';

jest.mock('../services/ai/aiService');
jest.mock('../services/ai/responseParser');
jest.mock('../reducers/narrativeReducer');

describe('Player Decision Integration', () => {
  const mockState = {
    ...initialGameState
  };
  const mockDispatch = jest.fn();
  const mockOnInventoryChange = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should extract and present player decisions from AI responses', async () => {
    // Mock the raw AI response with playerDecision
    const mockRawResponse = {
      narrative: 'Test narrative',
      playerDecision: {
        prompt: 'What will you do?',
        options: [
          { text: 'Option 1', impact: 'Impact 1' },
          { text: 'Option 2', impact: 'Impact 2' }
        ],
        importance: 'significant'
      }
    };
    
    // Mock the parsed player decision
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
    
    // Setup mocks
    (AIService.prototype.getAIResponse as jest.Mock).mockResolvedValue({
      ...mockRawResponse,
      location: { type: 'town', name: 'Test Town' },
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [],
      playerDecision: mockParsedDecision
    });
    
    (parsePlayerDecision as jest.Mock).mockReturnValue(mockParsedDecision);
    (presentDecision as jest.Mock).mockReturnValue({ type: 'PRESENT_DECISION', payload: mockParsedDecision });
    
    // Test the flow
    const { result } = renderHook(() => 
      useAIInteractions(mockState, mockDispatch, mockOnInventoryChange)
    );
    
    await act(async () => {
      await result.current.handleUserInput('test input');
    });
    
    // Verify the entire flow
    expect(AIService.prototype.getAIResponse).toHaveBeenCalledWith('test input', expect.any(String), expect.any(Array));
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'PRESENT_DECISION', payload: mockParsedDecision });
  });
});