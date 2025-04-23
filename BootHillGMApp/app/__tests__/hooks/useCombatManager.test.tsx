import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useCombatManager } from '../../hooks/useCombatManager';
import { TestCampaignStateProvider } from '../utils/testWrappers';
import { Character } from '../../types/character';
import { CombatType } from '../../types/combat';
import * as useCombatStateModule from '../../hooks/combat/useCombatState';

// Mock the necessary combat hooks
jest.mock('../../hooks/combat/useCombatState', () => ({
  useCombatState: jest.fn(() => ({
    isProcessing: false,
    setIsProcessing: jest.fn(),
    isUpdatingRef: { current: false },
    combatQueueLength: 0,
    stateProtection: { 
      current: { 
        withProtection: jest.fn((key, fn) => fn()), 
        getQueueLength: jest.fn(() => 0) 
      } 
    }
  })),
}));

jest.mock('../../hooks/combat/useCombatActions', () => ({
  useCombatActions: jest.fn(() => ({
    handleStrengthChange: jest.fn(),
    executeCombatRound: jest.fn()
  })),
}));

// Mock state protection to avoid actual state operations
jest.mock('../../utils/stateProtection', () => ({
  createStateProtection: jest.fn(() => ({
    withProtection: jest.fn((key, fn) => fn()),
    getQueueLength: jest.fn(() => 0),
    isLocked: jest.fn(() => false),
    clearQueue: jest.fn()
  }))
}));

// Helper function to create a properly structured character
const createCharacter = (partialCharacter: Partial<Character>): Character => ({
  id: `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: partialCharacter.name || 'Unknown Character',
  attributes: { 
    strength: 10,
    baseStrength: 10,
    speed: 5,
    ...partialCharacter.attributes 
  },
  wounds: [...(partialCharacter.wounds || [])],
  isUnconscious: Boolean(partialCharacter.isUnconscious),
  isNPC: Boolean(partialCharacter.isNPC),
  isPlayer: Boolean(partialCharacter.isPlayer)
}) as Character;

// Create test characters
const testPlayer = createCharacter({
  name: 'Test Character',
  attributes: {
    speed: 5,
    gunAccuracy: 5,
    throwingAccuracy: 5,
    strength: 10,
    baseStrength: 10,
    bravery: 5,
    experience: 0
  },
  wounds: [],
  isUnconscious: false,
  isNPC: false,
  isPlayer: true
});

const testOpponent = createCharacter({
  name: 'Unknown Opponent',
  attributes: {
    speed: 5,
    gunAccuracy: 5,
    throwingAccuracy: 5,
    strength: 10,
    baseStrength: 10,
    bravery: 5,
    experience: 0
  },
  wounds: [],
  isUnconscious: false,
  isNPC: true,
  isPlayer: false
});

describe('useCombatManager', () => {
  const mockUpdateNarrative = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handles combat end with state protection', async () => {
    // Create initial test state with player and opponent
    const initialState = {
      character: {
        player: testPlayer
      },
      combat: {
        opponent: testOpponent,
        isActive: true,
        combatType: 'brawling' as CombatType,
        rounds: 0,
        currentTurn: 'player'
      }
    };
    
    // Render with our test wrapper
    const { result } = renderHook(
      () => useCombatManager({ onUpdateNarrative: mockUpdateNarrative }), 
      { 
        wrapper: ({ children }) => (
          <TestCampaignStateProvider initialState={initialState}>
            {children}
          </TestCampaignStateProvider>
        )
      }
    );
    
    // Make sure the combat manager has necessary properties
    expect(result.current).toBeDefined();
    
    // Verify character data access
    expect(result.current.character?.player?.name).toBe('Test Character');
    expect(result.current.combat?.opponent?.name).toBe('Unknown Opponent');
    
    // Call handleCombatEnd and verify it works
    await act(async () => {
      await result.current.handleCombatEnd('player', 'Test combat results');
    });

    // Should have called the narrative updater
    expect(mockUpdateNarrative).toHaveBeenCalledWith('Test combat results');
    expect(mockUpdateNarrative).toHaveBeenCalledWith(
      expect.stringContaining('Test Character emerges victorious')
    );
  });

  test('handles combat end error gracefully', async () => {
    // Temporarily suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { /* Intentionally empty */ });
    
    // Mock the stateProtection to throw an error for this test
    const mockWithProtection = jest.fn().mockRejectedValue(new Error('Test error'));
    jest.spyOn(useCombatStateModule, 'useCombatState')
      .mockReturnValue({
        isProcessing: false,
        setIsProcessing: jest.fn(),
        isUpdatingRef: { current: false },
        combatQueueLength: 0,
        stateProtection: { 
          current: { 
            withProtection: mockWithProtection,
            getQueueLength: jest.fn(() => 0) 
          } 
        }
      });

    // Create initial test state
    const initialState = {
      character: {
        player: testPlayer
      },
      combat: {
        opponent: testOpponent,
        isActive: true,
        combatType: 'brawling' as CombatType
      }
    };
    
    // Render with our test wrapper
    const { result } = renderHook(
      () => useCombatManager({ onUpdateNarrative: mockUpdateNarrative }), 
      { 
        wrapper: ({ children }) => (
          <TestCampaignStateProvider initialState={initialState}>
            {children}
          </TestCampaignStateProvider>
        )
      }
    );

    // Verify we can still access the combat manager methods
    expect(result.current.handleCombatEnd).toBeDefined();
    
    // Test behavior still works without causing test failure
    await act(async () => {
      await result.current.handleCombatEnd('player', 'Test combat results');
    });

    // Should call updateNarrative with an error message
    expect(mockUpdateNarrative).toHaveBeenCalledWith(
      expect.stringContaining('error processing the combat end')
    );

    // Restore console.error
    consoleSpy.mockRestore();
    
    // Reset the mock to its default behavior
    jest.spyOn(useCombatStateModule, 'useCombatState')
      .mockReturnValue({
        isProcessing: false,
        setIsProcessing: jest.fn(),
        isUpdatingRef: { current: false },
        combatQueueLength: 0,
        stateProtection: { 
          current: { 
            withProtection: jest.fn((key, fn) => fn()),
            getQueueLength: jest.fn(() => 0) 
          } 
        }
      });
  });
});
