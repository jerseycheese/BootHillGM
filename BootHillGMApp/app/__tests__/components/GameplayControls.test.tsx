/**
 * GameplayControls Component Tests
 * 
 * Tests for the GameplayControls component's ability to handle
 * various game state conditions and user interactions.
 */

import React from 'react';
import '@testing-library/jest-dom';
import { GameplayControls } from '../../components/GameArea/GameplayControls';
import GameStorage from '../../utils/gameStorage';
import { GameState } from '../../types/gameState';
import { 
  gameStateUtils 
} from '../../test/utils';
import { SuggestedAction } from '../../types/campaign';

// Define mock actions
const mockSuggestedActions: SuggestedAction[] = [
  { id: 'mock-action-1', title: 'Mock Action', description: 'From mock', type: 'optional' }
];

// Mock the GameStorage utility
jest.mock('../../utils/gameStorage', () => ({
  getCharacter: jest.fn(),
  getNarrativeText: jest.fn(),
  getSuggestedActions: jest.fn(() => mockSuggestedActions),
  getJournalEntries: jest.fn(),
  initializeNewGame: jest.fn(),
  saveGameState: jest.fn(),
  getDefaultInventoryItems: jest.fn(),
  getDefaultCharacter: jest.fn()
}));

describe('GameplayControls Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    gameStateUtils.mockLocalStorage.clear();
    
    // Set up mocks
    (GameStorage.getSuggestedActions as jest.Mock).mockReturnValue(mockSuggestedActions);
    gameStateUtils.setupGameStorageMocks(GameStorage);
  });
  
  test('renders with suggested actions from state', () => {
    const stateActions = [
      { id: 'state-action-1', title: 'State Action', description: 'From state', type: 'optional' }
    ];
    
    const mockState: GameState = gameStateUtils.createMockGameState({
      suggestedActions: stateActions
    });
    
    gameStateUtils.renderWithGameProvider(
      <GameplayControls {...gameStateUtils.defaultGameplayControlsProps} state={mockState} />, 
      mockState
    );
    
    // Should not call getSuggestedActions since state has actions
    expect(GameStorage.getSuggestedActions).not.toHaveBeenCalled();
  });
  
  test('renders with suggested actions from GameStorage when state has none', () => {
    const mockState: GameState = gameStateUtils.createMockGameState({
      suggestedActions: []
    });
    
    gameStateUtils.renderWithGameProvider(
      <GameplayControls {...gameStateUtils.defaultGameplayControlsProps} state={mockState} />, 
      mockState
    );
    
    // Should call getSuggestedActions as fallback
    expect(GameStorage.getSuggestedActions).toHaveBeenCalled();
  });
  
  test('renders input manager even when character is null', () => {
    const mockState: GameState = gameStateUtils.createMockGameState({
      character: { player: null, opponent: null },
      suggestedActions: []
    });
    
    gameStateUtils.renderWithGameProvider(
      <GameplayControls {...gameStateUtils.defaultGameplayControlsProps} state={mockState} />, 
      mockState
    );
    
    // Should call getSuggestedActions since state has empty actions
    expect(GameStorage.getSuggestedActions).toHaveBeenCalled();
  });
});