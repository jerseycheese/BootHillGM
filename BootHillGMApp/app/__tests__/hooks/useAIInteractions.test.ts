import { renderHook, act } from '@testing-library/react';
import { useAIInteractions } from '../../hooks/useAIInteractions';
import { AIService } from '../../services/ai/aiService';
import { presentDecision } from '../../reducers/narrativeReducer';

jest.mock('../../services/ai/aiService');
jest.mock('../../reducers/narrativeReducer');

import { initialGameState } from '../../types/campaign';

describe('useAIInteractions', () => {
  const mockState = {
    ...initialGameState
  };
  const mockDispatch = jest.fn();
  const mockOnInventoryChange = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
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
    
    const mockAIResponse = {
      narrative: 'Test narrative',
      location: { type: 'town', name: 'Test Town' },
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [],
      playerDecision: mockPlayerDecision
    };
    
    (AIService.prototype.getAIResponse as jest.Mock).mockResolvedValue(mockAIResponse);
    (presentDecision as jest.Mock).mockReturnValue({ type: 'PRESENT_DECISION', payload: mockPlayerDecision });
    
    const { result } = renderHook(() => 
      useAIInteractions(mockState, mockDispatch, mockOnInventoryChange)
    );
    
    await act(async () => {
      await result.current.handleUserInput('test input');
    });
    
    expect(presentDecision).toHaveBeenCalledWith(mockPlayerDecision);
    expect(mockDispatch).toHaveBeenCalledWith({ 
      type: 'PRESENT_DECISION', 
      payload: mockPlayerDecision 
    });
  });
  
  it('should not dispatch presentDecision when AI response does not include playerDecision', async () => {
    const mockAIResponse = {
      narrative: 'Test narrative',
      location: { type: 'town', name: 'Test Town' },
      acquiredItems: [],
      removedItems: [],
      suggestedActions: []
    };
    
    (AIService.prototype.getAIResponse as jest.Mock).mockResolvedValue(mockAIResponse);
    
    const { result } = renderHook(() => 
      useAIInteractions(mockState, mockDispatch, mockOnInventoryChange)
    );
    
    await act(async () => {
      await result.current.handleUserInput('test input');
    });
    
    expect(presentDecision).not.toHaveBeenCalled();
  });
});