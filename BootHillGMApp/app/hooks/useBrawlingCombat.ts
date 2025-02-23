import { UseBrawlingCombatProps } from "../types/brawling.types";
import { useBrawlingState } from "./combat/useBrawlingState";
import { useBrawlingActions } from "./combat/useBrawlingActions";
import { useBrawlingSync } from "./combat/useBrawlingSync";

/**
 * Custom hook to manage brawling combat logic.
 * Orchestrates state, actions, and synchronization.
 *
 * @param {UseBrawlingCombatProps} props - The properties for the hook.
 * @param {Character} props.playerCharacter - The player character object.
 * @param {Character} props.opponent - The opponent character object.
 * @param {(winner: 'player' | 'opponent', summary: string) => void} props.onCombatEnd - Callback function to be called when combat ends.
 * @param {React.Dispatch<GameEngineAction>} props.dispatch - Dispatch function for the game engine.
 * @param {BrawlingState} [props.initialCombatState] - Optional initial state for brawling combat.
 * @returns {object} An object containing the brawling state, processing status, combat ended status, and the processRound function.
 */
export const useBrawlingCombat = ({
  playerCharacter,
  opponent,
  onCombatEnd,
  dispatch,
  initialCombatState
}: UseBrawlingCombatProps) => {
  const {
    brawlingState,
    dispatchBrawling,
    isProcessing,
    setIsProcessing,
    isCombatEnded,
    setIsCombatEnded,
    isValidCombatState
  } = useBrawlingState({ initialCombatState, playerCharacter, opponent });

  const { endCombat, syncWithGlobalState } = useBrawlingSync({
    brawlingState,
    isCombatEnded,
    dispatch,
    onCombatEnd,
    playerCharacter,
    opponent,
    setIsCombatEnded,
    dispatchBrawling
  });

  const { processRound } = useBrawlingActions({
    playerCharacter,
    opponent,
    dispatch,
    dispatchBrawling,
    brawlingState,
    isCombatEnded,
    endCombat,
    syncWithGlobalState,
    isValidCombatState,
    setIsProcessing
  });

  return {
    brawlingState,
    isProcessing,
    isCombatEnded,
    processRound,
  };
};
