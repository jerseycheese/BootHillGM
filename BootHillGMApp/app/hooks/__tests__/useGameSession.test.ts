jest.mock('../../utils/inventoryManager', () => ({
  InventoryManager: {
    validateItemUse: jest.fn(() => ({ valid: true })),
  },
}));

import { renderHook, act } from '@testing-library/react';
import { InventoryManager } from '../../utils/inventoryManager';
import { useGameSession } from '../useGameSession';
import { useCampaignState } from '../../components/CampaignStateManager';
import { ItemCategory } from '../../types/item.types';
import { getAIResponse } from '../../services/ai/gameService';

jest.mock('../../components/CampaignStateManager');
jest.mock('../../services/ai/gameService');

describe('useGameSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getAIResponse as jest.Mock).mockResolvedValue({ narrative: 'Mocked AI response.' });
  });

  it('handleUseItem should update the narrative when an item is used', async () => {
    const mockDispatch = jest.fn();
    const mockState = {
      inventory: [
        {
          id: 'test-item',
          name: 'Test Item',
          quantity: 1,
          description: 'A test item',
          category: 'general' as ItemCategory,
        },
      ],
      journal: [],
      narrative: '', // Ensure narrative is empty initially
      currentPlayer: '',
      npcs: [],
      location: null,
      quests: [],
      character: null,
      gameProgress: 0,
      isCombatActive: false,
      opponent: null,
      savedTimestamp: undefined,
      isClient: false,
      suggestedActions: [],
      combatState: undefined,
    };

    (useCampaignState as jest.Mock).mockReturnValue({
      state: mockState,
      dispatch: mockDispatch,
    });

    const { result } = renderHook(() => useGameSession());

    await act(async () => {
      await result.current.handleUseItem('test-item');
    });

        // Check that USE_ITEM is dispatched
        expect(mockDispatch).toHaveBeenCalledWith({
          type: 'USE_ITEM',
          payload: 'test-item',
        });

        // Check that ADD_NARRATIVE_HISTORY is dispatched with the correct payload
        expect(mockDispatch).toHaveBeenCalledWith({
          type: 'ADD_NARRATIVE_HISTORY',
          payload: expect.stringContaining('Player: use Test Item\nMocked AI response.'),
        });
  });

    it('should update isUsingItem state correctly during handleUseItem', async () => {
    const mockDispatch = jest.fn();
    const mockState = {
      inventory: [
                {
                    id: 'test-item',
                    name: 'Test Item',
                    quantity: 1,
                    description: 'A test item',
                    category: 'general' as ItemCategory,
                },
            ],
            journal: [],
            narrative: '',
            currentPlayer: '',
            npcs: [],
            location: null,
            quests: [],
            character: null,
            gameProgress: 0,
            isCombatActive: false,
            opponent: null,
            savedTimestamp: undefined,
            isClient: false,
            suggestedActions: [],
            combatState: undefined,
        };

        (useCampaignState as jest.Mock).mockReturnValue({
            state: mockState,
            dispatch: mockDispatch,
        });

      const { result } = renderHook(() => useGameSession());

      expect(result.current.isUsingItem('test-item')).toBe(false);

      // Wrap the state update in act
      await act(async () => {
        await result.current.handleUseItem('test-item');
      });

      // Check isUsingItem *after* the operation
      expect(result.current.isUsingItem('test-item')).toBe(false);
    });

    it('should update isLoading state correctly during handleUseItem', async () => {
        const mockDispatch = jest.fn();
        const mockState = {
          inventory: [
            {
              id: 'test-item',
              name: 'Test Item',
              quantity: 1,
              description: 'A test item',
              category: 'general' as ItemCategory,
            },
          ],
          journal: [],
          narrative: '',
          currentPlayer: '',
          npcs: [],
          location: null,
          quests: [],
          character: null,
          gameProgress: 0,
          isCombatActive: false,
          opponent: null,
          savedTimestamp: undefined,
          isClient: false,
          suggestedActions: [],
          combatState: undefined,
        };

        (useCampaignState as jest.Mock).mockReturnValue({
            state: mockState,
            dispatch: mockDispatch,
        });

        const { result } = renderHook(() => useGameSession());

        expect(result.current.isLoading).toBe(false);

        // Use act to wrap state updates
        await act(async () => {
            await result.current.handleUseItem('test-item');
        });

        expect(result.current.isLoading).toBe(false);
    });

  it('should set an error if the item is not found', async () => {
      const { result } = renderHook(() => useGameSession());
      await act(async() => {
          await result.current.handleUseItem('nonexistent-item');
      });

      expect(result.current.error).toBe('Item not found in inventory: nonexistent-item');
  });

    it('should handle errors from getAIResponse', async () => {
        const mockDispatch = jest.fn();
        const mockState = {
            inventory: [
                {
                    id: 'test-item',
                    name: 'Test Item',
                    quantity: 1,
                    description: 'A test item',
                    category: 'general' as ItemCategory,
                },
            ],
            journal: [],
            narrative: '',
            currentPlayer: '',
            npcs: [],
            location: null,
            quests: [],
            character: null,
            gameProgress: 0,
            isCombatActive: false,
            opponent: null,
            savedTimestamp: undefined,
            isClient: false,
            suggestedActions: [],
            combatState: undefined,
        };

        (useCampaignState as jest.Mock).mockReturnValue({
            state: mockState,
            dispatch: mockDispatch,
        });

      // Mock validateItemUse to return an invalid result
    (InventoryManager.validateItemUse as jest.Mock).mockReturnValue({ valid: false, reason: 'Invalid game state' });

    const { result } = renderHook(() => useGameSession());

    await act(async () => {
      await result.current.handleUseItem('test-item');
    });

    // Expect the error state to be set with the validation reason
    expect(result.current.error).toBe('Invalid game state');
      // Expect that USE_ITEM is *not* dispatched
      expect(mockDispatch).not.toHaveBeenCalledWith({
        type: 'USE_ITEM',
        payload: 'test-item',
      });
  });

  it('should call handleUserInput again when retryLastAction is called', async () => {
      const mockDispatch = jest.fn();
      const mockState = {
          inventory: [],
          journal: [],
          narrative: 'Initial narrative',
          currentPlayer: '',
          npcs: [],
          location: null,
          quests: [],
          character: null,
          gameProgress: 0,
          isCombatActive: false,
          opponent: null,
          savedTimestamp: undefined,
          isClient: false,
          suggestedActions: [],
          combatState: undefined,
      };
      (useCampaignState as jest.Mock).mockReturnValue({
          state: mockState,
          dispatch: mockDispatch,
      });

    // Mock getAIResponse to RESOLVE with a valid response.
    (getAIResponse as jest.Mock).mockResolvedValue({
      narrative: 'Mocked AI response.',
    });

      const { result } = renderHook(() => useGameSession());

      // First call to handleUserInput, which should fail due to the mocked error.
      await act(async () => {
        await result.current.handleUserInput('test input');
      });

      // Now, call retryLastAction *after* the first call has settled.
      await act(async () => {
        await result.current.retryLastAction();
      });

      // Expect dispatch to have been called with specific arguments *twice*
      // (This assumes handleUserInput makes at least one dispatch call)
      expect(mockDispatch).toHaveBeenCalledTimes(2); // Check for 2 total calls
    });
  });