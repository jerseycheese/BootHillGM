import { renderHook, act } from '@testing-library/react';
import useCharacterStats from './useCharacterStats';
import { Character } from '../types/character';

const mockCharacter: Character = {
  id: 'test',
  name: 'Test Character',
  attributes: {
    speed: 5,
    gunAccuracy: 5,
    throwingAccuracy: 5,
    strength: 10,
    baseStrength: 10,
    bravery: 5,
    experience: 0,
  },
  wounds: [],
  isUnconscious: false,
  inventory: [],
};

describe('useCharacterStats', () => {
  it('initializes with null character', () => {
    const { result } = renderHook(() => useCharacterStats());
    expect(result.current.character).toBeNull();
  });

  it('sets character correctly', () => {
    const { result } = renderHook(() => useCharacterStats());
    act(() => {
      result.current.setCharacter(mockCharacter);
    });
    expect(result.current.character).toEqual(mockCharacter);
  });

  it('updates stat within valid range', () => {
    const { result } = renderHook(() => useCharacterStats());
    act(() => {
      result.current.setCharacter(mockCharacter);
    });
    act(() => {
      result.current.updateStat('speed', 6);
    });
    expect(result.current.character?.attributes.speed).toBe(6);
  });

  it('does not update stat outside valid range', () => {
    const { result } = renderHook(() => useCharacterStats());
    act(() => {
      result.current.setCharacter(mockCharacter);
    });
    act(() => {
      result.current.updateStat('speed', 11);
    });
    expect(result.current.character?.attributes.speed).toBe(5);
  });

  it('calculates derived stats correctly', () => {
    const { result } = renderHook(() => useCharacterStats());
    act(() => {
      result.current.setCharacter(mockCharacter);
    });
    expect(result.current.derivedStats.hitPoints).toBe(20);
  });
});
