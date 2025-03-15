import { GameState } from './gameState';
import { initialNarrativeState } from './narrative.types';

export const initialState: GameState = {
  currentPlayer: '',
  npcs: [],
  location: null,
  inventory: [],
  quests: [],
  character: null,
  narrative: initialNarrativeState,
  gameProgress: 0,
  journal: [],
  opponent: null,
  isCombatActive: false,
  combatState: undefined,
  savedTimestamp: 0,
  isClient: false,
  suggestedActions: [],
  
  // Add player getter that returns the character property
  get player() {
    return this.character;
  }
};
