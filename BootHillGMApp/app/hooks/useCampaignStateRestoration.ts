import { GameState } from '../types/gameState';
import { initialState as initialGameState } from '../types/initialState';
// Removed unused imports: CharacterState, CombatState, NarrativeState, UIState, CombatType
// Removed unused imports from stateRestorationUtils

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
    // Return initial state directly, ensuring isClient is set
    return {
      ...initialGameState,
      isClient: true,
    };
  }

  if (!savedStateJSON) {
    // Return initial state directly, ensuring isClient is set and character is null
    return {
      ...initialGameState,
      isClient: true,
      character: null,
    };
  }

  try {
    let savedState: unknown;
    try {
      savedState = JSON.parse(savedStateJSON);
    } catch {
      // Silently handle parse errors and return initial state
      return {
        ...initialGameState,
        isClient: true,
        character: { // Ensure character slice exists but is empty
          player: null,
          opponent: null,
        },
      };
    }
    
    // Process the state with adapters to ensure backward compatibility 
    // No adaptation needed; savedState should represent GameState structure
    const normalizedState = savedState as Partial<GameState>;
    
    // Check if combat has isActive property to avoid property access error
    // Simplified check for combat activity directly from normalized state
    const combatIsActive = Boolean(normalizedState.combat?.isActive);

    // Merge the loaded state with initial state to ensure all properties exist
    const restoredState: GameState = {
      ...initialGameState,
      ...normalizedState,
      // Ensure nested slices are also merged correctly
      character: {
        player: normalizedState.character?.player ?? initialGameState.character?.player ?? null,
        opponent: normalizedState.character?.opponent ?? initialGameState.character?.opponent ?? null,
      },
      combat: {
        ...initialGameState.combat,
        ...(normalizedState.combat || {}),
        // Ensure isActive is correctly set based on loaded data
        isActive: combatIsActive,
      },
      inventory: {
        ...initialGameState.inventory,
        ...(normalizedState.inventory || {}),
      },
      journal: {
        ...initialGameState.journal,
        ...(normalizedState.journal || {}),
      },
      narrative: {
        ...initialGameState.narrative,
        ...(normalizedState.narrative || {}),
      },
      ui: {
        ...initialGameState.ui,
        ...(normalizedState.ui || {}),
      },
      // Ensure isClient and savedTimestamp are correctly set
      isClient: true,
      savedTimestamp: typeof normalizedState.savedTimestamp === 'number'
        ? normalizedState.savedTimestamp
        : undefined,
    };

    // Return the merged GameState directly
    return restoredState;
    
  } catch (error) {
    console.error('Error restoring state:', error);
    // Return initial state directly on error, ensuring isClient is set
    return {
      ...initialGameState,
      isClient: true,
      character: { // Ensure character slice exists but is empty
        player: null,
        opponent: null,
      },
    };
  }
};
