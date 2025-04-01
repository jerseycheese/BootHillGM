'use client';

import React, { useReducer, useEffect, useRef, useMemo } from 'react';
import { GameEngineAction } from '../types/gameActions';
import { gameReducer } from '../reducers/gameReducer';
import { GameState } from '../types/gameState';
import { useCampaignStateRestoration } from '../hooks/useCampaignStateRestoration';
import { adaptStateForTests, legacyGetters } from '../utils/stateAdapters';
import { createCompatibleDispatch } from '../types/gameActionsAdapter';
import { ExtendedGameState } from '../types/extendedState';
import { CampaignStateContext } from '../hooks/useCampaignStateContext';
import { useCampaignStatePersistence } from '../hooks/useCampaignStatePersistence';
import { useStateCleanup } from '../hooks/useStateCleanup';
import { useAutoSave } from '../hooks/useAutoSave';
import { useBeforeUnloadHandler } from '../hooks/useBeforeUnloadHandler';
import { JournalEntry } from '../types/journal';
import { NarrativeContext } from '../types/narrative/context.types';

/**
 * Safe access to browser storage APIs that works with SSR/SSG
 */
const isBrowser = typeof window !== 'undefined';

const safeStorage = {
  local: {
    getItem: (key: string): string | null => {
      if (!isBrowser) return null;
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.error('Error accessing localStorage:', e);
        return null;
      }
    },
    setItem: (key: string, value: string): void => {
      if (!isBrowser) return;
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.error('Error writing to localStorage:', e);
      }
    }
  },
  session: {
    getItem: (key: string): string | null => {
      if (!isBrowser) return null;
      try {
        return sessionStorage.getItem(key);
      } catch (e) {
        console.error('Error accessing sessionStorage:', e);
        return null;
      }
    },
    setItem: (key: string, value: string): void => {
      if (!isBrowser) return;
      try {
        sessionStorage.setItem(key, value);
      } catch (e) {
        console.error('Error writing to sessionStorage:', e);
      }
    },
    removeItem: (key: string): void => {
      if (!isBrowser) return;
      try {
        sessionStorage.removeItem(key);
      } catch (e) {
        console.error('Error removing from sessionStorage:', e);
      }
    }
  }
};

/**
 * CampaignStateProvider component manages the game state for a campaign session.
 * It combines multiple specialized hooks for state management, persistence, and cleanup.
 * 
 * This component:
 * - Initializes and maintains game state
 * - Provides state saving and loading functionality
 * - Handles state cleanup for new game sessions
 * - Manages auto-saving for important state changes
 * - Provides backward compatibility through legacy getters
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render within the provider
 */
export const CampaignStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isInitializedRef = useRef(false);
  const isInitializing = isBrowser && Boolean(safeStorage.session.getItem('initializing_new_character'));

  // Get the saved state from localStorage
  const savedStateJSON = useMemo(() => {
    return safeStorage.local.getItem('campaignState');
  }, []);
  
  // Only log in development mode and in the browser
  useEffect(() => {
    if (isBrowser && process.env.NODE_ENV === 'development') {
      console.log('CampaignStateManager: Reading campaignState from localStorage:', savedStateJSON);
    }
  }, [savedStateJSON]);

  // Restore the campaign state
  const initialState = useCampaignStateRestoration({ 
    isInitializing, 
    savedStateJSON 
  });

  // Create an extended initial state by adding the properties needed by ExtendedGameState
  const extendedInitialState: ExtendedGameState = {
    ...initialState,
    opponent: null, // Ensure opponent is always null, not undefined
    combatState: undefined,
    entries: []
  };

  // Use the gameReducer with the extended initial state
  const [state, originalDispatch] = useReducer(gameReducer, extendedInitialState);
  
  // Create compatible dispatch that handles legacy actions
  // Use type assertion to satisfy the parameter constraint, then cast the result
  const dispatch = createCompatibleDispatch(originalDispatch as unknown as React.Dispatch<unknown>) as React.Dispatch<GameEngineAction>;
  
  // Apply adapters for backward compatibility - use explicit cast to handle type mismatch
  const adaptedState = adaptStateForTests(state as GameState);

  // Handle initialization
  useEffect(() => {
    if (!isInitializedRef.current && isBrowser) {
      if (!isInitializing) {
        safeStorage.session.removeItem('initializing_new_character');
      }
      isInitializedRef.current = true;
    }
  }, [isInitializing]);

  // State persistence logic
  const { saveGame, loadGame, stateRef } = useCampaignStatePersistence(
    isInitializing, 
    isInitializedRef,
    dispatch
  );

  // State cleanup logic
  const cleanupState = useStateCleanup(state as GameState, dispatch);

  // Auto-save logic for narrative and combat changes
  useAutoSave(state as GameState, saveGame, isInitializedRef);

  // Before unload handler for combat state
  useBeforeUnloadHandler(stateRef);

  // Create context value with legacy getters for backward compatibility
  const contextValue = useMemo(() => ({
    state: adaptedState,
    dispatch,
    saveGame,
    loadGame,
    cleanupState,
    
    // Legacy getters for backward compatibility
    player: legacyGetters.getPlayer(state as GameState),
    opponent: legacyGetters.getOpponent(state as GameState),
    inventory: legacyGetters.getItems(state as GameState),
    entries: legacyGetters.getEntries(state as GameState) as JournalEntry[],
    isCombatActive: legacyGetters.isCombatActive(state as GameState),
    narrativeContext: legacyGetters.getNarrativeContext(state as GameState) as NarrativeContext | undefined,
  }), [state, adaptedState, dispatch, saveGame, loadGame, cleanupState]);

  return (
    <div
      id="bhgmCampaignStateManager"
      data-testid="campaign-state-manager"
      className="bhgm-campaign-state-manager"
    >
      <CampaignStateContext.Provider value={contextValue}>
        {children}
      </CampaignStateContext.Provider>
    </div>
  );
};

CampaignStateProvider.displayName = 'CampaignStateProvider';

// Re-export the context hook for convenience
export { useCampaignState, CampaignStateContext } from '../hooks/useCampaignStateContext';
