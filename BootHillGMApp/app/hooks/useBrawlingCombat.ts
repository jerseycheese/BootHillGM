import { useState, useCallback } from 'react';
import { Character, Wound } from '../types/character';
import { isCharacterDefeated } from '../utils/strengthSystem';
import { resolveBrawlingRound, BrawlingResult } from '../utils/brawlingSystem';
import { calculateBrawlingDamage } from '../utils/bootHillCombat';
import { GameEngineAction } from '../utils/gameEngine';
import { cleanCombatLogEntry, cleanMetadataMarkers } from '../utils/textCleaningUtils';

interface UseBrawlingCombatProps {
  playerCharacter: Character;
  opponent: Character;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  dispatch: React.Dispatch<GameEngineAction>;
  initialCombatState?: BrawlingState;
}

interface CombatLogEntry {
  text: string;
  type: 'hit' | 'miss' | 'critical' | 'info';
  timestamp: number;
}

interface BrawlingState {
  round: 1 | 2;
  playerModifier: number;
  opponentModifier: number;
  roundLog: CombatLogEntry[];
}

/**
 * Custom hook implementing Boot Hill v2 brawling rules
 * 
 * Features:
 * - Two-round combat turns
 * - Punch/grapple action resolution
 * - Automated opponent responses
 * - Wound tracking and application
 * - Combat log management
 * - Victory/defeat conditions
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
    const wound: Wound = {
      location,
      severity: 'light',
      strengthReduction: damage,
      turnReceived: Date.now()
    };

    const target = isPlayer ? playerCharacter : opponent;
    const updatedTarget = {
      ...target,
      wounds: [...target.wounds, wound],
      attributes: {
        ...target.attributes,
        strength: Math.max(0, target.attributes.strength - damage)
      }
    };

    dispatch({
      type: isPlayer ? 'SET_CHARACTER' : 'SET_OPPONENT',
      payload: updatedTarget
    });

    return updatedTarget;
  }, [playerCharacter, opponent, dispatch]);

  const formatBrawlingMessage = (attacker: string, result: BrawlingResult, isPunching: boolean): string => {
    const moveType = isPunching ? 'punches' : 'grapples';
    // Clean the attacker name before using it in the message
    const cleanedAttackerName = cleanMetadataMarkers(attacker);
    return `${cleanedAttackerName} ${moveType} with ${result.result} (Roll: ${result.roll}) dealing ${result.damage} damage to ${result.location}`;
  };

  const handleCombatAction = useCallback((isPlayer: boolean, isPunching: boolean) => {
    const modifier = isPlayer ? brawlingState.playerModifier : brawlingState.opponentModifier;
    const result = resolveBrawlingRound(modifier, isPunching);

    // Calculate damage based on attacker's strength
    const attacker = isPlayer ? playerCharacter : opponent;
    const defender = isPlayer ? opponent : playerCharacter;
    const finalDamage = calculateBrawlingDamage(
      result.damage,
      attacker.attributes.strength,
      defender.attributes.strength
    );

    // Add new log entry
    const message = formatBrawlingMessage(isPlayer ? playerCharacter.name : opponent.name, result, isPunching);
    const cleanedMessage = cleanCombatLogEntry(message); // Clean the message before adding to log
    const newLogEntry = { text: cleanedMessage, type: 'info' as const, timestamp: Date.now() };
    
    setBrawlingState(prev => ({
      ...prev,
      playerModifier: isPlayer ? result.nextRoundModifier : prev.playerModifier,
      opponentModifier: !isPlayer ? result.nextRoundModifier : prev.opponentModifier,
      roundLog: [...prev.roundLog, newLogEntry]
    }));

    // Apply damage if hit landed
    if (finalDamage > 0) {
      const updatedTarget = applyWound(!isPlayer, result.location, finalDamage);
      
      // Check for knockout
      if (updatedTarget.attributes.strength === 0) {
        const winner = isPlayer ? 'player' : 'opponent';
        // Clean names before using in knockout message
        const loser = cleanMetadataMarkers(isPlayer ? opponent.name : playerCharacter.name);
        const attackerName = cleanMetadataMarkers(isPlayer ? playerCharacter.name : opponent.name);
        const summary = `${attackerName} knocks out ${loser} with a ${isPunching ? 'devastating punch' : 'powerful grapple'}!`;
        onCombatEnd(winner, summary);
        return true;
      }
    }
    return false;
  }, [brawlingState, opponent, playerCharacter, onCombatEnd, applyWound]);

  const processRound = useCallback(async (isPlayer: boolean, isPunching: boolean) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Handle player's action
      const isKnockout = handleCombatAction(isPlayer, isPunching);
      
      // Handle opponent's response if player acted and no knockout occurred
      if (!isKnockout && isPlayer && !isCharacterDefeated(opponent)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        handleCombatAction(false, Math.random() > 0.5);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, handleCombatAction, opponent]);

  return {
    brawlingState,
    isProcessing,
    processRound
  };
};
