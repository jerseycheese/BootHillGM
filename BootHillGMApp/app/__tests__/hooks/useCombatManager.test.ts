import { renderHook, act } from '@testing-library/react';
import { useCombatManager } from '../../hooks/useCombatManager';
import { createStateProtection } from '../../utils/stateProtection';
import { CampaignStateProvider } from '../../components/CampaignStateManager';
import { GameState } from '../../types/gameState';
import { Character } from '../../types/character';
import React from 'react';
import { setupMocks } from '../../test/setup/mockSetup';

// Mock state protection with simple async behavior
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
  ...partialCharacter,
  attributes: { ...partialCharacter.attributes },
  wounds: [...(partialCharacter.wounds || [])],
  isUnconscious: Boolean(partialCharacter.isUnconscious),
  isNPC: Boolean(partialCharacter.isNPC),
  isPlayer: Boolean(partialCharacter.isPlayer)
}) as Character;

// Mock initial state with proper GameState typing and deep object copies
const mockInitialState: GameState = {
  currentPlayer: 'Test Player',
  npcs: [],
  location: 'Test Location',
  inventory: [],
  quests: [],
  character: createCharacter({
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
  }),
  narrative: '',
  gameProgress: 0,
  journal: [],
  isCombatActive: false,
  opponent: createCharacter({
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
  }),
  savedTimestamp: Date.now(),
  isClient: true,
  suggestedActions: [],
  combatState: {
    isActive: false,
    combatType: null,
    winner: null,
    currentTurn: 'player',
    combatLog: [],
    participants: [],
    rounds: 0
  }
};

describe('useCombatManager', () => {
  const mockUpdateNarrative = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    const { mockLocalStorage } = setupMocks();
    
    // Set up initial state in localStorage before each test
    mockLocalStorage.setItem('campaignState', JSON.stringify({
      ...mockInitialState,
      savedTimestamp: Date.now()
    }));
  });

  const renderHookWithProvider = () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(CampaignStateProvider, null, children)
    );
    
    return renderHook(
      () => useCombatManager({ onUpdateNarrative: mockUpdateNarrative }),
      { wrapper }
    );
  };

  test('handles combat end with state protection', async () => {
    const { result } = renderHookWithProvider();
    
    // Wait for state to be loaded from localStorage
    await act(async () => {
      await Promise.resolve();
    });
    
    // Verify initial state matches mockInitialState
    expect(result.current.character?.name).toBe('Test Character');
    expect(result.current.opponent?.name).toBe('Unknown Opponent');
    expect(result.current.character).toEqual(mockInitialState.character);
    expect(result.current.opponent).toEqual(mockInitialState.opponent);
    // Verify combat state exists and has expected properties
    expect(result.current.combatState).toBeTruthy();
    const combatState = result.current.combatState;
    if (combatState) {
      expect({
        isActive: combatState.isActive,
        combatType: combatState.combatType,
        winner: combatState.winner,
        currentTurn: combatState.currentTurn,
        combatLog: combatState.combatLog,
        participants: combatState.participants,
        rounds: combatState.rounds
      }).toEqual(mockInitialState.combatState);
    }

    await act(async () => {
      await result.current.handleCombatEnd('player', 'Test combat results');
    });

    expect(mockUpdateNarrative).toHaveBeenCalledWith(
      'Test Character emerges victorious, defeating Unknown Opponent.'
    );
  });

  test('handles combat end error gracefully', async () => {
    // Temporarily suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock state protection to throw error
    (createStateProtection as jest.Mock).mockImplementationOnce(() => ({
      withProtection: jest.fn().mockRejectedValue(new Error('Test error')),
      getQueueLength: jest.fn(() => 0),
      isLocked: jest.fn(() => false),
      clearQueue: jest.fn()
    }));

    const { result } = renderHookWithProvider();

    await act(async () => {
      await result.current.handleCombatEnd('player', 'Test combat results');
    });

    expect(mockUpdateNarrative).toHaveBeenCalledWith(
      expect.stringContaining('error processing the combat end')
    );

    // Restore console.error
    consoleSpy.mockRestore();
  });

  test('tracks processing state correctly', async () => {
    // Mock state protection to control the timing
    let resolveOperation: () => void;
    const operationPromise = new Promise<void>(resolve => {
      resolveOperation = resolve;
    });

    (createStateProtection as jest.Mock).mockImplementationOnce(() => ({
      withProtection: jest.fn(() => operationPromise),
      getQueueLength: jest.fn(() => 0),
      isLocked: jest.fn(() => false),
      clearQueue: jest.fn()
    }));

    const { result } = renderHookWithProvider();

    expect(result.current.isProcessing).toBe(false);

    let combatEndPromise: Promise<void>;
    await act(async () => {
      combatEndPromise = Promise.resolve(result.current.handleCombatEnd('player', 'Test combat results'));
    });

    // isProcessing should be true after operation starts
    expect(result.current.isProcessing).toBe(true);

    await act(async () => {
      resolveOperation();
      await combatEndPromise;
    });

    expect(result.current.isProcessing).toBe(false);
  });

  test('provides combat queue length', () => {
    const mockStateProtection = {
      withProtection: jest.fn((key, fn) => fn()),
      getQueueLength: jest.fn().mockReturnValue(0),
      isLocked: jest.fn(() => false),
      clearQueue: jest.fn()
    };
    
    (createStateProtection as jest.Mock).mockReturnValue(mockStateProtection);
    
    const { result } = renderHookWithProvider();
    
    expect(mockStateProtection.getQueueLength).toHaveBeenCalled();
    expect(result.current.combatQueueLength).toBe(0);
  });
});
