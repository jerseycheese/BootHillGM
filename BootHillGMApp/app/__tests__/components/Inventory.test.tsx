import { screen } from '@testing-library/react'; // Keep screen import
import { Inventory } from '../../components/Inventory';
import { InventoryItem } from '../../types/item.types';
import { useGameSession } from '../../hooks/useGameSession';
// Removed unused imports
// import { GameProvider } from '../../hooks/useGame';
// import { CampaignStateContext } from '../../components/CampaignStateManager';
import {
  createMockGameState, // Use the new utility
  createMockInventoryItem,
} from '../../test/utils/inventoryTestUtils';
import { renderWithMockContext } from '../../test/utils/testWrappers'; // Import the new mock context renderer

jest.mock('../../hooks/useGameSession'); // Mock useGameSession

jest.mock('../../utils/inventoryManager', () => ({
  InventoryManager: {
    validateItemUse: jest.fn(() => ({ valid: true })),
  },
}));

// Removed createAdaptedMockState helper

// Configure the mock GameSession hook with the new GameState structure
const mockUseGameSession = (stateOverrides = {}, hookOverrides = {}) => {
  // Use the new mock state utility
  // Removed unused mockState definition from helper
  
  return {
    state: createMockGameState(stateOverrides), // Create state directly here if needed by hook consumers, though provider is primary source
    dispatch: jest.fn(),
    isLoading: false,
    error: null,
    setError: jest.fn(),
    retryLastAction: jest.fn(),
    handleUseItem: jest.fn(),
    isUsingItem: jest.fn().mockReturnValue(false),
    ...hookOverrides
  };
};

describe('Inventory', () => {
  // Removed unused mockSaveGame and mockLoadGame

  beforeEach(() => {
    jest.clearAllMocks();
    (useGameSession as jest.Mock).mockReturnValue(mockUseGameSession());
  });

  const ERROR_MESSAGES = {
    noCharacter: 'No character available',
    unableToUse: 'Unable to use item',
    cannotUse: 'Cannot use item',
  };

  // Removed renderWithContext helper, will render directly

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
    
    // Set up the mock for useGameSession with the specific inventory state
    // Create the specific state needed for this test
    const mockStateWithItems = createMockGameState({ inventory: { items: mockItems } });
    // Mock useGameSession, state comes from provider below
    (useGameSession as jest.Mock).mockReturnValue(mockUseGameSession());

    // Render with the mock context provider
    renderWithMockContext(
      <Inventory />,
      mockStateWithItems // Pass the mock state to the wrapper
    );

    expect(screen.getByText(/Health Potion/)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText(/Invalid item/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sword/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Shield/)).not.toBeInTheDocument();
  });

  test('handles missing character gracefully', () => {
    // Set up the mock for useGameSession with null character and error
    // Create the specific state needed for this test
    const stateWithError = createMockGameState({ character: { player: null, opponent: null } });
    // Mock useGameSession to return the error, but state comes from provider
    (useGameSession as jest.Mock).mockReturnValue({
      ...mockUseGameSession(), // Get default mock values (dispatch, etc.)
      error: ERROR_MESSAGES.noCharacter // Override error
    }
    );

    // Render with the mock context provider
    renderWithMockContext(
      <Inventory />,
      stateWithError // Pass the mock state to the wrapper
    );

    expect(screen.getByTestId('error-display')).toHaveTextContent(ERROR_MESSAGES.noCharacter);
  });
});
