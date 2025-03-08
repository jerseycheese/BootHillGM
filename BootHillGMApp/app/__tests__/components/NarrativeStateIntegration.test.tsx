import { act, render } from '@testing-library/react';
import { CampaignStateProvider, useCampaignState } from '../../components/CampaignStateManager';
import { initialNarrativeState } from '../../types/narrative.types';
import { GameState } from '../../types/gameState';

describe('Narrative State Integration', () => {
  afterEach(() => {
    jest.restoreAllMocks();
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
        <button onClick={() => dispatch({ type: 'SET_STATE', payload: { narrative: { ...initialNarrativeState, narrativeHistory: ['Test history'] } } })}>
          Update Narrative
        </button>
        <button onClick={() => saveGame(state)}>Save Game</button>
        <button onClick={() => loadGame()}>Load Game</button>
        <button onClick={() => cleanupState()}>Cleanup State</button>
      </div>
    );
  };


  it('should save narrative state to localStorage', () => {
    const { getByText } = render(
      <CampaignStateProvider>
        <TestComponent />
      </CampaignStateProvider>
    );

    act(() => {
      getByText('Update Narrative').click();
    });
    act(() => {
      getByText('Save Game').click();
    });


    const savedState = JSON.parse(localStorage.getItem('campaignState') || '{}');
    expect(savedState.narrative.narrativeHistory).toEqual(['Test history']);
  });

  it('should load narrative state from localStorage', async() => {
    const savedNarrativeState = {
      ...initialNarrativeState,
      narrativeHistory: ['Loaded history'],
    };

    const savedState: Partial<GameState> = {
      narrative: savedNarrativeState,
      savedTimestamp: Date.now(), // Add a timestamp
    }
    console.log("Setting localStorage:", JSON.stringify(savedState));
    localStorage.setItem('campaignState', JSON.stringify(savedState));
    console.log("localStorage after setItem:", localStorage.getItem('campaignState'));

  const { getByText, getByTestId } = render(
      <CampaignStateProvider>
        <TestComponent />
      </CampaignStateProvider>
    );

    await act(async () => {
      getByText('Load Game').click();
    });

    expect(JSON.parse(getByTestId('narrative-history').textContent!)).toEqual(['Loaded history']);
  });

  it('should initialize narrative state correctly', () => {
    const { getByTestId } = render(
      <CampaignStateProvider>
        <TestComponent />
      </CampaignStateProvider>
    );
    expect(JSON.parse(getByTestId('narrative-history').textContent!)).toEqual([]);
  });

  it('should cleanup narrative state', async () => {
    const { getByText, getByTestId } = render(
      <CampaignStateProvider>
        <TestComponent />
      </CampaignStateProvider>
    );

    act(() => {
      getByText('Update Narrative').click();
    });

    await act(async () => {
      getByText('Cleanup State').click();
    });

    expect(JSON.parse(getByTestId('narrative-history').textContent!)).toEqual([]);
  });
});