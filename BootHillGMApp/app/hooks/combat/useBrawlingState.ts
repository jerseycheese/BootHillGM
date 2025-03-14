import { useReducer, useState } from "react";
import { BrawlingState } from "../../types/combat";
import { brawlingReducer } from "../../utils/combat/brawlingReducer";
import { Character } from "../../types/character";

interface UseBrawlingStateProps {
  initialCombatState?: BrawlingState;
  playerCharacter: Character;
  opponent: Character;
}

/**
 * Checks if the current combat state is valid.
 *
 * @param {BrawlingState} state - The current brawling state.
 * @returns {boolean} True if the state is valid, false otherwise.
 * @throws {Error} If the state is invalid.
 */
export function isValidCombatState(state: BrawlingState): boolean {
    // Check if round is valid (must be 1 or 2)
    if (state.round !== 1 && state.round !== 2) {
      throw new Error('Invalid combat state');
    }
    
    // Check if roundLog is valid (must be an array)
    if (!state.roundLog || !Array.isArray(state.roundLog)) {
      throw new Error('Invalid combat state');
    }
    
    return true;
  }

/**
 * Custom hook to manage the brawling combat state.
 *
 * @param {UseBrawlingStateProps} props - The properties for the hook.
 * @param {BrawlingState} [props.initialCombatState] - Optional initial state.
 * @param {Character} props.playerCharacter - The player character object.
 * @param {Character} props.opponent - The opponent character object.
 *
 * @returns {object} - An object containing the brawling state, dispatch function, processing flag, and related setters.
 */
export const useBrawlingState = ({ initialCombatState, playerCharacter, opponent }: UseBrawlingStateProps) => {
  const [brawlingState, dispatchBrawling] = useReducer(brawlingReducer, {
    round: initialCombatState?.round || 1,
    playerModifier: initialCombatState?.playerModifier || 0,
    opponentModifier: initialCombatState?.opponentModifier || 0,
    playerCharacterId: playerCharacter.id,
    opponentCharacterId: opponent.id,
    roundLog: initialCombatState?.roundLog || []
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCombatEnded, setIsCombatEnded] = useState(false);

  return {
    brawlingState,
    dispatchBrawling,
    isProcessing,
    setIsProcessing,
    isCombatEnded,
    setIsCombatEnded,
    isValidCombatState
  };
};
