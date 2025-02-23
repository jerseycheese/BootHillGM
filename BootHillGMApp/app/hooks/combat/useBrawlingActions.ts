import { useCallback } from "react";
import { BrawlingEngine } from "../../utils/brawlingEngine";
import { LogEntry, BrawlingState } from "../../types/combat";
import { Wound } from "../../types/wound";
import { Character } from "../../types/character";
import * as brawlingSystem from "../../utils/brawlingSystem";
import { isKnockout, calculateUpdatedStrength } from "../../utils/strengthSystem";
import { BrawlingAction } from "../../types/brawling.types";
import { GameEngineAction } from "../../types/gameActions";

interface UseBrawlingActionsProps {
    playerCharacter: Character;
    opponent: Character;
    dispatch: React.Dispatch<GameEngineAction>;
    dispatchBrawling: React.Dispatch<BrawlingAction>;
    brawlingState: {
        round: 1 | 2;
        playerModifier: number;
        opponentModifier: number;
        playerCharacterId: string;
        opponentCharacterId: string;
        roundLog: LogEntry[];
    };
    isCombatEnded: boolean;
    endCombat: (winner: 'player' | 'opponent', summary: string) => void;
    syncWithGlobalState: () => void;
    isValidCombatState: (state: BrawlingState) => boolean;
    setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Custom hook to manage brawling combat actions.
 *
 * @param {UseBrawlingActionsProps} props - The properties for the hook.
 * @returns {object} An object containing action handlers.
 */
export const useBrawlingActions = ({
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
}: UseBrawlingActionsProps) => {

    /**
     * Applies a wound to the target character.
     */
    const applyWound = useCallback(
        (
          isPlayer: boolean,
          location:
            | "head"
            | "chest"
            | "abdomen"
            | "leftArm"
            | "rightArm"
            | "leftLeg"
            | "rightLeg",
          damage: number
        ) => {
          const target = isPlayer ? opponent : playerCharacter;
    
          const { newStrength, updatedHistory } = calculateUpdatedStrength(
            target,
            damage
          );
    
          const strengthReduction = damage;
    
          const wound: Wound = {
            severity: "light",
            damage,
            strengthReduction,
            turnReceived: Date.now(),
            location,
          };
    
          const updatedTarget = {
            ...target,
            wounds: [...target.wounds, wound],
            attributes: {
              ...target.attributes,
              strength: newStrength,
              baseStrength: target.attributes.baseStrength,
            },
            strengthHistory: updatedHistory,
            isUnconscious: newStrength <= 0,
          };
    
          if (isPlayer) {
            dispatch({
              type: 'UPDATE_CHARACTER',
              payload: {
                ...updatedTarget,
                id: opponent.id,
                damageInflicted: damage,
              },
            });
          } else {
            dispatch({
              type: 'UPDATE_CHARACTER',
              payload: {
                ...updatedTarget,
                id: playerCharacter.id,
                damageInflicted: damage,
              },
            });
          }
    
          dispatchBrawling({
            type: 'APPLY_DAMAGE',
            target: isPlayer ? 'opponent' : 'player',
            damage,
            location,
          });
    
          return { newStrength, location };
        },
        [playerCharacter, opponent, dispatch, dispatchBrawling]
      );

    /**
     * Handles a single combat action (punch or grapple).
     */
      const handleCombatAction = useCallback(
        (isPlayer: boolean, isPunching: boolean) => {
          if (isCombatEnded) {
            return true;
          }
    
          const result = brawlingSystem.resolveBrawlingRound(
            isPlayer
              ? brawlingState.playerModifier
              : brawlingState.opponentModifier,
            isPunching
          );
    
          const attacker = isPlayer ? playerCharacter : opponent;
    
          const newLogEntry: LogEntry = {
            text: BrawlingEngine.formatCombatMessage(
              attacker.name,
              result,
              isPunching
            ),
            type: result.damage > 0 ? 'hit' : 'miss',
            timestamp: Date.now(),
          };
    
          dispatchBrawling({
            type: 'ADD_LOG_ENTRY',
            entry: newLogEntry,
          });
    
          if (result.damage > 0) {
            const { newStrength } = applyWound(
              isPlayer,
              result.location,
              result.damage
            );
    
            dispatchBrawling({
              type: 'UPDATE_MODIFIERS',
              player: isPlayer ? result.nextRoundModifier : undefined,
              opponent: !isPlayer ? result.nextRoundModifier : undefined,
            });
    
            if (
              newStrength <= 0 ||
              isKnockout(newStrength, result.damage)
            ) {
              const loser = isPlayer ? opponent.name : playerCharacter.name;
    
              const winner = isPlayer ? 'player' : 'opponent';
              const summary = `${attacker.name} emerges victorious, defeating ${loser} with a ${
                isPunching ? 'devastating punch' : 'powerful grapple'
              } to the ${result.location}!`;
    
              endCombat(winner, summary);
              return true;
            }
          } else {
            dispatchBrawling({
              type: 'UPDATE_MODIFIERS',
              player: isPlayer ? result.nextRoundModifier : undefined,
              opponent: !isPlayer ? result.nextRoundModifier : undefined,
            });
          }
          syncWithGlobalState();
          return false;
        },
        [
          brawlingState,
          opponent,
          playerCharacter,
          applyWound,
          syncWithGlobalState,
          endCombat,
          isCombatEnded,
          dispatchBrawling
        ]
      );

      /**
       * Processes a single round of combat, including player and opponent actions.
       */
      const processRound = useCallback(
        async (isPlayer: boolean, isPunching: boolean) => {
          if (isCombatEnded) {
            return;
          }
    
          setIsProcessing(true);
          try {
            if (!isValidCombatState(brawlingState)) {
              throw new Error('Invalid combat state');
            }
    
            const playerKnockout = handleCombatAction(true, isPunching);
            if (playerKnockout) {
              return;
            }
    
            await new Promise((resolve) => setTimeout(resolve, 1000));
    
            const opponentPunching = Math.random() < 0.6;
            const opponentKnockout = handleCombatAction(
              false,
              opponentPunching
            );
            if (opponentKnockout) {
              return;
            }
    
            if (!isCombatEnded) {
              dispatchBrawling({ type: 'END_ROUND' });
            }
          } catch (error) {
            throw error;
          } finally {
            setIsProcessing(false);
          }
        },
        [brawlingState, handleCombatAction, isCombatEnded, setIsProcessing, isValidCombatState, dispatchBrawling]
      );

      return {
        processRound,
        applyWound,
        handleCombatAction
      }
};
