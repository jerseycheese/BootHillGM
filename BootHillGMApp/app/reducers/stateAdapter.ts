import { ExtendedGameState } from '../types/extendedState';
import { migrationAdapter } from '../utils/stateAdapters';
import { Character } from '../types/character';
import { JournalEntry } from '../types/journal';
import { adaptEnsureCombatState } from '../utils/combatAdapter';
import { convertToInventoryItem, convertToWound, mapToTypedArray } from '../utils/gameReducerHelpers';
import { hasCharacter, hasJournal, hasCombatState, isNonNullObject, hasCombat, hasNarrative } from './gameTypes';
import { GameState } from '../types/gameState';
import { LegacyState } from '../utils/stateAdapters';
import { NarrativeState } from '../types/state/narrativeState';
import { initialNarrativeState } from '../types/narrative.types';

/**
 * Handles the SET_STATE action
 */
export function handleSetState(state: ExtendedGameState, payload: unknown): ExtendedGameState {
  // Apply migration adapter to ensure proper state format
  // Cast payload to correct type expected by migrationAdapter.oldToNew
  const normalizedState = migrationAdapter.oldToNew(payload as GameState | LegacyState);
  
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
  }
  
  // Handle narrative state properly
  if (hasNarrative(normalizedState)) {
    // Create a new narrative state with proper typing and ensure all fields are present
    const narrativeData = normalizedState.narrative as Partial<NarrativeState>;
    newState.narrative = {
      ...initialNarrativeState, // Start with all required fields
      ...narrativeData, // Override with provided values
      
      // Ensure array properties are properly handled
      narrativeHistory: Array.isArray(narrativeData.narrativeHistory) 
        ? [...narrativeData.narrativeHistory] 
        : initialNarrativeState.narrativeHistory,
      
      visitedPoints: Array.isArray(narrativeData.visitedPoints) 
        ? [...narrativeData.visitedPoints] 
        : initialNarrativeState.visitedPoints,
      
      availableChoices: Array.isArray(narrativeData.availableChoices) 
        ? [...narrativeData.availableChoices] 
        : initialNarrativeState.availableChoices
    };
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