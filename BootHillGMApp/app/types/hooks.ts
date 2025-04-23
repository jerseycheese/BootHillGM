import { Dispatch } from 'react';
import { Character, CombatLogEntry } from './character';

export interface UseBrawlingCombatProps {
  playerCharacter: Character;
  opponent: Character;
  onCombatEnd: (winner: "player" | "opponent", summary: string) => void;
  dispatch: Dispatch<{
    type: 'SET_CHARACTER' | 'SET_OPPONENT';
    payload: Character;
  }>;
  initialCombatState?: {
    round: 1 | 2;
    playerModifier: number;
    opponentModifier: number;
    roundLog: CombatLogEntry[];
  };
}
