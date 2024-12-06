import { renderHook, act } from '@testing-library/react';
import { useWeaponCombat } from '../../hooks/useWeaponCombat';
import { Character } from '../../types/character';
import { InventoryItem } from '../../types/inventory';
import { CombatState } from '../../types/combat';

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
    skills: {
      shooting: 50,
      riding: 50,
      brawling: 50
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
    const { result } = renderHook(() => useWeaponCombat({
      playerCharacter: mockPlayer,
      opponent: mockOpponent,
      onCombatEnd: mockOnCombatEnd,
      dispatch: mockDispatch,
      combatState: mockCombatState
    }));

    // First verify initial state
    expect(result.current.canAim).toBe(true);

    await act(async () => {
      await result.current.processAction({ type: 'aim' });
    });

    expect(result.current.weaponState.roundLog[0].text)
      .toContain('takes aim carefully');
    expect(result.current.isProcessing).toBe(false);
  });

  test('processes weapon malfunction', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.96); // Force malfunction

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
    const weakOpponent = {
      ...mockOpponent,
      attributes: {
        ...mockOpponent.attributes,
        strength: 1  // Keep opponent very weak
      }
    };

    // Mock both the hit chance and damage rolls
    const mockRolls = [
      0.5,  // First roll for hit check (will hit)
      0.9,  // High roll for damage to ensure fatal hit
      0.9   // Second damage die roll
    ];
    let rollIndex = 0;
    jest.spyOn(Math, 'random').mockImplementation(() => mockRolls[rollIndex++]);

    const { result } = renderHook(() => useWeaponCombat({
      playerCharacter: mockPlayer,
      opponent: weakOpponent,
      onCombatEnd: mockOnCombatEnd,
      dispatch: mockDispatch,
      combatState: {
        ...mockCombatState,
        opponentStrength: 1  // Ensure combat state also reflects weak opponent
      }
    }));

    await act(async () => {
      await result.current.processAction({ type: 'fire' });
    });

    expect(mockOnCombatEnd).toHaveBeenCalledWith(
      'player',
      expect.stringContaining('defeat')
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
});
