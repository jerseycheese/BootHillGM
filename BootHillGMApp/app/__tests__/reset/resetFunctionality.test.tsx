import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { resetGame } from '../../utils/debugActions';
import { setupLocalStorageMock, resetLocalStorageMock } from '../../test/utils/mockLocalStorage';
import { GameControlSectionProps } from '../../types/debug.types';
import { GameAction } from '../../types/actions';
import { GameState } from '../../types/gameState';

// Mock resetGame to return a properly typed action
jest.mock('../../utils/debugActions', () => ({
  __esModule: true,
  resetGame: jest.fn(() => ({
    type: 'SET_STATE',
    payload: {
      character: {
        player: {
          name: 'Test Character',
          id: 'test-character',
          isNPC: false,
          isPlayer: true,
          attributes: {
            speed: 5,
            gunAccuracy: 5,
            throwingAccuracy: 5,
            strength: 5,
            baseStrength: 5,
            bravery: 5,
            experience: 0
          },
          minAttributes: {
            speed: 1,
            gunAccuracy: 1,
            throwingAccuracy: 1,
            strength: 1,
            baseStrength: 1,
            bravery: 1,
            experience: 0
          },
          maxAttributes: {
            speed: 10,
            gunAccuracy: 10,
            throwingAccuracy: 10,
            strength: 10,
            baseStrength: 10,
            bravery: 10,
            experience: 100
          },
          inventory: { 
            items: [],
            equippedWeaponId: null
          },
          wounds: [],
          isUnconscious: false
        },
        opponent: null
      },
      combat: {
        isActive: false,
        combatType: 'brawling',
        playerTurn: true,
        playerCharacterId: 'test-character',
        opponentCharacterId: '',
        roundStartTime: 0,
        modifiers: {
          player: 0,
          opponent: 0
        },
        currentTurn: null,
        winner: null,
        combatLog: [],
        participants: [],
        rounds: 0
      },
      inventory: { 
        items: [],
        equippedWeaponId: null
      },
      journal: { 
        entries: []
      },
      narrative: {
        narrativeHistory: [],
        currentStoryPoint: null,
        visitedPoints: [],
        availableChoices: [],
        displayMode: 'standard',
        context: '',
        selectedChoice: undefined,
        error: null
      },
      ui: {
        isLoading: false,
        modalOpen: null,
        notifications: [],
        activeTab: 'character'
      },
      currentPlayer: 'test-character',
      npcs: [],
      location: null,
      quests: [],
      gameProgress: 0,
      suggestedActions: []
    }
  } as const)),
  extractCharacterData: jest.fn().mockReturnValue({
    name: 'Test Character',
    id: 'test-character',
    attributes: {
      speed: 5,
      gunAccuracy: 5,
      throwingAccuracy: 5,
      strength: 5,
      baseStrength: 5,
      bravery: 5,
      experience: 0
    }
  })
}));

// Mock GameControlSection component
const MockGameControlSection = (props: GameControlSectionProps) => {
  return (
    <div>
      <button 
        onClick={async () => {
          props.setLoading('resetting');
          props.setLoadingIndicator('resetting');
          const action = resetGame();
          props.dispatch(action as unknown as GameAction);
          props.setLoading(null);
          props.setLoadingIndicator(null);
        }}
      >
        Reset Game
      </button>
    </div>
  );
};

describe('resetFunctionality', () => {
  beforeEach(() => {
    setupLocalStorageMock();
  });

  afterEach(() => {
    resetLocalStorageMock();
  });

  it('should dispatch SET_STATE action when reset button is clicked', async () => {
    const mockDispatch = jest.fn();
    const mockSetLoading = jest.fn();
    const mockSetLoadingIndicator = jest.fn();

    render(
      <MockGameControlSection
        dispatch={mockDispatch}
        loading={null}
        setLoading={mockSetLoading}
        setError={jest.fn()}
        setLoadingIndicator={mockSetLoadingIndicator}
        gameState={{} as GameState}
      />
    );

    fireEvent.click(screen.getByText('Reset Game'));

    await waitFor(() => {
      expect(mockSetLoading).toHaveBeenCalledWith('resetting');
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: 'SET_STATE'
      }));
      expect(mockSetLoading).toHaveBeenCalledWith(null);
    });
  });
});