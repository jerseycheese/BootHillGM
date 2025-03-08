'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef, useMemo } from 'react';
import { GameEngineAction } from '../types/gameActions';
import { gameReducer } from '../reducers/gameReducer';
import { GameState } from '../types/gameState';
import { initialState as initialGameState } from '../types/initialState';
import { useCampaignStateRestoration } from '../hooks/useCampaignStateRestoration';
import { InventoryItem } from '../types/item.types';
import { ensureCombatState } from '../types/combat';
import { getAIResponse } from '../services/ai/gameService';
import { initialNarrativeState } from '../types/narrative.types';

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
    } catch {
    }
  }, [isInitializing]);

  // Auto-save effect for narrative changes
  useEffect(() => {
    const currentNarrative = state.narrative?.narrativeHistory?.join('') || '';
    if (!isInitializedRef.current || !state.narrative || currentNarrative === previousNarrativeRef.current) {
      return;
    }

    previousNarrativeRef.current = currentNarrative;

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
    } catch {
      return null;
    }
  }, [dispatch]);

  const cleanupState = useCallback(async () => {
    // Set a flag in sessionStorage to indicate that a new character is being initialized.
    // This prevents the auto-save functionality from triggering during the reset process.
    sessionStorage.setItem('initializing_new_character', 'true');

    // Remove any existing saved game state from localStorage.
    localStorage.removeItem('campaignState');

    // Create a new game state object, starting with the initial game state.
    const cleanState: GameState = {
      ...initialGameState,
      isClient: true, // Ensure this flag is set
    };

    // If a character already exists (i.e., this is not the very first game load),
    // preserve the character's identity (ID, name, etc.) but reset their health-related attributes.
    if (state.character) {
      cleanState.character = {
        ...state.character, // Keep ID, name, etc.

        // Reset attributes that are affected by gameplay:
        attributes: {
          ...state.character.attributes, // Keep other attributes
          strength: state.character.attributes.baseStrength, // Reset strength to its base value
        },
        wounds: [], // Clear all wounds
        isUnconscious: false, // Reset unconscious status
        strengthHistory: {
          baseStrength: state.character.attributes.baseStrength, // Keep the base strength
          changes: [], // Clear the history of strength changes
        },
      };
    }

    // After resetting the character and game state, fetch an initial narrative from the AI.
    // This provides a starting point for the new game session.
    if (state.character) {
      try {
        const response = await getAIResponse(
          `Initialize a new game session for ${state.character.name}. Describe their current situation and location in detail. Include suggestions for what they might do next.`,
          "", // No journal context for the initial narrative
          state.inventory || []
        );
        cleanState.narrative = {
          ...initialNarrativeState,
          narrativeHistory: [response.narrative],
        };

      } catch (error) {
        console.error('Error fetching initial narrative:', error);
        cleanState.narrative = {
          ...initialNarrativeState,
          narrativeHistory: ['Error initializing narrative. Please try again.'],
        };
      }
    }

    // Dispatch an action to update the game state with the cleaned state.
    dispatch({ type: 'SET_STATE', payload: cleanState });
  }, [dispatch, state.character, state.inventory]);

  return (
    <div
      id="bhgmCampaignStateManager"
      data-testid="campaign-state-manager"
      className="bhgm-campaign-state-manager"
    >
      <CampaignStateContext.Provider
        value={{
          state,
          dispatch,
          saveGame,
          loadGame,
          cleanupState,
        }}
      >
        {children}
      </CampaignStateContext.Provider>
    </div>
  );
};

CampaignStateProvider.displayName = 'CampaignStateProvider';
