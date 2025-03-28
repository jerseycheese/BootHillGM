import { renderHook, act } from '@testing-library/react';
import { useCombatManager } from '../../hooks/useCombatManager';
import { createStateProtection } from '../../utils/stateProtection';
import { CampaignStateProvider, useCampaignState } from '../../components/CampaignStateManager';
import { GameState } from '../../types/gameState';
import { Character } from '../../types/character';
import React from 'react';
import { setupMocks } from '../../test/setup/mockSetup';
import { adaptStateForTests } from '../../utils/stateAdapters';
import { CombatType } from '../../types/combat';

// Override useCampaignState to provide our test state
jest.mock('../../components/CampaignStateManager', () => {
  const originalModule = jest.requireActual('../../components/CampaignStateManager');
  return {
    ...originalModule,
    useCampaignState: jest.fn()
  };
});

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

// Create player and opponent characters
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

// Create the combat state that the test is expecting
const testCombatState = {
  isActive: false,
  // Using proper CombatType, which is a union type of 'brawling' | 'weapon' | null
  combatType: 'brawling' as CombatType,
  rounds: 0,
  playerTurn: true,
  playerCharacterId: '',
  opponentCharacterId: '',
  combatLog: [],
  roundStartTime: 0,
  modifiers: { player: 0, opponent: 0 },
  // Using the correct type for currentTurn
  currentTurn: null
};

// Create a state that works with both old and new access patterns
const mockSliceBasedState: GameState = {
  character: {
    player: testPlayer,
    opponent: testOpponent
  },
  inventory: {
    items: []
  },
  journal: {
    entries: []
  },
  combat: testCombatState,
  narrative: {
    currentStoryPoint: null,
    visitedPoints: [],
    availableChoices: [],
    narrativeHistory: [],
    displayMode: 'standard',
    error: null
  },
  ui: {
    isLoading: false,
    modalOpen: null,
    notifications: []
  },
  currentPlayer: '',
  npcs: [],
  location: null,
  quests: [],
  gameProgress: 0,
  suggestedActions: [],
  savedTimestamp: Date.now(),
  isClient: true,
  // Add these getters for backward compatibility
  get player() { return this.character?.player ?? null; },
  get opponent() { return this.character?.opponent ?? null; },
  get isCombatActive() { return this.combat?.isActive ?? false; }
};

// Process the state through the adapters to ensure it has all expected properties
const adaptedMockState = adaptStateForTests(mockSliceBasedState);

describe('useCombatManager', () => {
  const mockUpdateNarrative = jest.fn();
  const mockDispatch = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    const { mockLocalStorage } = setupMocks();
    
    // Set up initial state in localStorage
    mockLocalStorage.setItem('campaignState', JSON.stringify(adaptedMockState));
    
    // Mock the return value of useCampaignState
    (useCampaignState as jest.Mock).mockReturnValue({
      state: adaptedMockState,
      dispatch: mockDispatch,
      player: testPlayer,
      opponent: testOpponent,
      inventory: [],
      journal: { entries: [] }
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
    
    // Wait for state to be loaded from localStorage
    await act(async () => {
      await Promise.resolve();
    });
    
    // Check the player and opponent names
    expect(result.current.player?.name).toBe('Test Character');
    expect(result.current.opponent?.name).toBe('Unknown Opponent');
    
    // Verify combat state exists with expected properties
    expect(result.current.combat).toBeTruthy();
    const combatState = result.current.combat;
    if (combatState) {
      expect(combatState.isActive).toBe(false);
      expect(combatState.rounds).toBe(0);
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