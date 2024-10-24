import { renderHook, act } from '@testing-library/react';
import { useAIInteractions } from '../../hooks/useAIInteractions';
import { getAIResponse } from '../../services/ai';
import { generateNarrativeSummary } from '../../utils/aiService';
import { getJournalContext } from '../../utils/JournalManager';

// Mock dependencies
jest.mock('../../services/ai');
jest.mock('../../utils/aiService');
jest.mock('../../utils/JournalManager');

describe('useAIInteractions', () => {
  const mockDispatch = jest.fn();
  const mockOnInventoryChange = jest.fn();
  const mockInitialState = {
    currentPlayer: 'Test Player',
    npcs: [],
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
    savedTimestamp: undefined,
    isClient: true,
    quests: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getAIResponse as jest.Mock).mockResolvedValue({
      narrative: 'AI response',
      acquiredItems: [],
      removedItems: [],
      location: 'Test Town'
    });
    (generateNarrativeSummary as jest.Mock).mockResolvedValue('Test summary');
    (getJournalContext as jest.Mock).mockReturnValue('Test context');
    // Mock console methods to prevent noise in test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console methods
    jest.restoreAllMocks();
  });

  it('handles user input successfully', async () => {
    const { result } = renderHook(() => 
      useAIInteractions(mockInitialState, mockDispatch, mockOnInventoryChange)
    );

    await act(async () => {
      await result.current.handleUserInput('test input');
    });

    // Verify AI service was called
    expect(getAIResponse).toHaveBeenCalledWith(
      'test input',
      'Test context',
      []
    );

    // Verify state was updated with new narrative
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SET_STATE',
        payload: expect.objectContaining({
          narrative: expect.stringContaining('AI response')
        })
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
    const testError = new Error('Test error');
    (getAIResponse as jest.Mock).mockRejectedValue(testError);

    const { result } = renderHook(() => 
      useAIInteractions(mockInitialState, mockDispatch, mockOnInventoryChange)
    );

    await act(async () => {
      await result.current.handleUserInput('test input');
    });

    // Verify error state
    expect(result.current.error).toBe('Test error');
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith('Error in handleUserInput:', testError);

    // Verify narrative update with error message
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SET_NARRATIVE',
        payload: expect.stringContaining('An error occurred')
      })
    );
  });
});
