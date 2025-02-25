import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InventoryItem } from '../InventoryItem';
import { createMockInventoryItem } from '../../test/utils/inventoryTestUtils';
import { InventoryManager } from '../../utils/inventoryManager';
import { GameContext, GameContextProps } from '../../hooks/useGame';
import { createMockCharacter } from '../../test/character/characterData';
import { GameState } from '../../types/gameState';
import { CombatState } from '../../types/combat';
import { JournalEntry } from '../../types/journal';

jest.mock('../../utils/inventoryManager', () => ({
  InventoryManager: {
    validateItemUse: jest.fn(() => ({ valid: true })),
  },
}));

// Helper function to create a mock GameState
const createMockGameState = (overrides: Partial<GameState> = {}): GameState => ({
  currentPlayer: 'player1',
  character: createMockCharacter(),
  npcs: [],
  location: { type: 'town', name: 'Fairhaven' },
  quests: [],
  inventory: [],
  journal: [] as JournalEntry[],
  combatState: undefined as CombatState | undefined,
  isCombatActive: false,
  gameProgress: 0,
  narrative: '',
  opponent: null,
  suggestedActions: [],
  ...overrides,
});

// Helper function to render with context
const renderWithContext = (
  ui: React.ReactElement,
  mockContextValue: Partial<GameContextProps>
) => {
  const fullContextValue: GameContextProps = {
    state: createMockGameState(),
    dispatch: jest.fn(),
    ...mockContextValue,
  };
  return render(
    <GameContext.Provider value={fullContextValue}>
      {ui}
    </GameContext.Provider>
  );
};

describe('InventoryItem', () => {
  const mockOnAction = jest.fn();

  beforeEach(() => {
    mockOnAction.mockClear();
    jest.clearAllMocks();
  });

  test('displays item descriptions on hover', () => {
    const item = createMockInventoryItem({
      id: '1',
      name: 'Health Potion',
      quantity: 2,
      description: 'Restores 20 health points',
    });
    const mockContextValue = {
      state: createMockGameState({
        inventory: [item],
      }),
    };
    renderWithContext(
      <InventoryItem item={item} onAction={mockOnAction} />,
      mockContextValue
    );

    // Find the Health Potion item
    const healthPotionItem = screen.getByText(/Health Potion/);

    // Trigger hover
    fireEvent.mouseEnter(healthPotionItem.closest('li')!);

    // Check if description is shown
    expect(screen.getByText('Restores 20 health points')).toBeInTheDocument();

    // Unhover
    fireEvent.mouseLeave(healthPotionItem.closest('li')!);

    // Check if description is hidden
    expect(screen.queryByText('Restores 20 health points')).not.toBeInTheDocument();
  });

  test('calls onAction with item ID and "use" when Use button is clicked', async () => {
    const item = createMockInventoryItem({
      id: '1',
      name: 'Health Potion',
      quantity: 2,
      description: 'Restores 20 health points',
      category: 'consumable',
      effect: {
        type: 'heal',
        value: 20,
      },
    });
    const mockContextValue = {
      state: createMockGameState({
        inventory: [item],
      }),
    };

    renderWithContext(
      <InventoryItem item={item} onAction={mockOnAction} />,
      mockContextValue
    );

    const useButton = screen.getByLabelText('Use Health Potion');

    fireEvent.click(useButton);

    expect(mockOnAction).toHaveBeenCalledWith('1', 'use');
  });
  test('displays error message when item validation fails', async () => {
    (InventoryManager.validateItemUse as jest.Mock).mockReturnValueOnce({
      valid: false,
      reason: 'Requires 20 strength',
    });
    const invalidItem = createMockInventoryItem({
      id: 'heavy-item',
      name: 'Heavy Item',
      quantity: 1,
      description: 'Too heavy to use',
      requirements: {
        minStrength: 20,
      },
    });
    const mockContextValue = {
      state: createMockGameState({
        inventory: [invalidItem],
        character: createMockCharacter({
          attributes: { strength: 10, speed: 0, gunAccuracy: 0, throwingAccuracy: 0, baseStrength: 0, bravery: 0, experience: 0 },
        }),
      }),
    };

    renderWithContext(
      <InventoryItem item={invalidItem} onAction={mockOnAction} />,
      mockContextValue
    );

    const useButton = screen.getByLabelText('Use Heavy Item');
    fireEvent.click(useButton);

    expect(screen.getByTestId('error-display')).toHaveTextContent(
      'Requires 20 strength'
    );
  });

  test('clears error message after timeout', async () => {
    (InventoryManager.validateItemUse as jest.Mock).mockReturnValueOnce({
      valid: false,
      reason: 'Invalid location',
    });
    const invalidItem = createMockInventoryItem({
      id: 'combat-item',
      name: 'Combat Item',
      quantity: 1,
      description: 'Combat only',
      requirements: {
        combatOnly: true,
      },
    });
    const mockContextValue = {
      state: createMockGameState({
        inventory: [invalidItem],
        isCombatActive: false,
      }),
    };

    renderWithContext(
      <InventoryItem item={invalidItem} onAction={mockOnAction} />,
      mockContextValue
    );

    const useButton = screen.getByLabelText('Use Combat Item');
    fireEvent.click(useButton);

    expect(screen.getByTestId('error-display')).toBeInTheDocument();

    // Wait for error to clear using waitFor instead of setTimeout
    await waitFor(() => {
      expect(screen.queryByTestId('error-display')).not.toBeInTheDocument();
    }, { timeout: 4000 }); // Slightly longer than the component's timeout
  });
});
