import { Character } from '../character';
import { GameEngineAction } from '../gameActions';
import { Dispatch } from 'react';
import { GameState } from '../gameState';
import { CombatState } from '../state/combatState';

/**
 * Represents the core structure of a game session with all its available methods
 * This interface helps avoid using 'any' types in utility functions
 */
export interface GameSessionType {
  state?: GameState;
  dispatch?: Dispatch<GameEngineAction>;
  executeCombatRound?: () => Promise<void>;
  initiateCombat?: (opponent: Character, combatState?: Partial<CombatState>) => void; // Use standard CombatState
  getCurrentOpponent?: () => Character | null;
  // Use a more specific type for characterType to match the implementation
  handleStrengthChange?: (characterType: "player" | "opponent", newStrength: number) => void;
  isLoading?: boolean;
  error?: string | null;
  handleUserInput?: (input: string) => void;
  retryLastAction?: () => void;
  handleCombatEnd?: (winner: 'player' | 'opponent', summary: string) => void;
  isCombatActive?: boolean;
}
