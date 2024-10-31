'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useState, useRef } from 'react';
import { GameState, GameEngineAction, gameReducer, initialState as initialGameState } from '../utils/gameEngine';
import { InventoryItem } from '../types/inventory';

export const CampaignStateContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameEngineAction>;
  saveGame: (state: GameState) => void;
  loadGame: () => GameState | null;
  cleanupState: () => void;
} | undefined>(undefined);

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
        return { ...initialGameState };
      }
      
      const isInitializing = sessionStorage.getItem('initializing_new_character');
      
      if (isInitializing) {
        return { ...initialGameState, isClient: true };
      }
      
      const savedStateJSON = localStorage.getItem('campaignState');
      
      if (savedStateJSON) {
        try {
          const savedState = JSON.parse(savedStateJSON);
          
          if (!savedState.character || !savedState.character.name) {
            return { ...initialGameState, isClient: true };
          }
          
          // Restore state with proper type handling for combat-related fields
          const restoredState = {
            ...initialGameState,
            ...savedState,
            isClient: true,
            isCombatActive: Boolean(savedState.isCombatActive),
            opponent: savedState.opponent ? {
              ...savedState.opponent,
              health: Number(savedState.opponent.health),
              attributes: { ...savedState.opponent.attributes },
              skills: { ...savedState.opponent.skills }
            } : null,
            combatState: savedState.combatState ? {
              ...savedState.combatState,
              playerHealth: Number(savedState.combatState.playerHealth),
              opponentHealth: Number(savedState.combatState.opponentHealth),
              currentTurn: savedState.combatState.currentTurn,
              combatLog: [...(savedState.combatState.combatLog || [])]
            } : undefined,
            inventory: savedState.inventory?.map((item: InventoryItem) => ({ ...item })) || [],
            journal: savedState.journal || []
          };

          return restoredState;
        } catch (error) {
          console.error('Error parsing saved state:', error);
          return { ...initialGameState, isClient: true };
        }
      }
      return { ...initialGameState, isClient: true };
    } catch {
      return { ...initialGameState };
    }
  };

  const [state, baseDispatch] = useReducer(gameReducer, getInitialState());
  const [isHydrated, setIsHydrated] = useState(false);
  const lastSavedRef = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const dispatch: React.Dispatch<GameEngineAction> = useCallback((action) => {
    baseDispatch(action);
  }, []);

  /**
   * Handles saving the game state to localStorage.
   * Includes special handling for combat state to ensure turn-based combat 
   * persists across page reloads and navigation.
   */
  const saveGame = useCallback((stateToSave: GameState) => {
    try {
      const timestamp = Date.now();
      
      if (timestamp - lastSavedRef.current < 1000) {
        return;
      }

      // Create a clean state with properly preserved combat information
      const cleanState = {
        ...stateToSave,
        // Deep clone arrays to avoid reference issues
        inventory: stateToSave.inventory.map(item => ({ ...item })),
        npcs: [...stateToSave.npcs],
        journal: [...stateToSave.journal],
        // Maintain combat state for ongoing battles
        isCombatActive: Boolean(stateToSave.isCombatActive),
        opponent: stateToSave.opponent ? {
          ...stateToSave.opponent,
          health: Number(stateToSave.opponent.health),
          attributes: { ...stateToSave.opponent.attributes },
          skills: { ...stateToSave.opponent.skills }
        } : null,
        combatState: stateToSave.combatState ? {
          ...stateToSave.combatState,
          playerHealth: Number(stateToSave.combatState.playerHealth),
          opponentHealth: Number(stateToSave.combatState.opponentHealth),
          currentTurn: stateToSave.combatState.currentTurn,
          combatLog: [...stateToSave.combatState.combatLog]
        } : undefined,
        savedTimestamp: timestamp,
        isClient: false
      };

      localStorage.setItem('campaignState', JSON.stringify(cleanState));
      lastSavedRef.current = timestamp;

      if (stateToSave.savedTimestamp !== timestamp) {
        dispatch({ type: 'SET_SAVED_TIMESTAMP', payload: timestamp });
      }
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }, [dispatch]);

  // Auto-save effect for narrative changes
  useEffect(() => {
    if (isHydrated && state.narrative) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        const currentTimestamp = state.savedTimestamp || 0;
        if (currentTimestamp > lastSavedRef.current) {
          saveGame(state);
        }
      }, 1000);

      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }
  }, [isHydrated, saveGame, state]);

  // Combat state persistence effect
  useEffect(() => {
    if (state.combatState && isHydrated) {
      const currentTimestamp = Date.now();
      if (currentTimestamp > lastSavedRef.current) {
        saveGame(state);
      }
    }
  }, [
    isHydrated,
    saveGame,
    state.combatState?.playerHealth,
    state.combatState?.opponentHealth,
    state.combatState?.currentTurn,
    state.isCombatActive,
    state
  ]);

  /**
   * Loads and restores the game state from localStorage.
   * Ensures proper type conversion for combat-related numerical values
   * and maintains combat state consistency.
   */
  const loadGame = useCallback((): GameState | null => {
    try {
      const serializedState = localStorage.getItem('campaignState');
      if (!serializedState) {
        return null;
      }

      const loadedState = JSON.parse(serializedState);
      
      if (!loadedState || !loadedState.savedTimestamp) {
        return null;
      }

      const stateWithClient = {
        ...loadedState,
        isClient: true,
        isCombatActive: Boolean(loadedState.isCombatActive),
        opponent: loadedState.opponent ? {
          ...loadedState.opponent,
          health: Number(loadedState.opponent.health),
          attributes: { ...loadedState.opponent.attributes },
          skills: { ...loadedState.opponent.skills }
        } : null,
        combatState: loadedState.combatState ? {
          ...loadedState.combatState,
          playerHealth: Number(loadedState.combatState.playerHealth),
          opponentHealth: Number(loadedState.combatState.opponentHealth),
          currentTurn: loadedState.combatState.currentTurn,
          combatLog: [...(loadedState.combatState.combatLog || [])]
        } : undefined
      };
      
      dispatch({ type: 'SET_STATE', payload: stateWithClient });
      return stateWithClient;
    } catch (error) {
      console.error('Failed to load game state:', error);
      return null;
    }
  }, [dispatch]);

  const cleanupState = useCallback(() => {
    try {
      sessionStorage.setItem('initializing_new_character', 'true');
      localStorage.removeItem('campaignState');
      const cleanState = { ...initialGameState, isClient: true };
      dispatch({ type: 'SET_STATE', payload: cleanState });
    } finally {
      // Cleanup runs regardless of success/failure
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
