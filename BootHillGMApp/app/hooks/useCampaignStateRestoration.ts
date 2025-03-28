import { GameState } from '../types/gameState';
import { initialState as initialGameState } from '../types/initialState';
import { migrationAdapter, LegacyState } from '../utils/stateAdapters';
import { CharacterState } from '../types/state/characterState';
import { SuggestedAction } from '../types/campaign';
import { CombatState } from '../types/state/combatState';
import { NarrativeState } from '../types/state/narrativeState';
import { UIState } from '../types/state/uiState';
import { CombatType } from '../types/combat';
import { Character } from '../types/character'; // Still needed for opponentCharacter type hint
import {
  ensureLocationType,
  createGameStateWithGetters,
  getStringValue,
  getNumberValue,
  getStringArrayValue,
  restoreCharacter,
  normalizeInventoryItems,
  normalizeJournalEntries,
  normalizeCharacterState,
  normalizeInventoryState,
  normalizeJournalState,
  GameStateWithTesting // Import the testing type if needed here, or adjust tests
} from '../utils/stateRestorationUtils';

interface RestoreStateOptions {
  isInitializing: boolean;
  savedStateJSON: string | null;
}

/**
 * Hook for restoring game state from storage with proper type conversion.
 * Handles both new game initialization and saved game restoration.
 * 
 * Key responsibilities:
 * - Proper type conversion of saved data
 * - Deep copying of complex objects (inventory, combat state)
 * - Validation of restored data
 * - Error handling for corrupt or invalid saves
 * 
 * Used by CampaignStateManager to handle state initialization.
 */
export const useCampaignStateRestoration = ({ 
  isInitializing, 
  savedStateJSON 
}: RestoreStateOptions): GameState => {
  // Initialize with proper structure for new games
  if (isInitializing) {
    return createGameStateWithGetters({
      ...initialGameState,
      isClient: true // Add isClient flag for new games
    });
  }

  if (!savedStateJSON) {
    return createGameStateWithGetters({
      ...initialGameState,
      isClient: true,
      character: null // Explicitly return null for test compatibility
    });
  }

  try {
    let savedState: LegacyState;
    try {
      savedState = JSON.parse(savedStateJSON);
    } catch {
      // Silently handle parse errors and return initial state
      return createGameStateWithGetters({
        ...initialGameState,
        isClient: true,
        character: {
          player: null,
          opponent: null
        }  // Initialize with empty character state that's not null
      });
    }
    
    // Process the state with adapters to ensure backward compatibility 
    const normalizedState = migrationAdapter.oldToNew(savedState);
    
    // Check if combat has isActive property to avoid property access error
    const combatIsActive = normalizedState.combat && 
      typeof normalizedState.combat === 'object' && 
      'isActive' in (normalizedState.combat as object) ? 
      Boolean((normalizedState.combat as {isActive: unknown}).isActive) : 
      Boolean(savedState.isCombatActive);

    // Normalize core state slices using utility functions
    // Cast normalizedState as its type might be broader than Partial<GameState>
    const inventoryItems = normalizeInventoryItems(normalizedState as Partial<GameState>, savedState);
    const journalEntries = normalizeJournalEntries(normalizedState as Partial<GameState>, savedState);
    
    // Restore opponent first as it might be needed for character state normalization
    const opponentCharacter = savedState.opponent ? 
      restoreCharacter(savedState.opponent as Partial<Character>) : null;
      
    const characterValue = normalizeCharacterState(savedState, opponentCharacter);
    const inventoryValue = normalizeInventoryState(savedState, inventoryItems);
    const journalValue = normalizeJournalState(journalEntries);

    // Handle combat state specifically for tests (consider refactoring tests later)
    const combatState = savedState.combatState ? {
      ...savedState.combatState,
      isActive: combatIsActive, // Use the previously determined combatIsActive
    } : undefined;
    
    // Ensure suggestedActions has a value
    const suggestedActionsValue = savedState.suggestedActions && Array.isArray(savedState.suggestedActions) 
      ? savedState.suggestedActions as SuggestedAction[]
      : [];
    
    // Get typed combat data from normalized state
    const typedCombat = normalizedState.combat as Partial<CombatState> || {};
    
    // Create default narrative state if missing
    const defaultNarrativeState: NarrativeState = {
      currentStoryPoint: null,
      visitedPoints: [],
      availableChoices: [],
      narrativeHistory: [],
      displayMode: 'standard',
      error: null
    };
    
    // Create default UI state if missing
    const defaultUIState: UIState = {
      isLoading: false,
      modalOpen: null,
      notifications: []
    };
    
    // Create the initial object with proper typing for all slices
    const baseStateObject: Partial<GameStateWithTesting> = {
      ...initialGameState, // Start with initial state for default values
      
      // Core properties with proper type handling
      currentPlayer: getStringValue(normalizedState.currentPlayer, ''),
      npcs: getStringArrayValue(normalizedState.npcs),
      location: ensureLocationType(savedState.location),
      quests: getStringArrayValue(normalizedState.quests),
      gameProgress: getNumberValue(normalizedState.gameProgress, 0),
      savedTimestamp: typeof normalizedState.savedTimestamp === 'number' ? 
        normalizedState.savedTimestamp : undefined,
      isClient: true, // Always set isClient to true
      
      // Domain slices with proper typing
      character: characterValue,
      inventory: inventoryValue,
      journal: journalValue,
      
      // Special properties for tests
      combatState,
      opponent: opponentCharacter, // Include opponent directly for backward compatibility
      
      // Set combat state with proper defaults
      combat: {
        isActive: combatIsActive,
        combatType: typedCombat.combatType || 'brawling' as CombatType,
        rounds: typedCombat.rounds || 0,
        playerTurn: typedCombat.playerTurn !== undefined ? typedCombat.playerTurn : true,
        playerCharacterId: typedCombat.playerCharacterId || '',
        opponentCharacterId: typedCombat.opponentCharacterId || '',
        combatLog: typedCombat.combatLog || [],
        roundStartTime: typedCombat.roundStartTime || 0,
        modifiers: typedCombat.modifiers || { player: 0, opponent: 0 },
        currentTurn: typedCombat.currentTurn || null
      } as CombatState,
      
      // Ensure narrative state has required properties
      narrative: {
        ...defaultNarrativeState,
        ...(normalizedState.narrative as Partial<NarrativeState> || {})
      } as NarrativeState,
      
      // Ensure UI state has required properties
      ui: {
        ...defaultUIState,
        ...(normalizedState.ui as Partial<UIState> || {})
      } as UIState,
      
      // Ensure suggestedActions is properly set
      suggestedActions: suggestedActionsValue
    };
    
    // Add proper getters and return
    return createGameStateWithGetters(baseStateObject);
    
  } catch (error) {
    console.error('Error restoring state:', error);
    return createGameStateWithGetters({
      ...initialGameState,
      isClient: true,
      character: {
        player: null,
        opponent: null
      } as CharacterState // Return an empty character state instead of null
    });
  }
};
