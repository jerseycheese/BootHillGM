'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { CampaignState, GameAction } from '../types/campaign';
import { addJournalEntry } from '../utils/JournalManager';

// Define the initial state of the campaign
const initialCampaignState: CampaignState = {
  character: null,
  savedTimestamp: null,
  location: '',
  gameProgress: 0,
  journal: [],
  narrative: '',
  inventory: [],
  isCombatActive: false,
  opponent: null,
};

// Reducer function to handle state updates
const campaignReducer = (state: CampaignState, action: GameAction): CampaignState => {
  switch (action.type) {
    case 'SET_CHARACTER':
      return { ...state, character: action.payload };
    case 'SET_LOCATION':
      return { ...state, location: action.payload };
    case 'SET_GAME_PROGRESS':
      return { ...state, gameProgress: action.payload };
    case 'UPDATE_JOURNAL':
      // Handle different types of journal updates
      if (typeof action.payload === 'string') {
        return { ...state, journal: addJournalEntry(state.journal, action.payload) };
      } else if (Array.isArray(action.payload)) {
        return { ...state, journal: [...state.journal, ...action.payload] };
      } else {
        return { ...state, journal: [...state.journal, action.payload] };
      }
    case 'SET_JOURNAL':
      return { ...state, journal: action.payload };
    case 'SET_NARRATIVE':
      return { ...state, narrative: action.payload };
    case 'ADD_ITEM':
      return { ...state, inventory: [...state.inventory, action.payload] };
    case 'REMOVE_ITEM':
      return { ...state, inventory: state.inventory.filter(item => item.id !== action.payload) };
    case 'SET_INVENTORY':
      return { ...state, inventory: action.payload };
    case 'SET_COMBAT_ACTIVE':
      return { ...state, isCombatActive: action.payload };
    case 'SET_SAVED_TIMESTAMP':
      return { ...state, savedTimestamp: action.payload };
    case 'SET_OPPONENT':
      return { ...state, opponent: action.payload };
    default:
      return state;
  }
};

// Create a context for the campaign state
export const CampaignStateContext = createContext<{
  state: CampaignState;
  dispatch: React.Dispatch<GameAction>;
  saveGame: (state: CampaignState) => void;
  loadGame: () => CampaignState | null;
} | null>(null);

// Provider component to wrap the application and provide campaign state
export const CampaignStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(campaignReducer, initialCampaignState);
  
    const saveGame = useCallback((stateToSave: CampaignState) => {
    try {
      const serializedState = JSON.stringify(stateToSave);
      localStorage.setItem('campaignState', serializedState);
      const newTimestamp = Date.now();
      stateToSave.savedTimestamp = newTimestamp;
      dispatch({ type: 'SET_STATE', payload: stateToSave });
      console.log('Game state saved successfully');
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }, []);

  const loadGame = (): CampaignState | null => {
    try {
      const serializedState = localStorage.getItem('campaignState');
      if (serializedState === null) {
        return null;
      }
      const loadedState: CampaignState = JSON.parse(serializedState);
      console.log('Game state loaded successfully');
      return loadedState;
    } catch (error) {
      console.error('Failed to load game state:', error);
      return null;
    }
  };

  // Load initial state
  useEffect(() => {
    const loadedState = loadGame();
    if (loadedState) {
      dispatch({ type: 'SET_STATE', payload: loadedState });
    }
  }, []);

  // Auto-save on state changes
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      console.log('Saving state:', state);
      saveGame(state);
    }, 10000);  // Save game state 10 seconds after last state change

    return () => {
      clearTimeout(saveTimeout);
    };
  }, [state, saveGame]);

  return (
    <CampaignStateContext.Provider value={{ state, dispatch, saveGame, loadGame }}>
      {children}
    </CampaignStateContext.Provider>
  );
};

// Custom hook to use the campaign state
export const useCampaignState = () => {
  const context = useContext(CampaignStateContext);
  if (!context) {
    throw new Error('useCampaignState must be used within a CampaignStateProvider');
  }
  return context;
};
