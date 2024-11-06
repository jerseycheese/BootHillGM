import { useEffect } from 'react';
import { GameSessionProps } from '../components/GameArea/types';
import { Character } from '../types/character';

type GameSessionWithoutState = Omit<GameSessionProps, 'state'>;

interface CombatInitiator extends GameSessionWithoutState {
  initiateCombat: (
    opponent: Character,
    combatState: {
      playerStrength: number;
      opponentStrength: number;
      currentTurn: 'player' | 'opponent';
      combatLog: string[];
    }
  ) => void;
}

/**
 * Hook to handle combat state restoration after page refreshes or navigation.
 * Ensures combat can resume exactly where it left off by:
 * - Restoring opponent data with proper type conversion
 * - Maintaining exact strength values and turn state
 * - Preserving combat log history and wounds
 */
export function useCombatStateRestoration(
  state: GameSessionProps['state'],
  gameSession: CombatInitiator | null
) {
  useEffect(() => {
    if (!state || !gameSession) return;

    const shouldRestoreCombat = state.isCombatActive && 
      state.opponent && 
      state.combatState &&
      !gameSession.isCombatActive;

    if (shouldRestoreCombat && state.opponent && state.combatState) {
      const restoredOpponent: Character = {
        name: state.opponent.name,
        attributes: {
          speed: state.opponent.attributes?.speed ?? 5,
          gunAccuracy: state.opponent.attributes?.gunAccuracy ?? 5,
          throwingAccuracy: state.opponent.attributes?.throwingAccuracy ?? 5,
          strength: state.opponent.attributes?.strength ?? 5,
          baseStrength: state.opponent.attributes?.baseStrength ?? 5,
          bravery: state.opponent.attributes?.bravery ?? 5,
          experience: state.opponent.attributes?.experience ?? 5
        },
        skills: {
          shooting: state.opponent.skills?.shooting ?? 50,
          riding: state.opponent.skills?.riding ?? 50,
          brawling: state.opponent.skills?.brawling ?? 50
        },
        weapon: state.opponent.weapon ? {
          name: state.opponent.weapon.name,
          damage: state.opponent.weapon.damage
        } : undefined,
        wounds: state.opponent.wounds ?? [],
        isUnconscious: state.opponent.isUnconscious ?? false
      };

      gameSession.initiateCombat(
        restoredOpponent,
        {
          playerStrength: Number(state.combatState.playerStrength),
          opponentStrength: Number(state.combatState.opponentStrength),
          currentTurn: state.combatState.currentTurn,
          combatLog: Array.isArray(state.combatState.combatLog) 
            ? [...state.combatState.combatLog] 
            : []
        }
      );
    }
  }, [state, gameSession]);
}
