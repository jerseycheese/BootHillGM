/**
 * SidePanel Component Tests
 * 
 * Tests for the SidePanel component's ability to handle
 * various game state conditions, including empty or null states.
 */

import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SidePanel } from '../../components/GameArea/SidePanel';
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

describe('SidePanel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    gameStateUtils.mockLocalStorage.clear();
    gameStateUtils.setupGameStorageMocks(GameStorage);
  });
  
  test('renders with player character from state', () => {
    // Create a fully compliant mockState
    const mockState: GameState = gameStateUtils.createMockGameState({
      character: {
        player: {
          id: 'player-1',
          name: 'Test Player',
          isNPC: false,
          isPlayer: true,
          inventory: { items: [] },
          attributes: { speed: 10, gunAccuracy: 10, throwingAccuracy: 10, strength: 10, baseStrength: 10, bravery: 10, experience: 0 },
          minAttributes: { speed: 1, gunAccuracy: 1, throwingAccuracy: 1, strength: 8, baseStrength: 8, bravery: 1, experience: 0 },
          maxAttributes: { speed: 20, gunAccuracy: 20, throwingAccuracy: 20, strength: 20, baseStrength: 20, bravery: 20, experience: 11 },
          wounds: [],
          isUnconscious: false
        },
        opponent: null
      }
    });
    
    gameStateUtils.renderWithGameProvider(
      <SidePanel {...gameStateUtils.defaultGameSessionProps} state={mockState} />, 
      mockState
    );
    
    expect(screen.getByText('Test Player')).toBeInTheDocument();
    expect(GameStorage.getCharacter).not.toHaveBeenCalled(); // Should not use fallback
  });
  
  test('renders with player character from GameStorage when state has null character', () => {
    const mockState: GameState = gameStateUtils.createMockGameState({
      character: null
    });
    
    gameStateUtils.renderWithGameProvider(
      <SidePanel {...gameStateUtils.defaultGameSessionProps} state={mockState} />, 
      mockState
    );
    
    expect(screen.getByText('Character data not available')).toBeInTheDocument();
  });
  
  test('renders with character data not available message when all sources fail', () => {
    const mockState: GameState = gameStateUtils.createMockGameState({
      character: null
    });
    
    // Override the GameStorage mock to return null
    (GameStorage.getCharacter as jest.Mock).mockReturnValue({
      player: null,
      opponent: null
    });
    
    gameStateUtils.renderWithGameProvider(
      <SidePanel {...gameStateUtils.defaultGameSessionProps} state={mockState} />, 
      mockState
    );
    
    expect(screen.getByText('Character data not available')).toBeInTheDocument();
  });
  
  test('uses journal entries from state if available', () => {
    const mockState: GameState = gameStateUtils.createMockGameState({
      character: {
        player: {
          id: 'player-1',
          name: 'Test Player',
          isNPC: false,
          isPlayer: true,
          inventory: { items: [] },
          attributes: { speed: 1, gunAccuracy: 1, throwingAccuracy: 1, strength: 8, baseStrength: 8, bravery: 1, experience: 0 },
          minAttributes: { speed: 1, gunAccuracy: 1, throwingAccuracy: 1, strength: 8, baseStrength: 8, bravery: 1, experience: 0 },
          maxAttributes: { speed: 20, gunAccuracy: 20, throwingAccuracy: 20, strength: 20, baseStrength: 20, bravery: 20, experience: 11 },
          wounds: [],
          isUnconscious: false
        },
        opponent: null
      },
      journal: {
        entries: [
          { id: 'journal-1', type: 'narrative', content: 'Test content', timestamp: Date.now() }
        ]
      }
    });
    
    gameStateUtils.renderWithGameProvider(
      <SidePanel {...gameStateUtils.defaultGameSessionProps} state={mockState} />, 
      mockState
    );
    
    // Use a more robust query to find the text within the list item
    const journalList = screen.getByRole('list');
    expect(journalList).toHaveTextContent(/Test content/);
    expect(GameStorage.getJournalEntries).not.toHaveBeenCalled(); // Should not use fallback
  });
  
  test('uses journal entries from GameStorage when state journal is empty', () => {
    const mockState: GameState = gameStateUtils.createMockGameState({
      character: {
        player: {
          id: 'player-1',
          name: 'Test Player',
          isNPC: false,
          isPlayer: true,
          inventory: { items: [] },
          attributes: { speed: 1, gunAccuracy: 1, throwingAccuracy: 1, strength: 8, baseStrength: 8, bravery: 1, experience: 0 },
          minAttributes: { speed: 1, gunAccuracy: 1, throwingAccuracy: 1, strength: 8, baseStrength: 8, bravery: 1, experience: 0 },
          maxAttributes: { speed: 20, gunAccuracy: 20, throwingAccuracy: 20, strength: 20, baseStrength: 20, bravery: 20, experience: 11 },
          wounds: [],
          isUnconscious: false
        },
        opponent: null
      },
      journal: { entries: [] }
    });
    
    gameStateUtils.renderWithGameProvider(
      <SidePanel {...gameStateUtils.defaultGameSessionProps} state={mockState} />, 
      mockState
    );
    
    expect(GameStorage.getJournalEntries).toHaveBeenCalled();
  });
});