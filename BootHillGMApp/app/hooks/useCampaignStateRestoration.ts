import { GameState } from '../types/campaign';
import { InventoryItem } from '../types/inventory';
import { Character } from '../types/character';
import { initialState as initialGameState } from '../utils/gameEngine';

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
  if (isInitializing) {
    return {
      ...initialGameState,
      isClient: true
    };
  }

  if (!savedStateJSON) {
    return { 
      ...initialGameState, 
      isClient: true 
    };
  }

  try {
    let savedState;
    try {
      savedState = JSON.parse(savedStateJSON);
    } catch {
      // Silently handle parse errors and return initial state
      return { 
        ...initialGameState, 
        isClient: true 
      };
    }
    
    if (!savedState.character || !savedState.character.name) {
      return { 
        ...initialGameState, 
        isClient: true 
      };
    }

    return {
      ...initialGameState,
      ...savedState,
      isClient: true,
      isCombatActive: Boolean(savedState.isCombatActive),
      opponent: savedState.opponent ? restoreCharacter(savedState.opponent) : null,
      combatState: savedState.combatState ? {
        ...savedState.combatState,
        playerStrength: Number(savedState.combatState.playerStrength),
        opponentStrength: Number(savedState.combatState.opponentStrength),
        currentTurn: savedState.combatState.currentTurn,
        combatLog: [...(savedState.combatState.combatLog || [])]
      } : undefined,
      inventory: savedState.inventory?.map((item: InventoryItem) => ({ ...item })) || [],
      journal: savedState.journal || []
    };
  } catch (error) {
    console.error('Error parsing saved state:', error);
    return { 
      ...initialGameState, 
      isClient: true 
    };
  }
};

/**
 * Creates a fresh copy of character data with all nested objects properly copied.
 * Ensures that all required character properties are present and correctly typed.
 */
const restoreCharacter = (character: Partial<Character>): Character => ({
  ...character,
  attributes: { ...character.attributes },
  skills: { ...character.skills },
  wounds: [...(character.wounds || [])],
  isUnconscious: Boolean(character.isUnconscious)
}) as Character;
