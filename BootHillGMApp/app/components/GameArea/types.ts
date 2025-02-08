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
  handleUserInput: (input: string) => void;
  retryLastAction: () => void;
  handleCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  handlePlayerHealthChange: (characterType: 'player' | 'opponent', newStrength: number) => void;
  handleUseItem: (itemId: string) => void;
  handleEquipWeapon: (itemId: string) => void;
}

export interface GameplayControlsProps {
  isLoading: boolean;
  isCombatActive: boolean;
  opponent: Character | null;
  state: GameState;
  onUserInput: (input: string) => void;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  onPlayerHealthChange: (characterType: 'player' | 'opponent', newStrength: number) => void;
  dispatch: React.Dispatch<GameEngineAction>;
}
