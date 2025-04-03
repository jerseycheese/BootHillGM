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
import GameStorage from '../utils/gameStorage';

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
 * Fixes the campaign state by combining data from multiple localStorage keys using GameStorage utility
 */
function fixCampaignState() {
  if (!isBrowser) return null;
  
  try {
    // Get existing campaign state
    const campaignStateJSON = safeStorage.local.getItem('campaignState');
    const campaignState: Record<string, unknown> = campaignStateJSON ? JSON.parse(campaignStateJSON) : {};
    
    // Check if character data is needed
    if (!campaignState.character || !(campaignState.character as Record<string, unknown>).player) {
      // Use GameStorage to get character data
      const characterState = GameStorage.getCharacter();
      if (characterState.player) {
        campaignState.character = characterState;
      }
    }
    
    // Get narrative data if needed
    if (!campaignState.narrative || !(campaignState.narrative as Record<string, unknown>).initialNarrative) {
      // Get narrative text from GameStorage
      const narrativeText = GameStorage.getNarrativeText();
      if (narrativeText) {
        // Initialize narrative if needed
        if (!campaignState.narrative) {
          campaignState.narrative = {};
        }
        // Add narrative text
        (campaignState.narrative as Record<string, unknown>).initialNarrative = narrativeText;
        (campaignState.narrative as Record<string, unknown>).narrativeHistory = narrativeText.split('\n');
      }
    }
    
    // Get suggested actions if needed
    if (!campaignState.suggestedActions || !(campaignState.suggestedActions as Array<unknown>).length) {
      campaignState.suggestedActions = GameStorage.getSuggestedActions();
    }
    
    // Get journal entries if needed
    if (!campaignState.journal || 
        (typeof campaignState.journal === 'object' && 
         // Check if 'entries' exists and is an array before checking length
         (!('entries' in (campaignState.journal as object)) ||
          !Array.isArray((campaignState.journal as { entries: unknown }).entries) ||
          (campaignState.journal as { entries: unknown[] }).entries.length === 0))) {
      const journalEntries = GameStorage.getJournalEntries();
      if (journalEntries.length > 0) {
        campaignState.journal = {
          entries: journalEntries
        };
      }
    }
    
    // Save the fixed state
    safeStorage.local.setItem('campaignState', JSON.stringify(campaignState));
    return JSON.stringify(campaignState);
  } catch (e) {
    console.error('Error fixing campaign state:', e);
    return null;
  }
}

/**
 * Ensures character state is properly initialized in case of a new game
 */
function ensureCharacterState(state: GameState): GameState {
  // Check if character state is missing or invalid
  if (!state.character || 
      (typeof state.character === 'object' && 
       'player' in state.character && 
       !state.character.player)) {
    
    // Use GameStorage to get character data
    const characterState = GameStorage.getCharacter();
    
    // Return updated state with character data
    return {
      ...state,
      character: characterState
    };
  }
  
  return state;
}

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
  
  // First attempt to fix the state if needed
  const fixedStateRef = useRef<string | null>(null);
  
  // Get the saved state from localStorage
  const savedStateJSON = useMemo(() => {
    // If we've already fixed the state, use that
    if (fixedStateRef.current) return fixedStateRef.current;
    
    // Otherwise, try to fix the state first
    const rawState = safeStorage.local.getItem('campaignState');
    
    // Check if state needs fixing (has null player or missing narrative)
    const needsFix = !rawState || 
                     rawState.includes('"player":null') || 
                     !rawState.includes('"narrative"');
    
    if (needsFix) {
      // Try to fix the state by combining data from different sources
      const fixedState = fixCampaignState();
      if (fixedState) {
        console.log('Fixed campaign state');
        fixedStateRef.current = fixedState;
        return fixedState;
      }
    }
    
    return rawState;
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
  const _adaptedState = adaptStateForTests(state as GameState);

  // Handle initialization
  useEffect(() => {
    if (!isInitializedRef.current && isBrowser) {
      if (!isInitializing) {
        safeStorage.session.removeItem('initializing_new_character');
      }
      isInitializedRef.current = true;
      
      // Ensure character state is properly initialized
      if (!state.character || 
          (typeof state.character === 'object' && 
           'player' in state.character && 
           !state.character.player)) {
        
        // Use GameStorage to get character data
        const characterState = GameStorage.getCharacter();
        
        // Update state with character data
        if (characterState.player) {
          dispatch({
            // Use namespaced type and pass the player character object
            // Use the non-namespaced type expected by GameEngineAction
            type: 'SET_CHARACTER',
            payload: characterState.player
          });
        }
      }
    }
  }, [isInitializing, state, dispatch]);

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
  const contextValue = useMemo(() => {
    // Ensure character state is valid
    const validatedState = ensureCharacterState(state as GameState);
    
    return {
      state: adaptStateForTests(validatedState),
      dispatch,
      saveGame,
      loadGame,
      cleanupState,
      
      // Legacy getters for backward compatibility
      player: legacyGetters.getPlayer(validatedState),
      opponent: legacyGetters.getOpponent(validatedState),
      inventory: legacyGetters.getItems(validatedState),
      entries: legacyGetters.getEntries(validatedState) as JournalEntry[],
      isCombatActive: legacyGetters.isCombatActive(validatedState),
      narrativeContext: legacyGetters.getNarrativeContext(validatedState) as NarrativeContext | undefined,
    };
  }, [state, dispatch, saveGame, loadGame, cleanupState]);

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
