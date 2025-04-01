/**
 * State Type Guards for AI Decision Services
 * 
 * Provides type guard utilities for safely checking and converting 
 * between different state formats in AI decision features.
 */

import { GameState } from '../../../types/gameState';
import { ExtendedGameState } from '../types/aiDecisionTypes';
import { Character } from '../../../types/character';
import { initialCombatState } from '../../../types/state/combatState'; 
import { initialUIState } from '../../../types/state/uiState'; 
import { NarrativeState } from '../../../types/narrative.types';

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
 * Checks if the game state has a character property with player and opponent
 */
export function hasCharacterState(state: unknown): state is { character: { player?: Character; opponent?: Character } } {
  return (
    isNonNullObject(state) && 
    isNonNullObject((state as Record<string, unknown>).character)
  );
}

/**
 * Checks if the game state has a narrative state property
 */
export function hasNarrativeState(state: unknown): state is { narrative: NarrativeState } {
  return (
    isNonNullObject(state) && 
    isNonNullObject((state as Record<string, unknown>).narrative)
  );
}

/**
 * Checks if the game state has a combat property
 */
export function hasCombatState(state: unknown): state is { combat: { isActive: boolean } } {
  return (
    isNonNullObject(state) && 
    isNonNullObject((state as Record<string, unknown>).combat) &&
    hasCombatActive((state as Record<string, unknown>).combat)
  );
}

/**
 * Safely extends a game state for decision services
 */
export function safeExtendGameState(state: unknown): ExtendedGameState {
  // Create a base extended state
  const baseState: ExtendedGameState = {
    character: { player: null, opponent: null },
    combat: { ...initialCombatState, isActive: false, active: false }, // Use initialCombatState
    inventory: { items: [] },
    journal: { entries: [] },
    narrative: {
      currentStoryPoint: null,
      visitedPoints: [],
      availableChoices: [],
      narrativeHistory: [],
      displayMode: 'standard',
      context: '', // Add required context property
      error: null
    },
    ui: initialUIState, // Use initialUIState for UI slice
    currentPlayer: '',
    npcs: [],
    location: null,
    quests: [],
    gameProgress: 0,
    suggestedActions: []
  };
  
  // Return base state if input is invalid
  if (!isNonNullObject(state)) {
    return baseState;
  }
  
  // Merge with the input state
  const result: ExtendedGameState = {
    ...baseState,
    ...state
  };
  
  // Ensure combat has the 'active' property synced with 'isActive'
  if (hasCombatState(state)) {
    result.combat = {
      ...result.combat,
      ...state.combat,
      active: Boolean(state.combat.isActive)
    };
  }
  
  return result;
}

/**
 * Type guard to check if a state is already an ExtendedGameState
 */
export function isExtendedGameState(state: unknown): state is ExtendedGameState {
  return (
    isNonNullObject(state) &&
    hasCombatState(state) &&
    'activeEvent' in state &&
    hasCombatActive(state.combat) &&
    'active' in state.combat
  );
}

/**
 * Safely converts a GameState to ExtendedGameState
 */
export function convertToExtendedGameState(state: GameState): ExtendedGameState {
  // If it's already an ExtendedGameState, return it
  if (isExtendedGameState(state)) {
    return state;
  }
  
  // Otherwise, extend it
  return safeExtendGameState(state);
}