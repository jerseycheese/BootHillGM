import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InventoryItem } from '../../components/InventoryItem';
import { createMockInventoryItem } from '../../test/utils/inventoryTestUtils';
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
      // Pass undefined for isUsing
      <InventoryItem item={item} onAction={mockOnAction} isUsing={undefined} />,
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
      // Pass undefined for isUsing
      <InventoryItem item={item} onAction={mockOnAction} isUsing={undefined} />,
      mockContextValue
    );

    const useButton = screen.getByLabelText('Use Health Potion');

    fireEvent.click(useButton);

    expect(mockOnAction).toHaveBeenCalledWith('1', 'use');
  });
});
