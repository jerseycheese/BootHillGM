/**
 * useCampaignStateRestoration Hook Tests
 * 
 * Tests the hook's ability to handle various saved state conditions including:
 * - New game initialization
 * - Saved state restoration
 * - Corrupted state recovery
 * - Missing character data
 * - Default inventory item addition
 */

// Import React for JSX usage
import React from 'react';
// Import standard React Testing Library
import { render } from '@testing-library/react';
import { useCampaignStateRestoration } from '../../hooks/useCampaignStateRestoration';
import GameStorage from '../../utils/gameStorage';
import { gameStateUtils } from '../../test/utils';

// Add Jest DOM matchers for assertions
import '@testing-library/jest-dom';

// Importing GameState type for proper typing of parsed results
import { GameState } from '../../types/gameState';
import { InventoryItem, ItemCategory } from '../../types/item.types';

// IMPORTANT: Mock the GameStorage utility BEFORE defining the variables
// This approach ensures proper hoisting in Jest
jest.mock('../../utils/gameStorage', () => ({
  getCharacter: jest.fn().mockReturnValue({
    player: null,
    opponent: null
  }),
  getNarrativeText: jest.fn(),
  getSuggestedActions: jest.fn(),
  getJournalEntries: jest.fn(),
  initializeNewGame: jest.fn(),
  saveGameState: jest.fn(),
  getDefaultInventoryItems: jest.fn(),
  keys: {
    GAME_STATE: 'saved-game-state',
    CAMPAIGN_STATE: 'campaignState',
    NARRATIVE_STATE: 'narrativeState',
    CHARACTER_PROGRESS: 'character-creation-progress',
    INITIAL_NARRATIVE: 'initial-narrative',
    COMPLETED_CHARACTER: 'completed-character',
    LAST_CHARACTER: 'lastCreatedCharacter'
  }
}));

// Create a simple test component that uses our hook
interface TestComponentProps {
  isInitializing?: boolean;
  savedStateJSON?: string | null;
}

function TestComponent({ 
  isInitializing = false, 
  savedStateJSON = null 
}: TestComponentProps) {
  const result = useCampaignStateRestoration({
    isInitializing,
    savedStateJSON
  });
  
  // Render the result as a data attribute so we can check it
  return (
    <div data-testid="test-component" data-result={JSON.stringify(result)}>
      {result.isClient ? 'Client Ready' : 'Not Ready'}
    </div>
  );
}

// Get a reference to the mock for easier usage in tests
const mockGameStorage = GameStorage as jest.Mocked<typeof GameStorage>;

describe('useCampaignStateRestoration Hook', () => {
  const initialCharacterState = {
    player: null,
    opponent: null
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    gameStateUtils.mockLocalStorage.clear();
    // Ensure character mock always returns null player to match test expectations
    mockGameStorage.getCharacter.mockImplementation(() => initialCharacterState);
  });
  
  test('initializes new game state correctly', () => {
    const { getByTestId } = render(<TestComponent isInitializing={true} />);
    const element = getByTestId('test-component');
    const result = JSON.parse(element.getAttribute('data-result') || '{}') as GameState;
    
    expect(result.isClient).toBe(true);
    expect(result.character).toBeDefined();
    expect(result.character).toEqual(initialCharacterState);
    expect(result.narrative).toBeDefined();
    expect(result.narrative.narrativeHistory.length).toBe(3); // Default narrative entries
  });
  
  test('restores from savedStateJSON when available', () => {
    const mockSavedState = {
      character: {
        player: {
          id: 'saved-player',
          name: 'Saved Character',
          // Minimal required props
          isNPC: false,
          isPlayer: true,
          inventory: { items: [] },
          attributes: {},
          minAttributes: {},
          maxAttributes: {},
          wounds: [],
          isUnconscious: false
        },
        opponent: null
      },
      narrative: {
        narrativeHistory: ['Saved narrative text']
      },
      suggestedActions: [
        { id: 'saved-action', title: 'Saved Action', description: 'From saved state', type: 'optional' }
      ]
    };
    
    const { getByTestId } = render(
      <TestComponent savedStateJSON={JSON.stringify(mockSavedState)} />
    );
    const element = getByTestId('test-component');
    const result = JSON.parse(element.getAttribute('data-result') || '{}') as GameState;
    
    expect(result.character?.player?.name).toBe('Saved Character');
    expect(result.narrative.narrativeHistory[0]).toBe('Saved narrative text');
    expect(result.suggestedActions[0].title).toBe('Saved Action');
  });
  
  test('recovers from corrupted savedStateJSON', () => {
    // Setup mocks for recovery path
    mockGameStorage.getNarrativeText.mockReturnValue('Recovered narrative text');
    mockGameStorage.getSuggestedActions.mockReturnValue([
      { id: 'recovered-action', title: 'Recovered Action', description: 'From recovery', type: 'optional' }
    ]);
    
    const { getByTestId } = render(
      <TestComponent savedStateJSON="invalid json{{" />
    );
    const element = getByTestId('test-component');
    const result = JSON.parse(element.getAttribute('data-result') || '{}') as GameState;
    
    expect(result.isClient).toBe(true);
    expect(result.character).toEqual(initialCharacterState);
    expect(mockGameStorage.getCharacter).toHaveBeenCalled();
    expect(mockGameStorage.getNarrativeText).toHaveBeenCalled();
    expect(result.narrative.narrativeHistory[0]).toBe('Recovered narrative text');
  });
  
  test('handles missing character in savedStateJSON', () => {
    const mockSavedState = {
      character: null,
      narrative: {
        narrativeHistory: ['Saved narrative text']
      }
    };
    
    const { getByTestId } = render(
      <TestComponent savedStateJSON={JSON.stringify(mockSavedState)} />
    );
    const element = getByTestId('test-component');
    const result = JSON.parse(element.getAttribute('data-result') || '{}') as GameState;
    
    expect(result.character).toEqual(initialCharacterState);
    expect(mockGameStorage.getCharacter).toHaveBeenCalled();
    expect(result.narrative.narrativeHistory[0]).toBe('Saved narrative text');
  });
  
  test('adds default inventory items when player has no inventory', () => {
    // Setup properly typed mock for inventory items
    const defaultItems: InventoryItem[] = [
      { 
        id: 'test-item', 
        name: 'Test Item', 
        description: 'A test item', 
        quantity: 1, 
        category: 'general' as ItemCategory 
      }
    ];
    mockGameStorage.getDefaultInventoryItems.mockReturnValue(defaultItems);
    
    // Setup properly typed mock character with no inventory
    const characterWithoutInventory = {
      player: {
        id: 'test-player',
        name: 'Test Player',
        isNPC: false,
        isPlayer: true,
        inventory: { items: [] },
        attributes: {
          speed: 0,
          gunAccuracy: 0,
          throwingAccuracy: 0,
          strength: 0,
          baseStrength: 0,
          bravery: 0,
          experience: 0
        },
        minAttributes: {
          speed: 0,
          gunAccuracy: 0,
          throwingAccuracy: 0,
          strength: 0,
          baseStrength: 0,
          bravery: 0,
          experience: 0
        },
        maxAttributes: {
          speed: 0,
          gunAccuracy: 0,
          throwingAccuracy: 0,
          strength: 0,
          baseStrength: 0,
          bravery: 0,
          experience: 0
        },
        wounds: [],
        isUnconscious: false
      },
      opponent: null
    };
    mockGameStorage.getCharacter.mockReturnValue(characterWithoutInventory);
    
    const { getByTestId } = render(<TestComponent isInitializing={true} />);
    const element = getByTestId('test-component');
    const result = JSON.parse(element.getAttribute('data-result') || '{}') as GameState;
    
    expect(result.character?.player?.inventory).toBeDefined();
    expect(result.character?.player?.inventory?.items).toEqual(defaultItems);
    expect(mockGameStorage.getDefaultInventoryItems).toHaveBeenCalled();
  });
});
