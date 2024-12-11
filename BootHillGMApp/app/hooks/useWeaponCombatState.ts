import { useState, useEffect } from 'react';
import { Character } from '../types/character';
import { WeaponCombatState } from '../types/combat';
import { initializeWeaponCombatState } from '../utils/weaponCombatInitializer';

/**
 * Interface for the properties passed to the useWeaponCombatState hook.
 */
interface UseWeaponCombatStateProps {
  playerCharacter: Character;
  opponent: Character;
  initialState?: WeaponCombatState;
}

/**
 * Custom hook to manage the state of weapon combat.
 * Initializes the weapon combat state and updates it based on changes in the opponent.
 * 
 * @param playerCharacter - The player character involved in combat.
 * @param opponent - The opponent character involved in combat.
 * @param initialState - Optional initial state for the weapon combat.
 * @returns An object containing the current opponent, weapon state, processing status, and aim bonus.
 */
export const useWeaponCombatState = ({
  playerCharacter,
  opponent,
  initialState
}: UseWeaponCombatStateProps) => {
  // State to track the current opponent
  const [currentOpponent, setCurrentOpponent] = useState(opponent);

  // State to track the weapon combat state, initialized using the provided or default values
  const [weaponState, setWeaponState] = useState<WeaponCombatState>(() => 
    initializeWeaponCombatState(playerCharacter, opponent, initialState)
  );

  // State to track if a combat action is currently being processed
  const [isProcessing, setIsProcessing] = useState(false);

  // State to track the aim bonus for the player
  const [aimBonus, setAimBonus] = useState(0);

  // Effect to update the current opponent if the opponent prop changes
  useEffect(() => {
    if (opponent !== currentOpponent) {
      setCurrentOpponent(opponent);
    }
  }, [opponent, currentOpponent]);

  return {
    currentOpponent,
    setCurrentOpponent,
    weaponState,
    setWeaponState,
    isProcessing,
    setIsProcessing,
    aimBonus,
    setAimBonus
  };
};
