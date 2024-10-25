'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useState, useRef } from 'react';
import { GameState, GameEngineAction, gameReducer, initialState as initialGameState } from '../utils/gameEngine';

// Create the context with the cleanup function
export const CampaignStateContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameEngineAction>;
  saveGame: (state: GameState) => void;
  loadGame: () => GameState | null;
  cleanupState: () => void;
} | undefined>(undefined);

// Custom hook to use the campaign state
export const useCampaignState = () => {
  const context = useContext(CampaignStateContext);
  if (context === undefined) {
    throw new Error('useCampaignState must be used within a CampaignStateProvider');
  }
  return context;
};

export const CampaignStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialState = (): GameState => {
    try {
      if (typeof window === 'undefined') {
        return initialGameState;
      }
      
      // Immediately check for initialization flag
      const isInitializing = sessionStorage.getItem('initializing_new_character');
      
      if (isInitializing) {
        return { ...initialGameState, isClient: true };
      }
      
      // Check localStorage
      const savedStateJSON = localStorage.getItem('campaignState');
      
      if (savedStateJSON) {
        try {
          const savedState = JSON.parse(savedStateJSON);
          
          // Quick validation of saved state
          if (!savedState.character || !savedState.character.name) {
            return { ...initialGameState, isClient: true };
          }
          
          return { ...savedState, isClient: true };
        } catch {
          return { ...initialGameState, isClient: true };
        }
      }
      return initialGameState;
    } catch {
      return initialGameState;
    }
  };

  const [state, baseDispatch] = useReducer(gameReducer, getInitialState());
  const [isHydrated, setIsHydrated] = useState(false);
  const lastSavedRef = useRef<number>(0);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const dispatch: React.Dispatch<GameEngineAction> = useCallback((action) => {
    baseDispatch(action);
  }, []);

  const saveGame = useCallback((stateToSave: GameState) => {
    try {
      // Add timestamp for save verification
      const timestamp = Date.now();
      const cleanState = {
        ...stateToSave,
        inventory: stateToSave.inventory.map((item) => ({ ...item })),
        savedTimestamp: timestamp,
        isClient: false  // Changed from true to false for storage
      };

      const serializedState = JSON.stringify(cleanState);
      localStorage.setItem('campaignState', serializedState);
      lastSavedRef.current = timestamp;

      // Update React state with the new timestamp
      dispatch({ type: 'SET_SAVED_TIMESTAMP', payload: timestamp });

    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }, [dispatch]);

  // Autosave effect
  useEffect(() => {
    if (isHydrated && state.narrative) {
      const currentTimestamp = state.savedTimestamp || 0;
      if (currentTimestamp > lastSavedRef.current) {
        saveGame(state);
      }
    }
  }, [isHydrated, state, saveGame]);

  const loadGame = useCallback((): GameState | null => {
    try {
      const serializedState = localStorage.getItem('campaignState');
      if (!serializedState) {
        return null;
      }

      const loadedState = JSON.parse(serializedState);
      
      // Only load if the saved state is newer than what we have
      if (!state.savedTimestamp || loadedState.savedTimestamp > state.savedTimestamp) {
        const stateWithClient = {
          ...loadedState,
          isClient: true
        };
        
        dispatch({ type: 'SET_STATE', payload: stateWithClient });
        return stateWithClient;
      } else {
        return state;
      }
    } catch {
      return null;
    }
  }, [state, dispatch]);

  // Add cleanup function
const cleanupState = useCallback(() => {
    try {
      // Performs a complete state cleanup when creating a new character
      // 1. Sets initialization flag to ensure fresh state on next load
      // 2. Clears existing game state from storage
      // 3. Forces immediate state reset to prevent stale data
      sessionStorage.setItem('initializing_new_character', 'true');
      
      // Clear all game state
      localStorage.removeItem('campaignState');
      
      // Force immediate state reset
      const cleanState = { ...initialGameState, isClient: true };
      dispatch({ type: 'SET_STATE', payload: cleanState });
    } finally {
    }
}, [dispatch]);

  if (!isHydrated) {
    return null;
  }

  return (
    <CampaignStateContext.Provider value={{ 
      state, 
      dispatch, 
      saveGame, 
      loadGame,
      cleanupState 
    }}>
      {children}
    </CampaignStateContext.Provider>
  );
};
