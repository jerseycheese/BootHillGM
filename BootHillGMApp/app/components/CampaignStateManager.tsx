'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { GameState, GameEngineAction, gameReducer, initialState as initialGameState } from '../utils/gameEngine';
import { useCampaignStateRestoration } from '../hooks/useCampaignStateRestoration';
import { InventoryItem } from '../types/inventory';
import { ensureCombatState } from '../types/combat';

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
  const initializationRef = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const lastSavedRef = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const stateRef = useRef<GameState | null>(null);

  const isInitializing = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(sessionStorage.getItem('initializing_new_character'));
  }, []);

  const savedStateJSON = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('campaignState');
  }, []);

  const initialState = useCampaignStateRestoration({ 
    isInitializing, 
    savedStateJSON 
  });

  const [state, baseDispatch] = useReducer(gameReducer, initialState);

  // Keep stateRef updated with latest state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Handle hydration once on mount
  useEffect(() => {
    if (!initializationRef.current) {
      initializationRef.current = true;
      setIsHydrated(true);
      // Clear initialization flag only if we're not actively initializing
      if (!isInitializing) {
        sessionStorage.removeItem('initializing_new_character');
      }
    }
  }, [isInitializing]);

  const dispatch = useCallback((action: GameEngineAction) => {
    baseDispatch(action);
  }, []);

  const saveGame = useCallback((stateToSave: GameState) => {
    try {
      const timestamp = Date.now();
      
      if (timestamp - lastSavedRef.current < 1000) {
        return;
      }

      // Create a clean state with properly preserved combat information
      const cleanState = {
        ...stateToSave,
        inventory: stateToSave.inventory.map((item: InventoryItem) => ({ ...item })),
        npcs: [...stateToSave.npcs],
        journal: [...stateToSave.journal],
        isCombatActive: Boolean(stateToSave.isCombatActive),
        opponent: stateToSave.opponent ? {
          ...stateToSave.opponent,
          attributes: { ...stateToSave.opponent.attributes },
          skills: { ...stateToSave.opponent.skills }
        } : null,
        combatState: stateToSave.combatState 
          ? ensureCombatState(stateToSave.combatState)
          : undefined,
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
    if (!isHydrated || !state.narrative) return;

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
  }, [isHydrated, saveGame, state, state.narrative, state.savedTimestamp]);

  // Combat state persistence effect
  useEffect(() => {
    if (!state.combatState || !isHydrated) return;

    const currentTimestamp = Date.now();
    if (currentTimestamp > lastSavedRef.current) {
      saveGame(state);
    }
  }, [
    isHydrated,
    saveGame,
    state,
    state.combatState?.playerStrength,
    state.combatState?.opponentStrength,
    state.combatState?.currentTurn,
    state.isCombatActive
  ]);

  // Add beforeunload handler for combat state
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentState = stateRef.current;
      if (currentState?.isCombatActive && currentState?.combatState) {
        localStorage.setItem('campaignState', JSON.stringify({
          ...currentState,
          savedTimestamp: Date.now(),
          isClient: false
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

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

      const restoredState = {
        ...initialGameState,
        ...loadedState,
        isClient: true,
        isCombatActive: Boolean(loadedState.isCombatActive),
        opponent: loadedState.opponent ? {
          ...loadedState.opponent,
          attributes: { ...loadedState.opponent.attributes },
          skills: { ...loadedState.opponent.skills },
          wounds: [...(loadedState.opponent.wounds || [])],
          isUnconscious: Boolean(loadedState.opponent.isUnconscious)
        } : null,
        combatState: loadedState.combatState 
          ? ensureCombatState(loadedState.combatState)
          : undefined,
        inventory: loadedState.inventory?.map((item: InventoryItem) => ({ ...item })) || [],
        journal: loadedState.journal || []
      };
      
      dispatch({ type: 'SET_STATE', payload: restoredState });
      return restoredState;
    } catch (error) {
      console.error('Failed to load game state:', error);
      return null;
    }
  }, [dispatch]);

  const cleanupState = useCallback(() => {
    // Set initialization flag before state cleanup
    sessionStorage.setItem('initializing_new_character', 'true');
    localStorage.removeItem('campaignState');
    const cleanState = { ...initialGameState, isClient: true };
    dispatch({ type: 'SET_STATE', payload: cleanState });
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
