import { renderHook, act } from '@testing-library/react';
import { useAIInteractions } from '../../hooks/useAIInteractions';
import { GameState } from '../../types/campaign';
import { Character } from '../../types/character';

const mockGetResponse = jest.fn();

// Mock the AIService and narrative summary generation
jest.mock('../../services/ai', () => {
  return {
    AIService: jest.fn().mockImplementation(() => {
      return {
        getResponse: () => mockGetResponse()
      };
    })
  };
});

jest.mock('../../utils/aiService', () => ({
  generateNarrativeSummary: jest.fn().mockResolvedValue('Test summary')
}));

describe('useAIInteractions', () => {
  const mockDispatch = jest.fn();
  const mockOnInventoryChange = jest.fn();
  const mockInitialState: GameState = {
    currentPlayer: '',
    npcs: [],
    character: null,
    location: 'Test Location',
    gameProgress: 0,
    journal: [],
    narrative: '',
    inventory: [],
    quests: [],
    isCombatActive: false,
    opponent: null,
    isClient: false,
    suggestedActions: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleUserInput', () => {
    it('should process user input and update state with all response elements', async () => {
      const userInput = 'Hello AI';
      const mockResponse = {
        narrative: 'AI response narrative',
        location: 'New Location',
        acquiredItems: ['item1'],
        removedItems: [],
        suggestedActions: [
          { text: 'Action 1', type: 'basic' as const, context: 'Test context' }
        ]
      };

      mockGetResponse.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAIInteractions(
        mockInitialState,
        mockDispatch,
        mockOnInventoryChange
      ));

      await act(async () => {
        await result.current.handleUserInput(userInput);
      });

      // Verify AI service call
      expect(mockGetResponse).toHaveBeenCalled();

      // Verify narrative update
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_NARRATIVE',
        payload: expect.stringContaining('AI response narrative')
      });

      // Verify journal update
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_JOURNAL',
        payload: expect.objectContaining({
          type: 'narrative',
          content: userInput,
          narrativeSummary: 'Test summary'
        })
      });

      // Verify location update
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_LOCATION',
        payload: mockResponse.location
      });

      // Verify inventory changes
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'ADD_ITEM',
        payload: expect.objectContaining({
          name: 'item1',
          quantity: 1
        })
      });

      // Verify suggested actions update
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_SUGGESTED_ACTIONS',
        payload: mockResponse.suggestedActions
      });

      // Verify onInventoryChange callback
      expect(mockOnInventoryChange).toHaveBeenCalledWith(['item1'], []);
      
      // Verify no errors
      expect(result.current.error).toBeNull();
    });

    it('should handle combat initiation correctly', async () => {
      const mockOpponent: Character = {
        name: 'Test Opponent',
        attributes: {
          speed: 10,
          gunAccuracy: 8,
          throwingAccuracy: 7,
          strength: 10,
          baseStrength: 10,
          bravery: 8,
          experience: 5
        },
        skills: {
          shooting: 50,
          riding: 40,
          brawling: 45
        },
        wounds: [],
        isUnconscious: false
      };

      const mockResponse = {
        narrative: 'Combat starts',
        combatInitiated: true,
        opponent: mockOpponent,
        acquiredItems: [],
        removedItems: [],
        suggestedActions: [
          { text: 'Fight', type: 'combat' as const, context: 'Combat initiated' }
        ]
      };

      mockGetResponse.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAIInteractions(
        mockInitialState,
        mockDispatch,
        mockOnInventoryChange
      ));

      await act(async () => {
        await result.current.handleUserInput('attack');
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_CHARACTER',
        payload: mockOpponent
      });
    });
  });

  describe('retryLastAction', () => {
    it('should retry the last action successfully', async () => {
      const mockResponse = {
        narrative: 'Retry response',
        acquiredItems: [],
        removedItems: [],
        suggestedActions: [
          { text: 'Retry Action', type: 'basic' as const, context: 'Retry context' }
        ]
      };

      mockGetResponse.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAIInteractions(
        mockInitialState,
        mockDispatch,
        mockOnInventoryChange
      ));

      // First, set up a last action
      await act(async () => {
        await result.current.handleUserInput('initial action');
      });

      // Then test retry
      await act(async () => {
        await result.current.retryLastAction();
      });

      expect(mockGetResponse).toHaveBeenCalledTimes(2);
      expect(result.current.error).toBeNull();
    });

    it('should not retry if there is no last action', async () => {
      const { result } = renderHook(() => useAIInteractions(
        mockInitialState,
        mockDispatch,
        mockOnInventoryChange
      ));

      await act(async () => {
        await result.current.retryLastAction();
      });

      expect(mockGetResponse).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle AI service errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const error = new Error('AI service error');
      mockGetResponse.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAIInteractions(
        mockInitialState,
        mockDispatch,
        mockOnInventoryChange
      ));

      await act(async () => {
        const response = await result.current.handleUserInput('test input');
        expect(response).toBeNull();
      });

      expect(result.current.error).toBe('AI service error');
      expect(mockOnInventoryChange).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle undefined response values', async () => {
      const mockResponse = {
        narrative: 'Test narrative',
        acquiredItems: [],
        removedItems: [],
        suggestedActions: [] // Empty but present array of suggested actions
      };

      mockGetResponse.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAIInteractions(
        mockInitialState,
        mockDispatch,
        mockOnInventoryChange
      ));

      await act(async () => {
        await result.current.handleUserInput('test input');
      });

      // Verify that undefined optional values don't cause issues
      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SET_LOCATION'
        })
      );
    });
  });
});
