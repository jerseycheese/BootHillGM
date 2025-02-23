import { GameState } from '../types/gameState';
import { InventoryItem } from '../types/inventory';
import { Character } from '../types/character';
import { initialState as initialGameState } from '../types/initialState';
import { LocationType } from '../services/locationService';
import { ensureCombatState } from '../types/combat';

interface RestoreStateOptions {
  isInitializing: boolean;
  savedStateJSON: string | null;
}

// Helper function to ensure the location is a valid LocationType
const ensureLocationType = (location: unknown): LocationType => {
  if (location && typeof location === 'object' && 'type' in location) {
    const loc = location as { type: string; name?: string; description?: string };
    
    switch (loc.type) {
      case 'town':
        return loc.name ? { type: 'town', name: loc.name } : { type: 'unknown' };
      case 'wilderness':
        return loc.description ? { type: 'wilderness', description: loc.description } : { type: 'unknown' };
      case 'landmark':
        return loc.name ? { type: 'landmark', name: loc.name, description: loc.description } : { type: 'unknown' };
      case 'unknown':
        return { type: 'unknown' };
      default:
        return { type: 'unknown' };
    }
  }
  return { type: 'unknown' };
};

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
      combatState: savedState.combatState 
          ? ensureCombatState(savedState.combatState)
          : undefined,
      inventory: savedState.inventory?.map((item: InventoryItem) => ({ ...item })) || [],
      journal: savedState.journal || [],
      location: ensureLocationType(savedState.location), // Ensure location is a LocationType
    };
  } catch {
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
  wounds: [...(character.wounds || [])],
  isUnconscious: Boolean(character.isUnconscious)
}) as Character;
