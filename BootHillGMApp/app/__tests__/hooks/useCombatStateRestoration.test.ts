import { renderHook } from '@testing-library/react';
import { useCombatStateRestoration } from '../../hooks/useCombatStateRestoration';
import { GameState } from '../../utils/gameEngine';
import { Character } from '../../types/character';

describe('useCombatStateRestoration', () => {
  const mockOpponent: Character = {
    name: 'Test Opponent',
    health: 100,
    attributes: {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 10,
      bravery: 10,
      experience: 5
    },
    skills: {
      shooting: 50,
      riding: 50,
      brawling: 50
    }
  };

  const mockState: GameState = {
    currentPlayer: 'Player1',
    npcs: [],
    location: 'Saloon',
    inventory: [],
    quests: [],
    character: {
      name: 'Player1',
      health: 100,
      attributes: {
        speed: 10,
        gunAccuracy: 10,
        throwingAccuracy: 10,
        strength: 10,
        bravery: 10,
        experience: 5
      },
      skills: {
        shooting: 50,
        riding: 50,
        brawling: 50
      }
    },
    narrative: '',
    gameProgress: 0,
    journal: [],
    isCombatActive: true,
    opponent: mockOpponent,
    suggestedActions: [],
    combatState: {
      playerHealth: 100,
      opponentHealth: 100,
      currentTurn: 'player' as const,
      combatLog: ['Combat started']
    }
  };

  const mockGameSession = {
    initiateCombat: jest.fn(),
    dispatch: jest.fn(),
    isLoading: false,
    error: null,
    isCombatActive: false,
    opponent: null,
    handleUserInput: jest.fn(),
    retryLastAction: jest.fn(),
    handleCombatEnd: jest.fn(),
    handlePlayerHealthChange: jest.fn(),
    handleManualSave: jest.fn(),
    handleUseItem: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should restore combat state when conditions are met', () => {
    renderHook(() => useCombatStateRestoration(mockState, mockGameSession));

    expect(mockGameSession.initiateCombat).toHaveBeenCalledWith(
      expect.objectContaining({
        name: mockOpponent.name,
        health: mockOpponent.health,
        attributes: expect.objectContaining(mockOpponent.attributes),
        skills: expect.objectContaining(mockOpponent.skills)
      }),
      expect.objectContaining({
        playerHealth: 100,
        opponentHealth: 100,
        currentTurn: 'player',
        combatLog: ['Combat started']
      })
    );
  });

  it('should not restore combat if state is incomplete', () => {
    const incompleteState = { ...mockState, opponent: null };
    
    renderHook(() => useCombatStateRestoration(incompleteState, mockGameSession));

    expect(mockGameSession.initiateCombat).not.toHaveBeenCalled();
  });
});
