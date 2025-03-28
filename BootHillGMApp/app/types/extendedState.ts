import { GameState } from './gameState';
import { Character } from './character';
import { JournalEntry } from './journal';
import { CombatState } from './state/combatState';

/**
 * Extended GameState interface that accommodates both new structure and legacy compatibility
 */
export interface ExtendedGameState extends GameState {
  opponent: Character | null; // Changed from opponent?: to opponent: to match GameState
  combatState?: CombatState;
  entries?: JournalEntry[];
  [key: string]: unknown;
}
