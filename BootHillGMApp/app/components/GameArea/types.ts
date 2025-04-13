import { GameAction } from '../../types/actions'; // Use the main GameAction type
import { Character } from '../../types/character';
import { CombatState } from '../../types/combat'; // Revert to types/combat CombatState
import { Dispatch } from 'react';
import { GameState } from '../../types/gameState';

export interface CombatSystemProps {
  playerCharacter: Character;
  opponent: Character;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  dispatch: Dispatch<GameAction>; // Use the main GameAction type
  initialCombatState?: CombatState; // This now refers to types/combat CombatState
  currentCombatState?: CombatState; // Add the missing prop
}

export interface GameSessionProps {
  state: GameState;
  dispatch: Dispatch<GameAction>; // Use the main GameAction type
  isLoading: boolean;
  error: string | null;
  isCombatActive: boolean;
  opponent: Character | null;
  handleUserInput?: (input: string) => void;
  retryLastAction?: () => void;
  handleCombatEnd: (winner: 'player' | 'opponent', summary: string) => Promise<void>;
  handlePlayerHealthChange: (characterType: string, newStrength: number) => void;
  handleStrengthChange: (characterType: 'player' | 'opponent', newStrength: number) => void;
  handleUseItem: (itemId: string) => void;
  handleEquipWeapon: (itemId: string) => void;
  id?: string;
  "data-testid"?: string;
  // Add other expected props with optional markers
  executeCombatRound?: () => Promise<void>;
  initiateCombat?: (opponent: Character, combatState?: CombatState) => void; // Revert to types/combat CombatState
  getCurrentOpponent?: () => Character | null;
}

export interface GameplayControlsProps {
  isLoading: boolean;
  isCombatActive: boolean;
  opponent: Character | null;
  state: GameState;
  onUserInput?: (input: string) => void;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  onPlayerHealthChange: (characterType: string, newStrength: number) => void;
  dispatch: Dispatch<GameAction>; // Use the main GameAction type
  id?: string;
  "data-testid"?: string;
}
