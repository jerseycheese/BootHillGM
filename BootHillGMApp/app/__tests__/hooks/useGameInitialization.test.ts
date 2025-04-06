import { renderHook, waitFor } from '@testing-library/react';
import { useGameInitialization } from '../../hooks/useGameInitialization';
import { useGameState } from '../../context/GameStateProvider';
import * as gameService from '../../services/ai/gameService'; // Import gameService to mock
import * as narrativeSummary from '../../utils/ai/narrativeSummary'; // Import summary generator to mock
import * as gameStorage from '../../utils/gameStorage'; // Import gameStorage to mock defaults

// Mock the context provider
jest.mock('../../context/GameStateProvider', () => ({
  useGameState: jest.fn(),
}));

// Mock the AI services
jest.mock('../../services/ai/gameService');
jest.mock('../../utils/ai/narrativeSummary');

// Mock GameStorage utilities
jest.mock('../../utils/gameStorage', () => ({
  GameStorage: {
    keys: {
      GAME_STATE: 'saved-game-state', // Ensure keys are defined
    },
    initializeNewGame: jest.fn(() => ({ /* return minimal initial state */ })),
    getDefaultCharacter: jest.fn(() => ({ id: 'char1', name: 'Test Character' })),
    getDefaultInventoryItems: jest.fn(() => [{ id: 'item1', name: 'Revolver' }]),
  },
}));

describe('useGameInitialization Hook', () => {
  let mockDispatch: jest.Mock;
  let mockGetAIResponse: jest.SpyInstance;
  let mockGenerateNarrativeSummary: jest.SpyInstance;

  beforeEach(() => {
    // Reset mocks before each test
    mockDispatch = jest.fn();
    (useGameState as jest.Mock).mockReturnValue({ state: {}, dispatch: mockDispatch });

    // Clear localStorage
    localStorage.clear();
    jest.clearAllMocks(); // Clear mock call history

    // Setup spies on the mocked modules
    mockGetAIResponse = jest.spyOn(gameService, 'getAIResponse').mockResolvedValue({
      narrative: 'AI Generated Narrative',
      suggestedActions: [{ id: 'ai-action-1', title: 'AI Action 1', description: '', type: 'optional' }],
      location: { type: 'town', name: 'Test Town' }, // Add required fields
      acquiredItems: [],
      removedItems: [],
    });
    mockGenerateNarrativeSummary = jest.spyOn(narrativeSummary, 'generateNarrativeSummary').mockResolvedValue('AI Generated Summary');
  });

  it('should call AI services and dispatch results when initializing a new game', async () => {
    // Render the hook
    renderHook(() => useGameInitialization());

    // Wait for async operations within the hook to complete
    await waitFor(() => {
      // Check if AI services were called
      expect(mockGetAIResponse).toHaveBeenCalledTimes(1);
      expect(mockGenerateNarrativeSummary).toHaveBeenCalledTimes(1);
      expect(mockGenerateNarrativeSummary).toHaveBeenCalledWith(expect.any(String), 'AI Generated Narrative'); // Verify summary input

      // Check if dispatch was called with the correct actions
      // 1. SET_STATE for initial game
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'SET_STATE' }));
      // 2. SET_CHARACTER
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'character/SET_CHARACTER' }));
      // 3. SET_INVENTORY (or ADD_ITEM loop) - check based on hook implementation
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'inventory/SET_INVENTORY' }));
      // Potentially ADD_ITEM calls as well
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'inventory/ADD_ITEM' }));

      // 4. journal/ADD_ENTRY with AI content and summary
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: 'journal/ADD_ENTRY',
        payload: expect.objectContaining({
          content: 'AI Generated Narrative',
          narrativeSummary: 'AI Generated Summary',
        }),
      }));

      // 5. SET_SUGGESTED_ACTIONS with AI actions
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: 'SET_SUGGESTED_ACTIONS',
        payload: [{ id: 'ai-action-1', title: 'AI Action 1', description: '', type: 'optional' }],
      }));
       // 6. Final SET_CHARACTER call
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'character/SET_CHARACTER' }));
    });

     // Verify the total number of dispatch calls matches expectations
     // Adjust count based on exact dispatch calls in the hook (SET_STATE, SET_CHARACTER x2, SET_INVENTORY, ADD_ITEM xN, ADD_ENTRY, SET_SUGGESTED_ACTIONS)
     // Example: If 1 item in default inventory -> 1 SET_INVENTORY + 1 ADD_ITEM = 2 inventory calls
     // Total = 1(SET_STATE) + 2(SET_CHAR) + 2(INV) + 1(JOURNAL) + 1(ACTIONS) = 7
     expect(mockDispatch).toHaveBeenCalledTimes(7); // Adjust this count precisely
  });

  it('should load from localStorage and NOT call AI services if saved state exists', async () => {
    // Setup localStorage with saved data
    const savedState = { game: 'saved data', journal: { entries: [{ id: 'saved', content: 'Saved Content' }] } };
    localStorage.setItem(gameStorage.GameStorage.keys.GAME_STATE, JSON.stringify(savedState));

    // Render the hook
    renderHook(() => useGameInitialization());

    // Wait for potential async operations
    await waitFor(() => {
       // Check dispatch for loading saved state
       expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_STATE', payload: savedState });
    });

    // Crucially, verify AI services were NOT called
    expect(mockGetAIResponse).not.toHaveBeenCalled();
    expect(mockGenerateNarrativeSummary).not.toHaveBeenCalled();
  });
});