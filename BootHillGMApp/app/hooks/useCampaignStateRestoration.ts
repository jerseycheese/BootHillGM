import { GameState } from '../types/campaign';
import { InventoryItem } from '../types/inventory';
import { Character } from '../types/character';
import { initialState as initialGameState } from '../utils/gameEngine';

interface RestoreStateOptions {
  isInitializing: boolean;
  savedStateJSON: string | null;
}

/**
 * Hook to handle game state restoration from storage.
 * Manages initialization of new games and restoration of saved games,
 * ensuring proper type conversion and data structure preservation.
 * 
 * @param options.isInitializing - Whether a new game is being initialized
 * @param options.savedStateJSON - Saved game state JSON from localStorage
 * @returns Restored GameState with proper type conversions
 */
export const useStateRestoration = ({ 
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
    const savedState = JSON.parse(savedStateJSON);
    
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
 * Helper function to properly restore a character's data structure,
 * ensuring all nested objects and arrays are correctly copied.
 */
const restoreCharacter = (character: Partial<Character>): Character => ({
  ...character,
  attributes: { ...character.attributes },
  skills: { ...character.skills },
  wounds: [...(character.wounds || [])],
  isUnconscious: Boolean(character.isUnconscious)
}) as Character;
