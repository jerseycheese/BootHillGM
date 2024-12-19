import { useCallback } from 'react';
import { WeaponCombatAction, WeaponCombatState } from '../types/combat';
import { Character } from '../types/character';
import { GameEngineAction } from '../types/gameActions';
import { CombatState } from '../types/combat';
import { processCombatTurn } from '../utils/weaponCombatTurn';
import { shouldResetAim } from '../utils/weaponCombatAim';

/**
 * Interface for the properties passed to the useWeaponCombatAction hook.
 */
interface UseWeaponCombatActionProps {
  playerCharacter: Character;
  opponent: Character;
  weaponState: WeaponCombatState;
  aimBonus: number;
  isProcessing: boolean;
  dispatch: React.Dispatch<GameEngineAction>;
  combatState: CombatState;
  setWeaponState: (state: WeaponCombatState | ((prev: WeaponCombatState) => WeaponCombatState)) => void;
  setCurrentOpponent: (opponent: Character) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setAimBonus: (bonus: number) => void;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
}

/**
 * Custom hook to handle weapon combat actions.
 * Processes the combat turn and updates the combat state accordingly.
 * 
 * @param playerCharacter - The player character involved in combat.
 * @param opponent - The opponent character involved in combat.
 * @param weaponState - The current state of the weapon combat.
 * @param aimBonus - The current aim bonus for the player.
 * @param isProcessing - Indicates if a combat action is currently being processed.
 * @param dispatch - Dispatch function to update the game state.
 * @param combatState - The current combat state.
 * @param setWeaponState - Function to update the weapon combat state.
 * @param setCurrentOpponent - Function to update the current opponent.
 * @param setIsProcessing - Function to update the processing status.
 * @param setAimBonus - Function to update the aim bonus.
 * @param onCombatEnd - Callback function to handle the end of combat.
 * @returns A function to process a combat action.
 */
export const useWeaponCombatAction = ({
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
}: UseWeaponCombatActionProps) => {
  return useCallback(async (action: WeaponCombatAction): Promise<void> => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Process the combat turn using the provided action and state
      await processCombatTurn({
        action,
        playerCharacter,
        opponent,
        weaponState,
        aimBonus,
        dispatch,
        combatState,
        setWeaponState,
        setCurrentOpponent,
        onCombatEnd
      });

      // Reset aim bonus if the action is not a fire action
      if (shouldResetAim()) {
        // Reset the aim bonus to 0
        setAimBonus(0);
      }
    } catch (error) {
      console.error('Combat action error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [
    isProcessing,
    playerCharacter,
    opponent,
    weaponState,
    aimBonus,
    dispatch,
    combatState,
    onCombatEnd,
    setWeaponState,
    setCurrentOpponent,
    setIsProcessing,
    setAimBonus
  ]);
};
