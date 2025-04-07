import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MainGameArea } from '../../../components/GameArea/MainGameArea';
import { GameState } from '../../../types/gameState'; // Corrected import path
// Update the import path for NarrativeProvider
import { NarrativeProvider } from '../../../hooks/narrative/NarrativeProvider';

// Mock NarrativeWithDecisions with proper rendering of newlines
jest.mock('../../../components/narrative/NarrativeWithDecisions', () => {
  // Added types for props
  return function MockNarrativeWithDecisions({ narrative, error, onRetry }: { narrative: string; error?: string | null; onRetry?: () => void }) {
    // Simplify mock: Render the raw narrative string directly
    // This avoids issues with <br> tags and complex fragments in textContent assertion
    // const narrativeWithBreaks = narrative; // Use the raw string (Removed this intermediate step)

    return (
      <div data-testid="mock-narrative-with-decisions">
        {/* Render the raw narrative string directly */}
        <div data-testid="narrative-prop" style={{ whiteSpace: 'pre-wrap' }}>{narrative}</div>
        {error && <div data-testid="error-prop">{error}</div>}
        {onRetry && (
          <button data-testid="retry-button" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    );
  };
});

// Mock GameplayControls
jest.mock('../../../components/GameArea/GameplayControls', () => ({
  GameplayControls: function MockGameplayControls() {
    return <div data-testid="mock-gameplay-controls">Gameplay Controls</div>;
  }
}));

// Wrap component with NarrativeProvider for testing
// Added type for ui parameter
const renderWithNarrativeProvider = (ui: React.ReactElement) => {
  return render(
    <NarrativeProvider>
      {ui}
    </NarrativeProvider>
  );
};

describe('MainGameArea', () => {
  // Create a more complete mock state based on initial state structure
  const mockState: GameState = {
    character: null, // Add other initial state parts
    combat: { // Use properties from initialCombatState or CombatState definition
      isActive: false,
      combatType: 'brawling', // Use initial value
      rounds: 0,
      playerTurn: true,
      playerCharacterId: '',
      opponentCharacterId: '',
      combatLog: [], // Correct property name
      roundStartTime: 0,
      modifiers: { player: 0, opponent: 0 },
      currentTurn: null,
      winner: null,
      participants: []
    },
    inventory: { items: [], equippedWeaponId: null }, // Example initial inventory state
    journal: { // Override journal entries for the test
      entries: [
        { id: 'entry1', type: 'narrative', timestamp: 1, content: 'Line 1', title: 'Entry 1' }, // Added title
        { id: 'entry2', type: 'narrative', timestamp: 2, content: 'Line 2', title: 'Entry 2' }, // Added title
        { id: 'entry3', type: 'narrative', timestamp: 3, content: 'Line 3', title: 'Entry 3' }, // Added title
      ]
    },
    narrative: { // Add initial narrative state parts
        currentStoryPoint: null,
        visitedPoints: [],
        availableChoices: [],
        narrativeHistory: [], // Keep this empty as MainGameArea reads from journal
        displayMode: 'standard',
        context: '',
        needsInitialGeneration: false, // Assume false for this test context
        lore: undefined,
        storyProgression: undefined,
        currentDecision: undefined,
        error: null,
        selectedChoice: undefined,
        narrativeContext: undefined,
    },
    ui: { // Use properties from initialUIState or UIState definition
      isLoading: false,
      modalOpen: null,
      notifications: [],
      activeTab: 'character' // Use initial value
    },
    currentPlayer: 'Test Player',
    npcs: [],
    location: { type: 'town', name: 'Test Town' }, // Example location
    quests: [],
    gameProgress: 0,
    savedTimestamp: Date.now(),
    isClient: true,
    suggestedActions: []
  };

  const defaultProps = {
    state: mockState,
    dispatch: jest.fn(),
    isLoading: false,
    error: null,
    isCombatActive: false,
    opponent: null,
    handleUserInput: jest.fn(),
    retryLastAction: jest.fn(),
    handleCombatEnd: jest.fn(),
    handlePlayerHealthChange: jest.fn(),
    // Add missing mock functions required by GameSessionProps
    handleUseItem: jest.fn(),
    handleEquipWeapon: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });


  it('constructs narrative prop from narrativeHistory', () => {
    const historyState: GameState = {
      ...mockState,
      narrative: {
        ...mockState.narrative,
        narrativeHistory: [
          'Initial Narrative Line.',
          'Player: Test Action',
          'AI Response Line.'
        ]
      }
    };
    const props = { ...defaultProps, state: historyState };

    renderWithNarrativeProvider(<MainGameArea {...props} />);

    // Get the mock component instance
    // Get the mock component instance (variable removed as it's unused)
    // const mockNarrativeInstance = screen.getByTestId('mock-narrative-with-decisions');
    // Find the element holding the narrative prop within the mock
    const narrativePropElement = screen.getByTestId('narrative-prop'); 

    // Check the text content of the element holding the prop
    // It should be the joined string from narrativeHistory
    expect(narrativePropElement).toHaveTextContent('Initial Narrative Line. Player: Test Action AI Response Line.');
  });

  it('renders the MainGameArea with NarrativeWithDecisions', () => {
    renderWithNarrativeProvider(<MainGameArea {...defaultProps} />);
    
    // Check if NarrativeWithDecisions is rendered
    expect(screen.getByTestId('mock-narrative-with-decisions')).toBeInTheDocument();
    
    // Check if GameplayControls is rendered
    expect(screen.getByTestId('mock-gameplay-controls')).toBeInTheDocument();
  });

  it('passes error and retry handler to NarrativeWithDecisions', () => {
    const props = {
      ...defaultProps,
      error: 'Test error',
    };
    
    renderWithNarrativeProvider(<MainGameArea {...props} />);
    
    // Check if error prop is passed correctly
    expect(screen.getByTestId('error-prop')).toHaveTextContent('Test error');
    
    // Check if retry button exists
    expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    
    // Simulate retry button click
    screen.getByTestId('retry-button').click();
    
    // Check if retry handler is called
    expect(defaultProps.retryLastAction).toHaveBeenCalledTimes(1);
  });

  it('renders with correct container classes', () => {
    renderWithNarrativeProvider(<MainGameArea {...defaultProps} />);
    
    // Check for container classes
    expect(screen.getByTestId('main-game-area-container')).toHaveClass('h-full');
    expect(screen.getByTestId('main-game-area-container')).toHaveClass('flex');
    expect(screen.getByTestId('main-game-area-container')).toHaveClass('flex-col');
    expect(screen.getByTestId('main-game-area-container')).toHaveClass('overflow-auto');
  });
});