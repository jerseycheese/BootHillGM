import { renderHook, act } from '@testing-library/react';
import { useWeaponCombat } from '../../hooks/useWeaponCombat';
import { Character } from '../../types/character';
import { InventoryItem } from '../../types/inventory';
import { CombatState } from '../../types/combat';
import { processPlayerAction } from '../../utils/weaponCombatActions';

jest.mock('../../utils/weaponCombatActions');

describe('useWeaponCombat', () => {
  const mockPlayer: Character = {
    name: 'Player',
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
    inventory: [] as InventoryItem[],
    weapon: {
      id: 'colt-revolver',
      name: 'Colt Revolver',
      modifiers: {
        damage: '2d6',
        range: 20,
        accuracy: 2,
        reliability: 95,
        speed: 1
      }
    }
  };

  const mockOpponent: Character = {
    ...mockPlayer,
    name: 'Opponent',
    attributes: {
      ...mockPlayer.attributes,
      strength: 10  // Start with full strength
    },
    weapon: {
      id: 'winchester-rifle',
      name: 'Winchester Rifle',
      modifiers: {
        damage: '2d8',
        range: 50,
        accuracy: 3,
        reliability: 90,
        speed: 0
      }
    }
  };

  const mockDispatch = jest.fn();
  const mockOnCombatEnd = jest.fn();

  const mockCombatState: CombatState = {
    isActive: true,
    combatType: 'weapon',
    winner: null,
    weapon: {
      round: 1,
      playerWeapon: mockPlayer.weapon || null,
      opponentWeapon: mockOpponent.weapon || null,
      currentRange: 15,
      roundLog: [],
      lastAction: undefined
    },
    playerStrength: mockPlayer.attributes.strength,
    opponentStrength: mockOpponent.attributes.strength,
    currentTurn: 'player',
    combatLog: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for processPlayerAction
    jest.mocked(processPlayerAction).mockResolvedValue({
      result: {
        hit: false,
        type: 'fire',
        roll: 10,
        modifiedRoll: 12,
        targetNumber: 15,
        message: 'Default action',
        newStrength: 10
      },
      turnResult: {
        updatedCharacter: null,
        logEntry: {
          text: 'Default action',
          type: 'info',
          timestamp: Date.now()
        },
        shouldEndCombat: false
      }
    });
  });

  test('initializes with correct weapon state', () => {
    const { result } = renderHook(() => useWeaponCombat({
      playerCharacter: mockPlayer,
      opponent: mockOpponent,
      onCombatEnd: mockOnCombatEnd,
      dispatch: mockDispatch,
      combatState: mockCombatState
    }));

    expect(result.current.weaponState.playerWeapon?.name).toBe('Colt Revolver');
    expect(result.current.weaponState.opponentWeapon?.name).toBe('Winchester Rifle');
    expect(result.current.weaponState.currentRange).toBe(15);
  });

  test('handles aim action', async () => {
    jest.mocked(processPlayerAction).mockResolvedValue({
      result: {
        type: 'aim',
        message: 'Player takes aim carefully',
        hit: false,
        roll: 0,
        modifiedRoll: 0,
        targetNumber: 0,
        newStrength: 10
      },
      turnResult: {
        updatedCharacter: null,
        logEntry: {
          text: 'Player takes aim carefully',
          type: 'info',
          timestamp: Date.now()
        },
        shouldEndCombat: false
      }
    });

    const { result } = renderHook(() => useWeaponCombat({
      playerCharacter: mockPlayer,
      opponent: mockOpponent,
      onCombatEnd: mockOnCombatEnd,
      dispatch: mockDispatch,
      combatState: mockCombatState
    }));

    expect(result.current.canAim).toBe(true);

    await act(async () => {
      await result.current.processAction({ type: 'aim' });
    });

    expect(result.current.weaponState.roundLog[0].text)
      .toContain('takes aim carefully');
    expect(result.current.isProcessing).toBe(false);
  });

  test('processes weapon malfunction', async () => {
    jest.mocked(processPlayerAction).mockResolvedValue({
      result: {
        type: 'fire',
        message: 'Weapon malfunctions',
        hit: false,
        roll: 10,
        modifiedRoll: 12,
        targetNumber: 15,
        newStrength: 10
      },
      turnResult: {
        updatedCharacter: null,
        logEntry: {
          text: 'Weapon malfunctions',
          type: 'info',
          timestamp: Date.now()
        },
        shouldEndCombat: false
      }
    });

    const { result } = renderHook(() => useWeaponCombat({
      playerCharacter: mockPlayer,
      opponent: mockOpponent,
      onCombatEnd: mockOnCombatEnd,
      dispatch: mockDispatch,
      combatState: mockCombatState
    }));

    await act(async () => {
      await result.current.processAction({ type: 'fire' });
    });

    expect(result.current.weaponState.roundLog[0].text)
      .toContain('malfunctions');
  });

  test('applies range modifiers correctly', async () => {
    jest.mocked(processPlayerAction).mockResolvedValue({
      result: {
        type: 'move',
        targetRange: 20,
        message: 'Player moves to 20 yards distance',
        hit: false,
        roll: 0,
        modifiedRoll: 0,
        targetNumber: 0,
        newStrength: 10
      },
      turnResult: {
        updatedCharacter: null,
        logEntry: {
          text: 'Player moves to 20 yards distance',
          type: 'info',
          timestamp: Date.now()
        },
        shouldEndCombat: false
      }
    });

    const { result } = renderHook(() => useWeaponCombat({
      playerCharacter: mockPlayer,
      opponent: mockOpponent,
      onCombatEnd: mockOnCombatEnd,
      dispatch: mockDispatch,
      combatState: mockCombatState
    }));

    await act(async () => {
      await result.current.processAction({ 
        type: 'move',
        targetRange: 20 
      });
    });

    expect(result.current.weaponState.currentRange).toBe(20);
    expect(result.current.weaponState.roundLog[0].text)
      .toContain('moves to 20 yards distance');
  });

  test('processes combat end on fatal hit', async () => {
    // Mock the processPlayerAction to simulate a fatal hit
    jest.mocked(processPlayerAction).mockResolvedValue({
      result: {
        hit: true,
        damage: 6,
        type: 'fire',
        roll: 15,
        modifiedRoll: 17,
        targetNumber: 10,
        newStrength: 0,
        message: 'Fatal hit!'
      },
      turnResult: {
        updatedCharacter: {
          ...mockOpponent,
          attributes: { ...mockOpponent.attributes, strength: 0 }
        },
        logEntry: {
          text: 'Fatal hit!',
          type: 'hit',
          timestamp: Date.now()
        },
        shouldEndCombat: true
      }
    });

    const { result } = renderHook(() => useWeaponCombat({
      playerCharacter: mockPlayer,
      opponent: mockOpponent,
      onCombatEnd: mockOnCombatEnd,
      dispatch: mockDispatch,
      combatState: mockCombatState
    }));

    await act(async () => {
      await result.current.processAction({ type: 'fire' });
    });

    // Verify that combat end was triggered
    expect(mockOnCombatEnd).toHaveBeenCalledWith(
      'player',
      expect.any(String)
    );
  });

  test('maintains action availability states', async () => {
    const { result } = renderHook(() => useWeaponCombat({
      playerCharacter: mockPlayer,
      opponent: mockOpponent,
      onCombatEnd: mockOnCombatEnd,
      dispatch: mockDispatch,
      combatState: mockCombatState
    }));

    expect(result.current.canFire).toBe(true);
    expect(result.current.canReload).toBe(true);

    await act(async () => {
      await result.current.processAction({ type: 'aim' });
    });

    // Should still be able to fire after aiming
    expect(result.current.canFire).toBe(true);
  });

  test('handles reload action', async () => {
    jest.mocked(processPlayerAction).mockResolvedValue({
      result: {
        type: 'reload',
        message: 'Player reloads Colt Revolver',
        hit: false,
        roll: 0,
        modifiedRoll: 0,
        targetNumber: 0,
        newStrength: 10
      },
      turnResult: {
        updatedCharacter: null,
        logEntry: {
          text: 'Player reloads Colt Revolver',
          type: 'info',
          timestamp: Date.now()
        },
        shouldEndCombat: false
      }
    });

    const { result } = renderHook(() => useWeaponCombat({
      playerCharacter: mockPlayer,
      opponent: mockOpponent,
      onCombatEnd: mockOnCombatEnd,
      dispatch: mockDispatch,
      combatState: mockCombatState
    }));

    await act(async () => {
      await result.current.processAction({ type: 'reload' });
    });

    expect(result.current.weaponState.roundLog[0].text)
      .toContain('reloads Colt Revolver');
    expect(result.current.isProcessing).toBe(false);
  });
});
