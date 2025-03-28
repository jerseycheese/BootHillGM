import { useCallback, useRef } from 'react';
import { GameState } from '../types/gameState';
import { NormalizedState } from '../types/campaignState.types';
import { migrationAdapter } from '../utils/stateAdapters';
import { InventoryItem } from '../types/item.types';
import { Character } from '../types/character';
import { JournalEntry } from '../types/journal';
import { CombatState } from '../types/state/combatState';
import { initialState as initialGameState } from '../types/initialState';
import { migrateGameState } from '../utils/stateMigration';
import { ExtendedGameState } from '../types/extendedState';
import { GameEngineAction } from '../types/gameActions';

/**
 * Hook for managing campaign state persistence to localStorage.
 * Handles saving and loading game state with proper normalization and migration.
 * 
 * @param {boolean} isInitializing - Flag indicating if character creation is in progress
 * @param {React.MutableRefObject<boolean>} isInitializedRef - Ref tracking initialization status
 * @param {React.Dispatch<GameEngineAction>} dispatch - Game state dispatch function
 * @returns {Object} Object containing saveGame and loadGame functions and stateRef
 */
export const useCampaignStatePersistence = (
  isInitializing: boolean,
  isInitializedRef: React.MutableRefObject<boolean>,
  dispatch: React.Dispatch<GameEngineAction>
) => {
  const lastSavedRef = useRef<number>(0);
  const stateRef = useRef<GameState | null>(null);

  /**
   * Saves the current game state to localStorage.
   * Prevents rapid consecutive saves and handles proper normalization.
   * 
   * @param {GameState} stateToSave - The game state to save
   */
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
  }, [isInitializing, isInitializedRef]);

  /**
   * Loads game state from localStorage.
   * Handles state migration, normalization, and type validation.
   * 
   * @returns {GameState | null} The loaded game state or null if loading failed
   */
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

  return {
    saveGame,
    loadGame,
    stateRef
  };
};
