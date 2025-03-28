'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef, useMemo } from 'react';
import { GameEngineAction } from '../types/gameActions';
import { gameReducer } from '../reducers/gameReducer';
import { GameState } from '../types/gameState';
import { initialState as initialGameState } from '../types/initialState';
import { useCampaignStateRestoration } from '../hooks/useCampaignStateRestoration';
import { InventoryItem } from '../types/item.types';
import { getAIResponse } from '../services/ai/gameService';
import { initialNarrativeState } from '../types/narrative.types';
import { migrateGameState } from '../utils/stateMigration';
import { adaptStateForTests, legacyGetters, migrationAdapter } from '../utils/stateAdapters';
import { createCompatibleDispatch } from '../types/gameActionsAdapter';
import { Character } from '../types/character';
import { JournalEntry } from '../types/journal';
import { NarrativeContext } from '../types/narrative/context.types';
import { CombatState } from '../types/state/combatState';
import { ExtendedGameState } from '../types/extendedState';

// Type definition for the normalized state with partial combat state
interface NormalizedState extends Record<string, unknown> {
  inventory?: InventoryItem[] | { items?: InventoryItem[] };
  npcs?: Character[];
  journal?: { entries?: JournalEntry[] };
  combat?: Partial<CombatState> & { isActive?: boolean };
  character?: {
    player?: Character;
    opponent?: Character;
  };
  narrative?: unknown;
}

export const CampaignStateContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameEngineAction>;
  saveGame: (state: GameState) => void;
  loadGame: () => GameState | null;
  cleanupState: () => void;
  // Legacy getters for backward compatibility
  player: Character | null; 
  opponent: Character | null;
  inventory: InventoryItem[];
  entries: JournalEntry[];
  isCombatActive: boolean;
  narrativeContext: NarrativeContext | undefined;
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

      // Ensure state is in the new format before saving
      const normalizedState = migrationAdapter.oldToNew(stateToSave) as NormalizedState;

      // Create a clean state with properly preserved combat information
      const cleanState = {
        ...normalizedState,
        inventory: {
          items: Array.isArray(normalizedState.inventory)
            ? (normalizedState.inventory as InventoryItem[]).map((item) => ({ ...item }))
            : (normalizedState.inventory?.items as InventoryItem[] | undefined)?.map(item => ({ ...item })) || []
        },
        npcs: [...(normalizedState.npcs || [])],
        journal: {
          entries: [...(normalizedState.journal?.entries || [])]
        },
        combat: {
          ...(normalizedState.combat || {}),
          isActive: Boolean(normalizedState.combat?.isActive || false)
        },
        character: {
          ...normalizedState.character,
          opponent: normalizedState.character?.opponent ? {
            ...normalizedState.character.opponent,
            attributes: { ...normalizedState.character.opponent.attributes }
          } : null
        },
        savedTimestamp: timestamp,
        isClient: true, // Ensure isClient is set to true
        narrative: normalizedState.narrative,
      };

      localStorage.setItem('campaignState', JSON.stringify(cleanState));
      lastSavedRef.current = timestamp;
    } catch (error) {
      console.error('Error saving game state:', error);
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
      saveGame(state as GameState);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state, state.narrative, saveGame]);

  // Combat state persistence effect
  useEffect(() => {
    if (!isInitializedRef.current || !state.combat?.isActive) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveGame(state as GameState);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    state,
    state.combat,
    saveGame
  ]);

  // Add beforeunload handler for combat state
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentState = stateRef.current;
      if (currentState?.combat?.isActive) {
        // Ensure state is in the new format before saving
        const normalizedState = migrationAdapter.oldToNew(currentState);
        
        localStorage.setItem('campaignState', JSON.stringify({
          ...normalizedState,
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
      } catch (error) {
        console.error('Error parsing saved game state:', error);
        return null;
        // TODO: Implement more robust error handling, e.g., displaying a user-friendly message.
      }

      if (!loadedState || !loadedState.savedTimestamp) {
        return null;
      }

      // Migrate the loaded state to handle potential missing narrative data and schema changes
      loadedState = migrateGameState(loadedState);
      
      // Ensure state is in the new format
      const normalizedState = migrationAdapter.oldToNew(loadedState);

      // Extract and properly type player and opponent
      const playerCharacter = normalizedState.character && 
        typeof normalizedState.character === 'object' && 
        'player' in normalizedState.character ? 
        (normalizedState.character.player as Character) : null;
      
      const opponentCharacter = normalizedState.character && 
        typeof normalizedState.character === 'object' && 
        'opponent' in normalizedState.character ? 
        (normalizedState.character.opponent as Character) : null;
    
      // Extract properties we want to handle separately to avoid type conflicts
      const { player, opponent, character, inventory, journal, combat, ...otherProps } = normalizedState as NormalizedState;
      
      const restoredState: GameState = {
        ...initialGameState, // Start with a fresh base state
        ...otherProps, // Spread other properties safely
        // Ensure inventory has the correct structure with items property
        inventory: {
          items: Array.isArray(normalizedState.inventory)
            ? (normalizedState.inventory as InventoryItem[]).map((item) => ({ ...item }))
            : (normalizedState.inventory as { items?: InventoryItem[] })?.items?.map(item => ({ ...item })) || []
        },
        // Ensure npcs has the correct structure
        npcs: (normalizedState && 'npcs' in normalizedState && Array.isArray(normalizedState.npcs)
          ? (normalizedState.npcs as Character[]).map(npc => ({ ...npc }))
          : []) as unknown as string[], // Type assertion to match GameState definition
        // Ensure journal has the correct structure with entries property
        journal: {
          entries: Array.isArray(normalizedState.journal)
            ? (normalizedState.journal as JournalEntry[]).map((entry) => ({ ...entry }))
            : (normalizedState.journal as { entries?: JournalEntry[] })?.entries?.map(entry => ({ ...entry })) || []
        },
        // Ensure character has the correct structure with properly typed player and opponent
        character: {
          player: playerCharacter as Character | null,
          opponent: opponentCharacter as Character | null
        },
        // Ensure combat has all required properties from CombatState
        combat: {
          ...initialGameState.combat, // Start with all required properties
          ...((normalizedState.combat as Partial<CombatState>) || {}), // Override with any values from loaded state
          isActive: Boolean((normalizedState.combat as Partial<CombatState>)?.isActive) // Ensure isActive is a boolean
        },
        // Ensure narrative has the correct type
        narrative: normalizedState.narrative 
          ? { ...initialGameState.narrative, ...normalizedState.narrative as typeof initialGameState.narrative }
          : { ...initialGameState.narrative },
        isClient: true, // Ensure isClient is set to true
        savedTimestamp: loadedState.savedTimestamp,
      };

      // Create extended state version - ensure opponent is never undefined
      const extendedRestoredState: ExtendedGameState = {
        ...restoredState,
        opponent: opponentCharacter || null, // Ensure opponent is never undefined
        combatState: combat as CombatState | undefined,
        entries: Array.isArray(normalizedState.journal)
          ? (normalizedState.journal as JournalEntry[])
          : (normalizedState.journal as { entries?: JournalEntry[] })?.entries || []
      };

      dispatch({ type: 'SET_STATE', payload: extendedRestoredState });
      return restoredState;
    } catch (error) {
      console.error('Error loading game state:', error);
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
      narrative: initialNarrativeState,
    };

    // If a character already exists (i.e., this is not the very first game load),
    // preserve the character's identity (ID, name, etc.) but reset their health-related attributes.
    if (state.character?.player) {
      cleanState.character = {
        ...state.character, // Keep structure
        player: {
          ...state.character.player, // Keep ID, name, etc.
          // Reset attributes that are affected by gameplay:
          attributes: {
            ...state.character.player.attributes, // Keep other attributes
            strength: state.character.player.attributes.baseStrength, // Reset strength to base
          },
          wounds: [], // Clear all wounds
          isUnconscious: false, // Reset unconscious status
        },
        opponent: null, // Clear opponent
      };
    }

    // After resetting the character and game state, fetch an initial narrative from the AI.
    // This provides a starting point for the new game session.
    if (state.character?.player) {
      try {
        const response = await getAIResponse(
          `Initialize a new game session for ${state.character.player.name}. Describe their current situation and location in detail. Include suggestions for what they might do next.`,
          "", // No journal context for the initial narrative
          state.inventory?.items || []
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

    // Create extended state version with backward compatibility fields
    // Ensure opponent is never undefined
    const extendedCleanState: ExtendedGameState = {
      ...cleanState,
      opponent: null, // Ensure opponent is never undefined
      combatState: undefined,
      entries: []
    };

    // Dispatch an action to update the game state with the cleaned state.
    dispatch({ type: 'SET_STATE', payload: extendedCleanState });
  }, [dispatch, state.character, state.inventory]);

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
