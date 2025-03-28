/**
 * Tests for character selector hooks
 */

import { renderHook } from '@testing-library/react';
import * as useGameModule from '../../hooks/useGame';
import { 
  usePlayerCharacter,
  useOpponentCharacter,
  usePlayerAttribute,
  usePlayerStrength,
  usePlayerHealth,
  usePlayerWounds,
  useIsPlayerWounded,
  usePlayerName,
  useOpponentName
} from '../../hooks/stateHooks';

// Mock the useGame hook
jest.mock('../../hooks/useGame', () => ({
  useGame: jest.fn()
}));

describe('Character Selector Hooks', () => {
  // Sample character state
  const sampleCharacterState = {
    player: {
      id: 'player-1',
      name: 'John Smith',
      attributes: {
        strength: 10,
        speed: 8,
        gunAccuracy: 7,
        throwingAccuracy: 6,
        baseStrength: 10,
        bravery: 7,
        experience: 3
      },
      wounds: [
        { id: 'wound-1', location: 'arm', severity: 2 },
        { id: 'wound-2', location: 'leg', severity: 1 }
      ]
    },
    opponent: {
      id: 'npc-1',
      name: 'Outlaw Pete',
      attributes: {
        strength: 9,
        speed: 7,
        gunAccuracy: 6,
        throwingAccuracy: 5,
        baseStrength: 9,
        bravery: 8,
        experience: 4
      },
      wounds: []
    }
  };
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation for useGame
    (useGameModule.useGame as jest.Mock).mockReturnValue({
      state: {
        character: sampleCharacterState
      },
      dispatch: jest.fn()
    });
  });
  
  test('usePlayerCharacter should return the player character', () => {
    const { result } = renderHook(() => usePlayerCharacter());
    
    expect(result.current).toEqual(sampleCharacterState.player);
    expect(result.current?.name).toBe('John Smith');
  });
  
  test('useOpponentCharacter should return the opponent character', () => {
    const { result } = renderHook(() => useOpponentCharacter());
    
    expect(result.current).toEqual(sampleCharacterState.opponent);
    expect(result.current?.name).toBe('Outlaw Pete');
  });
  
  test('usePlayerAttribute should return the requested attribute', () => {
    const { result: strengthResult } = renderHook(() => usePlayerAttribute('strength'));
    const { result: speedResult } = renderHook(() => usePlayerAttribute('speed'));
    
    expect(strengthResult.current).toBe(10);
    expect(speedResult.current).toBe(8);
  });
  
  test('usePlayerAttribute should handle missing attributes', () => {
    const { result } = renderHook(() => usePlayerAttribute('nonexistent'));
    
    expect(result.current).toBe(0);
  });
  
  test('usePlayerStrength should return the strength attribute', () => {
    const { result } = renderHook(() => usePlayerStrength());
    
    expect(result.current).toBe(10);
  });
  
  test('usePlayerHealth should calculate health correctly', () => {
    const { result } = renderHook(() => usePlayerHealth());
    
    // 10 (strength) - 3 (total wound severity)
    expect(result.current).toBe(7);
  });
  
  test('usePlayerHealth should handle no player', () => {
    // Mock no player
    (useGameModule.useGame as jest.Mock).mockReturnValue({
      state: {
        character: { player: null, opponent: null }
      },
      dispatch: jest.fn()
    });
    
    const { result } = renderHook(() => usePlayerHealth());
    
    expect(result.current).toBe(0);
  });
  
  test('usePlayerWounds should return all wounds', () => {
    const { result } = renderHook(() => usePlayerWounds());
    
    expect(result.current).toEqual(sampleCharacterState.player.wounds);
    expect(result.current.length).toBe(2);
  });
  
  test('useIsPlayerWounded should detect when player has wounds', () => {
    const { result } = renderHook(() => useIsPlayerWounded());
    
    expect(result.current).toBe(true);
  });
  
  test('useIsPlayerWounded should detect when player has no wounds', () => {
    // Mock player with no wounds
    (useGameModule.useGame as jest.Mock).mockReturnValue({
      state: {
        character: {
          ...sampleCharacterState,
          player: {
            ...sampleCharacterState.player,
            wounds: []
          }
        }
      },
      dispatch: jest.fn()
    });
    
    const { result } = renderHook(() => useIsPlayerWounded());
    
    expect(result.current).toBe(false);
  });
  
  test('usePlayerName should return the player name', () => {
    const { result } = renderHook(() => usePlayerName());
    
    expect(result.current).toBe('John Smith');
  });
  
  test('useOpponentName should return the opponent name', () => {
    const { result } = renderHook(() => useOpponentName());
    
    expect(result.current).toBe('Outlaw Pete');
  });
});
