import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Inventory from '../../components/Inventory';
import { CampaignStateContext } from '../../components/CampaignStateManager';
import { CampaignState } from '../../types/campaign';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  description: string;
}

describe('Inventory', () => {
  // Mock campaign state with test data
  const mockState: CampaignState = {
    currentPlayer: '',
    npcs: [],
    character: null,
    location: '',
    savedTimestamp: undefined,
    gameProgress: 0,
    journal: [],
    narrative: '',
    inventory: [
      { id: '1', name: 'Health Potion', quantity: 2, description: 'Restores 20 health points' },
      { id: '2', name: 'Rope', quantity: 1, description: 'A sturdy rope, 50 feet long' }
    ],
    quests: [],
    isCombatActive: false,
    opponent: null,
    isClient: false,
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
        { id: '1', name: 'Health Potion', quantity: 2, description: 'Restores 20 health points' },
        { id: '2', name: 'Empty Bottle', quantity: 0, description: 'An empty glass bottle' }
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
        { id: '1', name: 'Health Potion', quantity: 2, description: 'Restores 20 health points' },
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
});
