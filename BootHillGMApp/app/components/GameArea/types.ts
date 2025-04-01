import { GameEngineAction } from '../../types/gameActions';
import { Character } from '../../types/character';
import { CombatState } from '../../types/combat';
import { GameState } from '../../types/gameState';

export interface CombatSystemProps {
  playerCharacter: Character;
  opponent: Character;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  dispatch: React.Dispatch<GameEngineAction>;
  initialCombatState?: CombatState;
}

export interface GameSessionProps {
  state: GameState;
  dispatch: React.Dispatch<GameEngineAction>;
  isLoading: boolean;
  error: string | null;
  isCombatActive: boolean;
  opponent: Character | null;
  handleUserInput?: (input: string) => void;
  retryLastAction?: () => void;
  handleCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  handlePlayerHealthChange: (characterType: string, newStrength: number) => void;
  handleUseItem: (itemId: string) => void;
  handleEquipWeapon: (itemId: string) => void;
  id?: string;
  "data-testid"?: string;
  // Add other expected props with optional markers
  executeCombatRound?: () => Promise<void>;
  initiateCombat?: (opponent: Character, combatState?: CombatState) => void;
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
  dispatch: React.Dispatch<GameEngineAction>;
  id?: string;
  "data-testid"?: string;
}
