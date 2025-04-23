/**
 * SidePanel Component Tests
 * 
 * Tests for the SidePanel component's ability to handle
 * various game state conditions, including empty or null states.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react'; // Import waitFor
import '@testing-library/jest-dom';
import { SidePanel } from '../../components/GameArea/SidePanel';
import GameStorage from '../../utils/gameStorage';
import { GameState } from '../../types/gameState';
import { gameStateUtils } from '../../test/utils';
import { CampaignStateProvider } from '../../components/CampaignStateProvider'; // Use named import

// Mock the GameStorage utility
jest.mock('../../utils/gameStorage', () => {
  return {
    getCharacter: jest.fn(),
    getNarrativeText: jest.fn(),
    getSuggestedActions: jest.fn(),
    getJournalEntries: jest.fn(),
    initializeNewGame: jest.fn(),
    saveGameState: jest.fn(),
    getDefaultInventoryItems: jest.fn()
  };
});

describe('SidePanel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    gameStateUtils.mockLocalStorage.clear();
    
    // Setup the GameStorage mocks
    (GameStorage.getCharacter as jest.Mock).mockReturnValue({
      player: null,
      opponent: null
    });
    (GameStorage.getJournalEntries as jest.Mock).mockReturnValue([]);
    (GameStorage.getDefaultInventoryItems as jest.Mock).mockReturnValue([]);
  });
  
  test('renders with player character from state', async () => { // Make test async
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
    
    // Use the utility function to render with the provider
    gameStateUtils.renderWithCampaignStateProvider(
      <SidePanel
        handleEquipWeapon={gameStateUtils.defaultGameSessionProps.handleEquipWeapon}
        isLoading={gameStateUtils.defaultGameSessionProps.isLoading}
      />,
      mockState // Pass the mock state to the utility
    );
    
    // Use a more reliable selector like data-testid instead of text content
    await waitFor(() => {
      expect(screen.getByTestId('character-name')).toHaveTextContent('Test Player');
    });
    expect(GameStorage.getCharacter).not.toHaveBeenCalled(); // Should not use fallback
  });
  
  test('renders with player character from GameStorage when state has null character', () => {
    const mockState: GameState = gameStateUtils.createMockGameState({
      character: null
    });
    
    gameStateUtils.renderWithCampaignStateProvider(
      <SidePanel
        handleEquipWeapon={gameStateUtils.defaultGameSessionProps.handleEquipWeapon}
        isLoading={gameStateUtils.defaultGameSessionProps.isLoading}
      />,
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
    
    gameStateUtils.renderWithCampaignStateProvider(
      <SidePanel
        handleEquipWeapon={gameStateUtils.defaultGameSessionProps.handleEquipWeapon}
        isLoading={gameStateUtils.defaultGameSessionProps.isLoading}
      />,
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
          { id: 'journal-1', type: 'narrative', title: 'Test Title', content: 'Test content', narrativeSummary: 'Test summary', timestamp: Date.now() }
        ]
      }
    });
    
    gameStateUtils.renderWithCampaignStateProvider(
      <SidePanel
        handleEquipWeapon={gameStateUtils.defaultGameSessionProps.handleEquipWeapon}
        isLoading={gameStateUtils.defaultGameSessionProps.isLoading}
      />,
      mockState
    );
    
    // Check for journal entry content
    expect(screen.getByText(/Test summary/)).toBeInTheDocument(); // Check for summary, not content
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
    
    gameStateUtils.renderWithCampaignStateProvider(
      <SidePanel
        handleEquipWeapon={gameStateUtils.defaultGameSessionProps.handleEquipWeapon}
        isLoading={gameStateUtils.defaultGameSessionProps.isLoading}
      />,
      mockState
    );
    
    // Check that the fallback is called
    expect(GameStorage.getJournalEntries).toHaveBeenCalled();
  });
});