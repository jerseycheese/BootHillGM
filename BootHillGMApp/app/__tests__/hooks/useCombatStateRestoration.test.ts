import { renderHook } from '@testing-library/react';
import { useCombatStateRestoration } from '../../hooks/useCombatStateRestoration';
import { GameState } from '../../types/gameState';
import { Character } from '../../types/character';

describe('useCombatStateRestoration', () => {
  const mockOpponent: Character = {
    id: 'character_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    name: 'Test Opponent',
    attributes: {
      speed: 10,
      gunAccuracy: 10,
      throwingAccuracy: 10,
      strength: 10,
      baseStrength: 10,
      bravery: 10,
      experience: 5
    },
    wounds: [],
    isUnconscious: false,
    inventory: [],
    isNPC: true,
    isPlayer: false
  };

const mockState: GameState = {
    character: {
        id: 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: 'Player1',
        attributes: {
            speed: 10,
            gunAccuracy: 10,
            throwingAccuracy: 10,
            strength: 10,
            baseStrength: 10,
            bravery: 10,
            experience: 5
        },
        wounds: [],
        isUnconscious: false,
        inventory: [],
        isNPC: false,
        isPlayer: true,
        strengthHistory: { baseStrength: 10, changes: [] }
    },
    location: { type: 'town', name: 'Testville' },
    isCombatActive: true,
    opponent: mockOpponent,
    combatState: {
        isActive: true,
        combatType: 'brawling',
        winner: null,
        participants: [],
        rounds: 0,
        combatLog: [{ text: 'Combat started', type: 'info', timestamp: Date.now() }],
    },
    inventory: [],
    journal: [],
    narrative: '',
    gameProgress: 0,
    suggestedActions: [],
    currentPlayer: 'Player1',
    npcs: [],
    quests: []
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
    handleUseItem: jest.fn(), // Ensure this function is defined
    onEquipWeapon: jest.fn(),
    handleEquipWeapon: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should restore combat state when conditions are met', () => {
    renderHook(() => useCombatStateRestoration(mockState, mockGameSession));
    expect(mockGameSession.initiateCombat).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        name: mockOpponent.name,
        attributes: expect.objectContaining(mockOpponent.attributes),
        inventory: expect.anything(),
        isNPC: true,
        isPlayer: false,
      }),
      expect.objectContaining({
        isActive: true,
        combatType: 'brawling',
        combatLog: expect.arrayContaining([
          expect.objectContaining({
            text: 'Combat started',
            type: 'info',
            timestamp: expect.any(Number)
          })
        ])
      })
    );
  });

  it('should not restore combat if state is incomplete', () => {
    const incompleteState = { ...mockState, opponent: null } as GameState;

    renderHook(() => useCombatStateRestoration(incompleteState, mockGameSession));

    expect(mockGameSession.initiateCombat).not.toHaveBeenCalled();
  });
});
