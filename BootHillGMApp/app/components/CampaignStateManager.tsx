'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { CampaignState, GameAction } from '../types/campaign';
import { addJournalEntry } from '../utils/JournalManager';
import { JournalEntry } from '../types/journal';

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
      const newEntry: JournalEntry = typeof action.payload === 'string' 
        ? { timestamp: Date.now(), content: action.payload }
        : action.payload as JournalEntry;
      return { 
        ...state, 
        journal: [...state.journal, newEntry]
      };
    case 'SET_JOURNAL':
      return { ...state, journal: action.payload };
    case 'SET_NARRATIVE':
      return { ...state, narrative: action.payload };
    case 'ADD_ITEM':
      return { ...state, inventory: [...state.inventory, action.payload] };
    case 'REMOVE_ITEM':
      return { ...state, inventory: state.inventory.filter(item => item.id !== action.payload) };
    case 'UPDATE_ITEM_QUANTITY':
      return {
        ...state,
        inventory: state.inventory.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ),
      };
    case 'SET_INVENTORY':
      return { ...state, inventory: action.payload };
    case 'SET_COMBAT_ACTIVE':
      return { ...state, isCombatActive: action.payload };
    case 'SET_SAVED_TIMESTAMP':
      return { ...state, savedTimestamp: action.payload };
    case 'SET_OPPONENT':
      return { ...state, opponent: action.payload };
    case 'SET_STATE':
      // Replace the entire state with the provided payload
      return action.payload;
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
  const [state, baseDispatch] = useReducer(campaignReducer, initialCampaignState);

  // Wrap dispatch to handle async actions
  const dispatch: React.Dispatch<GameAction> = useCallback((action) => {
    if (action.type === 'UPDATE_JOURNAL') {
      baseDispatch(action); // Dispatch the action directly
      // The actual journal update will be handled in the reducer
    } else {
      baseDispatch(action);
    }
  }, [baseDispatch]); // Only depend on baseDispatch
  
  // Function to save the current game state
  const saveGame = useCallback((stateToSave: CampaignState) => {
    try {
      // Add a timestamp to the state before saving
      const stateWithTimestamp = {
        ...stateToSave,
        savedTimestamp: Date.now()
      };
      const serializedState = JSON.stringify(stateWithTimestamp);
      localStorage.setItem('campaignState', serializedState);
      // Update the state with the new timestamp
      dispatch({ type: 'SET_STATE', payload: stateWithTimestamp });
      console.log('Game state saved successfully');
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }, [dispatch]);

  // Function to load the saved game state
  const loadGame = useCallback((): CampaignState | null => {
    try {
      const serializedState = localStorage.getItem('campaignState');
      if (serializedState === null) {
        console.log('No saved state found');
        return null;
      }
      const loadedState: CampaignState = JSON.parse(serializedState);
      // Update the state with the loaded data
      dispatch({ type: 'SET_STATE', payload: loadedState });
      console.log('Game state loaded successfully');
      return loadedState;
    } catch (error) {
      console.error('Failed to load game state:', error);
      return null;
    }
  }, [dispatch]);

  // Auto-save on state changes
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      console.log('Auto-saving state:', state);
      saveGame(state);
    }, 300000);  // Save game state 5 minutes after last state change

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
