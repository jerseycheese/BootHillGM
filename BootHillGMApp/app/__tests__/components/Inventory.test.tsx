import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Inventory } from '../../components/Inventory';
import { CampaignStateContext } from '../../components/CampaignStateManager';
import { InventoryItem } from '../../types/item.types';
import { InventoryManager } from '../../utils/inventoryManager';
import {
  createMockCampaignState,
  createMockInventoryItem,
} from '../../test/utils/inventoryTestUtils';

jest.mock('../../utils/inventoryManager', () => ({
  InventoryManager: {
    validateItemUse: jest.fn(() => ({ valid: true })),
  },
}));

// Mock useMemo to return the first argument (the function) directly
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useMemo: <T,>(fn: () => T) => fn(),
}));

describe('Inventory', () => {
  const mockDispatch = jest.fn();
  const mockSaveGame = jest.fn();
  const mockLoadGame = jest.fn();
  const mockOnUseItem = jest.fn();

  const ERROR_MESSAGES = {
    noCharacter: 'No character available',
    unableToUse: 'Unable to use item',
    cannotUse: 'Cannot use item',
  };

  // Helper function to render Inventory with context
  const renderWithContext = (
    ui: React.ReactElement,
    state = createMockCampaignState()
  ) => {
    return render(
      <CampaignStateContext.Provider
        value={{
          state,
          dispatch: mockDispatch,
          saveGame: mockSaveGame,
          loadGame: mockLoadGame,
          cleanupState: jest.fn(),
        }}
      >
        {ui}
      </CampaignStateContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

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

    renderWithContext(<Inventory />, stateWithInvalidItems);
    expect(screen.getByText(/Health Potion \(x2\)/)).toBeInTheDocument();

    // The following items should NOT be rendered because they have missing properties
    expect(screen.queryByText(/Invalid item/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sword/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Shield/)).not.toBeInTheDocument();
  });

  test('handles missing character gracefully', async () => {
    // Create a state without a character
    const baseState = createMockCampaignState({ inventory: [] });
    const stateWithoutCharacter = {
      ...baseState,
      character: null,
    };

    renderWithContext(<Inventory />, stateWithoutCharacter);

    // Error should appear immediately
    expect(screen.getByTestId('error-display')).toHaveTextContent(
      ERROR_MESSAGES.noCharacter
    );
  });

  test('calls onUseItem only when validation passes', () => {
    const validItem = createMockInventoryItem({
      id: 'valid-item',
      name: 'Valid Item',
      quantity: 1,
      description: 'Can use this',
    });

    const stateWithValidItem = createMockCampaignState({
      inventory: [validItem],
    });

    renderWithContext(
      <Inventory onUseItem={mockOnUseItem} />,
      stateWithValidItem
    );

    const useButton = screen.getByLabelText('Use Valid Item');
    fireEvent.click(useButton);

    expect(mockOnUseItem).toHaveBeenCalledWith('valid-item', 'use');
    expect(screen.queryByTestId('inventory-error')).not.toBeInTheDocument();
  });

  test('displays and clears error when validation fails', async () => {
    (InventoryManager.validateItemUse as jest.Mock).mockReturnValueOnce({
      valid: false,
      reason: 'Test Reason',
    });

    const invalidItem = createMockInventoryItem({ id: 'invalid', quantity: 1 });
    const stateWithInvalidItem = createMockCampaignState({
      inventory: [invalidItem],
    });

    renderWithContext(<Inventory />, stateWithInvalidItem);

    const useButton = screen.getByLabelText(`Use ${invalidItem.name}`);

    fireEvent.click(useButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-display')).toHaveTextContent(
        'Test Reason'
      );
    });

    // Wait for the error timeout (3000ms) + a small buffer
    await waitFor(
      () => {
        expect(screen.queryByTestId('error-display')).not.toBeInTheDocument();
      },
      { timeout: 3100 }
    );
  });

  test('uses default error message when no reason is provided', async () => {
      (InventoryManager.validateItemUse as jest.Mock).mockReturnValueOnce({
        valid: false,
        reason: undefined, // Simulate missing reason
      });

      const invalidItem = createMockInventoryItem({ id: 'invalid', quantity: 1 });
      const stateWithInvalidItem = createMockCampaignState({
        inventory: [invalidItem],
      });

      renderWithContext(<Inventory />, stateWithInvalidItem);
      const useButton = screen.getByLabelText(`Use ${invalidItem.name}`);
      fireEvent.click(useButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-display')).toHaveTextContent(
          ERROR_MESSAGES.cannotUse
        );
      });
    });
});
