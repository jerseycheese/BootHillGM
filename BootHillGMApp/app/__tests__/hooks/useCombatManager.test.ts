import { renderHook, act } from '@testing-library/react';
import { useCombatManager, formatCombatEndMessage } from '../../hooks/useCombatManager';
import { createStateProtection } from '../../utils/stateProtection';
import { CampaignStateProvider } from '../../components/CampaignStateManager';
import { GameState } from '../../utils/gameEngine';
import { Character } from '../../types/character';
import { ensureCombatState } from '../../types/combat';
import React from 'react';

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
  ...partialCharacter,
  attributes: { ...partialCharacter.attributes },
  skills: { ...partialCharacter.skills },
  wounds: [...(partialCharacter.wounds || [])],
  isUnconscious: Boolean(partialCharacter.isUnconscious)
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
    skills: {
      shooting: 50,
      riding: 50,
      brawling: 50
    },
    wounds: [],
    isUnconscious: false
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
    skills: {
      shooting: 50,
      riding: 50,
      brawling: 50
    },
    wounds: [],
    isUnconscious: false
  }),
  savedTimestamp: Date.now(),
  isClient: true,
  suggestedActions: [],
  combatState: ensureCombatState({
    isActive: false,
    combatType: null,
    winner: null,
    summary: null,
    playerStrength: 10,
    opponentStrength: 10,
    currentTurn: 'player',
    combatLog: []
  })
};

describe('useCombatManager', () => {
  const mockUpdateNarrative = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock sessionStorage to ensure we're not in initialization mode
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn((key) => {
          if (key === 'initializing_new_character') return null;
          return null;
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        length: 0,
        key: jest.fn(),
      },
      writable: true
    });

    // Mock localStorage with properly structured state
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => {
          if (key === 'campaignState') {
            // Create a properly structured state that matches what the reducer expects
            const state = {
              ...mockInitialState,
              character: mockInitialState.character ? createCharacter(mockInitialState.character) : null,
              opponent: mockInitialState.opponent ? createCharacter(mockInitialState.opponent) : null,
              isCombatActive: Boolean(mockInitialState.isCombatActive),
              isClient: true,
              savedTimestamp: Date.now(),
              inventory: mockInitialState.inventory.map(item => ({ ...item })),
              journal: [...mockInitialState.journal],
              combatState: mockInitialState.combatState ? ensureCombatState(mockInitialState.combatState) : undefined
            };
            return JSON.stringify(state);
          }
          return null;
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        length: 0,
        key: jest.fn(),
      },
      writable: true
    });
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
    
    // Verify initial state
    expect(result.current.character?.name).toBe('Test Character');
    expect(result.current.opponent?.name).toBe('Unknown Opponent');

    await act(async () => {
      await result.current.handleCombatEnd('player', 'Test summary');
    });

    expect(mockUpdateNarrative).toHaveBeenCalledWith(
      expect.stringContaining('Test Character emerges victorious, defeating Unknown Opponent.')
    );
  });

  test('handles combat end error gracefully', async () => {
    // Mock state protection to throw error
    (createStateProtection as jest.Mock).mockImplementationOnce(() => ({
      withProtection: jest.fn().mockRejectedValue(new Error('Test error')),
      getQueueLength: jest.fn(() => 0),
      isLocked: jest.fn(() => false),
      clearQueue: jest.fn()
    }));

    const { result } = renderHookWithProvider();

    await act(async () => {
      await result.current.handleCombatEnd('player', 'Test summary');
    });

    expect(mockUpdateNarrative).toHaveBeenCalledWith(
      expect.stringContaining('error processing the combat end')
    );
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
      combatEndPromise = Promise.resolve(result.current.handleCombatEnd('player', 'Test summary'));
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

  // New tests for formatCombatEndMessage
  describe('formatCombatEndMessage', () => {
    test('formats victory message correctly', () => {
      const message = formatCombatEndMessage(
        'player',
        'with a powerful strike',
        'Test Character',
        'Unknown Opponent'
      );
      expect(message).toBe('Test Character emerges victorious, defeating Unknown Opponent with a powerful strike.');
    });

    test('formats defeat message correctly', () => {
      const message = formatCombatEndMessage(
        'opponent',
        'with a devastating blow',
        'Test Character',
        'Unknown Opponent'
      );
      expect(message).toBe('Unknown Opponent emerges victorious, defeating Test Character with a devastating blow.');
    });

    test('removes redundant roll information', () => {
      const message = formatCombatEndMessage(
        'player',
        'lands the final blow [Roll: 10/20 - Critical!]',
        'Test Character',
        'Unknown Opponent'
      );
      expect(message).toBe('Test Character emerges victorious, defeating Unknown Opponent lands the final blow.');
    });

    test('handles empty combat summary', () => {
      const message = formatCombatEndMessage(
        'player',
        '',
        'Test Character',
        'Unknown Opponent'
      );
      expect(message).toBe('Test Character emerges victorious, defeating Unknown Opponent.');
    });

    test('handles null combat summary', () => {
      const message = formatCombatEndMessage(
        'player',
        null,
        'Test Character',
        'Unknown Opponent'
      );
      expect(message).toBe('Test Character emerges victorious, defeating Unknown Opponent.');
    });
  });

  test('processes complete combat round with player and opponent actions', async () => {
    // Mock random choice for opponent
    jest.spyOn(global.Math, 'random').mockReturnValue(0.5);

    const { result } = renderHook(() =>
      useBrawlingCombat({
        playerCharacter: mockPlayer,
        opponent: mockOpponent,
        onCombatEnd: mockOnCombatEnd,
        dispatch: mockDispatch
      })
    );

    await act(async () => {
      await result.current.processRound(true, true);
    });

    // Should have two log entries (player + opponent actions)
    expect(result.current.brawlingState.roundLog).toHaveLength(2);
    
    // Verify round advanced
    expect(result.current.brawlingState.round).toBe(2);

    // Verify both player and opponent actions were processed
    const [playerEntry, opponentEntry] = result.current.brawlingState.roundLog;
    expect(playerEntry.text).toContain('Player');
    expect(opponentEntry.text).toContain('Opponent');

    // Verify dispatch was called twice (once for each character update)
    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });

  test('ends combat when knockout occurs', async () => {
    // Mock a powerful hit that causes knockout
    jest.spyOn(require('../../utils/brawlingSystem'), 'resolveBrawlingRound')
      .mockReturnValueOnce({
        roll: 20,
        result: 'Critical Hit',
        damage: 10, // High damage to trigger knockout
        location: 'head',
        nextRoundModifier: 0
      });

    const { result } = renderHook(() =>
      useBrawlingCombat({
        playerCharacter: mockPlayer,
        opponent: mockOpponent,
        onCombatEnd: mockOnCombatEnd,
        dispatch: mockDispatch
      })
    );

    await act(async () => {
      await result.current.processRound(true, true);
    });

    // Verify combat ended
    expect(mockOnCombatEnd).toHaveBeenCalledWith(
      'player',
      expect.stringContaining('emerges victorious')
    );

    // Verify only one action was processed (combat ended before opponent's turn)
    expect(result.current.brawlingState.roundLog).toHaveLength(1);
  });

  test('handles multiple rounds of combat', async () => {
    const { result } = renderHook(() =>
      useBrawlingCombat({
        playerCharacter: mockPlayer,
        opponent: mockOpponent,
        onCombatEnd: mockOnCombatEnd,
        dispatch: mockDispatch
      })
    );

    // Process first round
    await act(async () => {
      await result.current.processRound(true, true);
    });

    expect(result.current.brawlingState.round).toBe(2);

    // Process second round
    await act(async () => {
      await result.current.processRound(true, false); // Try grapple this time
    });

    // Should have 4 log entries total (2 per round)
    expect(result.current.brawlingState.roundLog).toHaveLength(4);

    // Verify round sequence
    const logEntries = result.current.brawlingState.roundLog;
    expect(logEntries[0].text).toContain('Player');
    expect(logEntries[1].text).toContain('Opponent');
    expect(logEntries[2].text).toContain('Player');
    expect(logEntries[3].text).toContain('Opponent');
  });

  test('respects processing state during combat', async () => {
    const { result } = renderHook(() =>
      useBrawlingCombat({
        playerCharacter: mockPlayer,
        opponent: mockOpponent,
        onCombatEnd: mockOnCombatEnd,
        dispatch: mockDispatch
      })
    );

    // Start processing a round
    const roundPromise = act(async () => {
      await result.current.processRound(true, true);
    });

    // Verify processing state is true during combat
    expect(result.current.isProcessing).toBe(true);

    // Wait for round to complete
    await roundPromise;

    // Verify processing state is false after combat
    expect(result.current.isProcessing).toBe(false);
  });
});
