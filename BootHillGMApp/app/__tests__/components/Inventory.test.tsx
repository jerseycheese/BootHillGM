import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CampaignStateProvider } from '../../components/CampaignStateManager';
import Inventory from '../../components/Inventory';
import { useGame } from '../../utils/gameEngine';

jest.mock('../../utils/gameEngine', () => ({
  useGame: jest.fn()
}));

describe('Inventory', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    (useGame as jest.Mock).mockReturnValue({
      state: {
        inventory: [
          { id: '1', name: 'Health Potion', quantity: 2, description: 'Restores 20 health points' },
          { id: '2', name: 'Rope', quantity: 1, description: 'A sturdy rope, 50 feet long' }
        ]
      },
      dispatch: mockDispatch
    });
  });

  test('renders inventory items', () => {
    render(
      <CampaignStateProvider>
        <Inventory />
      </CampaignStateProvider>
    );

    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText('Health Potion (x2)')).toBeInTheDocument();
    expect(screen.getByText('Rope (x1)')).toBeInTheDocument();
  });

  test('displays empty inventory message when no items', () => {
    (useGame as jest.Mock).mockReturnValue({
      state: { inventory: [] },
      dispatch: mockDispatch
    });

    render(
      <CampaignStateProvider>
        <Inventory />
      </CampaignStateProvider>
    );

    expect(screen.getByText('Your inventory is empty.')).toBeInTheDocument();
  });

  test('calls dispatch when using an item', () => {
    render(
      <CampaignStateProvider>
        <Inventory />
      </CampaignStateProvider>
    );

    const useButtons = screen.getAllByText('Use');
    fireEvent.click(useButtons[0]);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'USE_ITEM',
      payload: '1'
    });
  });
});