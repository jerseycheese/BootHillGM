import { useWeaponCombatState } from './useWeaponCombatState';
import { useWeaponCombatAction } from './useWeaponCombatAction';
import { getCombatCapabilities } from '../utils/weaponCombatValidation';
import { UseWeaponCombatReturn } from '../types/weaponCombatHook';
import { WeaponCombatState } from '../types/combat';
import { Character } from '../types/character';
import { GameAction } from '../types/actions'; // Use main GameAction type
import { CombatState } from '../types/combat';

interface UseWeaponCombatProps {
  playerCharacter: Character;
  opponent: Character;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  dispatch: React.Dispatch<GameAction>; // Use main GameAction type
  initialState?: WeaponCombatState;
  debugMode?: boolean;
  combatState: CombatState;
}

export const useWeaponCombat = ({
  playerCharacter,
  opponent,
  onCombatEnd,
  dispatch,
  initialState,
  combatState
}: UseWeaponCombatProps): UseWeaponCombatReturn => {
  const {
    currentOpponent,
    setCurrentOpponent,
    weaponState,
    setWeaponState,
    isProcessing,
    setIsProcessing,
    aimBonus,
    setAimBonus
  } = useWeaponCombatState({
    playerCharacter,
    opponent,
    initialState
  });

  /**
   * Processes a complete combat turn including opponent response.
   * Includes weapon combat resolution, state updates, and combat log entries.
   */
  const processAction = useWeaponCombatAction({
    playerCharacter,
    opponent,
    weaponState,
    aimBonus,
    isProcessing,
    dispatch,
    combatState,
    setWeaponState,
    setCurrentOpponent,
    setIsProcessing,
    setAimBonus,
    onCombatEnd
  });

  const combatCapabilities = getCombatCapabilities(isProcessing, aimBonus, weaponState);

  return {
    weaponState,
    isProcessing,
    processAction,
    ...combatCapabilities,
    currentOpponent,
    combatState
  };
};
