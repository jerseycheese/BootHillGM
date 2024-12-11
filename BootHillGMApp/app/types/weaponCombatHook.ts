import { Character } from './character';
import { WeaponCombatState, WeaponCombatAction, CombatState } from './combat';
import { GameEngineAction } from './gameActions';

export interface UseWeaponCombatProps {
  playerCharacter: Character;
  opponent: Character;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  dispatch: React.Dispatch<GameEngineAction>;
  initialState?: WeaponCombatState;
  debugMode?: boolean;
  combatState: CombatState;
}

export interface UseWeaponCombatReturn {
  weaponState: WeaponCombatState;
  isProcessing: boolean;
  processAction: (action: WeaponCombatAction) => Promise<void>;
  canAim: boolean;
  canFire: boolean;
  canReload: boolean;
  currentOpponent: Character;
  combatState: CombatState;
}
