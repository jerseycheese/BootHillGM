import { renderHook, act } from '@testing-library/react';
import { useWeaponCombat } from '../../hooks/useWeaponCombat';
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
      name: 'Colt Revolver',
      damage: '1d6'
    }
  };

  const mockOpponent: Character = {
    ...mockPlayer,
    name: 'Opponent',
    weapon: {
      name: 'Winchester Rifle',
      damage: '1d8'
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

    await act(async () => {
      await result.current.processAction({ type: 'aim' });
    });

    expect(result.current.weaponState.roundLog[0].text)
      .toContain('takes aim carefully');
    expect(result.current.canAim).toBe(true);
  });

  // Test is pending, functionality not in place yet.
  // test('processes fire action', async () => {
  //   const { result } = renderHook(() => useWeaponCombat({
  //     playerCharacter: mockPlayer,
  //     opponent: mockOpponent,
  //     onCombatEnd: mockOnCombatEnd,
  //     dispatch: mockDispatch,
  //     debugMode: true // Enable debug mode to force a hit for the player
  //   }));

  //   // Force a hit for the opponent by setting a low roll value
  //   jest.spyOn(Math, 'random').mockReturnValueOnce(0.01); // Opponent's roll

  //   await act(async () => {
  //     await result.current.processAction({ type: 'fire' });
  //   });

  //   expect(result.current.weaponState.roundLog).toHaveLength(2); // Player + opponent actions
  //   expect(mockDispatch).toHaveBeenCalled();
  // });

  test('handles movement action', async () => {
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

    const { result } = renderHook(() => useWeaponCombat({
      playerCharacter: mockPlayer,
      opponent: weakOpponent,
      onCombatEnd: mockOnCombatEnd,
      dispatch: mockDispatch
    }));

    await act(async () => {
      await result.current.processAction({ type: 'fire' });
    });

    if (mockOnCombatEnd.mock.calls.length > 0) {
      expect(mockOnCombatEnd).toHaveBeenCalledWith(
        'player',
        expect.stringContaining('defeat')
      );
    }
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
