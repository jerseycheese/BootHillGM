import { LogEntry, BrawlingState } from "./combat";
import { GameEngineAction } from "./gameActions";
import { Character } from "./character";

/**
 * Test scenario type for brawling combat tests
 */
export interface BrawlingTestScenario {
  initialState: Partial<BrawlingState>;
  actions: BrawlingAction[];
  expectedState: Partial<BrawlingState>;
  description: string;
}

/**
 * Properties for the useBrawlingCombat hook.
 */
export interface UseBrawlingCombatProps {
  playerCharacter: Character;
  opponent: Character;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  dispatch: React.Dispatch<GameEngineAction>;
  initialCombatState?: BrawlingState;
}

/**
 * Actions for the brawling reducer.
 */
export type BrawlingAction =
  | { type: 'APPLY_DAMAGE'; target: 'player' | 'opponent'; damage: number; location: string }
  | { type: 'ADD_LOG_ENTRY'; entry: LogEntry }
  | { type: 'UPDATE_MODIFIERS'; player?: number; opponent?: number }
  | { type: 'END_ROUND' }
  | { type: 'END_COMBAT'; winner: 'player' | 'opponent'; summary: string }
  | { type: 'SYNC_STRENGTH'; playerStrength: number; opponentStrength: number };
