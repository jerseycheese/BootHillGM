import { renderHook, act } from '@testing-library/react';
import { useAIInteractions } from '../../hooks/useAIInteractions';
import AIService from '../../services/AIService';
import { generateNarrativeSummary } from '../../utils/aiService';
import { getJournalContext } from '../../utils/JournalManager';

// Mock dependencies
jest.mock('../../services/AIService');
jest.mock('../../utils/aiService');
jest.mock('../../utils/JournalManager');

describe('useAIInteractions', () => {
  const mockDispatch = jest.fn();
  const mockOnInventoryChange = jest.fn();
  const mockInitialState = {
    character: {
      name: 'Test Character',
      health: 100,
      attributes: {
        speed: 5,
        gunAccuracy: 5,
        throwingAccuracy: 5,
        strength: 5,
        bravery: 5,
        experience: 0,
      },
      skills: {
        shooting: 5,
        riding: 5,
        brawling: 5,
      },
    },
    narrative: '',
    journal: [],
    inventory: [],
    location: '',
    gameProgress: 0,
    isCombatActive: false,
    opponent: null,
    savedTimestamp: null,
    isClient: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AIService.getAIResponse as jest.Mock).mockResolvedValue({
      narrative: 'AI response',
      acquiredItems: [],
      removedItems: [],
      location: 'Test Town'
    });
    (generateNarrativeSummary as jest.Mock).mockResolvedValue('Test summary');
    (getJournalContext as jest.Mock).mockReturnValue('Test context');
  });

  it('handles user input successfully', async () => {
    const { result } = renderHook(() => 
      useAIInteractions(mockInitialState, mockDispatch, mockOnInventoryChange)
    );

    await act(async () => {
      await result.current.handleUserInput('test input');
    });

    // Verify AI service was called
    expect(AIService.getAIResponse).toHaveBeenCalledWith(
      'test input',
      'Test context',
      []
    );

    // Verify narrative was updated
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SET_NARRATIVE',
        payload: expect.stringContaining('AI response')
      })
    );

    // Verify journal was updated
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UPDATE_JOURNAL',
        payload: expect.objectContaining({
          content: 'test input',
          narrativeSummary: 'Test summary'
        })
      })
    );
  });

  it('handles errors gracefully', async () => {
    (AIService.getAIResponse as jest.Mock).mockRejectedValue(new Error('Test error'));

    const { result } = renderHook(() => 
      useAIInteractions(mockInitialState, mockDispatch, mockOnInventoryChange)
    );

    await act(async () => {
      await result.current.handleUserInput('test input');
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SET_NARRATIVE',
        payload: expect.stringContaining('An error occurred')
      })
    );
  });
});
