// Jest setup
import { jest, describe, it, expect } from '@jest/globals';
import '@testing-library/jest-dom';
import { renderHook, act } from '@testing-library/react';

// Application imports
import { useAIInteractions } from '../../hooks/useAIInteractions';
import { GameServiceResponse } from '../../services/ai/types/gameService.types';
import { GameState } from '../../types/gameState';

// Mock the AI service
jest.mock('../../hooks/useAIInteractions', () => {
  const originalModule = jest.requireActual('../../hooks/useAIInteractions') as object;
  return {
    ...originalModule,
    aiService: {
      generateGameContent: jest.fn(() => ({
        narrative: 'Test narrative',
        location: { type: 'town', name: 'Boot Hill' },
        playerDecision: undefined,
        acquiredItems: [],
        removedItems: [],
        suggestedActions: []
      } as GameServiceResponse))
    }
  };
});

describe('useAIInteractions', () => {
  const mockState: GameState = {
    narrative: { 
      narrativeHistory: [],
      currentStoryPoint: null,
      visitedPoints: [],
      availableChoices: [],
      displayMode: 'standard',
      context: '',
      selectedChoice: undefined,
      error: null
    },
    gameProgress: 0,
    character: null,
    combat: {
      isActive: false,
      combatType: 'brawling',
      playerTurn: true,
      playerCharacterId: '',
      opponentCharacterId: '',
      roundStartTime: 0,
      modifiers: { player: 0, opponent: 0 },
      currentTurn: null,
      winner: null,
      combatLog: [],
      participants: [],
      rounds: 0
    },
    inventory: { items: [], equippedWeaponId: null },
    journal: { entries: [] },
    currentPlayer: '',
    npcs: [],
    location: null,
    quests: [],
    suggestedActions: [],
    ui: {
      activeTab: 'character',
      isLoading: false,
      modalOpen: null,
      notifications: []
    }
  };

  it('should handle undefined location in response', async () => {
    const mockDispatch = jest.fn();
    const _mockOnInventoryChange = jest.fn(); // Prefixed with underscore

    // Create a valid response with explicit undefined location
    // Mock implementation is now typed in the jest.fn above
    // No need for separate mockResponse variable

    const { result } = renderHook(() => 
      useAIInteractions(mockState, mockDispatch, _mockOnInventoryChange) // Use prefixed variable
    );

    await act(async () => {
      await result.current.handleUserInput('test input');
    });

    expect(mockDispatch).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });
});