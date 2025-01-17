import { useState, useCallback } from 'react';
import { BrawlingEngine } from '../utils/brawlingEngine';
import { BrawlingState, LogEntry, ensureCombatState } from '../types/combat';
import { Wound } from '../types/wound';
import { GameEngineAction } from '../types/gameActions';
import { Character } from '../types/character';
import * as brawlingSystem from '../utils/brawlingSystem';

interface UseBrawlingCombatProps {
  playerCharacter: Character;
  opponent: Character;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  dispatch: React.Dispatch<GameEngineAction>;
  initialCombatState?: BrawlingState;
}

/**
 * Manages brawling combat state and coordinates combat actions
 * Uses BrawlingEngine for combat calculations while managing:
 * - Combat rounds and turn order
 * - Wound application and health updates
 * - Combat log entries
 * - Win/loss conditions
 */
export const useBrawlingCombat = ({
  playerCharacter,
  opponent,
  onCombatEnd,
  dispatch,
  initialCombatState
}: UseBrawlingCombatProps) => {
  const [brawlingState, setBrawlingState] = useState<BrawlingState>({
    round: initialCombatState?.round || 1,
    playerModifier: initialCombatState?.playerModifier || 0,
    opponentModifier: initialCombatState?.opponentModifier || 0,
    playerStrength: initialCombatState?.playerStrength || playerCharacter.attributes.strength,
    playerBaseStrength: initialCombatState?.playerBaseStrength || playerCharacter.attributes.baseStrength,
    opponentStrength: initialCombatState?.opponentStrength || opponent.attributes.strength,
    opponentBaseStrength: initialCombatState?.opponentBaseStrength || opponent.attributes.baseStrength,
    roundLog: initialCombatState?.roundLog || []
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const applyWound = useCallback((isPlayer: boolean, location: "head" | "chest" | "abdomen" | "leftArm" | "rightArm" | "leftLeg" | "rightLeg", damage: number) => {
    const target = isPlayer ? playerCharacter : opponent;
    const wound: Wound = {
      location,
      severity: 'light',
      strengthReduction: damage,
      turnReceived: Date.now()
    };

    // Calculate new strength without modifying base strength
    const newStrength = Math.max(0, target.attributes.strength - damage);

    console.log('applyWound - Before:', {
      currentStrength: target.attributes.strength,
      baseStrength: target.attributes.baseStrength,
      damage
    });

    const updatedTarget = {
      ...target,
      wounds: [...target.wounds, wound],
      attributes: {
        ...target.attributes,
        strength: newStrength,
        baseStrength: target.attributes.baseStrength // Preserve base strength
      },
      isUnconscious: newStrength <= 0
    };

    console.log('applyWound - After:', {
      currentStrength: updatedTarget.attributes.strength,
      baseStrength: updatedTarget.attributes.baseStrength
    });

    // Update both character state and combat state
    dispatch({
      type: isPlayer ? 'SET_CHARACTER' : 'SET_OPPONENT',
      payload: updatedTarget
    });

    // Update combat state with current strength
    dispatch({
      type: 'UPDATE_COMBAT_STATE',
      payload: {
        ...brawlingState,
        [isPlayer ? 'playerStrength' : 'opponentStrength']: newStrength
      }
    });

    console.log('applyWound - State Updated:', {
      combatStrength: newStrength,
      isPlayer
    });

    return updatedTarget;
  }, [playerCharacter, opponent, dispatch, brawlingState]);

  const handleCombatAction = useCallback((isPlayer: boolean, isPunching: boolean) => {
    const modifier = isPlayer ? brawlingState.playerModifier : brawlingState.opponentModifier;

    const result = brawlingSystem.resolveBrawlingRound(
      modifier,
      isPunching
    );
    console.log('handleCombatAction - Result:', result);
    const attacker = isPlayer ? playerCharacter : opponent;
    const defender = isPlayer ? opponent : playerCharacter;
    
    // Add new log entry
    const message = BrawlingEngine.formatCombatMessage(
      attacker.name,
      result,
      result.roll > 2  // Only show punch/grapple message on hits
        ? isPunching
        : isPunching
    );
    
    const newLogEntry: LogEntry = {
      text: message,
      type: 'info',
      timestamp: Date.now()
    };
    
    setBrawlingState((prev: BrawlingState) => ({
      ...prev,
      playerModifier: isPlayer ? result.nextRoundModifier : prev.playerModifier,
      opponentModifier: !isPlayer ? result.nextRoundModifier : prev.opponentModifier,
      roundLog: [...prev.roundLog, newLogEntry]
    }));

    // Apply damage if hit landed
    if (result.damage > 0) {
      const updatedTarget = applyWound(!isPlayer, result.location, result.damage);
      
      if (BrawlingEngine.isKnockout(updatedTarget.attributes.strength, result.damage)) {
        const winner = isPlayer ? 'player' : 'opponent';
        const summary = `${attacker.name} emerges victorious, defeating ${defender.name} with a ${isPunching ? 'devastating punch' : 'powerful grapple'} to the ${result.location}!`;
        console.log('handleCombatAction - Knockout! Winner:', winner, 'Summary:', summary);
        // Update combat state before ending
        dispatch({
          type: 'UPDATE_COMBAT_STATE',
          payload: ensureCombatState({
            isActive: false,
            combatType: 'brawling',
            winner,
            brawling: brawlingState
          })
        });

        onCombatEnd(winner, summary);
        return true;
      }
    }
    return false;
  }, [brawlingState, opponent, playerCharacter, onCombatEnd, applyWound, dispatch]);

  const processRound = useCallback(async (isPlayer: boolean, isPunching: boolean) => {
    setIsProcessing(true);
    try {
      console.log('processRound - Current brawlingState:', brawlingState);
      if (isPlayer) {
        // Process player's action
        const playerKnockout = handleCombatAction(true, isPunching);
        if (playerKnockout) return;

        // Add delay for opponent's response
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Opponent randomly chooses punch (true) or grapple (false)
        const opponentPunching = Math.random() < 0.6; // 60% chance to punch
        const opponentKnockout = handleCombatAction(false, opponentPunching);
        
        // Only advance the round if neither participant is knocked out
        if (!playerKnockout && !opponentKnockout) {
          setBrawlingState((prev: BrawlingState) => {
            console.log('setBrawlingState - Previous state:', prev);
            const updatedState: BrawlingState = {
              ...prev,
              round: prev.round === 1 ? 2 : 1,
              roundLog: prev.roundLog
            };
            console.log('setBrawlingState - Updated state:', updatedState);
            return updatedState;
          });
        } else {
          // If either participant is knocked out, end combat
          dispatch({
            type: 'UPDATE_COMBAT_STATE',
            payload: ensureCombatState({
              isActive: false,
              combatType: 'brawling',
              winner: playerKnockout ? 'opponent' : 'player',
              brawling: brawlingState
            })
          });
          return;
        }
      }
    } finally {
      setIsProcessing(false);
    }
  }, [handleCombatAction, brawlingState, dispatch]);

  return {
    brawlingState,
    isProcessing,
    processRound
  };
};
