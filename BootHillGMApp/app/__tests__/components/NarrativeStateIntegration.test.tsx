import { act, render } from '@testing-library/react';
import { CampaignStateProvider, useCampaignState } from '../../components/CampaignStateManager';
import { initialNarrativeState } from '../../types/narrative/utils';
import { GameState } from '../../types/gameState';

describe('Narrative State Integration', () => {
  // Clear localStorage before each test to ensure isolation
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  const TestComponent: React.FC = () => {
    const context = useCampaignState();
    if (!context) {
      return <div data-testid="test-component">Context is undefined</div>;
    }
    const { state, dispatch, saveGame, loadGame, cleanupState } = context;
    return (
      <div data-testid="test-component">
        <p data-testid="narrative-history">{JSON.stringify(state.narrative.narrativeHistory)}</p>
        <button data-testid="update-narrative" onClick={() => dispatch({ 
          type: 'SET_STATE', 
          payload: { 
            narrative: { 
              ...initialNarrativeState, 
              narrativeHistory: ['Test history']
            } 
          } 
        })}>
          Update Narrative
        </button>
        <button data-testid="save-game" onClick={() => saveGame(state)}>Save Game</button>
        <button data-testid="load-game" onClick={() => loadGame()}>Load Game</button>
        <button data-testid="cleanup-state" onClick={() => cleanupState()}>Cleanup State</button>
      </div>
    );
  };

  it('should save narrative state to localStorage', () => {
    const { getByTestId } = render(
      <CampaignStateProvider>
        <TestComponent />
      </CampaignStateProvider>
    );

    // First update the narrative
    act(() => {
      getByTestId('update-narrative').click();
    });
    
    // Force timers to run to handle debounced saves
    act(() => {
      jest.runAllTimers();
    });
    
    // Now explicitly save the game
    act(() => {
      getByTestId('save-game').click();
    });

    // Check the value in localStorage
    const savedState = JSON.parse(localStorage.getItem('campaignState') || '{}');
    expect(savedState.narrative.narrativeHistory).toEqual(['Test history']);
  });

  it('should load narrative state from localStorage', async() => {
    // Set up a saved state in localStorage first
    const savedNarrativeState = {
      ...initialNarrativeState,
      narrativeHistory: ['Loaded history'],
    };

    const savedState: Partial<GameState> = {
      narrative: savedNarrativeState,
      savedTimestamp: Date.now(), // Add a timestamp
      isClient: true,
    };
    localStorage.setItem('campaignState', JSON.stringify(savedState));

    const { getByTestId } = render(
      <CampaignStateProvider>
        <TestComponent />
      </CampaignStateProvider>
    );

    await act(async () => {
      getByTestId('load-game').click();
    });

    expect(JSON.parse(getByTestId('narrative-history').textContent!)).toEqual(['Loaded history']);
  });

  it('should initialize narrative state correctly', () => {
    // Clear localStorage to ensure a clean environment
    localStorage.clear();
    
    const { getByTestId } = render(
      <CampaignStateProvider>
        <TestComponent />
      </CampaignStateProvider>
    );
    
    // Expect the default initial narrative history, not an empty array
    // When initializing without saved state, the history comes from GameStorage.getNarrativeText()
    const expectedInitialHistory = [
      'Your adventure begins in the rugged frontier town of Boot Hill...'
    ];
    expect(JSON.parse(getByTestId('narrative-history').textContent!)).toEqual(expectedInitialHistory);
  });

  it('should cleanup narrative state', async () => {
    const { getByTestId } = render(
      <CampaignStateProvider>
        <TestComponent />
      </CampaignStateProvider>
    );

    // First add something to the narrative
    act(() => {
      getByTestId('update-narrative').click();
    });

    // Then clean it up
    await act(async () => {
      getByTestId('cleanup-state').click();
    });

    expect(JSON.parse(getByTestId('narrative-history').textContent!)).toEqual([]);
  });
});