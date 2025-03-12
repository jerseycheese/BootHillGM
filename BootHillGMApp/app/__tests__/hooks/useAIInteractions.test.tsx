import { renderHook, act } from '@testing-library/react';
import { useAIInteractions } from '../../hooks/useAIInteractions';
import { GameState } from '../../types/campaign';
import { Character } from '../../types/character';

jest.mock('../../services/ai', () => {
  const mockGetResponse = jest.fn();
  const AIService = jest.fn().mockImplementation(() => ({
    getAIResponse: mockGetResponse
  }));
  return { AIService, mockGetResponse };
});

const { mockGetResponse } = jest.requireMock('../../services/ai');

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
      payload: { text: expect.stringContaining('AI response narrative') }
    });

    // Verify journal update
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_JOURNAL',
      payload: {
        timestamp: expect.any(Number), // Use expect.any(Number) for the timestamp
        type: 'narrative',
        content: userInput,
        narrativeSummary: 'Test summary',
      }
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
        wounds: [],
        isUnconscious: false,
        inventory: []
      };

      const mockResponse = {
        narrative: 'Combat starts',
        combatInitiated: true,
        opponent: mockOpponent,
        acquiredItems: [],
        removedItems: [],
        suggestedActions: []
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

      // Get all calls to mockDispatch
      const dispatchCalls = mockDispatch.mock.calls;

      // Find the SET_OPPONENT call
      const setOpponentCall = dispatchCalls.find(call => call[0].type === 'SET_OPPONENT');
      expect(setOpponentCall).toBeTruthy();
      expect(setOpponentCall[0]).toEqual({
        type: 'SET_OPPONENT',
        payload: expect.objectContaining({
          name: mockOpponent.name,
          attributes: mockOpponent.attributes,
          wounds: mockOpponent.wounds,
          isUnconscious: mockOpponent.isUnconscious,
          inventory: [],
          weapon: undefined
        })
      });

      // Find the UPDATE_COMBAT_STATE call
      const updateCombatStateCall = dispatchCalls.find(call => call[0].type === 'UPDATE_COMBAT_STATE');
      expect(updateCombatStateCall).toBeTruthy();
      expect(updateCombatStateCall[0]).toEqual({
        type: 'UPDATE_COMBAT_STATE',
        payload: expect.objectContaining({
          isActive: true,
          combatType: null,
          winner: null
        })
      });

      // Find the SET_COMBAT_ACTIVE call
      const setCombatActiveCall = dispatchCalls.find(call => call[0].type === 'SET_COMBAT_ACTIVE');
      expect(setCombatActiveCall).toBeTruthy();
      expect(setCombatActiveCall[0]).toEqual({
        type: 'SET_COMBAT_ACTIVE',
        payload: true
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
      mockGetResponse.mockRejectedValueOnce(new Error('AI service error'));

      const { result } = renderHook(() => useAIInteractions(
        mockInitialState,
        mockDispatch,
        mockOnInventoryChange
      ));

      await act(async () => {
        await result.current.handleUserInput('test input');
      });

      expect(result.current.error).toBe('AI service error');
      expect(mockOnInventoryChange).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
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
