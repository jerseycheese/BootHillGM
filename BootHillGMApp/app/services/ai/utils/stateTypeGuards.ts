/**
 * State Type Guards for AI Decision Services
 *
 * Provides type guard utilities for safely checking and converting
 * between different state formats in AI decision features.
 */

import { GameState, initialGameState } from '../../../types/gameState';
// Use the canonical ExtendedGameState type
import { ExtendedGameState } from '../../../types/extendedState';
import { Character } from '../../../types/character';
import { NarrativeState } from '../../../types/narrative.types';
import { CombatState } from '../../../types/state/combatState';

/**
 * Checks if a value is a non-null object
 */
export function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

/**
 * Checks if combat state has an 'isActive' property
 */
export function hasCombatActive(combat: unknown): combat is { isActive: boolean } {
  return isNonNullObject(combat) && 'isActive' in combat;
}

/**
 * Checks if the game state has a character property (which should contain player/opponent)
 */
export function hasCharacterState(state: unknown): state is { character: { player?: Character | null; opponent?: Character | null } | null } {
  return (
    isNonNullObject(state) &&
    'character' in state // Check if character property exists
    // Allow character slice to be null as per GameState definition
    // isNonNullObject((state as Record<string, unknown>).character) 
  );
}


/**
 * Checks if the game state has a narrative state property
 */
export function hasNarrativeState(state: unknown): state is { narrative: NarrativeState } {
  return (
    isNonNullObject(state) &&
    'narrative' in state && // Check if narrative property exists
    isNonNullObject((state as Record<string, unknown>).narrative)
  );
}

/**
 * Checks if the game state has a combat property and it's a valid object
 */
export function hasCombatState(state: unknown): state is { combat: CombatState } {
    return (
        isNonNullObject(state) &&
        'combat' in state && // Check if combat property exists
        isNonNullObject((state as Record<string, unknown>).combat)
        // No need to check isActive here, just the presence of the combat object
    );
}


/**
 * Safely extends a game state for decision services, ensuring it conforms to the canonical ExtendedGameState
 */
export function safeExtendGameState(state: unknown): ExtendedGameState {
  // 1. Create the base structure matching ExtendedGameState explicitly
  const base: ExtendedGameState = {
    // All properties from GameState
    character: initialGameState.character,
    combat: initialGameState.combat,
    inventory: initialGameState.inventory,
    journal: initialGameState.journal,
    narrative: initialGameState.narrative,
    ui: initialGameState.ui,
    currentPlayer: initialGameState.currentPlayer,
    npcs: initialGameState.npcs,
    location: initialGameState.location,
    quests: initialGameState.quests,
    gameProgress: initialGameState.gameProgress,
    savedTimestamp: initialGameState.savedTimestamp,
    isClient: initialGameState.isClient,
    suggestedActions: initialGameState.suggestedActions,
    meta: initialGameState.meta,
    // Properties required/added by ExtendedGameState
    opponent: initialGameState.character?.opponent ?? null, // Source from nested initial state
    combatState: initialGameState.combat, // Optional field initialization
    entries: initialGameState.journal.entries, // Optional field initialization
  };

  // 2. If input state is invalid, return the safe base
  if (!isNonNullObject(state)) {
    return base;
  }

  // 3. Merge valid input state onto the base
  const inputState = state as Partial<ExtendedGameState>; // Treat input as potentially partial

  // Create the result by starting with the base and overriding with input properties.
  // Perform deep merges for nested objects to handle partial inputs correctly.
  const mergedState: ExtendedGameState = {
    ...base, // Start with the complete base
    ...inputState, // Override with top-level properties from inputState

    // Deep merge nested slices, ensuring base structure is maintained if input slice is missing/partial
    // Check if inputState.character exists and is an object before merging
    character: hasCharacterState(inputState) && inputState.character ? { ...(base.character ?? {}), ...inputState.character } : base.character,
    combat: inputState.combat ? { ...base.combat, ...inputState.combat } : base.combat,
    inventory: inputState.inventory ? { ...base.inventory, ...inputState.inventory } : base.inventory,
    journal: inputState.journal ? { ...base.journal, ...inputState.journal } : base.journal,
    // Check if inputState.narrative exists and is an object before merging
    narrative: hasNarrativeState(inputState) && inputState.narrative ? { ...base.narrative, ...inputState.narrative } : base.narrative,
    ui: inputState.ui ? { ...base.ui, ...inputState.ui } : base.ui,

    // Ensure top-level opponent is correctly set, prioritizing input if available, else from base
    opponent: inputState.opponent !== undefined ? inputState.opponent : base.opponent,

    // Ensure optional fields are correctly set, prioritizing input if available
    combatState: inputState.combatState ?? base.combatState,
    entries: inputState.entries ?? base.entries,
  };

   // Final safety check for opponent type (should be Character | null)
   if (mergedState.opponent === undefined) {
       mergedState.opponent = null;
   }
   // Ensure character slice is not undefined if it was null in input
   if (mergedState.character === undefined) {
       mergedState.character = null;
   }


  return mergedState;
}


/**
 * Type guard to check if a state is already an ExtendedGameState (canonical version)
 */
export function isExtendedGameState(state: unknown): state is ExtendedGameState {
  if (!isNonNullObject(state)) return false;

  // Check for essential GameState properties
  const hasGameStateProps =
    'character' in state && // Allow character to be null
    'combat' in state && typeof state.combat === 'object' &&
    'inventory' in state && typeof state.inventory === 'object' &&
    'journal' in state && typeof state.journal === 'object' &&
    'narrative' in state && typeof state.narrative === 'object' &&
    'ui' in state && typeof state.ui === 'object' &&
    'currentPlayer' in state &&
    'location' in state && // location can be null
    'gameProgress' in state;

  if (!hasGameStateProps) return false;

  // Check specifically for the top-level 'opponent' property required by ExtendedGameState
  const hasOpponentProp = 'opponent' in state;

  return hasOpponentProp;
}

/**
 * Safely converts a GameState to ExtendedGameState
 */
export function convertToExtendedGameState(state: GameState): ExtendedGameState {
  // If it already conforms to the ExtendedGameState structure, return it.
  // Cast needed because GameState doesn't guarantee the top-level 'opponent'
  if (isExtendedGameState(state)) {
    return state as ExtendedGameState; 
  }

  // Otherwise, extend it using the safe function
  return safeExtendGameState(state);
}