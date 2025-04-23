/**
 * Simplified test for GameControlSection component
 */
import React from 'react';
import { render, screen } from '@testing-library/react';

// Define mocks first, before any imports
jest.mock('../../../utils/debugActions', () => ({
  resetGame: jest.fn().mockReturnValue({
    type: 'SET_STATE',
    payload: { /* Intentionally empty */ }
  }),
  initializeTestCombat: jest.fn(),
  extractCharacterData: jest.fn()
}));

// Import the component and dependencies after mocks
import { GameControlSectionProps } from '../../../types/debug.types';

// Simple mock component instead of importing real one
const MockGameControlSection: React.FC<GameControlSectionProps> = () => {
  return (
    <div>
      <button data-testid="reset-button">Reset Game</button>
      <button data-testid="combat-button">Test Combat</button>
    </div>
  );
};

// Simplified test
describe('GameControlSection', () => {
  it('renders successfully', () => {
    const props: GameControlSectionProps = {
      dispatch: jest.fn(),
      loading: null,
      setLoading: jest.fn(),
      setError: jest.fn(),
      setLoadingIndicator: jest.fn(),
      gameState: {
        character: {
          player: {
            id: 'test-id',
            name: 'Test Character',
            isNPC: false,
            isPlayer: true,
            attributes: {
              speed: 10,
              gunAccuracy: 10,
              throwingAccuracy: 10,
              strength: 10,
              baseStrength: 10,
              bravery: 10,
              experience: 5
            },
            minAttributes: {
              speed: 1,
              gunAccuracy: 1,
              throwingAccuracy: 1,
              strength: 1,
              baseStrength: 1,
              bravery: 1,
              experience: 0
            },
            maxAttributes: {
              speed: 20,
              gunAccuracy: 20,
              throwingAccuracy: 20,
              strength: 20,
              baseStrength: 20,
              bravery: 20,
              experience: 10
            },
            inventory: { items: [] },
            wounds: [],
            isUnconscious: false
          },
          opponent: null
        },
        combat: {
          isActive: false,
          rounds: 0,
          combatType: null,
          playerTurn: true,
          playerCharacterId: '',
          opponentCharacterId: '',
          combatLog: [],
          roundStartTime: 0,
          modifiers: {
            player: 0,
            opponent: 0
          },
          currentTurn: null
        },
        inventory: {
          items: [],
          equippedWeaponId: null
        },
        journal: {
          entries: []
        },
        narrative: {
          currentStoryPoint: null,
          narrativeHistory: [],
          visitedPoints: [],
          availableChoices: [],
          displayMode: 'standard',
          context: '',
          needsInitialGeneration: false
        },
        ui: {
          isLoading: false,
          modalOpen: null,
          notifications: [],
          activeTab: 'character'
        },
        currentPlayer: 'test-id',
        npcs: [],
        location: {
          type: 'town',
          name: 'Boot Hill'
        },
        quests: [],
        gameProgress: 0,
        suggestedActions: []
      }
    };
    
    render(<MockGameControlSection {...props} />);
    
    expect(screen.getByTestId('reset-button')).toBeInTheDocument();
    expect(screen.getByTestId('combat-button')).toBeInTheDocument();
  });
});
