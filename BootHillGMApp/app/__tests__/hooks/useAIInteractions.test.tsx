// First, set up the mock for AIService
jest.mock('../../services/ai', () => {
  return {
    AIService: jest.fn().mockImplementation(() => ({
      getAIResponse: jest.fn().mockImplementation(
        () => Promise.resolve({
          narrative: "Default mock response",
          acquiredItems: [],
          removedItems: [], 
          suggestedActions: []
        })
      )
    }))
  };
});

// Mock the narrative summary generation
jest.mock('../../utils/ai/narrativeSummary', () => ({
  generateNarrativeSummary: jest.fn().mockImplementation((input, narrative) => 
    // Return the actual format the hook is expecting
    Promise.resolve(`${narrative} ${input}.`)
  )
}));

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useAIInteractions, aiService } from '../../hooks/useAIInteractions';
import { GameState } from '../../types/gameState';
import { initialCharacterState } from '../../types/state/characterState';
import { initialCombatState } from '../../types/state/combatState';
import { initialInventoryState } from '../../types/state/inventoryState';
import { initialJournalState } from '../../types/state/journalState';
import { initialNarrativeState } from '../../types/state/narrativeState';
import { initialUIState } from '../../types/state/uiState';
import { LocationType } from '../../services/locationService';
import { AIResponse } from '../../services/ai/types';
import { Character } from '../../types/character';

describe('useAIInteractions', () => {
  const mockDispatch = jest.fn();
  const mockOnInventoryChange = jest.fn();
  
  const mockInitialState: GameState = {
    character: initialCharacterState,
    combat: initialCombatState,
    inventory: initialInventoryState,
    journal: initialJournalState,
    narrative: initialNarrativeState,
    ui: initialUIState,
    currentPlayer: '',
    npcs: [],
    location: { type: 'town', name: 'Test Town' } as LocationType,
    quests: [],
    gameProgress: 0,
    savedTimestamp: 0,
    isClient: false,
    suggestedActions: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleUserInput', () => {
    it('should process user input and update state with all response elements', async () => {
      const userInput = 'Hello AI';
      const mockResponse: AIResponse = {
        narrative: 'AI response narrative',
        location: { type: 'town', name: 'New Location' } as LocationType,
        acquiredItems: ['item1'],
        removedItems: [],
        suggestedActions: [
          { id: 'action-1', title: 'Action 1', type: 'optional', description: 'Test context' }
        ]
      };

      // Set up the mock using jest.spyOn
      jest.spyOn(aiService, 'getAIResponse').mockImplementation(() => Promise.resolve(mockResponse));

      const { result } = renderHook(() => useAIInteractions(
        mockInitialState,
        mockDispatch,
        mockOnInventoryChange
      ));

      await act(async () => {
        await result.current.handleUserInput(userInput);
      });

      // Verify the mock was called
      expect(aiService.getAIResponse).toHaveBeenCalled();
      
      // Verify narrative was updated
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SET_NARRATIVE',
          payload: { text: expect.stringContaining('AI response narrative') }
        })
      );
      
      // Verify journal update - test for structure only, not exact content
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'UPDATE_JOURNAL',
          payload: expect.objectContaining({
            content: userInput,
            type: 'narrative',
            // Don't assert specific content of narrativeSummary
            narrativeSummary: expect.any(String)
          })
        })
      );
      
      // Verify location update
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SET_LOCATION',
          payload: mockResponse.location
        })
      );
      
      // Verify item addition
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ADD_ITEM',
          payload: expect.objectContaining({ name: 'item1' })
        })
      );
      
      // Verify suggested actions
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SET_SUGGESTED_ACTIONS',
          payload: mockResponse.suggestedActions
        })
      );
      
      // Verify inventory change callback
      expect(mockOnInventoryChange).toHaveBeenCalledWith(['item1'], []);
      expect(result.current.error).toBeNull();
    });

    it('should handle combat initiation correctly', async () => {
      const mockOpponent: Partial<Character> = {
        id: 'opponent-1',
        name: 'Test Opponent',
        isNPC: true,
        isPlayer: false,
        attributes: {
          speed: 10,
          gunAccuracy: 8,
          throwingAccuracy: 7,
          strength: 10,
          baseStrength: 10,
          bravery: 8,
          experience: 5
        },
        wounds: [],
        isUnconscious: false,
        inventory: { items: [] },
        minAttributes: { speed: 1, gunAccuracy: 1, throwingAccuracy: 1, strength: 1, baseStrength: 1, bravery: 1, experience: 0 },
        maxAttributes: { speed: 20, gunAccuracy: 20, throwingAccuracy: 20, strength: 20, baseStrength: 20, bravery: 20, experience: 100 },
        strengthHistory: { baseStrength: 10, changes: [] },
        weapon: undefined
      };

      const mockResponse: AIResponse = {
        narrative: 'Combat starts',
        combatInitiated: true,
        opponent: mockOpponent as Character,
        acquiredItems: [],
        removedItems: [],
        suggestedActions: []
      };

      // Set up the mock using jest.spyOn
      jest.spyOn(aiService, 'getAIResponse').mockImplementation(() => Promise.resolve(mockResponse));

      const { result } = renderHook(() => useAIInteractions(
        mockInitialState,
        mockDispatch,
        mockOnInventoryChange
      ));

      await act(async () => {
        await result.current.handleUserInput('attack');
      });

      // Verify opponent creation
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SET_OPPONENT',
          payload: expect.objectContaining({
            name: 'Test Opponent',
            isNPC: true,
            attributes: mockOpponent.attributes
          })
        })
      );
      
      // Verify combat state
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'UPDATE_COMBAT_STATE',
          payload: expect.objectContaining({
            isActive: true,
            combatType: null
          })
        })
      );
      
      // Verify combat active flag
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SET_COMBAT_ACTIVE',
          payload: true
        })
      );
    });
  });

  describe('retryLastAction', () => {
    it('should retry the last action successfully', async () => {
      const mockResponse: AIResponse = {
        narrative: 'Retry response',
        acquiredItems: [],
        removedItems: [],
        suggestedActions: []
      };

      // Set up the mock using jest.spyOn
      const spy = jest.spyOn(aiService, 'getAIResponse').mockImplementation(() => Promise.resolve(mockResponse));

      const { result } = renderHook(() => useAIInteractions(
        mockInitialState,
        mockDispatch,
        mockOnInventoryChange
      ));

      // First, set up last action
      await act(async () => {
        await result.current.handleUserInput('initial action');
      });

      // Verify first call happened
      expect(spy).toHaveBeenCalledTimes(1);
      
      // Reset mocks to isolate retry call
      mockDispatch.mockClear();
      
      // Then retry
      await act(async () => {
        await result.current.retryLastAction();
      });

      // Verify second call happened
      expect(spy).toHaveBeenCalledTimes(2);
      expect(result.current.error).toBeNull();
    });

    it('should not retry if there is no last action', async () => {
      // Set up the mock using jest.spyOn
      const spy = jest.spyOn(aiService, 'getAIResponse').mockImplementation(() => Promise.resolve({
        narrative: 'Test narrative',
        acquiredItems: [],
        removedItems: [],
        suggestedActions: []
      }));
      
      const { result } = renderHook(() => useAIInteractions(
        mockInitialState,
        mockDispatch,
        mockOnInventoryChange
      ));

      await act(async () => {
        await result.current.retryLastAction();
      });

      // Should not call API
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle AI service errors gracefully', async () => {
      // Set up the mock to throw an error
      jest.spyOn(aiService, 'getAIResponse').mockImplementation(() => Promise.reject(new Error('AI service error')));

      const { result } = renderHook(() => useAIInteractions(
        mockInitialState,
        mockDispatch,
        mockOnInventoryChange
      ));

      await act(async () => {
        await result.current.handleUserInput('test input');
      });

      // Error should be captured in state
      expect(result.current.error).toBe('AI service error');
      
      // No side effects on error
      expect(mockOnInventoryChange).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should handle undefined response values', async () => {
      const mockResponse: AIResponse = {
        narrative: 'Test narrative',
        acquiredItems: [],
        removedItems: [],
        suggestedActions: []
      };

      // Set up the mock
      jest.spyOn(aiService, 'getAIResponse').mockImplementation(() => Promise.resolve(mockResponse));

      const { result } = renderHook(() => useAIInteractions(
        mockInitialState,
        mockDispatch,
        mockOnInventoryChange
      ));

      await act(async () => {
        await result.current.handleUserInput('test input');
      });

      // Should not try to set location when undefined
      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SET_LOCATION'
        })
      );
    });
  });
});
