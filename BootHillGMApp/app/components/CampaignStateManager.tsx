'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CampaignState, Action } from '../types/campaign';

// Define the initial state of the campaign
const initialCampaignState: CampaignState = {
  character: null,
  currentLocation: '',
  gameProgress: 0,
  journal: [],
  narrative: '',
  inventory: [],
  isCombatActive: false,
  opponent: null,
};

// Reducer function to handle state updates based on dispatched actions
const campaignReducer = (state: CampaignState, action: Action): CampaignState => {
  switch (action.type) {
    case 'SET_CHARACTER':
      return { ...state, character: action.payload };
    case 'SET_LOCATION':
      return { ...state, currentLocation: action.payload };
    case 'SET_GAME_PROGRESS':
      return { ...state, gameProgress: action.payload };
    case 'UPDATE_JOURNAL':
      return { ...state, journal: action.payload };
    case 'SET_NARRATIVE':
      return { ...state, narrative: action.payload };
    case 'ADD_ITEM':
      return { ...state, inventory: [...state.inventory, action.payload] };
    case 'REMOVE_ITEM':
        return { ...state, inventory: state.inventory.filter(item => item.id !== action.payload) };
    case 'SET_INVENTORY':
        return { ...state, inventory: action.payload };
    default:
      return state;
  }
};

// Create context for the campaign state
const CampaignStateContext = createContext<{ state: CampaignState; dispatch: React.Dispatch<Action> } | null>(null);

// Provider component to wrap the application and provide campaign state
export const CampaignStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(campaignReducer, initialCampaignState);

  // Load campaign state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('campaignState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'SET_CHARACTER', payload: parsedState.character });
        dispatch({ type: 'SET_LOCATION', payload: parsedState.currentLocation });
        dispatch({ type: 'SET_GAME_PROGRESS', payload: parsedState.gameProgress });
        dispatch({ type: 'UPDATE_JOURNAL', payload: parsedState.journal });
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