import { GameState, GameEngineAction } from '../../utils/gameEngine';
import { Character } from '../../types/character';

interface CombatLogEntry {
  text: string;
  type: 'hit' | 'miss' | 'critical' | 'info';
  timestamp: number;
}

export interface CombatSystemProps {
  playerCharacter: Character;
  opponent: Character;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  dispatch: React.Dispatch<GameEngineAction>;
  initialCombatState?: {
    round: 1 | 2;
    playerModifier: number;
    opponentModifier: number;
    roundLog: CombatLogEntry[];
  };
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
  handlePlayerHealthChange: (newHealth: number) => void;
  handleManualSave: () => void;
  handleUseItem: (itemId: string) => void;
}

export interface GameplayControlsProps {
  isLoading: boolean;
  isCombatActive: boolean;
  opponent: Character | null;
  state: GameState;
  onUserInput: (input: string) => void;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  onPlayerHealthChange: (newHealth: number) => void;
  dispatch: React.Dispatch<GameEngineAction>;
}
