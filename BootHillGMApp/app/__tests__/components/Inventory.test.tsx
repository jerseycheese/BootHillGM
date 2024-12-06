import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Inventory } from '../../components/Inventory';
import { CampaignStateContext } from '../../components/CampaignStateManager';
import { CampaignState } from '../../types/campaign';
import { InventoryItem, ItemCategory } from '../../types/inventory';

describe('Inventory', () => {
  // Mock campaign state with test data
  const mockState: CampaignState = {
    currentPlayer: '',
    npcs: [],
    character: {
      name: 'Test Character',
      attributes: {
        speed: 5,
        gunAccuracy: 5,
        throwingAccuracy: 5,
        strength: 10,
        baseStrength: 10,
        bravery: 5,
        experience: 0
      },
      wounds: [],
      isUnconscious: false,
      inventory: []
    },
    location: '',
    savedTimestamp: undefined,
    gameProgress: 0,
    journal: [],
    narrative: '',
    inventory: [
      { id: '1', name: 'Health Potion', quantity: 2, description: 'Restores 20 health points', category: 'consumable' as ItemCategory },
      { id: '2', name: 'Rope', quantity: 1, description: 'A sturdy rope, 50 feet long', category: 'general' as ItemCategory }
    ],
    quests: [],
    isCombatActive: false,
    opponent: null,
    isClient: false,
    suggestedActions: []
  };

  const mockDispatch = jest.fn();
  const mockSaveGame = jest.fn();
  const mockLoadGame = jest.fn();

  // Helper function to render Inventory with context
  const renderWithContext = (ui: React.ReactElement, state = mockState) => {
    return render(
      <CampaignStateContext.Provider 
        value={{ 
          state, 
          dispatch: mockDispatch,
          saveGame: mockSaveGame,
          loadGame: mockLoadGame,
          cleanupState: jest.fn()
        }}
      >
        {ui}
      </CampaignStateContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders inventory items', () => {
    renderWithContext(<Inventory />);

    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText(/Health Potion \(x2\)/)).toBeInTheDocument();
    expect(screen.getByText(/Rope \(x1\)/)).toBeInTheDocument();
  });

  test('displays empty inventory message when no items', () => {
    const emptyState: CampaignState = {
      ...mockState,
      inventory: []
    };

    renderWithContext(<Inventory />, emptyState);
    expect(screen.getByText('Your inventory is empty.')).toBeInTheDocument();
  });

  test('does not render items with quantity 0', () => {
    const stateWithZeroQuantity: CampaignState = {
      ...mockState,
      inventory: [
        { id: '1', name: 'Health Potion', quantity: 2, description: 'Restores 20 health points', category: 'consumable' as ItemCategory },
        { id: '2', name: 'Empty Bottle', quantity: 0, description: 'An empty glass bottle', category: 'general' as ItemCategory }
      ]
    };

    renderWithContext(<Inventory />, stateWithZeroQuantity);
    expect(screen.getByText(/Health Potion \(x2\)/)).toBeInTheDocument();
    expect(screen.queryByText(/Empty Bottle/)).not.toBeInTheDocument();
  });

  test('handles empty inventory gracefully', () => {
    const stateWithEmptyInventory: CampaignState = {
      ...mockState,
      inventory: []
    };

    renderWithContext(<Inventory />, stateWithEmptyInventory);
    expect(screen.getByText('Your inventory is empty.')).toBeInTheDocument();
  });

  test('does not render items with missing properties', () => {
    const stateWithInvalidItems: CampaignState = {
      ...mockState,
      inventory: [
        { id: '1', name: 'Health Potion', quantity: 2, description: 'Restores 20 health points', category: 'consumable' as ItemCategory },
        { id: '2', quantity: 1, description: 'Invalid item' } as unknown as InventoryItem, // Missing name
        { name: 'Sword', quantity: 1, description: 'Invalid item' } as unknown as InventoryItem, // Missing id
        { id: '4', name: 'Shield', description: 'Invalid item' } as unknown as InventoryItem // Missing quantity
      ]
    };

    renderWithContext(<Inventory />, stateWithInvalidItems);
    expect(screen.getByText(/Health Potion \(x2\)/)).toBeInTheDocument();

    // The following items should NOT be rendered because they have missing properties
    expect(screen.queryByText(/Invalid item/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sword/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Shield/)).not.toBeInTheDocument();
  });

  test('displays item descriptions on hover', () => {
    renderWithContext(<Inventory />);
    
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

  test('calls onUseItem with item ID when Use button is clicked', async () => {
    const mockOnUseItem = jest.fn();
    renderWithContext(
      <Inventory onUseItem={mockOnUseItem} />, 
      {
        ...mockState,
        inventory: [
          { 
            id: '1', 
            name: 'Health Potion', 
            quantity: 2, 
            description: 'Restores 20 health points',
            category: 'consumable' as ItemCategory,
            effect: {
              type: 'heal',
              value: 20
            }
          }
        ]
      }
    );

    // Find and click the Use button
    const useButton = screen.getByLabelText('Use Health Potion');
    
    // Click the button and wait for updates
    await act(async () => {
      fireEvent.click(useButton);
    });

    // Verify the callback was called
    expect(mockOnUseItem).toHaveBeenCalledWith('1');
  });

  test('handles using an item with quantity greater than 1', () => {
    const mockOnUseItem = jest.fn();
    const stateWithMultipleItems: CampaignState = {
      ...mockState,
      inventory: [
        { id: '1', name: 'Health Potion', quantity: 3, description: 'Restores 20 health points', category: 'consumable' as ItemCategory }
      ]
    };

    renderWithContext(<Inventory onUseItem={mockOnUseItem} />, stateWithMultipleItems);
    
    // Find and click the Use button
    const useButton = screen.getByLabelText('Use Health Potion');
    fireEvent.click(useButton);
    
    // Check if onUseItem was called with the correct item ID
    expect(mockOnUseItem).toHaveBeenCalledWith('1');
    
    // The item should still be visible since quantity was > 1
    expect(screen.getByText(/Health Potion \(x3\)/)).toBeInTheDocument();
  });

  // New tests
  test('displays error message when item validation fails', () => {
    const invalidItem = {
      id: 'heavy-item',
      name: 'Heavy Item',
      quantity: 1,
      description: 'Too heavy to use',
      requirements: {
        minStrength: 20
      },
      category: 'general' as ItemCategory
    };

    const stateWithInvalidItem = {
      ...mockState,
      inventory: [invalidItem]
    };

    renderWithContext(<Inventory />, stateWithInvalidItem);
    
    const useButton = screen.getByLabelText('Use Heavy Item');
    fireEvent.click(useButton);

    expect(screen.getByTestId('inventory-error')).toHaveTextContent('Requires 20 strength');
  });

  test('clears error message after timeout', async () => {
    const invalidItem = {
      id: 'combat-item',
      name: 'Combat Item',
      quantity: 1,
      description: 'Combat only',
      requirements: {
        combatOnly: true
      },
      category: 'general' as ItemCategory
    };

    const stateWithInvalidItem = {
      ...mockState,
      inventory: [invalidItem]
    };

    renderWithContext(<Inventory />, stateWithInvalidItem);
    
    const useButton = screen.getByLabelText('Use Combat Item');
    fireEvent.click(useButton);

    expect(screen.getByTestId('inventory-error')).toBeInTheDocument();
    
    // Wait for error to clear using waitFor instead of setTimeout
    await waitFor(() => {
      expect(screen.queryByTestId('inventory-error')).not.toBeInTheDocument();
    }, { timeout: 4000 }); // Slightly longer than the component's timeout
  });

  test('handles missing character gracefully', () => {
    const stateWithoutCharacter = {
      ...mockState,
      character: null
    };

    renderWithContext(<Inventory />, stateWithoutCharacter);
    
    const useButton = screen.getByLabelText('Use Health Potion');
    fireEvent.click(useButton);

    expect(screen.getByTestId('inventory-error')).toHaveTextContent('Unable to use item');
  });

  test('calls onUseItem only when validation passes', () => {
    const validItem = {
      id: 'valid-item',
      name: 'Valid Item',
      quantity: 1,
      description: 'Can use this',
      category: 'general' as ItemCategory
    };

    const stateWithValidItem = {
      ...mockState,
      inventory: [validItem]
    };

    const mockOnUseItem = jest.fn();
    renderWithContext(<Inventory onUseItem={mockOnUseItem} />, stateWithValidItem);
    
    const useButton = screen.getByLabelText('Use Valid Item');
    fireEvent.click(useButton);

    expect(mockOnUseItem).toHaveBeenCalledWith('valid-item');
    expect(screen.queryByTestId('inventory-error')).not.toBeInTheDocument();
  });
});
