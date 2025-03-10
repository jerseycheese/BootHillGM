import { Character } from './character';
import { InventoryItem } from './item.types';
import { JournalEntry } from './journal';
import { SuggestedAction } from './campaign';
import { CombatState } from './combat';
import { LocationType } from '../services/locationService';
import { NarrativeState, initialNarrativeState } from './narrative.types';

export interface GameState {
  currentPlayer: string;
  npcs: string[];
  location: LocationType | null;
  inventory: InventoryItem[];
  quests: string[];
  character: Character | null;
  narrative: NarrativeState;
  gameProgress: number;
  journal: JournalEntry[];
  isCombatActive: boolean;
  opponent: Character | null;
  savedTimestamp?: number;
  isClient?: boolean;
  suggestedActions: SuggestedAction[];
  combatState?: CombatState;
  error?: string | null;
}

export const initialGameState: GameState = {
  currentPlayer: '',
  npcs: [],
  location: null,
  inventory: [],
  quests: [],
  character: null,
  narrative: initialNarrativeState,
  gameProgress: 0,
  journal: [],
  isCombatActive: false,
  opponent: null,
  savedTimestamp: undefined,
  isClient: false,
  suggestedActions: [],
  combatState: undefined,
};
