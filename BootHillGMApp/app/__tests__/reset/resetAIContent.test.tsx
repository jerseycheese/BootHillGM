/**
 * Reset AI Content Test
 * 
 * This test specifically verifies that the reset process properly generates
 * AI content and summaries rather than using hardcoded text or truncated content.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AIService } from '../../services/ai/aiService';
import GameControlSection from '../../components/Debug/GameControlSection';
import { setupLocalStorageMock, resetLocalStorageMock } from '../../test/utils/mockLocalStorage';
import { 
  createTestGameState, 
  createTestCharacter, 
  createTestInventoryItem,
  createTestNarrativeState
} from '../../utils/initialization/testHelpers';

// Mock AIService
jest.mock('../../services/ai/aiService');
const MockAIService = AIService as jest.MockedClass<typeof AIService>;

// Mock GameStorage
jest.mock('../../utils/gameStorage');

// Mock useGameInitialization to avoid actual initialization
jest.mock('../../hooks/useGameInitialization', () => ({
  useGameInitialization: jest.fn().mockReturnValue({
    isInitializing: false,
    isClient: true
  })
}));

// Mock timeout/intervals
jest.useFakeTimers();

describe('Reset AI Content Generation', () => {
  // Set up localStorage mock for all tests
  beforeAll(() => {
    setupLocalStorageMock();
  });
  
  beforeEach(() => {
    resetLocalStorageMock();
    jest.clearAllMocks();
    
    // Set up mock AIService implementation
    MockAIService.prototype.generateGameContent.mockResolvedValue({
      narrative: 'The dusty streets of Boot Hill welcome John Smith as the frontier town bustles with activity. Weathered buildings line the main road, while locals and travelers move about their business with caution and purpose.',
      suggestedActions: [
        { id: 'action1', title: 'Look around', description: 'Survey your surroundings', type: 'optional' }
      ],
      location: { type: 'town', name: 'Boot Hill' },
      acquiredItems: [],
      removedItems: [],
      opponent: null
    });
    
    // Set up distinct summary that's clearly not the first sentence
    MockAIService.prototype.generateNarrativeSummary.mockResolvedValue(
      'John Smith arrives in the frontier town of Boot Hill, where activity fills the dusty streets and wary locals observe newcomers.'
    );
  });

  it('should generate AI content and proper summaries during reset', async () => {
    // Set up initial game state with character data
    const character = createTestCharacter({
      id: 'test-character-id',
      name: 'John Smith'
    });
    
    const narrativeState = createTestNarrativeState({
      narrativeHistory: ['Old narrative content that should be replaced']
    });

    const initialState = createTestGameState({
      character: {
        player: character,
        opponent: null
      },
      narrative: narrativeState,
      journal: {
        entries: [{
          id: 'old-entry',
          type: 'narrative',
          timestamp: Date.now() - 10000,
          title: 'Old Adventure',
          content: 'Old content that should be replaced',
          narrativeSummary: 'Old summary that should be replaced'
        }]
      }
    });

    // Set up mock dispatch function to capture actions
    const mockDispatch = jest.fn();
    const setLoading = jest.fn();
    const setError = jest.fn();
    const setLoadingIndicator = jest.fn();
    
    // Render the GameControlSection component
    render(
      <GameControlSection
        dispatch={mockDispatch}
        loading={null}
        setLoading={setLoading}
        setError={setError}
        setLoadingIndicator={setLoadingIndicator}
        gameState={initialState}
      />
    );

    // Trigger reset by clicking the reset button
    fireEvent.click(screen.getByText('Reset Game'));
    
    // Advance timers to simulate the reset process completing
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    
    // Wait for the reset process to complete
    await waitFor(() => {
      // Verify AIService was called to generate content
      expect(MockAIService.prototype.generateGameContent).toHaveBeenCalled();
      
      // Verify AIService was called to generate a summary
      expect(MockAIService.prototype.generateNarrativeSummary).toHaveBeenCalled();
      
      // Verify that narrative was dispatched to state
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: 'ADD_NARRATIVE_HISTORY',
        payload: expect.any(String)
      }));
      
      // Verify that journal entry was dispatched with proper summary
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: 'journal/ADD_ENTRY',
        payload: expect.objectContaining({
          type: 'narrative',
          content: expect.any(String),
          narrativeSummary: expect.any(String)
        })
      }));
    });
    
    // Check localStorage for properly saved content
    const narrative = JSON.parse(localStorage.getItem('narrative') || 'null');
    const journal = JSON.parse(localStorage.getItem('journal') || '[]');
    
    // Verify narrative was stored in localStorage
    expect(narrative).toBeTruthy();
    
    // Verify journal entry was stored with the proper AI-generated summary
    expect(journal.length).toBe(1);
    expect(journal[0].narrativeSummary).toBe(
      'John Smith arrives in the frontier town of Boot Hill, where activity fills the dusty streets and wary locals observe newcomers.'
    );
    
    // Verify the summary is NOT just the first sentence of the narrative
    const firstSentence = 'The dusty streets of Boot Hill welcome John Smith as the frontier town bustles with activity.';
    expect(journal[0].narrativeSummary).not.toBe(firstSentence);
  });
  
  it('should handle AI generation failure gracefully during reset', async () => {
    // Set up mock to simulate AI generation failure
    MockAIService.prototype.generateNarrativeSummary.mockRejectedValue(
      new Error('AI generation failed')
    );
    
    // Set up initial game state with character data
    const character = createTestCharacter({
      id: 'test-character-id',
      name: 'John Smith'
    });
    
    const narrativeState = createTestNarrativeState({
      narrativeHistory: ['Old narrative content that should be replaced']
    });

    const initialState = createTestGameState({
      character: {
        player: character,
        opponent: null
      },
      narrative: narrativeState,
      journal: {
        entries: []
      }
    });

    // Set up mock dispatch function to capture actions
    const mockDispatch = jest.fn();
    const setLoading = jest.fn();
    const setError = jest.fn();
    const setLoadingIndicator = jest.fn();
    
    // Render the GameControlSection component
    render(
      <GameControlSection
        dispatch={mockDispatch}
        loading={null}
        setLoading={setLoading}
        setError={setError}
        setLoadingIndicator={setLoadingIndicator}
        gameState={initialState}
      />
    );

    // Trigger reset by clicking the reset button
    fireEvent.click(screen.getByText('Reset Game'));
    
    // Advance timers to simulate the reset process completing
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    
    // Wait for the reset process to complete
    await waitFor(() => {
      // Verify that journal entry was still dispatched despite summary failure
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: 'journal/ADD_ENTRY',
        payload: expect.objectContaining({
          type: 'narrative',
          narrativeSummary: expect.any(String)
        })
      }));
    });
    
    // Check localStorage for the journal entry
    const journal = JSON.parse(localStorage.getItem('journal') || '[]');
    
    // Verify journal entry has a fallback summary that's not just the first sentence
    expect(journal.length).toBe(1);
    expect(journal[0].narrativeSummary).toContain('John Smith');
    
    // Verify the summary is NOT just the first sentence of the narrative
    const firstSentence = 'The dusty streets of Boot Hill welcome John Smith as the frontier town bustles with activity.';
    expect(journal[0].narrativeSummary).not.toBe(firstSentence);
    
    // Verify the fallback summary is a complete sentence ending with a period
    expect(journal[0].narrativeSummary.endsWith('.')).toBeTruthy();
  });
  
  it('should preserve character data through reset', async () => {
    // Set up initial game state with character data using custom weapon item
    const weaponItem = createTestInventoryItem({
      id: 'item1',
      name: 'Six-shooter',
      category: 'weapon'
    });
    
    const characterData = createTestCharacter({
      id: 'test-character-id',
      name: 'John Smith',
      inventory: { 
        items: [weaponItem]
      }
    });
    
    const narrativeState = createTestNarrativeState({
      narrativeHistory: ['Old narrative content that should be replaced']
    });
    
    const initialState = createTestGameState({
      character: {
        player: characterData,
        opponent: null
      },
      inventory: {
        items: [weaponItem],
        equippedWeaponId: 'item1'
      },
      narrative: narrativeState,
      journal: {
        entries: []
      }
    });

    // Set up mock dispatch function to capture actions
    const mockDispatch = jest.fn();
    const setLoading = jest.fn();
    const setError = jest.fn();
    const setLoadingIndicator = jest.fn();
    
    // Render the GameControlSection component
    render(
      <GameControlSection
        dispatch={mockDispatch}
        loading={null}
        setLoading={setLoading}
        setError={setError}
        setLoadingIndicator={setLoadingIndicator}
        gameState={initialState}
      />
    );

    // Trigger reset by clicking the reset button
    fireEvent.click(screen.getByText('Reset Game'));
    
    // Advance timers to simulate the reset process completing
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    
    // Check localStorage for preserved character data
    const savedCharacterData = JSON.parse(localStorage.getItem('characterData') || 'null');
    
    // Verify character data was preserved
    expect(savedCharacterData).toBeTruthy();
    expect(savedCharacterData.id).toBe(characterData.id);
    expect(savedCharacterData.name).toBe(characterData.name);
    expect(savedCharacterData.inventory.items[0].id).toEqual(characterData.inventory.items[0].id);
    expect(savedCharacterData.inventory.items[0].name).toEqual(characterData.inventory.items[0].name);
  });
});