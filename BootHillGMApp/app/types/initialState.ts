import { GameState } from './gameState';

export const initialState: GameState = {
  currentPlayer: '',
  npcs: [],
  location: '',
  inventory: [],
  quests: [],
  character: null,
  narrative: '',
  gameProgress: 0,
  journal: [],
  opponent: null,
  isCombatActive: false,
  combatState: undefined,
  savedTimestamp: 0,
  isClient: false,
  suggestedActions: []
};
