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

// Mock the GameStorage utility
jest.mock('../../utils/gameStorage', () => ({
  getCharacter: jest.fn(),
  getNarrativeText: jest.fn(),
  getSuggestedActions: jest.fn(),
  getJournalEntries: jest.fn(),
  initializeNewGame: jest.fn(),
  saveGameState: jest.fn(),
  getDefaultInventoryItems: jest.fn()
}));

describe('GameplayControls Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    gameStateUtils.mockLocalStorage.clear();
    gameStateUtils.setupGameStorageMocks(GameStorage);
  });
  
  test('renders with suggested actions from state', () => {
    const mockState: GameState = gameStateUtils.createMockGameState({
      suggestedActions: [
        { id: 'state-action-1', title: 'State Action', description: 'From state', type: 'optional' }
      ]
    });
    
    gameStateUtils.renderWithGameProvider(
      <GameplayControls {...gameStateUtils.defaultGameplayControlsProps} state={mockState} />, 
      mockState
    );
    
    expect(GameStorage.getSuggestedActions).not.toHaveBeenCalled(); // Should not use fallback
  });
  
  test('renders with suggested actions from GameStorage when state has none', () => {
    const mockState: GameState = gameStateUtils.createMockGameState({
      suggestedActions: []
    });
    
    gameStateUtils.renderWithGameProvider(
      <GameplayControls {...gameStateUtils.defaultGameplayControlsProps} state={mockState} />, 
      mockState
    );
    
    expect(GameStorage.getSuggestedActions).toHaveBeenCalled();
  });
  
  test('renders input manager even when character is null', () => {
    const mockState: GameState = gameStateUtils.createMockGameState({
      character: null,
      suggestedActions: []
    });
    
    gameStateUtils.renderWithGameProvider(
      <GameplayControls {...gameStateUtils.defaultGameplayControlsProps} state={mockState} />, 
      mockState
    );
    
    expect(GameStorage.getSuggestedActions).toHaveBeenCalled();
  });
});
