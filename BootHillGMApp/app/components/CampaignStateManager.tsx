'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { CampaignState, GameAction } from '../types/campaign';
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
  isClient: false,
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
      const newEntries: JournalEntry[] = Array.isArray(action.payload)
        ? action.payload
        : [
            typeof action.payload === 'string'
              ? {
                  timestamp: Date.now(),
                  content: action.payload,
                  narrativeSummary: action.payload,
                }
              : action.payload,
          ];
      return {
        ...state,
        journal: [...(state.journal || []), ...newEntries],
      };
    case 'SET_JOURNAL':
      return {
        ...state,
        journal: Array.isArray(action.payload) ? action.payload : state.journal,
      };
    case 'SET_NARRATIVE':
      return { ...state, narrative: action.payload };
    case 'ADD_ITEM':
      const existingItemIndex = state.inventory.findIndex((item) => item.name === action.payload.name);
      if (existingItemIndex !== -1) {
        // Item already exists, update quantity
        const updatedInventory = [...state.inventory];
        updatedInventory[existingItemIndex] = {
          ...updatedInventory[existingItemIndex],
          quantity: updatedInventory[existingItemIndex].quantity + action.payload.quantity,
        };
        return { ...state, inventory: updatedInventory };
      } else {
        // New item, add to inventory
        return { ...state, inventory: [...state.inventory, action.payload] };
      }
    case 'REMOVE_ITEM': {
      return {
        ...state,
        inventory: state.inventory.filter((item) => item.name !== action.payload),
      };
    }
    case 'UPDATE_ITEM_QUANTITY': {
      /**
       * Handles inventory item quantity updates:
       * - Updates specific item quantities
       * - Removes items when quantity reaches 0
       * - Maintains inventory state consistency
       * - Triggers state persistence after updates
       */
      const { id, quantity } = action.payload;

      // Create a new inventory array with the updated quantity
      const updatedInventory = state.inventory.map((item) => {
        if (item.id === id) {
          return { ...item, quantity };
        }
        return item;
      });

      // Filter out any items with quantity 0
      const filteredInventory = updatedInventory.filter((item) => item.quantity > 0);

      const newState = {
        ...state,
        inventory: filteredInventory,
      };
      return newState;
    }
    case 'SET_INVENTORY':
      return { ...state, inventory: action.payload };
    case 'SET_COMBAT_ACTIVE':
      return { ...state, isCombatActive: action.payload };
    case 'SET_SAVED_TIMESTAMP':
      return { ...state, savedTimestamp: action.payload };
    case 'SET_OPPONENT':
      return { ...state, opponent: action.payload };
    case 'SET_STATE': {
      // Ensure we're not accidentally reverting inventory changes and preserve isClient
      const newState = {
        ...action.payload,
        inventory: action.payload.inventory.map((item) => ({ ...item })),
        isClient: state.isClient, // Preserve the current isClient value
      };

      return newState;
    }
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
  // Update saveGame function to preserve current inventory state and isClient
  const saveGame = useCallback((stateToSave: CampaignState) => {
    try {
      // Create a clean copy of the state
      const cleanState = {
        ...stateToSave,
        inventory: stateToSave.inventory.map((item) => ({ ...item })),
        savedTimestamp: Date.now(),
        isClient: stateToSave.isClient, // Ensure isClient is preserved
      };
      const serializedState = JSON.stringify(cleanState);
      localStorage.setItem('campaignState', serializedState);

      // Update the state with the new savedTimestamp
      dispatch({ type: 'SET_SAVED_TIMESTAMP', payload: cleanState.savedTimestamp });
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }, [dispatch]);

  // Function to load the saved game state
  const loadGame = useCallback((): CampaignState | null => {
    try {
      const serializedState = localStorage.getItem('campaignState');
      if (!serializedState) {
        return null;
      }

      let loadedState: CampaignState;
      try {
        loadedState = JSON.parse(serializedState);
      } catch (parseError) {
        console.error('Failed to parse game state:', parseError);
        if (parseError instanceof Error) {
          console.error('Error type:', parseError.name);
          console.error('Error message:', parseError.message);
        }
        return null;
      }

      dispatch({ type: 'SET_STATE', payload: loadedState });
      return loadedState;
    } catch (error) {
      console.error('Failed to load game state:', error);
      if (error instanceof Error) {
        console.error('Error type:', error.name);
        console.error('Error message:', error.message);
      }
      return null;
    }
  }, [dispatch]);

  // Auto-save on state changes
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      saveGame(state);
    }, 300000); // Save game state 5 minutes after last state change

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
