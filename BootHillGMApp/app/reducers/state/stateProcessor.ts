import { ExtendedGameState } from '../../types/extendedState';
import { migrationAdapter } from '../../utils/stateAdapters';
import { Character } from '../../types/character';
import { JournalEntry } from '../../types/journal';
import { 
  hasCharacter, 
  hasJournal, 
  hasCombat, 
  hasCombatState, 
  isNonNullObject,
  mapToTypedArray,
  convertToInventoryItem,
  convertToWound
} from '../../utils/typeGuards';
import { adaptEnsureCombatState } from '../../utils/combatAdapter';

/**
 * Type for state payload to avoid any
 */
export interface StatePayload {
  [key: string]: unknown;
}

/**
 * Processes SET_STATE action
 */
export function processSetState(state: ExtendedGameState, payload: StatePayload): ExtendedGameState {
  // Apply migration adapter to ensure proper state format
  const normalizedState = migrationAdapter.oldToNew(payload);
  
  // Type assertion to help TypeScript understand that normalized state follows our ExtendedGameState structure
  const typedState = normalizedState as unknown as ExtendedGameState;
  
  // Create a clean state object with both new domain slices and backward compatibility
  const newState: ExtendedGameState = {
    ...state,
    ...typedState
  };
  
  // Update combat active flag based on normalized state
  if (hasCombat(normalizedState)) {
    newState.combat = {
      ...newState.combat,
      isActive: Boolean(normalizedState.combat.isActive)
    };
    // The isCombatActive property is read-only, no need to set it directly
  }
  
  // Handle opponent for backward compatibility
  if (hasCharacter(normalizedState) && isNonNullObject(normalizedState.character.opponent)) {
    const opponentData = normalizedState.character.opponent as Record<string, unknown>;
    
    // Create a properly typed opponent character
    const opponent: Character = {
      id: String(opponentData.id || `character_${Date.now()}`),
      name: String(opponentData.name || 'Unknown Opponent'),
      isNPC: Boolean(opponentData.isNPC ?? true),
      isPlayer: Boolean(opponentData.isPlayer ?? false),
      // Convert inventory items with proper typing
      inventory: Array.isArray(opponentData.inventory) 
        ? { items: mapToTypedArray(opponentData.inventory, convertToInventoryItem) }
        : { items: [] },
      attributes: isNonNullObject(opponentData.attributes) 
        ? { 
            speed: Number((opponentData.attributes as Record<string, unknown>).speed ?? 5),
            gunAccuracy: Number((opponentData.attributes as Record<string, unknown>).gunAccuracy ?? 5),
            throwingAccuracy: Number((opponentData.attributes as Record<string, unknown>).throwingAccuracy ?? 5),
            strength: Number((opponentData.attributes as Record<string, unknown>).strength ?? 5),
            baseStrength: Number((opponentData.attributes as Record<string, unknown>).baseStrength ?? 5),
            bravery: Number((opponentData.attributes as Record<string, unknown>).bravery ?? 5),
            experience: Number((opponentData.attributes as Record<string, unknown>).experience ?? 5)
          } 
        : {
            speed: 5,
            gunAccuracy: 5, 
            throwingAccuracy: 5,
            strength: 5,
            baseStrength: 5,
            bravery: 5,
            experience: 5
          },
      // Convert wounds with proper typing
      wounds: Array.isArray(opponentData.wounds) 
        ? mapToTypedArray(opponentData.wounds, convertToWound)
        : [],
      isUnconscious: Boolean(opponentData.isUnconscious),
      minAttributes: {
        speed: 0,
        gunAccuracy: 0,
        throwingAccuracy: 0,
        strength: 0,
        baseStrength: 0,
        bravery: 0,
        experience: 0
      },
      maxAttributes: {
        speed: 10,
        gunAccuracy: 10,
        throwingAccuracy: 10,
        strength: 10,
        baseStrength: 10,
        bravery: 10,
        experience: 10
      }
    };
    
    newState.opponent = opponent;
  } else {
    newState.opponent = null;
  }
  
  // Handle combat state for backward compatibility
  if (hasCombatState(normalizedState)) {
    newState.combatState = adaptEnsureCombatState(normalizedState.combatState);
  }
  
  // Client flag
  newState.isClient = true;
  
  // For backward compatibility - journal entries access
  if (hasJournal(normalizedState) && Array.isArray(normalizedState.journal.entries)) {
    newState.entries = normalizedState.journal.entries as JournalEntry[];
  }
  
  return newState;
}
