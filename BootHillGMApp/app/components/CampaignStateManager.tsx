'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef, useMemo } from 'react';
import { GameEngineAction } from '../types/gameActions';
import { gameReducer } from '../reducers/gameReducer';
import { GameState } from '../types/gameState';
import { initialState as initialGameState } from '../types/initialState';
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
  const lastSavedRef = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const stateRef = useRef<GameState | null>(null);
  const previousNarrativeRef = useRef<string>('');
  const isInitializedRef = useRef(false);

  const isInitializing = (typeof window !== 'undefined') && Boolean(sessionStorage.getItem('initializing_new_character'));

  const savedStateJSON = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('campaignState');
  }, []);

  const initialState = useCampaignStateRestoration({ 
    isInitializing, 
    savedStateJSON 
  });

  const [state, baseDispatch] = useReducer(gameReducer, initialState);

  const dispatch = baseDispatch;

  // Handle initialization
  useEffect(() => {
    if (!isInitializedRef.current && typeof window !== 'undefined') {
      if (!isInitializing) {
        sessionStorage.removeItem('initializing_new_character');
      }
      isInitializedRef.current = true;
    }
  }, [isInitializing]);

  const saveGame = useCallback((stateToSave: GameState) => {
    try {
      const timestamp = Date.now();
      
      // Prevent rapid consecutive saves and saves during initialization
      if (timestamp - lastSavedRef.current < 1000 || isInitializing || !isInitializedRef.current) {
        return;
      }

      stateRef.current = stateToSave;

      // Create a clean state with properly preserved combat information
      const cleanState = {
        ...stateToSave,
        inventory: stateToSave.inventory.map((item: InventoryItem) => ({ ...item })),
        npcs: [...stateToSave.npcs],
        journal: [...stateToSave.journal],
        isCombatActive: Boolean(stateToSave.isCombatActive),
        opponent: stateToSave.opponent ? {
          ...stateToSave.opponent,
          attributes: { ...stateToSave.opponent.attributes }
        } : null,
        combatState: stateToSave.combatState 
          ? ensureCombatState(stateToSave.combatState)
          : undefined,
        savedTimestamp: timestamp,
        isClient: true // Ensure isClient is set to true
      };

      localStorage.setItem('campaignState', JSON.stringify(cleanState));
      lastSavedRef.current = timestamp;
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }, [isInitializing]);

  // Auto-save effect for narrative changes
  useEffect(() => {
    if (!isInitializedRef.current || !state.narrative || state.narrative === previousNarrativeRef.current) {
      return;
    }

    previousNarrativeRef.current = state.narrative;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveGame(state);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state, state.narrative, saveGame]);

  // Combat state persistence effect
  useEffect(() => {
    if (!isInitializedRef.current || !state.combatState) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveGame(state);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    state,
    state.combatState,
    state.isCombatActive,
    saveGame
  ]);

  // Add beforeunload handler for combat state
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentState = stateRef.current;
      if (currentState?.isCombatActive && currentState?.combatState) {
        localStorage.setItem('campaignState', JSON.stringify({
          ...currentState,
          savedTimestamp: Date.now(),
          isClient: true // Ensure isClient is set to true
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

      let loadedState;
      try {
        loadedState = JSON.parse(serializedState);
      } catch {
        return null;
      }
      
      if (!loadedState || !loadedState.savedTimestamp) {
        return null;
      }

      const restoredState = {
        ...initialGameState,
        ...loadedState,
        isClient: true, // Ensure isClient is set to true
        isCombatActive: Boolean(loadedState.isCombatActive),
        opponent: loadedState.opponent ? {
          ...loadedState.opponent,
          attributes: { ...loadedState.opponent.attributes },
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
