import { useCallback } from "react";
import { BrawlingEngine } from "../../utils/brawlingEngine";
import { LogEntry, BrawlingState } from "../../types/combat";
import { Wound } from "../../types/wound";
import { Character } from "../../types/character";
import { resolveBrawlingRound } from "../../utils/brawlingSystem";
import { calculateUpdatedStrength } from "../../utils/strengthSystem";
import { BrawlingAction } from "../../types/brawling.types";
import { checkKnockout } from '../../utils/combatUtils'; // Import the new function
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
    isValidCombatState: (state: BrawlingState) => boolean;
    setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Custom hook to manage brawling combat actions.
 *
 * @param {UseBrawlingActionsProps} props - The properties for the hook.
 * @param {Character} props.playerCharacter - The player character object.
 * @param {Character} props.opponent - The opponent character object.
 * @param {React.Dispatch<GameEngineAction>} props.dispatch - Dispatch function for the game engine.
 * @param {React.Dispatch<BrawlingAction>} props.dispatchBrawling - Dispatch function for brawling-specific actions.
 * @param {BrawlingState} props.brawlingState - The current state of the brawling combat.
 * @param {boolean} props.isCombatEnded - Flag indicating if combat has ended.
 * @param {(winner: 'player' | 'opponent', summary: string) => void} props.endCombat - Function to call when combat ends.
 * @param {(state: BrawlingState) => boolean} props.isValidCombatState - Function to validate the combat state.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setIsProcessing - Function to set the processing state.
 * @returns {object} An object containing action handlers.
 * @returns {function} return.processRound - Function to process a combat round.
 * @returns {function} return.applyWound - Function to apply a wound to a character.
 * @returns {function} return.handleCombatAction - Function to handle a single combat action.
 */
export const useBrawlingActions = ({
    playerCharacter,
    opponent,
    dispatch,
    dispatchBrawling,
    brawlingState,
    isCombatEnded,
    endCombat,
    isValidCombatState,
    setIsProcessing
}: UseBrawlingActionsProps) => {

    /**
     * Applies a wound to the target character.
     * @param {boolean} isPlayer - True if the player is the attacker, false otherwise.
     * @param {string} location - The location of the wound.
     * @param {number} damage - The amount of damage inflicted.
     * @returns {{ newStrength: number, location: string, updatedTarget: Character }} An object containing the new strength, wound location, and updated target character.
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
          // If isPlayer is true, it means the player is attacking, so the target is the opponent
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
            wounds: [...(target.wounds || []), wound],
            attributes: {
              ...target.attributes,
              strength: newStrength,
              baseStrength: target.attributes.baseStrength,
            },
            strengthHistory: updatedHistory,
            isUnconscious: newStrength <= 0,
          };
    
          // Update the correct character in the global state
          dispatch({
            type: 'UPDATE_CHARACTER',
            payload: {
              ...updatedTarget,
              id: target.id,
              damageInflicted: damage,
            },
          });
    
          dispatchBrawling({
            type: 'APPLY_DAMAGE',
            target: isPlayer ? 'opponent' : 'player',
            damage,
            location,
          });
    
          return { newStrength, location, updatedTarget };
        },
        [playerCharacter, opponent, dispatch, dispatchBrawling]
      );

    /**
     * Handles a single combat action (punch or grapple).
     * @param {boolean} isPlayer - True if the player is performing the action, false otherwise.
     * @param {boolean} isPunching - True if the action is a punch, false if it's a grapple.
     * @returns {Promise<boolean>} - True if combat ended, false otherwise
     */
    const handleCombatAction = useCallback(
        async (isPlayer: boolean, isPunching: boolean) => {
            if (isCombatEnded) {
                return true;
            }

            const result = resolveBrawlingRound(
                isPlayer
                    ? brawlingState.playerModifier
                    : brawlingState.opponentModifier,
                isPunching
            );

            const attacker = isPlayer ? playerCharacter : opponent;

            // Create a log entry with a unique timestamp
            const timestamp = Date.now();
            const newLogEntry: LogEntry = {
                text: BrawlingEngine.formatCombatMessage(
                    attacker.name,
                    result,
                    isPunching
                ),
                type: result.damage > 0 ? 'hit' : 'miss',
                timestamp,
            };

            // Create and dispatch log entry first, ensure it's processed
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

                if (isPlayer && result.nextRoundModifier) {
                    const modifier = result.nextRoundModifier;
                    dispatchBrawling({
                        type: 'UPDATE_MODIFIERS',
                        player: modifier,
                    });
                } else if (!isPlayer && result.nextRoundModifier) {
                    const modifier = result.nextRoundModifier;
                    dispatchBrawling({
                        type: 'UPDATE_MODIFIERS',
                        opponent: modifier,
                    });
                }

                const knockoutResult = checkKnockout({
                    isPlayer,
                    playerCharacter,
                    opponent,
                    newStrength,
                    damage: result.damage,
                    isPunching,
                    location: result.location
                }) || { isKnockout: false };

                if (knockoutResult.isKnockout && knockoutResult.winner && knockoutResult.summary) {
                  // Call endCombat immediately without setTimeout
                  endCombat(knockoutResult.winner as 'player' | 'opponent', knockoutResult.summary ?? "Combat ended due to knockout.");
                  return true;
                }
              } else {
                if (isPlayer && result.nextRoundModifier) {
                    const modifier = result.nextRoundModifier;
                    dispatchBrawling({
                        type: 'UPDATE_MODIFIERS',
                        player: modifier
                    });
                }
                else if (!isPlayer && result.nextRoundModifier) {
                    const modifier = result.nextRoundModifier;
                    dispatchBrawling({
                        type: 'UPDATE_MODIFIERS',
                        opponent: modifier
                    });
                }
              }
              return false;
            },
            [
                brawlingState,
                opponent,
                playerCharacter,
                applyWound,
                endCombat,
                isCombatEnded,
                dispatchBrawling,
            ]
          );

    /**
     * Processes a single round of combat, including player and opponent actions.
     * @param {boolean} isPlayerAction - True if it's the player's turn to act, false otherwise.
     * @param {boolean} isPunching - True if the player chooses to punch, false if they choose to grapple.
     * @returns {Promise<void>}
     */
    const processRound = useCallback(
        async (isPlayerAction: boolean, isPunching: boolean) => {
            if (isCombatEnded) {
                return;
            }

            setIsProcessing(true);

            try {
                if (!isValidCombatState(brawlingState)) {
                    throw new Error('Invalid combat state');
                }

                if (!brawlingState.roundLog || !Array.isArray(brawlingState.roundLog)) {
                    const error = new Error('Invalid combat state');
                    throw error;
                }

                const playerKnockout = await handleCombatAction(true, isPunching);

                if (playerKnockout) {
                    setIsProcessing(false);
                    return;
                }

                const opponentPunching = Math.random() < 0.6;
                const opponentKnockout = await handleCombatAction(false, opponentPunching);

                if (opponentKnockout) {
                    setIsProcessing(false);
                    return;
                }

                if (!playerKnockout && !opponentKnockout) {
                    dispatchBrawling({ type: 'END_ROUND' });

                    dispatchBrawling({
                        type: 'ADD_LOG_ENTRY',
                        entry: {
                            text: `Round ${brawlingState.round} complete`,
                            type: 'info',
                            timestamp: Date.now()
                        }
                    });
                }
            } catch (error) {
                setIsProcessing(false);
                throw error;
            } finally {
                setIsProcessing(false);
            }
        },
        [
            brawlingState,
            handleCombatAction,
            isCombatEnded,
            setIsProcessing,
            isValidCombatState,
            dispatchBrawling,
        ]
    );

    return {
        processRound,
        applyWound,
        handleCombatAction
    }
};
