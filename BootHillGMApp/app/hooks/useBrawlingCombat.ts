import { useState, useCallback, useReducer } from 'react';
import { BrawlingEngine } from '../utils/brawlingEngine';
import { BrawlingState, LogEntry, ensureCombatState } from '../types/combat';
import { Wound } from '../types/wound';
import { GameEngineAction } from '../types/gameActions';
import { Character } from '../types/character';
import * as brawlingSystem from '../utils/brawlingSystem';
import { isKnockout, calculateUpdatedStrength } from '../utils/strengthSystem';

interface UseBrawlingCombatProps {
  playerCharacter: Character;
  opponent: Character;
  onCombatEnd: (winner: 'player' | 'opponent', summary: string) => void;
  dispatch: React.Dispatch<GameEngineAction>;
  initialCombatState?: BrawlingState;
}

// Action types for the reducer
type BrawlingAction =
  | { type: 'APPLY_DAMAGE'; target: 'player' | 'opponent'; damage: number; location: string }
  | { type: 'ADD_LOG_ENTRY'; entry: LogEntry }
  | { type: 'UPDATE_MODIFIERS'; player?: number; opponent?: number }
  | { type: 'END_ROUND' }
  | { type: 'END_COMBAT'; winner: 'player' | 'opponent'; summary: string }
  | { type: 'SYNC_STRENGTH'; playerStrength: number; opponentStrength: number };

// Reducer function for atomic state updates
function brawlingReducer(state: BrawlingState, action: BrawlingAction): BrawlingState {
  
  switch (action.type) {
    case 'APPLY_DAMAGE': {
      return state; // Strength is updated directly in Character objects
      // const newState = { // Removed strength updates from reducer
      //   ...state,
      //   playerStrength: action.target === 'player'
      //     ? calculateUpdatedStrength(state.playerStrength, action.damage)
      //     : state.playerStrength,
      //   opponentStrength: action.target === 'opponent'
      //     ? calculateUpdatedStrength(state.opponentStrength, action.damage)
      //     : state.opponentStrength
      // };
      // return newState;
    }
    
    case 'ADD_LOG_ENTRY': {
      // Only check timestamp for duplicates
      const isDuplicate = state.roundLog.some(
        entry => entry.timestamp === action.entry.timestamp
      );
      return isDuplicate ? state : {
        ...state,
        roundLog: [...state.roundLog, action.entry]
      };
    }
    
    case 'UPDATE_MODIFIERS': {
      return {
        ...state,
        playerModifier: action.player ?? state.playerModifier,
        opponentModifier: action.opponent ?? state.opponentModifier
      };
    }
    
    case 'END_ROUND': {
      const newRound = (state.round === 1 ? 2 : 1) as 1 | 2;
      return {
        ...state,
        round: newRound
      };
    }

    case 'END_COMBAT': {
      return {
        ...state,
        roundLog: [
          ...state.roundLog,
          {
            text: action.summary,
            type: 'info',
            timestamp: Date.now()
          }
        ]
      };
    }

    case 'SYNC_STRENGTH': {
      return state; // No longer syncing strength directly in combat state
      // return {
      //   ...state,
      //   playerStrength: action.playerStrength,
      //   opponentStrength: action.opponentStrength
      // };
    }
    
    default:
      return state;
  }
}

function isValidCombatState(state: BrawlingState): boolean {
  const isValid = (
    // state.playerStrength >= 0 && // No longer validating strength
    // state.opponentStrength >= 0 && // No longer validating strength
    (state.round === 1 || state.round === 2) &&
    Array.isArray(state.roundLog)
  );
  return isValid;
}

export const useBrawlingCombat = ({
  playerCharacter,
  opponent,
  onCombatEnd,
  dispatch,
  initialCombatState
}: UseBrawlingCombatProps) => {
  
  const [brawlingState, dispatchBrawling] = useReducer(brawlingReducer, {
    round: initialCombatState?.round || 1,
    playerModifier: initialCombatState?.playerModifier || 0,
    opponentModifier: initialCombatState?.opponentModifier || 0,
    playerCharacterId: playerCharacter.id, // Use character references
    opponentCharacterId: opponent.id,       // Use character references
    roundLog: initialCombatState?.roundLog || []
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCombatEnded, setIsCombatEnded] = useState(false);

  const endCombat = useCallback((winner: 'player' | 'opponent', summary: string) => {
    
    setIsCombatEnded(true);
    dispatchBrawling({ type: 'END_COMBAT', winner, summary });
    
    // Update global state with combat end
    dispatch({
      type: 'UPDATE_COMBAT_STATE',
      payload: ensureCombatState({
        ...brawlingState,
        isActive: true, // Keep active until user dismisses
        combatType: 'brawling',
        winner,
        summary: {
          winner,
          results: summary,
          stats: {
            rounds: brawlingState.round,
            damageDealt: playerCharacter.attributes.baseStrength - opponent.attributes.strength, // Use opponent.attributes.strength
            damageTaken: opponent.attributes.baseStrength - playerCharacter.attributes.strength // Use playerCharacter.attributes.strength
          }
        }
      })
    });

    // Update final character states
    dispatch({
      type: 'SET_CHARACTER',
      payload: {
        ...playerCharacter,
        attributes: {
          ...playerCharacter.attributes,
          strength: playerCharacter.attributes.strength, // Use playerCharacter.attributes.strength
          baseStrength: playerCharacter.attributes.baseStrength
        }
      }
    });

    dispatch({
      type: 'SET_OPPONENT',
      payload: {
        ...opponent,
        attributes: {
          ...opponent.attributes,
          strength: opponent.attributes.strength, // Use opponent.attributes.strength
          baseStrength: opponent.attributes.baseStrength
        }
      }
    });

    // Notify combat end
    onCombatEnd(winner, summary);
  }, [brawlingState, dispatch, onCombatEnd, playerCharacter, opponent]);

  const syncWithGlobalState = useCallback((state: BrawlingState) => {
    
    // Update character states
    dispatch({
      type: 'SET_CHARACTER',
      payload: {
        ...playerCharacter,
        attributes: {
          ...playerCharacter.attributes,
          strength: playerCharacter.attributes.strength, // Use playerCharacter.attributes.strength
          baseStrength: playerCharacter.attributes.baseStrength
      }
    }
  });

  dispatch({
    type: 'SET_OPPONENT',
    payload: {
      ...opponent,
      attributes: {
        ...opponent.attributes,
        strength: opponent.attributes.strength, // Use opponent.attributes.strength
        baseStrength: opponent.attributes.baseStrength
      }
    }
  });

    // Update combat state
    dispatch({
      type: 'UPDATE_COMBAT_STATE',
      payload: ensureCombatState({
        ...state,
        isActive: !isCombatEnded,
        combatType: 'brawling'
      })
    });
  }, [dispatch, isCombatEnded, playerCharacter, opponent]);

  
    const applyWound = useCallback((isPlayer: boolean, location: "head" | "chest" | "abdomen" | "leftArm" | "rightArm" | "leftLeg" | "rightLeg", damage: number) => {
      // isPlayer indicates if the player is attacking
      // When isPlayer is true, target the opponent
      // When isPlayer is false (opponent attacking), target the player
      const target = isPlayer ? opponent : playerCharacter;
      const currentStrength = isPlayer ? opponent.attributes.strength : playerCharacter.attributes.strength;
      const newStrength = calculateUpdatedStrength(currentStrength, damage);
  
      const wound: Wound = {
        severity: 'light',
        strengthReduction: damage,
        turnReceived: Date.now(),
        location: 'head'
      };

    // Update character state first
    const updatedTarget = {
      ...target,
      wounds: [...target.wounds, wound],
      attributes: {
        ...target.attributes,
        strength: newStrength,
        baseStrength: target.attributes.baseStrength
      },
      isUnconscious: newStrength <= 0
    };

    // Update global character state - use isPlayer to determine which character to update
    dispatch({
      type: isPlayer ? 'SET_OPPONENT' : 'SET_CHARACTER',
      payload: updatedTarget
    });

    // Update combat state atomically
    dispatchBrawling({
      type: 'APPLY_DAMAGE',
      target: !isPlayer ? 'player' : 'opponent',
      damage,
      location
    });

    return { newStrength, location };
  }, [playerCharacter, opponent, dispatch]);

  const handleCombatAction = useCallback((isPlayer: boolean, isPunching: boolean) => {

    // Only check end conditions if already ended
    if (isCombatEnded) {
      return true;
    }

    const result = brawlingSystem.resolveBrawlingRound(
      isPlayer ? brawlingState.playerModifier : brawlingState.opponentModifier,
      isPunching
    );

    const attacker = isPlayer ? playerCharacter : opponent;
    
    // Add log entry atomically
    const newLogEntry: LogEntry = {
      text: BrawlingEngine.formatCombatMessage(
        attacker.name,
        result,
        isPunching // Use actual punch/grapple choice
      ),
      type: result.damage > 0 ? 'hit' : 'miss',
      timestamp: Date.now()
    };
    
    dispatchBrawling({
      type: 'ADD_LOG_ENTRY',
      entry: newLogEntry
    });

    // Apply damage if hit landed
    if (result.damage > 0) {

      // Pass isPlayer directly to maintain correct targeting
      const { newStrength } = applyWound(isPlayer, result.location, result.damage);

      // Update modifiers atomically
      dispatchBrawling({
        type: 'UPDATE_MODIFIERS',
        player: isPlayer ? result.nextRoundModifier : undefined,
        opponent: !isPlayer ? result.nextRoundModifier : undefined
      });

      // Remove sync with global state - strength already updated in applyWound
      // syncWithGlobalState(brawlingState);
      
      // Check for combat end conditions
      if (newStrength <= 0 || isKnockout(newStrength, result.damage)) {
        
        const loser = !isPlayer ? playerCharacter.name : opponent.name;
        const winner = isPlayer ? 'player' : 'opponent';
        const summary = `${attacker.name} emerges victorious, defeating ${loser} with a ${isPunching ? 'devastating punch' : 'powerful grapple'} to the ${result.location}!`;
        
        endCombat(winner, summary);
        return true;
      }
    } else {
      // Update modifiers only on miss
      dispatchBrawling({
        type: 'UPDATE_MODIFIERS',
        player: isPlayer ? result.nextRoundModifier : undefined,
        opponent: !isPlayer ? result.nextRoundModifier : undefined
      });
      
      syncWithGlobalState(brawlingState);
    }
    return false;
  }, [brawlingState, opponent, playerCharacter, applyWound, syncWithGlobalState, endCombat, isCombatEnded]);

  const processRound = useCallback(async (isPlayer: boolean, isPunching: boolean) => {
    
    if (isCombatEnded) {
      return;
    }

    setIsProcessing(true);
    try {
      // Validate current state
      if (!isValidCombatState(brawlingState)) {
        throw new Error('Invalid combat state');
      }

      // Process player's action
      const playerKnockout = handleCombatAction(true, isPunching);
      if (playerKnockout) {
        return;
      }

      // Add delay for opponent's response
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Opponent randomly chooses punch (true) or grapple (false)
      const opponentPunching = Math.random() < 0.6; // 60% chance to punch
      const opponentKnockout = handleCombatAction(false, opponentPunching);
      if (opponentKnockout) {
        return;
      }

      // If combat continues, update round and sync states
      if (!isCombatEnded) {
        dispatchBrawling({ type: 'END_ROUND' });
      }
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [brawlingState, handleCombatAction, isCombatEnded]);

  return {
    brawlingState,
    isProcessing,
    isCombatEnded,
    processRound
  };
};
