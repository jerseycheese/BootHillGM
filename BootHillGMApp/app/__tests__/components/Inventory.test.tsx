import React from 'react';
import { render, screen } from '@testing-library/react';
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

  test('does not render items with quantity 0', () => {
    (useGame as jest.Mock).mockReturnValue({
      state: {
        inventory: [
          { id: '1', name: 'Health Potion', quantity: 2, description: 'Restores 20 health points' },
          { id: '2', name: 'Empty Bottle', quantity: 0, description: 'An empty glass bottle' }
        ]
      },
      dispatch: mockDispatch
    });

    render(
      <CampaignStateProvider>
        <Inventory />
      </CampaignStateProvider>
    );

    expect(screen.getByText('Health Potion (x2)')).toBeInTheDocument();
    expect(screen.queryByText('Empty Bottle (x0)')).not.toBeInTheDocument();
  });

  test('handles undefined inventory gracefully', () => {
    (useGame as jest.Mock).mockReturnValue({
      state: { inventory: undefined },
      dispatch: mockDispatch
    });

    render(
      <CampaignStateProvider>
        <Inventory />
      </CampaignStateProvider>
    );

    expect(screen.getByText('Your inventory is empty.')).toBeInTheDocument();
  });

  test('does not render items with missing properties', () => {
    (useGame as jest.Mock).mockReturnValue({
      state: {
        inventory: [
          { id: '1', name: 'Health Potion', quantity: 2, description: 'Restores 20 health points' },
          { id: '2', quantity: 1 }, // Missing name
          { name: 'Sword', quantity: 1 }, // Missing id
          { id: '4', name: 'Shield' } // Missing quantity
        ]
      },
      dispatch: mockDispatch
    });

    render(
      <CampaignStateProvider>
        <Inventory />
      </CampaignStateProvider>
    );

    expect(screen.getByText('Health Potion (x2)')).toBeInTheDocument();
    expect(screen.queryByText('(x1)')).not.toBeInTheDocument();
    expect(screen.queryByText('Sword (x1)')).not.toBeInTheDocument();
    expect(screen.queryByText('Shield')).not.toBeInTheDocument();
  });
});
