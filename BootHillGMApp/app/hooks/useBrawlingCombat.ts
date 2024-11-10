import { useState, useCallback } from 'react';
import { BrawlingEngine } from '../utils/brawlingEngine';
import { BrawlingState } from '../types/combat';
import { Wound } from '../types/character';
import { UseBrawlingCombatProps } from '../types/hooks';
import * as brawlingSystem from '../utils/brawlingSystem';

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
  dispatch
}: UseBrawlingCombatProps) => {
  const [brawlingState, setBrawlingState] = useState<BrawlingState>({
    round: 1,
    playerModifier: 0,
    opponentModifier: 0,
    roundLog: []
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

    const updatedTarget = {
      ...target,
      wounds: [...target.wounds, wound],
      attributes: {
        ...target.attributes,
        strength: BrawlingEngine.calculateUpdatedStrength(
          target.attributes.strength,
          damage
        )
      }
    };

    dispatch({
      type: isPlayer ? 'SET_CHARACTER' : 'SET_OPPONENT',
      payload: updatedTarget
    });

    return updatedTarget;
  }, [playerCharacter, opponent, dispatch]);

  const handleCombatAction = useCallback((isPlayer: boolean, isPunching: boolean) => {
    const modifier = isPlayer ? brawlingState.playerModifier : brawlingState.opponentModifier;

    const result = brawlingSystem.resolveBrawlingRound(
      modifier,
      isPunching
    );

    const attacker = isPlayer ? playerCharacter : opponent;
    const defender = isPlayer ? opponent : playerCharacter;
    
    // Add new log entry
    const message = BrawlingEngine.formatCombatMessage(
      attacker.name,
      result,
      isPunching
    );
    
    const newLogEntry = { 
      text: message, 
      type: 'info' as const, 
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
        const summary = `${attacker.name} knocks out ${defender.name} with a ${isPunching ? 'devastating punch' : 'powerful grapple'}!`;
        onCombatEnd(winner, summary);
        return true;
      }
    }
    return false;
  }, [brawlingState, opponent, playerCharacter, onCombatEnd, applyWound]);

  const processRound = useCallback(async (isPlayer: boolean, isPunching: boolean) => {
    setIsProcessing(true);
    try {
      // Process player's action
      const playerKnockout = handleCombatAction(true, isPunching);
      if (playerKnockout) return;

      // Process opponent's action
      const opponentKnockout = handleCombatAction(false, isPunching);
      if (!opponentKnockout) {
        setBrawlingState((prev: BrawlingState) => ({
          ...prev,
          round: prev.round + 1
        }));
      }
    } finally {
      setIsProcessing(false);
    }
  }, [handleCombatAction]);

  return {
    brawlingState,
    isProcessing,
    processRound
  };
};
