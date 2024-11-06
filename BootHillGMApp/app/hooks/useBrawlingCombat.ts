import { useState, useCallback, useRef } from 'react';
import { Character, Wound } from '../types/character';
import { isCharacterDefeated } from '../utils/strengthSystem';
import { resolveBrawlingRound, BrawlingResult } from '../utils/brawlingSystem';
import { GameEngineAction } from '../utils/gameEngine';

interface UseBrawlingCombatProps {
  playerCharacter: Character;
  opponent: Character;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  dispatch: React.Dispatch<GameEngineAction>;
  initialCombatState?: BrawlingState;
}

interface BrawlingState {
  round: 1 | 2;
  playerModifier: number;
  opponentModifier: number;
  roundLog: string[];
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
  // Maintain roundLog as a ref to prevent clearing
  const roundLogRef = useRef<string[]>([]);
  const [brawlingState, setBrawlingState] = useState<BrawlingState>({
    round: 1,
    playerModifier: 0,
    opponentModifier: 0,
    roundLog: roundLogRef.current
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const applyWound = useCallback((character: Character, result: BrawlingResult): Character => {
    const wound: Wound = {
      location: result.location,
      severity: 'light',
      strengthReduction: result.damage,
      turnReceived: Date.now()
    };

    return {
      ...character,
      wounds: [...character.wounds, wound]
    };
  }, []);

  const formatBrawlingMessage = (attacker: string, result: BrawlingResult, isPunching: boolean): string => {
    const moveType = isPunching ? 'punches' : 'grapples';
    return `${attacker} ${moveType} with ${result.result} (Roll: ${result.roll}) dealing ${result.damage} damage to ${result.location}`;
  };

  const processRound = useCallback(async (isPunching: boolean, isPlayer: boolean) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const modifier = isPlayer ? brawlingState.playerModifier : brawlingState.opponentModifier;
      const result = resolveBrawlingRound(modifier, isPunching);

      // Add new log entry
      const message = formatBrawlingMessage(isPlayer ? 'Player' : 'Opponent', result, isPunching);
      roundLogRef.current = [...roundLogRef.current, message];

      // Apply damage if hit landed
      if (result.damage > 0) {
        const target = isPlayer ? opponent : playerCharacter;
        const updatedTarget = applyWound(target, result);
        
        dispatch({
          type: isPlayer ? 'SET_OPPONENT' : 'SET_CHARACTER',
          payload: updatedTarget
        });

        // Check for defeat
        if (isCharacterDefeated(updatedTarget)) {
          onCombatEnd(isPlayer ? 'player' : 'opponent', `${target.name} is knocked out!`);
          return;
        }
      }

      // Update state for next round
      setBrawlingState(prev => ({
        ...prev,
        roundLog: roundLogRef.current,
        [isPlayer ? 'opponentModifier' : 'playerModifier']: 
          prev[isPlayer ? 'opponentModifier' : 'playerModifier'] + result.nextRoundModifier,
        // Only advance round after opponent's action
        ...(isPlayer ? {} : { round: prev.round === 1 ? 2 : 1 })
      }));

      // Opponent's immediate response
      if (isPlayer && !isCharacterDefeated(opponent)) {
        setTimeout(() => {
          processRound(Math.random() > 0.5, false);
        }, 1000);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [brawlingState, opponent, playerCharacter, dispatch, onCombatEnd, applyWound, isProcessing]);

  return {
    brawlingState: {
      ...brawlingState,
      roundLog: roundLogRef.current
    },
    isProcessing,
    processRound
  };
};
