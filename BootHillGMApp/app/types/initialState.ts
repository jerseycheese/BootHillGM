import { GameState } from './gameState';
import {
  initialCharacterState,
  initialCombatState,
  initialInventoryState,
  initialJournalState,
  initialNarrativeState,
  initialUIState
} from './state';

/**
 * Initial state for the entire game
 */
export const initialState: GameState = {
  // Domain-specific slices with their own initial states
  character: initialCharacterState,
  combat: initialCombatState,
  inventory: initialInventoryState,
  journal: initialJournalState,
  narrative: initialNarrativeState,
  ui: initialUIState,
  
  // Top-level state initialization
  currentPlayer: '',
  npcs: [],
  location: null,
  quests: [],
  gameProgress: 0,
  savedTimestamp: 0,
  isClient: false,
  suggestedActions: [], // Added missing required property
  
  // Legacy getters for backward compatibility
  get player() {
    return this.character?.player ?? null;
  },
  
  get opponent() {
    return this.character?.opponent ?? null;
  },
  
  get isCombatActive() {
    return this.combat.isActive;
  }
};
