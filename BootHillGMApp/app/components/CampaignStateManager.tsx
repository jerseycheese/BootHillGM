/**
 * Campaign State Manager
 * 
 * Provides a global state context for managing game state across the application.
 * Handles state initialization, persistence, and access patterns.
 */

'use client';

import React, { useReducer, useEffect, useState } from 'react';
import { initialGameState } from '../types/gameState';
import { GameAction } from '../types/actions';
import { gameReducer } from '../reducers/gameReducer';
import { CampaignStateContextType } from '../types/campaignState.types';
import GameStorage from '../utils/gameStorage';
import { ActionTypes } from '../types/actionTypes';
import { CampaignStateContext } from '../hooks/useCampaignStateContext';
import { CampaignStateProvider } from './CampaignStateProvider';

interface CampaignStateManagerProps {
  children: React.ReactNode;
}

/**
 * Campaign State Manager Component
 * 
 * Provides state management for the entire game campaign.
 * Handles state initialization, updates, and persistence.
 */
export const CampaignStateManager: React.FC<CampaignStateManagerProps> = ({ children }) => {
  // Initialize state with default values
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Create a wrapped dispatch function that adds metadata
  const narrativeDispatchWrapper = (action: GameAction) => {
    // Add metadata to action if needed
    switch (action.type) {
      case ActionTypes.ADD_NARRATIVE_HISTORY:
        // If the action was dispatched with a string payload, convert to object
        if (typeof action.payload === 'string') {
          dispatch({
            type: action.type,
            payload: action.payload,
            meta: { timestamp: Date.now() }
          });
        } else {
          // Pass through object payloads with added metadata
          dispatch({
            ...action,
            meta: { ...(action.meta || {}), timestamp: Date.now() }
          });
        }
        break;
        
      default:
        // For all other actions, just dispatch normally
        dispatch(action);
    }
  };
  
  // Initialize the game state
  useEffect(() => {
    if (isInitialized) return;
    
    const loadInitialState = async () => {
      try {
        const savedGameState = GameStorage.getGameState();
        
        // If we have a saved game state, use it
        if (savedGameState) {
          // Load the game state through the state lifecycle
          dispatch({ type: ActionTypes.LOAD_GAME });
        } else {
          // Initialize a new game
          dispatch({ 
            type: ActionTypes.SET_STATE, 
            payload: GameStorage.initializeNewGame()
          });
        }
      } catch (err) {
        console.error("Error initializing game state:", err);
        // If there's an error, start with a clean state
        dispatch({ 
          type: ActionTypes.SET_STATE, 
          payload: GameStorage.initializeNewGame()
        });
      } finally {
        setIsInitialized(true);
      }
    };
    
    loadInitialState();
  }, [isInitialized]);
  
  // Utility functions exposed through context
  const saveGame = () => {
    narrativeDispatchWrapper({ type: ActionTypes.SAVE_GAME });
  };
  
  const loadGame = () => {
    narrativeDispatchWrapper({ type: ActionTypes.LOAD_GAME });
  };
  
  const cleanupState = () => {
    narrativeDispatchWrapper({ type: ActionTypes.RESET_STATE });
  };
  
  // Create a context value with all derived state properties
  const contextValue: CampaignStateContextType = {
    state,
    dispatch: narrativeDispatchWrapper,
    saveGame,
    loadGame,
    cleanupState,
    
    // Derived state accessors for convenience
    player: state.character?.player || null,
    opponent: state.character?.opponent || null,
    inventory: state.inventory?.items || [],
    entries: state.journal?.entries || [],
    isCombatActive: state.combat?.isActive || false,
    narrativeContext: state.narrative?.narrativeContext
  };
  
  return (
    <CampaignStateContext.Provider value={contextValue}>
      {children}
    </CampaignStateContext.Provider>
  );
};

// Export the CampaignStateProvider for easier use in tests
export { CampaignStateProvider };
