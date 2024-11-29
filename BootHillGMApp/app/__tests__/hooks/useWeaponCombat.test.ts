import { renderHook, act } from '@testing-library/react';
import { useWeaponCombat } from '../../hooks/useWeaponCombat';
import { WEAPON_STATS } from '../../types/combat';
import { Character } from '../../types/character';

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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with correct weapon state', () => {
    const { result } = renderHook(() => useWeaponCombat({
      playerCharacter: mockPlayer,
      opponent: mockOpponent,
      onCombatEnd: mockOnCombatEnd,
      dispatch: mockDispatch
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
      dispatch: mockDispatch
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
      dispatch: mockDispatch
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
      dispatch: mockDispatch
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
        strength: 1
      }
    };

    // Force a hit
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const { result } = renderHook(() => useWeaponCombat({
      playerCharacter: mockPlayer,
      opponent: weakOpponent,
      onCombatEnd: mockOnCombatEnd,
      dispatch: mockDispatch,
      debugMode: true // Enable debug mode to ensure hit
    }));

    await act(async () => {
      await result.current.processAction({ type: 'fire' });
    });

    expect(mockOnCombatEnd).toHaveBeenCalledWith(
      'player',
      expect.stringContaining('defeats')
    );
  });

  test('maintains action availability states', async () => {
    const { result } = renderHook(() => useWeaponCombat({
      playerCharacter: mockPlayer,
      opponent: mockOpponent,
      onCombatEnd: mockOnCombatEnd,
      dispatch: mockDispatch
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
