import { render, screen } from '@testing-library/react';
import { Inventory } from '../../components/Inventory';
import { InventoryItem } from '../../types/item.types';
import { useGameSession } from '../../hooks/useGameSession';
import { GameProvider } from '../../hooks/useGame';
import { CampaignStateContext } from '../../components/CampaignStateManager';
import {
  createMockCampaignState,
  createMockInventoryItem,
} from '../../test/utils/inventoryTestUtils';
import { prepareStateForTesting } from '../../test/utils/stateTestUtils';

jest.mock('../../hooks/useGameSession'); // Mock useGameSession

jest.mock('../../utils/inventoryManager', () => ({
  InventoryManager: {
    validateItemUse: jest.fn(() => ({ valid: true })),
  },
}));

// Create adapted mock state with proper compatibility layer
const createAdaptedMockState = (partialState = {}) => {
  // Get the original mock state
  const originalState = createMockCampaignState(partialState);
  
  // Apply adapters to make it compatible with the new architecture
  return prepareStateForTesting(originalState);
};

// Configure the mock GameSession hook with proper state
const mockUseGameSession = (overrides = {}) => {
  const adaptedState = createAdaptedMockState();
  
  return {
    state: adaptedState,
    dispatch: jest.fn(),
    isLoading: false,
    error: null,
    setError: jest.fn(),
    retryLastAction: jest.fn(),
    handleUseItem: jest.fn(),
    isUsingItem: jest.fn().mockReturnValue(false),
    ...overrides
  };
};

describe('Inventory', () => {
  const mockSaveGame = jest.fn();
  const mockLoadGame = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useGameSession as jest.Mock).mockReturnValue(mockUseGameSession());
  });

  const ERROR_MESSAGES = {
    noCharacter: 'No character available',
    unableToUse: 'Unable to use item',
    cannotUse: 'Cannot use item',
  };

  // Render component with GameProvider wrapper
  const renderWithContext = (
    ui: React.ReactElement,
    partialState = {}
  ) => {
    // Create state with adapters applied
    const adaptedState = createAdaptedMockState(partialState);
    
    // Create context with both new state shape and legacy properties
    const contextValue = {
      state: adaptedState,
      dispatch: jest.fn(),
      saveGame: mockSaveGame,
      loadGame: mockLoadGame,
      cleanupState: jest.fn(),
      // Legacy properties from our adapters
      player: adaptedState.player,
      opponent: adaptedState.opponent,
      inventory: adaptedState.inventory,
      entries: adaptedState.entries,
      isCombatActive: adaptedState.isCombatActive,
      narrativeContext: adaptedState.narrativeContext,
    };
    
    // Render with both providers
    return render(
      <GameProvider initialState={adaptedState}>
        <CampaignStateContext.Provider value={contextValue}>
          {ui}
        </CampaignStateContext.Provider>
      </GameProvider>
    );
  };

  test('does not render items with missing properties', () => {
    const mockItems = [
      createMockInventoryItem({
        id: '1',
        name: 'Health Potion',
        quantity: 2,
      }),
      createMockInventoryItem({
        id: '2',
        quantity: 1,
        description: 'Invalid item',
        name: undefined,
      }), // Missing name
      createMockInventoryItem({
        id: undefined,
        name: 'Sword',
        quantity: 1,
        description: 'Invalid item',
      }), // Missing id
      createMockInventoryItem({
        id: '4',
        name: 'Shield',
        description: 'Invalid item',
        quantity: undefined,
      }), // Missing quantity
    ] as InventoryItem[];
    
    // Update the useGameSession mock with adapted state
    const adaptedState = createAdaptedMockState({
      inventory: { items: mockItems }
    });
    
    (useGameSession as jest.Mock).mockReturnValue({
      ...mockUseGameSession(),
      state: adaptedState
    });

    renderWithContext(<Inventory />, { inventory: { items: mockItems } });

    expect(screen.getByText(/Health Potion/)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText(/Invalid item/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sword/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Shield/)).not.toBeInTheDocument();
  });

  test('handles missing character gracefully', () => {
    // Create state without a character
    const adaptedState = createAdaptedMockState({
      character: null,
    });

    const mockSessionWithoutCharacter = {
      ...mockUseGameSession(),
      state: adaptedState,
      error: ERROR_MESSAGES.noCharacter,
      isUsingItem: jest.fn().mockReturnValue(false),
    };
    
    (useGameSession as jest.Mock).mockReturnValue(mockSessionWithoutCharacter);

    renderWithContext(<Inventory />, { character: null });

    expect(screen.getByTestId('error-display')).toHaveTextContent(ERROR_MESSAGES.noCharacter);
  });
});
