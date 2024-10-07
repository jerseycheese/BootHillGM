import React from 'react';
import { render, screen } from '@testing-library/react';
import { CampaignStateProvider } from './CampaignStateManager';
import Inventory from './Inventory';
import { useGame } from '../utils/gameEngine';

jest.mock('../utils/gameEngine', () => ({
  useGame: jest.fn()
}));

describe('Inventory', () => {
  test('renders inventory items', () => {
    (useGame as jest.Mock).mockReturnValue({
      state: {
        inventory: [
          { id: '1', name: 'Health Potion', quantity: 2 },
          { id: '2', name: 'Rope', quantity: 1 },
        ],
      },
      dispatch: jest.fn(),
    });

    render(
      <CampaignStateProvider>
        <Inventory />
      </CampaignStateProvider>
    );

    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText('Health Potion (x2)')).toBeInTheDocument();
    expect(screen.getByText('Rope (x1)')).toBeInTheDocument();
  });

  test('renders empty inventory message when no items', () => {
    (useGame as jest.Mock).mockReturnValue({
      state: { inventory: [] },
      dispatch: jest.fn(),
    });

    render(
      <CampaignStateProvider>
        <Inventory />
      </CampaignStateProvider>
    );

    expect(screen.getByText('Your inventory is empty.')).toBeInTheDocument();
  });
});