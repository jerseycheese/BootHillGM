import React from 'react';
import { render, act, renderHook } from '@testing-library/react';
import { CampaignStateProvider, useCampaignState } from '../../components/CampaignStateManager';
import { Character } from '../../types/character';
import { CampaignState } from '../../types/campaign';

jest.setTimeout(15000);

// Helper function to wait for state updates
const waitForStateUpdate = () => new Promise(resolve => setTimeout(resolve, 0));

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
  
    await act(async () => {
      result.current.saveGame(result.current.state);
      await waitForStateUpdate();
    });
  
    const savedState = JSON.parse(localStorage.getItem('campaignState') || '{}');
    console.log('Saved state:', savedState);
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

    console.log('Loaded state:', result.current.state);
    expect(result.current.state).toEqual(testState);
  });

  test('saveGame function saves state correctly', async () => {
    const initialState: CampaignState = {
      character: { name: 'Test Character', health: 100 } as Character,
      location: 'Test Town',
      gameProgress: 0,
      journal: [],
      narrative: '',
      inventory: [],
      isCombatActive: false,
      opponent: null,
      savedTimestamp: null,
      isClient: false, // Add isClient
    };
  
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CampaignStateProvider>{children}</CampaignStateProvider>
    );
  
    const { result } = renderHook(() => useCampaignState(), { wrapper });
  
    await act(async () => {
      result.current.dispatch({ type: 'SET_STATE', payload: initialState });
      await waitForStateUpdate();
    });
  
    await act(async () => {
      result.current.saveGame(result.current.state);
      await waitForStateUpdate();
    });
  
    const savedState = JSON.parse(localStorage.getItem('campaignState') || '{}');
    console.log('Saved state:', savedState);
    expect(savedState).toMatchObject({
      ...initialState,
      savedTimestamp: expect.any(Number)
    });
    expect(result.current.state).toMatchObject({
      ...initialState,
      savedTimestamp: expect.any(Number)
    });
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

    console.log('Loaded state:', result.current.state);
    expect(result.current.state).toEqual(testState);
  });
});
