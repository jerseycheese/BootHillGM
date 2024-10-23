import React from 'react';
import { render, act, renderHook } from '@testing-library/react';
import { CampaignStateProvider, useCampaignState } from '../../components/CampaignStateManager';
import { Character } from '../../types/character';
import { CampaignState } from '../../types/campaign';

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
    expect(initialState.character).toBeNull();
    expect(initialState.location).toBe('');
    expect(initialState.gameProgress).toBe(0);
    expect(initialState.journal).toEqual([]);
    expect(initialState.narrative).toBe('');
    expect(initialState.inventory).toEqual([]);
    expect(initialState.isCombatActive).toBe(false);
    expect(initialState.opponent).toBeNull();
    expect(initialState.savedTimestamp).toBeNull();
    expect(initialState.isClient).toBe(false); // Check isClient
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
        dispatch({ type: 'SET_CHARACTER', payload: testCharacter });
        dispatch({ type: 'SET_LOCATION', payload: 'Test Town' });
        dispatch({ type: 'UPDATE_JOURNAL', payload: 'Test journal entry' });
        dispatch({ type: 'SET_NARRATIVE', payload: 'Test narrative' });
        dispatch({ type: 'ADD_ITEM', payload: { id: '1', name: 'Test Item', quantity: 1, description: 'A test item' } });
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
    expect(updatedState.isClient).toBe(false); // Check isClient
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
      await waitForStateUpdate();
    });
  
    let savedTimestamp: number;
    await act(async () => {
      savedTimestamp = Date.now();
      result.current.dispatch({ type: 'SET_SAVED_TIMESTAMP', payload: savedTimestamp });
    });
  
    // Force a save
    await act(async () => {
      result.current.saveGame(result.current.state);
      await waitForStateUpdate();
    });
  
    const savedState = JSON.parse(localStorage.getItem('campaignState') || '{}');
    expect(savedState.character).toEqual(savedCharacter);
    expect(savedState.savedTimestamp).toBeDefined();
    expect(savedState.isClient).toBe(false); // Check isClient
    expect(result.current.state.character).toEqual(savedCharacter);
    expect(result.current.state.savedTimestamp).toBeDefined();
    expect(result.current.state.isClient).toBe(false); // Check isClient
  });

  test('loads state from localStorage', async () => {
    const testState: CampaignState = {
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
      journal: [{ timestamp: Date.now(), content: 'Entry 1' }],
      narrative: 'Loaded narrative',
      inventory: [{ id: '1', name: 'Loaded Item', quantity: 1, description: 'A loaded item' }],
      isCombatActive: false,
      opponent: null,
      savedTimestamp: Date.now(),
      isClient: false, // Add isClient
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

    expect(result.current.state).toEqual(testState);
  });

  test('saveGame function saves state correctly', async () => {
    // Unmock console.log for this test
    jest.spyOn(console, 'log').mockRestore();

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
    expect(result.current.state).toMatchObject({
      character: savedCharacter,
      location: '',
      narrative: '',
      inventory: [],
      journal: [],
      gameProgress: 0,
      isCombatActive: false,
      opponent: null,
      savedTimestamp: expect.any(Number),
      isClient: false
    });

    // Ensure the savedTimestamp in the state matches the one in localStorage
    expect(result.current.state.savedTimestamp).toBe(savedState.savedTimestamp);
  });

  test('loadGame function loads state correctly', async () => {
    const testState: CampaignState = {
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
      isCombatActive: false,
      opponent: null,
      savedTimestamp: Date.now(),
      isClient: false, // Add isClient
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

    expect(result.current.state).toEqual(testState);
  });

  test('loadGame handles minimal state correctly', async () => {
    // Test with minimal state (no character, just basic game state)
    const minimalState: CampaignState = {
      character: null,
      location: 'Test Town',
      narrative: 'Test narrative',
      inventory: [],
      journal: [],
      gameProgress: 0,
      isCombatActive: false,
      opponent: null,
      savedTimestamp: Date.now(),
      isClient: false
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

    // Verify loaded state matches saved state
    expect(result.current.state).toMatchObject(minimalState);
    // Specifically verify null character is preserved
    expect(result.current.state.character).toBeNull();
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
      expect(console.error).toHaveBeenCalledWith('Failed to parse game state:', expect.any(Error));
      expect(console.error).toHaveBeenCalledWith('Error type:', 'SyntaxError');
      expect(console.error).toHaveBeenCalledWith('Error message:', expect.stringContaining('Unexpected token'));
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
      // Should log a message
      expect(console.log).toHaveBeenCalledWith('No saved game state found in localStorage');
    });
  });
});
