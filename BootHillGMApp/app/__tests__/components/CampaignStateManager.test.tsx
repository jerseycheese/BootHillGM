import React from 'react';
import { render, act, renderHook } from '@testing-library/react';
import { CampaignStateProvider, useCampaignState } from '../../components/CampaignStateManager';
import { Character } from '../../types/character';
import { CampaignState } from '../../types/campaign';
import { JournalEntry } from '../../types/journal';

jest.setTimeout(15000);

// Helper function to wait for state updates
const waitForStateUpdate = () => new Promise(resolve => setTimeout(resolve, 100));

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    }
  };
})();

// Replace the window.localStorage with our mock version
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock the JournalManager
jest.mock('../../utils/JournalManager', () => ({
  addJournalEntry: jest.fn((journal, entry) => [...journal, { timestamp: Date.now(), content: entry }]),
}));

describe('CampaignStateManager', () => {
  // Clear localStorage before each test
  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Helper function to compare states without timestamps
  const compareStatesWithoutTimestamp = (currentState: Partial<CampaignState>, expectedState: Partial<CampaignState>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { savedTimestamp: currentTimestamp, ...currentStateWithoutTimestamp } = currentState;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { savedTimestamp: expectedTimestamp, ...expectedStateWithoutTimestamp } = expectedState;
    return expect(currentStateWithoutTimestamp).toEqual(expectedStateWithoutTimestamp);
  };

  // Test case: Check if the CampaignStateManager initializes with the default state
  test('initializes with default state', () => {
    const TestComponent = () => {
      const { state } = useCampaignState();
      return <div data-testid="test">{JSON.stringify(state)}</div>;
    };

    const { getByTestId } = render(
      <CampaignStateProvider>
        <TestComponent />
      </CampaignStateProvider>
    );

    const testElement = getByTestId('test');
    const initialState = JSON.parse(testElement.textContent || '');

    // Verify that the initial state matches our expectations
    expect(initialState.currentPlayer).toBe('');
    expect(initialState.npcs).toEqual([]);
    expect(initialState.character).toBeNull();
    expect(initialState.location).toBe('');
    expect(initialState.gameProgress).toBe(0);
    expect(initialState.journal).toEqual([]);
    expect(initialState.narrative).toBe('');
    expect(initialState.inventory).toEqual([]);
    expect(initialState.quests).toEqual([]);
    expect(initialState.isCombatActive).toBe(false);
    expect(initialState.opponent).toBeNull();
    expect(initialState.savedTimestamp).toBeUndefined();
    expect(initialState.isClient).toBe(false);
    expect(initialState.suggestedActions).toEqual([]);
  });

  // Test case: Verify that the state updates correctly when actions are dispatched
  test('updates state correctly', () => {
    const TestComponent = () => {
      const { state, dispatch } = useCampaignState();
      React.useEffect(() => {
        const testCharacter: Character = {
          name: 'Test Character',
          health: 100,
          attributes: {
            speed: 10,
            gunAccuracy: 10,
            throwingAccuracy: 10,
            strength: 10,
            bravery: 10,
            experience: 5
          },
          skills: {
            shooting: 50,
            riding: 50,
            brawling: 50
          }
        };
        dispatch({ type: 'SET_PLAYER', payload: 'Test Player' });
        dispatch({ type: 'ADD_NPC', payload: 'Test NPC' });
        dispatch({ type: 'SET_CHARACTER', payload: testCharacter });
        dispatch({ type: 'SET_LOCATION', payload: 'Test Town' });
        dispatch({ type: 'UPDATE_JOURNAL', payload: { timestamp: Date.now(), content: 'Test journal entry' } as JournalEntry });
        dispatch({ type: 'SET_NARRATIVE', payload: 'Test narrative' });
        dispatch({ type: 'ADD_ITEM', payload: { id: '1', name: 'Test Item', quantity: 1, description: 'A test item' } });
        dispatch({ type: 'ADD_QUEST', payload: 'Test Quest' });
      }, [dispatch]);
      return <div data-testid="test">{JSON.stringify(state)}</div>;
    };

    const { getByTestId } = render(
      <CampaignStateProvider>
        <TestComponent />
      </CampaignStateProvider>
    );

    const testElement = getByTestId('test');
    const updatedState = JSON.parse(testElement.textContent || '');

    // Verify that the state has been updated correctly
    expect(updatedState.currentPlayer).toBe('Test Player');
    expect(updatedState.npcs).toEqual(['Test NPC']);
    expect(updatedState.character).toEqual({
      name: 'Test Character',
      health: 100,
      attributes: {
        speed: 10,
        gunAccuracy: 10,
        throwingAccuracy: 10,
        strength: 10,
        bravery: 10,
        experience: 5
      },
      skills: {
        shooting: 50,
        riding: 50,
        brawling: 50
      }
    });
    expect(updatedState.location).toBe('Test Town');
    expect(updatedState.journal).toHaveLength(1);
    expect(updatedState.journal[0].content).toBe('Test journal entry');
    expect(updatedState.narrative).toBe('Test narrative');
    expect(updatedState.inventory).toHaveLength(1);
    expect(updatedState.inventory[0]).toEqual({ id: '1', name: 'Test Item', quantity: 1, description: 'A test item' });
    expect(updatedState.quests).toEqual(['Test Quest']);
    expect(updatedState.isClient).toBe(false);
    expect(updatedState.suggestedActions).toEqual([]);
  });

  test('saves state to localStorage', async () => {
    const savedCharacter: Character = {
      name: 'Saved Character',
      health: 100,
      attributes: {
        speed: 10,
        gunAccuracy: 10,
        throwingAccuracy: 10,
        strength: 10,
        bravery: 10,
        experience: 5
      },
      skills: {
        shooting: 50,
        riding: 50,
        brawling: 50
      }
    };
  
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CampaignStateProvider>{children}</CampaignStateProvider>
    );
  
    const { result } = renderHook(() => useCampaignState(), { wrapper });
  
    await act(async () => {
      result.current.dispatch({ type: 'SET_CHARACTER', payload: savedCharacter });
      result.current.dispatch({ type: 'SET_SAVED_TIMESTAMP', payload: Date.now() });
      await waitForStateUpdate();
    });
  
    // Force a save
    await act(async () => {
      result.current.saveGame(result.current.state);
      await waitForStateUpdate();
    });
  
    const savedState = JSON.parse(localStorage.getItem('campaignState') || '{}');
    expect(savedState.character).toEqual(savedCharacter);
    expect(savedState.savedTimestamp).toBeDefined();
    expect(savedState.isClient).toBe(false);
    expect(result.current.state.character).toEqual(savedCharacter);
    expect(result.current.state.savedTimestamp).toBeDefined();
    expect(result.current.state.isClient).toBe(false);
  });

  test('loads state from localStorage', async () => {
    const testState: CampaignState = {
      currentPlayer: 'Loaded Player',
      npcs: ['Loaded NPC'],
      character: {
        name: 'Loaded Character',
        health: 90,
        attributes: {
          speed: 11,
          gunAccuracy: 12,
          throwingAccuracy: 13,
          strength: 14,
          bravery: 15,
          experience: 6
        },
        skills: {
          shooting: 60,
          riding: 70,
          brawling: 80
        }
      },
      location: 'Loaded Town',
      gameProgress: 5,
      journal: [{ 
        timestamp: Date.now(), 
        content: 'Entry 1',
        narrativeSummary: 'Test summary'
      }],
      narrative: 'Loaded narrative',
      inventory: [{ 
        id: '1', 
        name: 'Loaded Item', 
        quantity: 1,
        description: 'A loaded item'
      }],
      quests: ['Loaded Quest'],
      isCombatActive: false,
      opponent: null,
      savedTimestamp: Date.now(),
      isClient: false,
      suggestedActions: []
    };
    
    localStorage.setItem('campaignState', JSON.stringify(testState));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CampaignStateProvider>{children}</CampaignStateProvider>
    );

    const { result } = renderHook(() => useCampaignState(), { wrapper });

    await act(async () => {
      result.current.loadGame();
      await waitForStateUpdate();
    });

    // Deep clone the state to avoid reference issues
    const currentState = JSON.parse(JSON.stringify(result.current.state));
    
    // Compare state without timestamps and journal
    const { journal: currentJournal, ...currentStateWithoutJournal } = currentState;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { savedTimestamp, journal: testJournal, ...testStateWithoutJournal } = testState;
    
    // Update test state to expect isClient: true
    testStateWithoutJournal.isClient = true;
    
    compareStatesWithoutTimestamp(currentStateWithoutJournal, testStateWithoutJournal);
    expect(currentJournal[0].content).toBe(testJournal[0].content);
    expect(currentJournal[0].narrativeSummary).toBe(testJournal[0].narrativeSummary);
    expect(currentState.savedTimestamp).toBeDefined();
  });

  test('saveGame function saves state correctly', async () => {
    const savedCharacter: Character = {
      name: 'Saved Character',
      health: 100,
      attributes: {
        speed: 10,
        gunAccuracy: 10,
        throwingAccuracy: 10,
        strength: 10,
        bravery: 10,
        experience: 5
      },
      skills: {
        shooting: 50,
        riding: 50,
        brawling: 50
      }
    };
  
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CampaignStateProvider>{children}</CampaignStateProvider>
    );
  
    const { result } = renderHook(() => useCampaignState(), { wrapper });
  
    // First, set the character
    await act(async () => {
      result.current.dispatch({ type: 'SET_CHARACTER', payload: savedCharacter });
      await waitForStateUpdate();
    });
  
    // Then save the game
    await act(async () => {
      result.current.saveGame(result.current.state);
      await waitForStateUpdate();
    });
  
    // Add a small delay to allow for state updates
    await new Promise(resolve => setTimeout(resolve, 100));
  
    // Get the saved state from localStorage
    const savedState = JSON.parse(localStorage.getItem('campaignState') || '{}');
    
    // Check that the state was saved to localStorage correctly
    expect(savedState).toMatchObject({
      character: savedCharacter,
      savedTimestamp: expect.any(Number),
    });
    
    expect(result.current.state.savedTimestamp).toBeDefined();
    expect(typeof result.current.state.savedTimestamp).toBe('number');
    expect(result.current.state.character).toEqual(savedCharacter);
  
    // Additional check for complete state match
    const stateToCompare = {
      currentPlayer: '',
      npcs: [],
      character: savedCharacter,
      location: '',
      narrative: '',
      inventory: [],
      journal: [],
      quests: [],
      gameProgress: 0,
      isCombatActive: false,
      opponent: null,
      isClient: false,
      suggestedActions: []
    };
    
    compareStatesWithoutTimestamp(result.current.state, stateToCompare);
  });

  test('loadGame function loads state correctly', async () => {
    const testState: CampaignState = {
      currentPlayer: 'Test Player',
      npcs: ['Test NPC'],
      character: {
        name: 'Test Character',
        health: 100,
        attributes: {
          speed: 10,
          gunAccuracy: 10,
          throwingAccuracy: 10,
          strength: 10,
          bravery: 10,
          experience: 5
        },
        skills: {
          shooting: 50,
          riding: 50,
          brawling: 50
        }
      },
      location: 'Test Town',
      gameProgress: 5,
      journal: [{ timestamp: Date.now(), content: 'Test entry' }],
      narrative: 'Test narrative',
      inventory: [{ id: '1', name: 'Test Item', quantity: 1, description: 'A test item' }],
      quests: ['Test Quest'],
      isCombatActive: false,
      opponent: null,
      savedTimestamp: Date.now(),
      isClient: false,
      suggestedActions: []
    };

    localStorage.setItem('campaignState', JSON.stringify(testState));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CampaignStateProvider>{children}</CampaignStateProvider>
    );

    const { result } = renderHook(() => useCampaignState(), { wrapper });

    await act(async () => {
      result.current.loadGame();
      await waitForStateUpdate();
    });

    // Compare state without timestamps and journal
    const { journal: currentJournal, ...currentStateWithoutJournal } = result.current.state;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { savedTimestamp, journal: testJournal, ...testStateWithoutJournal } = testState;
    
    // Update test state to expect isClient: true
    testStateWithoutJournal.isClient = true;
    
    compareStatesWithoutTimestamp(currentStateWithoutJournal, testStateWithoutJournal);
    expect(currentJournal[0].content).toBe(testJournal[0].content);
    expect(result.current.state.savedTimestamp).toBeDefined();
  });

  test('loadGame handles minimal state correctly', async () => {
    // Test with minimal state (no character, just basic game state)
    const minimalState: CampaignState = {
      currentPlayer: '',
      npcs: [],
      character: null,
      location: 'Test Town',
      narrative: 'Test narrative',
      inventory: [],
      journal: [],
      quests: [],
      gameProgress: 0,
      isCombatActive: false,
      opponent: null,
      savedTimestamp: Date.now(),
      isClient: false,
      suggestedActions: []
    };

    localStorage.setItem('campaignState', JSON.stringify(minimalState));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CampaignStateProvider>{children}</CampaignStateProvider>
    );

    const { result } = renderHook(() => useCampaignState(), { wrapper });

    await act(async () => {
      result.current.loadGame();
      await waitForStateUpdate();
    });

    // Compare state without timestamp
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { savedTimestamp: _, ...currentStateWithoutTimestamp } = result.current.state;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { savedTimestamp: __, ...minimalStateWithoutTimestamp } = minimalState;
    
    // Update minimal state to expect isClient: true
    minimalStateWithoutTimestamp.isClient = true;
    
    compareStatesWithoutTimestamp(currentStateWithoutTimestamp, minimalStateWithoutTimestamp);
    expect(result.current.state.savedTimestamp).toBeDefined();
  });

  // Modify existing test for handling corrupted saved state
  test('loadGame handles corrupted state gracefully', async () => {
    // Set invalid JSON in localStorage
    localStorage.setItem('campaignState', 'invalid json');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CampaignStateProvider>{children}</CampaignStateProvider>
    );

    const { result } = renderHook(() => useCampaignState(), { wrapper });

    await act(async () => {
      const loadedState = result.current.loadGame();
      await waitForStateUpdate();
      // Should return null for invalid state
      expect(loadedState).toBeNull();
      // Should maintain initial state
      expect(result.current.state.character).toBeNull();
      // Should log an error
      expect(console.error).toHaveBeenCalledWith('Failed to load game state:', expect.any(Error));
    });
  });

  // Add new test for handling no saved state
  test('loadGame handles no saved state gracefully', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CampaignStateProvider>{children}</CampaignStateProvider>
    );

    const { result } = renderHook(() => useCampaignState(), { wrapper });

    await act(async () => {
      const loadedState = result.current.loadGame();
      await waitForStateUpdate();
      // Should return null when no state is saved
      expect(loadedState).toBeNull();
    });
  });
});
