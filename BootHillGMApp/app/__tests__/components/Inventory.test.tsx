import { render, screen } from '@testing-library/react';
import { Inventory } from '../../components/Inventory';
import { InventoryItem } from '../../types/item.types';
import { useGameSession } from '../../hooks/useGameSession';
import { CampaignStateContext } from '../../components/CampaignStateManager';
import {
  createMockCampaignState,
  createMockInventoryItem,
} from '../../test/utils/inventoryTestUtils';

jest.mock('../../hooks/useGameSession'); // Mock useGameSession

jest.mock('../../utils/inventoryManager', () => ({
  InventoryManager: {
    validateItemUse: jest.fn(() => ({ valid: true })),
  },
}));

const mockUseGameSession = {
  state: createMockCampaignState(),
  dispatch: jest.fn(),
  isLoading: false,
  error: null,
  setError: jest.fn(),
  retryLastAction: jest.fn(),
  handleUseItem: jest.fn(),
  isUsingItem: jest.fn(),
};

describe('Inventory', () => {
  const mockSaveGame = jest.fn();
  const mockLoadGame = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const ERROR_MESSAGES = {
    noCharacter: 'No character available',
    unableToUse: 'Unable to use item',
    cannotUse: 'Cannot use item',
  };

    const renderWithContext = (
        ui: React.ReactElement,
        state = createMockCampaignState()
    ) => {
        return render(
            <CampaignStateContext.Provider
                value={{
                    state,
                    dispatch: jest.fn(),
                    saveGame: mockSaveGame,
                    loadGame: mockLoadGame,
                    cleanupState: jest.fn(),
                }}
            >
                {ui}
            </CampaignStateContext.Provider>
        );
    };

  test('does not render items with missing properties', () => {
    const stateWithInvalidItems = createMockCampaignState({
      inventory: [
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
      ] as InventoryItem[],
    });
    (useGameSession as jest.Mock).mockReturnValue({
      ...mockUseGameSession,
      state: stateWithInvalidItems
    });

    renderWithContext(<Inventory />, stateWithInvalidItems);

    expect(screen.getByText(/Health Potion/)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText(/Invalid item/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sword/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Shield/)).not.toBeInTheDocument();
  });

  test('handles missing character gracefully', () => {
      const stateWithoutCharacter = {
          ...createMockCampaignState(),
          character: null,
      };

    const mockUseGameSession = {
      state: stateWithoutCharacter,
      dispatch: jest.fn(),
      isLoading: false,
      error: ERROR_MESSAGES.noCharacter,
      setError: jest.fn(),
      retryLastAction: jest.fn(),
      handleUseItem: jest.fn(),
      isUsingItem: jest.fn().mockReturnValue(false),
    };
    (useGameSession as jest.Mock).mockReturnValue(mockUseGameSession);

    renderWithContext(<Inventory />, stateWithoutCharacter);

    expect(screen.getByTestId('error-display')).toHaveTextContent(ERROR_MESSAGES.noCharacter);
  });

  // TODO: Fix this test. See Issue #152
  // test('displays and clears error when validation fails', async () => {
  //   const invalidItem = createMockInventoryItem({ id: 'invalid', name: 'Test Item', quantity: 1 });
  //   const stateWithInvalidItem = createMockCampaignState({
  //     inventory: [invalidItem],
  //   });
  //
  //   // Mock validateItemUse *inside* the test case and useGameSession
  //     let mockError: string | null = null;
  //     const mockUseGameSession = {
  //       state: stateWithInvalidItem,
  //       dispatch: jest.fn(),
  //       isLoading: false,
  //       get error() { return mockError; }, // Use a getter for dynamic access
  //       setError: jest.fn().mockImplementation((newError: string | null) => {
  //         mockError = newError;
  //       }),
  //       retryLastAction: jest.fn(),
  //       handleUseItem: jest.fn(),
  //       isUsingItem: jest.fn().mockReturnValue(false),
  //     };
  //     (InventoryManager.validateItemUse as jest.Mock).mockReturnValueOnce({
  //       valid: false,
  //       reason: 'Test Reason',
  //     });
  //   (useGameSession as jest.Mock).mockReturnValue(mockUseGameSession);
  //
  //   renderWithContext(<Inventory />, stateWithInvalidItem);
  //
  //   const useButton = screen.getByRole('button', { name: /use/i });
  //
  //   // Log initial error state
  //
  //
  //   fireEvent.click(useButton);
  //
  //   // Log error state after click
  //
  //
  //   await waitFor(() => {
  //     expect(screen.getByText(/Test Reason/)).toBeInTheDocument();
  //   });
  // });

  // TODO: Fix this test. See Issue #152
  // test('uses default error message when no reason is provided', async () => {
  //   const invalidItem = createMockInventoryItem({ id: 'invalid', name: 'Test Item', quantity: 1 });
  //   const stateWithInvalidItem = createMockCampaignState({
  //     inventory: [invalidItem],
  //   });
  //
  //   let mockError: string | null = null;
  //   const mockUseGameSession = {
  //     state: stateWithInvalidItem,
  //     dispatch: jest.fn(),
  //     isLoading: false,
  //     get error() { return mockError; },
  //     setError: jest.fn().mockImplementation((newError: string | null) => {
  //       mockError = newError;
  //     }),
  //     retryLastAction: jest.fn(),
  //     handleUseItem: jest.fn(),
  //     isUsingItem: jest.fn().mockReturnValue(false),
  //   };
  //   (useGameSession as jest.Mock).mockReturnValue(mockUseGameSession);
  //
  //   // Mock validateItemUse *inside* the test case to return *no* reason
  //   (InventoryManager.validateItemUse as jest.Mock).mockReturnValueOnce({
  //     valid: false,
  //     reason: undefined, // No reason provided
  //   });
  //   renderWithContext(<Inventory />, stateWithInvalidItem);
  //
  //   const useButton = screen.getByRole('button', { name: /use/i });
  //   fireEvent.click(useButton);
  //
  //   await waitFor(() => {
  //     expect(screen.getByText(/Cannot use Test Item/)).toBeInTheDocument();
  //   });
  // });
});