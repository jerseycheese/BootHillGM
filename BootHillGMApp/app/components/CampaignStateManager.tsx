'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CampaignState, GameAction } from '../types/campaign';
import { addJournalEntry } from '../utils/JournalManager';

// Define the initial state of the campaign
const initialCampaignState: CampaignState = {
  character: null,
  location: '',
  gameProgress: 0,
  journal: [],
  narrative: '',
  inventory: [],
  isCombatActive: false,
  opponent: null,
};

// Reducer function to handle state updates based on dispatched actions
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
    case 'SET_OPPONENT':
      return { ...state, opponent: action.payload };
    default:
      return state;
  }
};

// Create a context for the campaign state
const CampaignStateContext = createContext<{
  state: CampaignState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

// Provider component to wrap the application and provide campaign state
export const CampaignStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(campaignReducer, initialCampaignState);

  // Load campaign state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('campaignState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Dispatch actions to set the loaded state
        dispatch({ type: 'SET_CHARACTER', payload: parsedState.character });
        dispatch({ type: 'SET_LOCATION', payload: parsedState.location });
        dispatch({ type: 'SET_GAME_PROGRESS', payload: parsedState.gameProgress });
        dispatch({ type: 'SET_JOURNAL', payload: parsedState.journal });
        dispatch({ type: 'SET_NARRATIVE', payload: parsedState.narrative });
        dispatch({ type: 'SET_INVENTORY', payload: parsedState.inventory });
        dispatch({ type: 'SET_COMBAT_ACTIVE', payload: parsedState.isCombatActive });
        dispatch({ type: 'SET_OPPONENT', payload: parsedState.opponent });
      } catch (error) {
        console.error('Error loading campaign state:', error);
      }
    }
  }, []);

  // Save campaign state to localStorage whenever the state changes
  useEffect(() => {
    localStorage.setItem('campaignState', JSON.stringify(state));
  }, [state]);

  return <CampaignStateContext.Provider value={{ state, dispatch }}>{children}</CampaignStateContext.Provider>;
};

// Custom hook to access the campaign state and dispatch function
export const useCampaignState = () => {
  const context = useContext(CampaignStateContext);
  if (!context) {
    throw new Error('useCampaignState must be used within a CampaignStateProvider');
  }
  return context;
};