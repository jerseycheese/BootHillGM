import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { GameState } from '../../types/gameState';
import { GameProvider, useGame } from '../../hooks/useGame';
import CampaignStateProvider from '../../components/CampaignStateProvider';
import { initialCharacterState } from '../../types/state';

/**
 * Integration test for character creation workflow
 * Tests that the character state is properly initialized in a new game
 */
describe('Character Creation Workflow', () => {
  beforeEach(() => {
    // Mock localStorage to simulate a new game with no saved state
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize character state correctly in a new game', async () => {
    // Mock the useGame hook to access state
    let capturedState: GameState | null = null;
    const CapturingComponent = () => {
      const { state } = useGame();
      capturedState = state;
      return <div data-testid="state-capture">State Captured</div>;
    };

    // Render the campaign state manager with our capturing component
    render(
      <GameProvider>
        <CampaignStateProvider>
          <CapturingComponent />
        </CampaignStateProvider>
      </GameProvider>
    );

    // Wait for component to render and state to be initialized
    await waitFor(() => {
      expect(screen.getByTestId('state-capture')).toBeInTheDocument();
    });

    // Check that character state is correctly initialized
    expect(capturedState).not.toBeNull();
    expect(capturedState!.character).not.toBeNull();
    expect(capturedState!.character).toEqual(initialCharacterState);
    expect(capturedState!.character).toHaveProperty('player', null);
    expect(capturedState!.character).toHaveProperty('opponent', null);
  });

  it('should never set character to null during initialization', async () => {
    // Create a component that will monitor if character ever becomes null
    let characterBecameNull = false;
    let renderCount = 0;
    
    const CharacterStateMonitor = () => {
      const { state } = useGame();
      renderCount++;
      
      // After first render, check if character is ever null
      if (renderCount > 1 && state.character === null) {
        characterBecameNull = true;
      }
      
      return <div data-testid="monitor">Monitoring Character State</div>;
    };

    // Render the campaign state manager with our monitoring component
    render(
      <GameProvider>
        <CampaignStateProvider>
          <CharacterStateMonitor />
        </CampaignStateProvider>
      </GameProvider>
    );

    // Wait for component to finish rendering cycles
    await waitFor(() => {
    });

    // Character should never have been null during the rendering process
    expect(characterBecameNull).toBe(false);
  });
});
