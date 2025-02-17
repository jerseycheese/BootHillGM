import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import DevToolsPanel from '../../../components/Debug/DevToolsPanel';
import { useCampaignState } from '../../../components/CampaignStateManager';
import { initialState } from '../../../types/initialState';

// Mock useCampaignState
jest.mock('../../../components/CampaignStateManager', () => ({
  useCampaignState: jest.fn(),
}));

describe('DevToolsPanel', () => {
  const mockDispatch = jest.fn();
  const mockCleanupState = jest.fn();

  beforeEach(() => {
    (useCampaignState as jest.Mock).mockReturnValue({
      cleanupState: mockCleanupState,
    });
  });

  it('renders without crashing', () => {
    render(<DevToolsPanel gameState={initialState} dispatch={mockDispatch} />);
    expect(screen.getByText('DevTools')).toBeInTheDocument();
  });

  it('calls cleanupState when Reset Game is clicked', async () => {
    render(<DevToolsPanel gameState={initialState} dispatch={mockDispatch} />);
    await act(async () => {
      fireEvent.click(screen.getByText('Reset Game'));
    });
    expect(mockCleanupState).toHaveBeenCalledTimes(1);
  });

  it('dispatches initializeTestCombat when Test Combat is clicked', async () => {
    render(<DevToolsPanel gameState={initialState} dispatch={mockDispatch} />);
    await act(async () => {
      fireEvent.click(screen.getByText('Test Combat'));
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_STATE",
      payload: {
        opponent: {
          id: "test_opponent",
          name: "Test Opponent",
          attributes: {
            speed: 5,
            gunAccuracy: 5,
            throwingAccuracy: 5,
            strength: 5,
            baseStrength: 5,
            bravery: 5,
            experience: 5,
          },
          wounds: [],
          isUnconscious: false,
          isNPC: true,
          isPlayer: false,
          inventory: [],
        },
        isCombatActive: true,
        combatState: {
          rounds: 0,
          combatType: "brawling",
          isActive: true,
          winner: null,
          participants: [],
          brawling: {
            round: 1,
            playerModifier: 0,
            opponentModifier: 0,
            playerCharacterId: "",
            opponentCharacterId: "test_opponent",
            roundLog: [],
          },
        },
        isClient: true,
      },
    });
  });
});
